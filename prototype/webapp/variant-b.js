// Variant B — "Cascade". OKR-dashboard derived: persistent sidebar, KPI stat
// tiles, an explicit Pathway -> Category -> Floor tree, and a dense table for
// check-in (select-driven, not tap-driven) — a power-user / desktop reading
// of the same data Variant A treats as a phone app.

let vbTab = "dashboard";
let vbStaged = {};

function renderVariantB(state, root) {
  root.classList.add("vb-shell");

  root.innerHTML = `
    <aside class="vb-sidebar">
      <div class="vb-word">Digby</div>
      <div class="vb-pathway-card">
        <div class="vb-pathway-title">${state.pathway.destination_label}</div>
        <ul class="vb-pathway-parts">${state.pathway.parts.map((p) => `<li>${p}</li>`).join("")}</ul>
      </div>
      <nav class="vb-nav">
        <button class="vb-nav-item ${vbTab === "dashboard" ? "active" : ""}" data-tab="dashboard">Dashboard</button>
        <button class="vb-nav-item ${vbTab === "plan" ? "active" : ""}" data-tab="plan">Weekly Execution Plan</button>
        <button class="vb-nav-item ${vbTab === "history" ? "active" : ""}" data-tab="history">History</button>
      </nav>
    </aside>
    <main class="vb-main">
      ${state.escalations.length ? `
        <div class="vb-banner">
          <strong>Escalation:</strong>
          ${state.escalations.map((e) => `${e.category.name} (${e.count} misses)`).join(", ")}
          — threshold is ${state.escalation_rule.misses}/${state.escalation_rule.window_days} days.
          <button id="vb-recovery">Start Recovery Session</button>
        </div>` : ""}
      ${vbTab === "dashboard" ? renderDashboard(state) : vbTab === "plan" ? renderPlan(state) : renderHistory(state)}
    </main>
  `;

  root.querySelectorAll(".vb-nav-item").forEach((btn) => {
    btn.onclick = () => { vbTab = btn.dataset.tab; renderVariantB(state, root); };
  });
  const recoveryBtn = document.getElementById("vb-recovery");
  if (recoveryBtn) recoveryBtn.onclick = () => alert("Recovery Session started — 15 minutes on the clock. (Prototype stub.)");

  if (vbTab === "plan") wirePlan(state, root);
}

