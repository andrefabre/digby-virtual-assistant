// Shared calendar widget: a Mon-Sun time grid, blocks positioned/sized by a
// commitment's start time + duration, colored by Category.

const CAL_START_HOUR = 6;
const CAL_END_HOUR = 21;
const CAL_PX_PER_HOUR = 52;

function minutesFromMidnight(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// `days` defaults to the full week; pass a filtered subset for a condensed view.
function renderCalendar(state, { days } = {}) {
  const weekDates = days || state.weekDates;
  const totalHeight = (CAL_END_HOUR - CAL_START_HOUR) * CAL_PX_PER_HOUR;
  const hours = [];
  for (let h = CAL_START_HOUR; h <= CAL_END_HOUR; h++) hours.push(h);

  const dayTotals = Object.fromEntries(
    weekDates.map((d) => [
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
      ${weekDates.map((d) => `
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
