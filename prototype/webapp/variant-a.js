// Variant A — "Momentum". Habit-tracker derived: single-column, phone-card
// layout, one big daily-completion ring, a tactile tap-to-check-off list,
// streak front and center, heatmap for history. Structure over table: the
// day's loop is the whole screen, everything else is secondary.

let vaTab = "today";
let vaPending = {}; // commitment_id -> {status, reason_code} staged before submit

function renderVariantA(state, root) {
  root.classList.add("va-shell-wrap");

  const todays = state.weekly_plan.commitments.filter((c) => c.day === state.todayName);
  const staged = todays.filter((c) => vaPending[c.id]);
  const doneCount = todays.filter((c) => c.status === "done" || vaPending[c.id]?.status === "done").length;
  const pct = todays.length ? doneCount / todays.length : 0;

  root.innerHTML = `
    <div class="va-shell">
      <header class="va-header">
        <div class="va-word">Digby</div>
        <div class="va-tabs">
          <button class="va-tab ${vaTab === "today" ? "active" : ""}" data-tab="today">Today</button>
          <button class="va-tab ${vaTab === "history" ? "active" : ""}" data-tab="history">History</button>
        </div>
      </header>

      ${state.escalations.length ? `
        <div class="va-escalation">
          <b>${state.escalations.map((e) => e.category.name).join(", ")}</b> hit
          ${state.escalation_rule.misses} misses in ${state.escalation_rule.window_days} days.
          <button id="va-recovery">Start Recovery Session</button>
        </div>` : ""}

      ${vaTab === "today" ? renderToday(state, todays, doneCount, pct) : renderHistory(state)}
    </div>
  `;

  root.querySelectorAll(".va-tab").forEach((btn) => {
    btn.onclick = () => { vaTab = btn.dataset.tab; renderVariantA(state, root); };
  });

  if (vaTab === "today") wireToday(state, root, todays);

  const recoveryBtn = document.getElementById("va-recovery");
  if (recoveryBtn) recoveryBtn.onclick = () => alert("Recovery Session started — 15 minutes on the clock. (Prototype stub.)");
}

function renderToday(state, todays, doneCount, pct) {
  return `
    <section class="va-hero">
      <div class="va-ring">
        ${donutSVG({ size: 160, stroke: 14, pct, color: "var(--status-good)", label: `${doneCount}/${todays.length}` })}
      </div>
      <div class="va-streak">🔥 ${state.streak}-day streak</div>
      <div class="va-week-label">${state.weekly_plan.week_label}</div>
    </section>

    <section class="va-cat-row">
      ${state.categories.map((c) => {
        const floorPct = c.floor_status === "decided" ? Math.min(1, state.hoursThisWeek[c.id] / c.floor_hours_per_week) : null;
        return `
        <div class="va-cat" title="${c.floor_note}">
          ${donutSVG({ size: 56, stroke: 6, pct: floorPct ?? 0, color: `var(--cat-${c.slot})`, track: `var(--cat-${c.slot}-soft)` })}
          <span>${c.name}</span>
          <small>${c.floor_status === "decided" ? c.floor_hours_per_week + "h floor" : "floor open"}</small>
        </div>`;
      }).join("")}
    </section>

    <section class="va-today-list">
      <h2>Today — ${state.todayName}</h2>
      ${state.alreadyCheckedInToday ? `<p class="va-done-msg">✅ Already checked in today.</p>` : ""}
      ${todays.length === 0 ? `<p class="va-empty">Nothing scheduled today in the sample plan.</p>` : ""}
      ${todays.map((c) => {
        const staged = vaPending[c.id];
        const effectiveStatus = state.alreadyCheckedInToday ? c.status : (staged?.status || "pending");
        const cat = state.categories.find((cc) => cc.id === c.category);
        return `
        <div class="va-row va-row--${effectiveStatus}" data-id="${c.id}">
          <button class="va-check" data-id="${c.id}" ${state.alreadyCheckedInToday ? "disabled" : ""}>
            ${effectiveStatus === "done" ? "✓" : effectiveStatus === "missed" ? "✕" : ""}
          </button>
          <div class="va-row-body">
            <div class="va-row-title">${c.title}</div>
            <div class="va-row-meta"><span class="va-dot" style="background:var(--cat-${cat.slot})"></span>${cat.name} · ${c.hours}h</div>
            ${effectiveStatus === "missed" ? `
              <select class="va-reason" data-id="${c.id}" ${state.alreadyCheckedInToday ? "disabled" : ""}>
                <option value="">reason…</option>
                ${state.reason_codes.map((r) => `<option value="${r}" ${staged?.reason_code === r ? "selected" : ""}>${r.replace(/_/g, " ")}</option>`).join("")}
              </select>` : ""}
          </div>
          ${!state.alreadyCheckedInToday ? `<button class="va-miss" data-id="${c.id}">missed</button>` : ""}
        </div>`;
      }).join("")}
      ${todays.length && !state.alreadyCheckedInToday ? `<button id="va-submit" class="va-submit">Finish check-in</button>` : ""}
    </section>
  `;
}

function renderHistory(state) {
  return `
    <section class="va-history">
      <h2>Last 5 weeks</h2>
      <div class="va-heatmap-wrap">${heatmapSVG(state.history)}</div>
      <h2>Why things get missed</h2>
      <div class="va-hbar-wrap">${hbarSVG(state.reasonTally)}</div>
    </section>
  `;
}

function wireToday(state, root, todays) {
  root.querySelectorAll(".va-check").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const cur = vaPending[id]?.status;
      vaPending[id] = cur === "done" ? undefined : { status: "done", reason_code: null };
      if (!vaPending[id]) delete vaPending[id];
      renderVariantA(state, root);
    };
  });
  root.querySelectorAll(".va-miss").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      vaPending[id] = { status: "missed", reason_code: null };
      renderVariantA(state, root);
    };
  });
  root.querySelectorAll(".va-reason").forEach((sel) => {
    sel.onchange = () => {
      vaPending[sel.dataset.id] = { status: "missed", reason_code: sel.value || null };
    };
  });
  const submit = document.getElementById("va-submit");
  if (submit) {
    submit.onclick = () => {
      const updates = Object.entries(vaPending).map(([commitment_id, v]) => ({ commitment_id, ...v }));
      if (updates.some((u) => u.status === "missed" && !u.reason_code)) {
        alert("Give every missed item a reason first.");
        return;
      }
      const res = actions.submitCheckin(updates);
      if (res.error) { alert(res.error); return; }
      vaPending = {};
    };
  }
}
