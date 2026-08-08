// Variant B — "Cascade", now the base. Persistent sidebar + KPI/Cascade
// dashboard chrome stay, but:
//  - Dashboard borrows Variant A's hero (daily ring + streak + category
//    rings) instead of the old KPI-tile grid.
//  - The Weekly Execution Plan is split into two separate menu items —
//    Calendar (time grid) and Table (every commitment, full detail, at
//    once) — instead of being bundled with check-in.
//  - Check-in is its own menu item and borrows Variant C's conversational
//    quick-reply flow wholesale (same buildMessages/wireQuickReplies).

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
        : vbTab === "table" ? renderTable(state)
        : vbTab === "checkin" ? renderCheckinTab(state)
        : renderHistory(state)
      }
    </main>
  `;

  root.querySelectorAll(".vb-nav-item").forEach((btn) => {
    btn.onclick = () => { vbTab = btn.dataset.tab; renderVariantB(state, root); };
  });
  root.querySelectorAll(".vb-subswitch-btn").forEach((btn) => {
    btn.onclick = () => { vbTableView = btn.dataset.view; renderVariantB(state, root); };
  });
  const recoveryBtn = document.getElementById("vb-recovery");
  if (recoveryBtn) recoveryBtn.onclick = () => alert("Recovery Session started — 15 minutes on the clock. (Prototype stub.)");

  if (vbTab === "checkin") {
    const msgs = document.getElementById("vb-chat-messages");
    msgs.innerHTML = buildMessages(state).join("");
    wireQuickReplies(state, msgs, () => renderVariantB(state, root));
    msgs.scrollTop = msgs.scrollHeight;
  }
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
        </div>`;
      }).join("")}
    </section>
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

function renderCalendarTab(state) {
  return `
    <h1>Weekly Execution Plan — Calendar</h1>
    <p class="vb-sub">${state.weekly_plan.week_label}</p>
    ${renderCalendar(state)}
  `;
}

// Three structurally different reads of the same commitment list — not yet
// settled which is right, so all three stay switchable via the pill row.
let vbTableView = "list";
const TABLE_VIEWS = [
  { key: "list", label: "List" },
  { key: "byDay", label: "By Day" },
  { key: "byCategory", label: "By Category" },
];

function renderTable(state) {
  const renderers = { list: renderTableList, byDay: renderTableByDay, byCategory: renderTableByCategory };
  return `
    <h1>Weekly Execution Plan — Table</h1>
    <p class="vb-sub">${state.weekly_plan.week_label} — every commitment, in detail</p>
    <div class="vb-subswitch">
      ${TABLE_VIEWS.map((v) => `<button class="vb-subswitch-btn ${vbTableView === v.key ? "active" : ""}" data-view="${v.key}">${v.label}</button>`).join("")}
    </div>
    ${renderers[vbTableView](state)}
  `;
}

function statusChip(c) {
  return `<span class="vb-status vb-status--${c.status}">${c.status}</span>`;
}

// 1 — dense spreadsheet: every row, every column, sorted Mon->Sun.
function renderTableList(state) {
  const sorted = [...state.weekly_plan.commitments].sort((a, b) =>
    DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) || a.start.localeCompare(b.start)
  );
  return `
    <table class="vb-table">
      <thead><tr><th>Day</th><th>Start</th><th>Category</th><th>Commitment</th><th>Hours</th><th>Status</th><th>Reason</th></tr></thead>
      <tbody>
        ${sorted.map((c) => {
          const cat = state.categories.find((cc) => cc.id === c.category);
          return `<tr class="${c.day === state.todayName ? "vb-row-today" : ""}">
            <td>${c.day}</td>
            <td>${c.start}</td>
            <td><span class="va-dot" style="background:var(--cat-${cat.slot})"></span> ${cat.name}</td>
            <td>${c.title}</td>
            <td>${c.hours}</td>
            <td>${statusChip(c)}</td>
            <td>${c.reason_code ? c.reason_code.replace(/_/g, " ") : "—"}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  `;
}

// 2 — read top-to-bottom like the markdown Weekly Execution Plan document
// itself: a day heading, its commitments underneath, a hint of a checklist.
function renderTableByDay(state) {
  return `
    <div class="vb-byday">
      ${state.weekDates.map((d) => {
        const items = state.weekly_plan.commitments
          .filter((c) => c.day === d.name)
          .sort((a, b) => a.start.localeCompare(b.start));
        const total = items.reduce((sum, c) => sum + c.hours, 0);
        return `
          <section class="vb-day-group ${d.isToday ? "vb-day-group--today" : ""}">
            <header class="vb-day-header">
              <h3>${d.name} <span class="vb-day-date">${d.label}</span></h3>
              <span class="vb-day-total">${total}h committed</span>
            </header>
            <ul class="vb-day-list">
              ${items.length ? items.map((c) => {
                const cat = state.categories.find((cc) => cc.id === c.category);
                return `
                  <li class="vb-day-item vb-day-item--${c.status}">
                    <span class="vb-day-time">${c.start}</span>
                    <span class="va-dot" style="background:var(--cat-${cat.slot})"></span>
                    <span class="vb-day-title">${c.title}</span>
                    <span class="vb-day-cat">${cat.name}</span>
                    <span class="vb-day-hours">${c.hours}h</span>
                    ${statusChip(c)}
                  </li>
                `;
              }).join("") : `<li class="vb-day-empty">Nothing planned.</li>`}
            </ul>
          </section>
        `;
      }).join("")}
    </div>
  `;
}

// 3 — grouped by Category, each with its Floor progress — the accounting
// view: "is Education actually getting its 40h this week?"
function renderTableByCategory(state) {
  return `
    <div class="vb-bycat">
      ${state.categories.map((cat) => {
        const items = [...state.weekly_plan.commitments.filter((c) => c.category === cat.id)]
          .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) || a.start.localeCompare(b.start));
        const committed = items.reduce((sum, c) => sum + c.hours, 0);
        const donePct = cat.floor_status === "decided" ? Math.min(1, state.hoursThisWeek[cat.id] / cat.floor_hours_per_week) : null;
        return `
          <section class="vb-cat-group" style="border-top-color: var(--cat-${cat.slot})">
            <header class="vb-cat-header">
              <span class="va-dot" style="background:var(--cat-${cat.slot})"></span>
              <h3>${cat.name}</h3>
              <span class="vb-cat-floor">${cat.floor_status === "decided" ? cat.floor_hours_per_week + "h/wk floor" : "floor open"}</span>
              <span class="vb-cat-total">${committed}h planned</span>
            </header>
            ${donePct !== null ? `
              <div class="vb-meter"><div class="vb-meter-fill" style="width:${donePct * 100}%; background:var(--cat-${cat.slot})"></div></div>
            ` : ""}
            <ul class="vb-cat-list">
              ${items.length ? items.map((c) => `
                <li class="vb-cat-item vb-cat-item--${c.status}">
                  <span class="vb-cat-day">${c.day} ${c.start}</span>
                  <span class="vb-cat-title">${c.title}</span>
                  <span class="vb-cat-hours">${c.hours}h</span>
                  ${statusChip(c)}
                </li>
              `).join("") : `<li class="vb-day-empty">Nothing planned.</li>`}
            </ul>
          </section>
        `;
      }).join("")}
    </div>
  `;
}

function renderCheckinTab(state) {
  return `
    <h1>Check-in — ${state.todayName}</h1>
    <p class="vb-sub">Same conversational flow as Variant C, mounted inside the Cascade shell.</p>
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
