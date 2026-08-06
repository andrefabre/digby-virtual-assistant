// Variant C — "Conversation". Chat-first: Digby leads, the day's commitments
// are revealed one at a time as quick-reply questions, and the Pathway/
// Category model is tucked behind a slide-over rather than always on screen.
// Structurally the opposite of B: no persistent chrome, one thing at a time.

let vcStaged = {};
let vcAwaitingReasonFor = null;
let vcPanelOpen = false;

function renderVariantC(state, root) {
  root.classList.add("vc-shell-wrap");

  root.innerHTML = `
    <div class="vc-shell">
      <header class="vc-header">
        <span class="vc-word">Digby</span>
        <button id="vc-panel-toggle" class="vc-panel-btn">Cascade ${vcPanelOpen ? "✕" : "›"}</button>
      </header>
      <div class="vc-messages" id="vc-messages"></div>
      <footer class="vc-input-row">
        <input type="text" placeholder="Message Digby… (prototype — not wired up)" disabled />
        <button disabled>Send</button>
      </footer>
    </div>
    <aside class="vc-panel ${vcPanelOpen ? "open" : ""}">
      <h2>${state.pathway.destination_label}</h2>
      <ul class="vb-pathway-parts">${state.pathway.parts.map((p) => `<li>${p}</li>`).join("")}</ul>
      <h3>Categories</h3>
      ${state.categories.map((c) => `
        <div class="vc-panel-cat">
          <span class="va-dot" style="background:var(--cat-${c.slot})"></span>
          <b>${c.name}</b> — ${c.floor_status === "decided" ? c.floor_hours_per_week + "h/wk floor" : "floor open"}
          <div class="vc-panel-note">${c.floor_note}</div>
        </div>
      `).join("")}
      <h3>Streak</h3>
      <p>🔥 ${state.streak} days</p>
    </aside>
  `;

  document.getElementById("vc-panel-toggle").onclick = () => { vcPanelOpen = !vcPanelOpen; renderVariantC(state, root); };

  const msgs = document.getElementById("vc-messages");
  msgs.innerHTML = buildMessages(state).join("");
  wireQuickReplies(state, root, msgs);
  msgs.scrollTop = msgs.scrollHeight;
}

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

    const staged = vcStaged[c.id];
    if (staged) {
      out.push(bubble("user", staged.status === "done" ? "Done" : `Missed — ${staged.reason_code ? staged.reason_code.replace(/_/g, " ") : "…"}`));
      continue;
    }

    if (vcAwaitingReasonFor === c.id) {
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

  const allResolved = todays.every((c) => vcStaged[c.id]);
  if (allResolved) {
    out.push(bubble("digby", "That's everything for today — want me to log it?"));
    out.push(quickReplies([{ label: "Submit check-in", action: "submit" }]));
  }

  return out;
}

function wireQuickReplies(state, root, msgs) {
  msgs.querySelectorAll(".vc-qr").forEach((btn) => {
    btn.onclick = () => {
      const { action, value } = btn.dataset;
      if (action === "recovery") { alert("Recovery Session started — 15 minutes on the clock. (Prototype stub.)"); return; }
      if (action === "dismiss") { return; }
      if (action === "done") { vcStaged[value] = { status: "done", reason_code: null }; renderVariantC(state, root); return; }
      if (action === "missed") { vcAwaitingReasonFor = value; renderVariantC(state, root); return; }
      if (action === "reason") {
        const [id, reason] = value.split("::");
        vcStaged[id] = { status: "missed", reason_code: reason };
        vcAwaitingReasonFor = null;
        renderVariantC(state, root);
        return;
      }
      if (action === "submit") {
        const updates = Object.entries(vcStaged).map(([commitment_id, v]) => ({ commitment_id, ...v }));
        const res = actions.submitCheckin(updates);
        if (res.error) alert(res.error);
        vcStaged = {};
        vcAwaitingReasonFor = null;
      }
    };
  });
}
