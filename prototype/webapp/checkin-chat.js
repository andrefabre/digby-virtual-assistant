// Shared check-in widget: Digby leads, today's commitments are revealed one
// at a time as quick-reply questions. Originally Variant C's whole page;
// now a reusable engine any shell can mount — pass it a message container
// and an onChange callback and it renders/wires itself into that container.

let chatStaged = {};
let chatAwaitingReasonFor = null;

function bubble(from, html) {
  return `<div class="vc-bubble vc-bubble--${from}">${html}</div>`;
}

function quickReplies(items) {
  return `<div class="vc-quick-replies">${items.map((i) => `<button class="vc-qr" data-action="${i.action}" data-value="${i.value || ""}">${i.label}</button>`).join("")}</div>`;
}

function buildMessages(state) {
  const out = [];
  const todays = state.weekly_plan.commitments.filter((c) => c.day === state.todayName);

  out.push(bubble("digby", `Morning. ${state.streak > 0 ? `You're on a <b>${state.streak}-day</b> streak.` : "Fresh start today."}`));

  if (state.escalations.length && !state.alreadyCheckedInToday) {
    out.push(bubble("digby", `Heads up — <b>${state.escalations.map((e) => e.category.name).join(", ")}</b> hit ${state.escalation_rule.misses} misses in ${state.escalation_rule.window_days} days.`));
    out.push(quickReplies([{ label: "Start Recovery Session", action: "recovery" }, { label: "Not now", action: "dismiss" }]));
  }

  if (state.alreadyCheckedInToday) {
    const todaysCheckin = state.checkins.find((c) => c.date === state.today);
    out.push(bubble("digby", `Already checked in today. ${todaysCheckin.updates.filter((u) => u.status === "done").length} done, ${todaysCheckin.updates.filter((u) => u.status === "missed").length} missed. See you tomorrow.`));
    return out;
  }

  if (todays.length === 0) {
    out.push(bubble("digby", "Nothing scheduled today in the sample plan."));
    return out;
  }

  out.push(bubble("digby", `Here's what's on for today (${state.todayName}):`));

  for (const c of todays) {
    const cat = state.categories.find((cc) => cc.id === c.category);
    out.push(bubble("digby", `<b>${c.title}</b> — ${cat.name}, ${c.hours}h. Done or missed?`));

    const staged = chatStaged[c.id];
    if (staged) {
      out.push(bubble("user", staged.status === "done" ? "Done" : `Missed — ${staged.reason_code ? staged.reason_code.replace(/_/g, " ") : "…"}`));
      continue;
    }

    if (chatAwaitingReasonFor === c.id) {
      out.push(bubble("user", "Missed"));
      out.push(bubble("digby", "What happened?"));
      out.push(quickReplies(state.reason_codes.map((r) => ({ label: r.replace(/_/g, " "), action: "reason", value: `${c.id}::${r}` }))));
    } else {
      out.push(quickReplies([
        { label: "Done", action: "done", value: c.id },
        { label: "Missed", action: "missed", value: c.id },
      ]));
    }
    break; // reveal one commitment at a time
  }

  const allResolved = todays.every((c) => chatStaged[c.id]);
  if (allResolved) {
    out.push(bubble("digby", "That's everything for today — want me to log it?"));
    out.push(quickReplies([{ label: "Submit check-in", action: "submit" }]));
  }

  return out;
}

// `onChange` re-renders whichever shell mounted this widget — every variant
// re-renders itself, never assume which one.
function wireQuickReplies(state, msgs, onChange) {
  msgs.querySelectorAll(".vc-qr").forEach((btn) => {
    btn.onclick = () => {
      const { action, value } = btn.dataset;
      if (action === "recovery") { alert("Recovery Session started — 15 minutes on the clock. (Prototype stub.)"); return; }
      if (action === "dismiss") { return; }
      if (action === "done") { chatStaged[value] = { status: "done", reason_code: null }; onChange(); return; }
      if (action === "missed") { chatAwaitingReasonFor = value; onChange(); return; }
      if (action === "reason") {
        const [id, reason] = value.split("::");
        chatStaged[id] = { status: "missed", reason_code: reason };
        chatAwaitingReasonFor = null;
        onChange();
        return;
      }
      if (action === "submit") {
        const updates = Object.entries(chatStaged).map(([commitment_id, v]) => ({ commitment_id, ...v }));
        const res = actions.submitCheckin(updates);
        if (res.error) alert(res.error);
        chatStaged = {};
        chatAwaitingReasonFor = null;
      }
    };
  });
}

// Mounts the chat engine into `msgs` (an existing element in the caller's
// DOM) and wires it. Call again after any store update to refresh.
function mountCheckinChat(state, msgs, onChange) {
  msgs.innerHTML = buildMessages(state).join("");
  wireQuickReplies(state, msgs, onChange);
  msgs.scrollTop = msgs.scrollHeight;
}