function renderDashboard(state) {
  const onTrack = state.categories.filter((c) => c.floor_status === "decided" && state.hoursThisWeek[c.id] >= c.floor_hours_per_week).length;
  const decided = state.categories.filter((c) => c.floor_status === "decided").length;
  return `
    <h1>Dashboard</h1>
    <div class="vb-kpis">
      <div class="vb-kpi"><div class="vb-kpi-value">${state.streak}</div><div class="vb-kpi-label">day streak</div></div>
      <div class="vb-kpi"><div class="vb-kpi-value">${onTrack}/${decided}</div><div class="vb-kpi-label">Floors on track</div></div>
      <div class="vb-kpi"><div class="vb-kpi-value">${state.escalations.length}</div><div class="vb-kpi-label">active escalations</div></div>
      <div class="vb-kpi"><div class="vb-kpi-value">${state.alreadyCheckedInToday ? "done" : "pending"}</div><div class="vb-kpi-label">today's check-in</div></div>
    </div>

    <h2>Cascade</h2>
    <div class="vb-cascade">
      <div class="vb-cascade-node vb-cascade-root">${state.pathway.destination_label}</div>
      <div class="vb-cascade-children">
        ${state.categories.map((c) => `
          <div class="vb-cascade-node" style="border-color: var(--cat-${c.slot})">
            <span class="va-dot" style="background:var(--cat-${c.slot})"></span>
            <b>${c.name}</b>
            <span class="vb-floor-tag vb-floor-tag--${c.floor_status}">${c.floor_status === "decided" ? c.floor_hours_per_week + "h/wk floor" : "floor open"}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// Calendar bounds — wide enough to hold every seeded block with margin.
const CAL_START_HOUR = 6;
const CAL_END_HOUR = 21;
const CAL_PX_PER_HOUR = 52;

function minutesFromMidnight(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function renderCalendar(state) {
  const totalHeight = (CAL_END_HOUR - CAL_START_HOUR) * CAL_PX_PER_HOUR;
  const hours = [];
  for (let h = CAL_START_HOUR; h <= CAL_END_HOUR; h++) hours.push(h);

  const dayTotals = Object.fromEntries(
    state.weekDates.map((d) => [
      d.name,
      state.weekly_plan.commitments.filter((c) => c.day === d.name).reduce((sum, c) => sum + c.hours, 0),
    ])
  );

  return `
    <div class="vb-cal">
      <div class="vb-cal-gutter">
        <div class="vb-cal-corner"></div>
        ${hours.map((h) => `<div class="vb-cal-hour" style="height:${CAL_PX_PER_HOUR}px">${String(h).padStart(2, "0")}:00</div>`).join("")}
      </div>
      ${state.weekDates.map((d) => `
        <div class="vb-cal-col ${d.isToday ? "vb-cal-col--today" : ""}">
          <div class="vb-cal-daylabel">
            <span>${d.name}</span><small>${d.label}</small>
            <span class="vb-cal-total">${dayTotals[d.name] || 0}h</span>
          </div>
          <div class="vb-cal-track" style="height:${totalHeight}px">
            ${hours.map((h) => `<div class="vb-cal-line" style="top:${(h - CAL_START_HOUR) * CAL_PX_PER_HOUR}px"></div>`).join("")}
            ${state.weekly_plan.commitments.filter((c) => c.day === d.name).map((c) => {
              const cat = state.categories.find((cc) => cc.id === c.category);
              const top = (minutesFromMidnight(c.start) - CAL_START_HOUR * 60) / 60 * CAL_PX_PER_HOUR;
              const height = Math.max(20, (c.hours * 60) / 60 * CAL_PX_PER_HOUR - 2);
              return `
                <div class="vb-block vb-block--${c.status}" style="top:${top}px;height:${height}px;border-left-color:var(--cat-${cat.slot});background:var(--cat-${cat.slot}-soft)"
                     title="${c.title} — ${cat.name}, ${c.hours}h, ${c.status}">
                  <span class="vb-block-title">${c.title}</span>
                  <span class="vb-block-meta">${c.start} · ${c.hours}h</span>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderPlan(state) {
  const todays = state.weekly_plan.commitments.filter((c) => c.day === state.todayName);
  return `
    <h1>Weekly Execution Plan</h1>
    <p class="vb-sub">${state.weekly_plan.week_label}</p>
    ${renderCalendar(state)}

    <h2>Today's check-in — ${state.todayName}</h2>
    ${state.alreadyCheckedInToday ? `<p class="va-done-msg">Already checked in today.</p>` : `
      <table class="vb-checkin-table">
        <thead><tr><th>Commitment</th><th>Status</th><th>Reason</th></tr></thead>
        <tbody>
          ${todays.map((c) => `
            <tr data-id="${c.id}">
              <td>${c.title}</td>
              <td>
                <select class="vb-status-select" data-id="${c.id}">
                  <option value="pending" ${!vbStaged[c.id] ? "selected" : ""}>pending</option>
                  <option value="done" ${vbStaged[c.id]?.status === "done" ? "selected" : ""}>done</option>
                  <option value="missed" ${vbStaged[c.id]?.status === "missed" ? "selected" : ""}>missed</option>
                </select>
              </td>
              <td>
                <select class="vb-reason-select" data-id="${c.id}" ${vbStaged[c.id]?.status !== "missed" ? "disabled" : ""}>
                  <option value="">—</option>
                  ${state.reason_codes.map((r) => `<option value="${r}" ${vbStaged[c.id]?.reason_code === r ? "selected" : ""}>${r.replace(/_/g, " ")}</option>`).join("")}
                </select>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${todays.length ? `<button id="vb-submit" class="vb-submit">Submit check-in</button>` : `<p class="va-empty">Nothing scheduled today in the sample plan.</p>`}
    `}
  `;
}

function renderHistory(state) {
  return `
    <h1>History</h1>
    <div class="vb-history-grid">
      <div>
        <h2>Last 5 weeks</h2>
        <div class="va-heatmap-wrap">${heatmapSVG(state.history)}</div>
      </div>
      <div>
        <h2>Miss reasons</h2>
        <div class="va-hbar-wrap">${hbarSVG(state.reasonTally)}</div>
      </div>
    </div>
  `;
}

function wirePlan(state, root) {
  root.querySelectorAll(".vb-status-select").forEach((sel) => {
    sel.onchange = () => {
      const id = sel.dataset.id;
      vbStaged[id] = { status: sel.value, reason_code: sel.value === "missed" ? vbStaged[id]?.reason_code || null : null };
      renderVariantB(state, root);
    };
  });
  root.querySelectorAll(".vb-reason-select").forEach((sel) => {
    sel.onchange = () => {
      vbStaged[sel.dataset.id] = { status: "missed", reason_code: sel.value || null };
    };
  });
  const submit = document.getElementById("vb-submit");
  if (submit) {
    submit.onclick = () => {
      const updates = Object.entries(vbStaged)
        .filter(([, v]) => v.status !== "pending")
        .map(([commitment_id, v]) => ({ commitment_id, ...v }));
      if (updates.some((u) => u.status === "missed" && !u.reason_code)) {
        alert("Give every missed item a reason first.");
        return;
      }
      const res = actions.submitCheckin(updates);
      if (res.error) { alert(res.error); return; }
      vbStaged = {};
    };
  }
}
