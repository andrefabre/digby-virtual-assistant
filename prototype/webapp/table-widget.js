// Shared table widget: three structurally different reads of the week's
// commitment list (List / By Day / By Category), switchable via a pill row.

let vbTableView = "list";
const TABLE_VIEWS = [
  { key: "list", label: "List" },
  { key: "byDay", label: "By Day" },
  { key: "byCategory", label: "By Category" },
];

function statusChip(c) {
  return `<span class="vb-status vb-status--${c.status}">${c.status}</span>`;
}

function renderTableSwitch(state, onChange) {
  const renderers = { list: renderTableList, byDay: renderTableByDay, byCategory: renderTableByCategory };
  return {
    html: `
      <div class="vb-subswitch">
        ${TABLE_VIEWS.map((v) => `<button class="vb-subswitch-btn ${vbTableView === v.key ? "active" : ""}" data-view="${v.key}">${v.label}</button>`).join("")}
      </div>
      ${renderers[vbTableView](state)}
    `,
    wire(root) {
      root.querySelectorAll(".vb-subswitch-btn").forEach((btn) => {
        btn.onclick = () => { vbTableView = btn.dataset.view; onChange(); };
      });
    },
  };
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
