// Variant B — "Cascade". The validated baseline: persistent sidebar, tabs
// for Dashboard / Calendar / Table / Check-in / History. Refined pass over
// the version Andre picked — now built on the shared calendar/table/chat
// widgets, plus a Floor-risk chip on the dashboard rings.

let vbTab = "dashboard";

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
        <div class="vb-nav-section">Weekly Execution Plan</div>
        <button class="vb-nav-item ${vbTab === "calendar" ? "active" : ""}" data-tab="calendar">Calendar</button>
        <button class="vb-nav-item ${vbTab === "table" ? "active" : ""}" data-tab="table">Table</button>
        <div class="vb-nav-section">Daily</div>
        <button class="vb-nav-item ${vbTab === "checkin" ? "active" : ""}" data-tab="checkin">Check-in</button>
        <div class="vb-nav-section">Insights</div>
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
      ${
        vbTab === "dashboard" ? renderDashboard(state)
        : vbTab === "calendar" ? renderCalendarTab(state)
        : vbTab === "table" ? renderTableTab(state, root)
        : vbTab === "checkin" ? renderCheckinTab(state)
        : renderHistory(state)
      }
    </main>
  `;

  root.querySelectorAll(".vb-nav-item").forEach((btn) => {
    btn.onclick = () => { vbTab = btn.dataset.tab; renderVariantB(state, root); };
  });
  const recoveryBtn = document.getElementById("vb-recovery");
  if (recoveryBtn) recoveryBtn.onclick = () => alert("Recovery Session started — 15 minutes on the clock. (Prototype stub.)");

  if (vbTab === "table") renderTableSwitch(state, () => renderVariantB(state, root)).wire(root);
  if (vbTab === "checkin") mountCheckinChat(state, document.getElementById("vb-chat-messages"), () => renderVariantB(state, root));
}

function floorRiskChip(state, categoryId) {
  const risk = state.floorRisk.find((r) => r.category.id === categoryId);
  if (!risk) return "";
  return risk.atRisk
    ? `<span class="vb-risk vb-risk--behind">behind pace</span>`
    : `<span class="vb-risk vb-risk--ontrack">on pace</span>`;
}

function renderDashboard(state) {
  const todays = state.weekly_plan.commitments.filter((c) => c.day === state.todayName);
  const doneCount = todays.filter((c) => c.status === "done").length;
  const pct = todays.length ? doneCount / todays.length : 0;

  return `
    <div class="vb-breadcrumb">${state.pathway.destination_label} <span class="vb-breadcrumb-sep">&rsaquo;</span> 5 Categories</div>

    <section class="va-hero">
      ${donutSVG({ size: 150, stroke: 14, pct, color: "var(--status-good)", label: `${doneCount}/${todays.length}` })}
      <div class="va-streak">🔥 ${state.streak}-day streak</div>
      <div class="va-week-label">${state.weekly_plan.week_label}</div>
    </section>

    <section class="va-cat-row vb-cat-row-wide">
      ${state.categories.map((c) => {
        const floorPct = c.floor_status === "decided" ? Math.min(1, state.hoursThisWeek[c.id] / c.floor_hours_per_week) : null;
        return `
        <div class="va-cat" title="${c.floor_note}">
          ${donutSVG({ size: 64, stroke: 7, pct: floorPct ?? 0, color: `var(--cat-${c.slot})`, track: `var(--cat-${c.slot}-soft)` })}
          <span>${c.name}</span>
          <small>${c.floor_status === "decided" ? c.floor_hours_per_week + "h floor" : "floor open"}</small>
          ${floorRiskChip(state, c.id)}
        </div>`;
      }).join("")}
    </section>
  `;
}

function renderCalendarTab(state) {
  return `
    <h1>Weekly Execution Plan — Calendar</h1>
    <p class="vb-sub">${state.weekly_plan.week_label}</p>
    ${renderCalendar(state)}
  `;
}

function renderTableTab(state, root) {
  const { html } = renderTableSwitch(state, () => renderVariantB(state, root));
  return `
    <h1>Weekly Execution Plan — Table</h1>
    <p class="vb-sub">${state.weekly_plan.week_label} — every commitment, in detail</p>
    ${html}
  `;
}

function renderCheckinTab(state) {
  return `
    <h1>Check-in — ${state.todayName}</h1>
    <p class="vb-sub">Conversational check-in, mounted inside the Cascade shell.</p>
    <div class="vc-messages vb-chat" id="vb-chat-messages"></div>
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
