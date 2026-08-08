// Variant C — "Timeline". No sidebar, no tabs — one continuous scroll that
// literally draws the Cascade: the Pathway's remaining horizon (2026->2033)
// zoomed into this week, then Today / This week / Categories / History
// stacked as sections, with a scrollspy to jump between them.

let tlObserver = null;

const TL_SECTIONS = [
  { id: "tl-today", label: "Today" },
  { id: "tl-week", label: "Week" },
  { id: "tl-categories", label: "Categories" },
  { id: "tl-history", label: "History" },
];

function renderVariantC(state, root) {
  root.classList.add("tl-shell-wrap");

  root.innerHTML = `
    <div class="tl-shell">
      <header class="tl-header">
        <span class="tl-word">Digby</span>
        <span class="tl-dest">${state.pathway.destination_label}</span>
      </header>

      <section class="tl-zoom">
        <div class="tl-zoom-row">
          <span class="tl-zoom-label">Pathway — ${state.pathwayProgress.startYear}&ndash;${state.pathwayProgress.endYear}</span>
          <div class="tl-bar tl-bar--pathway">
            <div class="tl-bar-fill" style="width:${state.pathwayProgress.pct * 100}%"></div>
            <div class="tl-bar-marker" style="left:${state.pathwayProgress.pct * 100}%" title="Today"></div>
          </div>
          <span class="tl-zoom-note">${Math.round(state.pathwayProgress.pct * 100)}% of the way to the Destination — illustrative, the Pathway has no tracked start date</span>
        </div>
        <div class="tl-zoom-row">
          <span class="tl-zoom-label">This week</span>
          <div class="tl-bar tl-bar--week">
            ${state.weekDates.map((d) => `<div class="tl-week-seg ${d.isToday ? "tl-week-seg--today" : ""}" title="${d.name} ${d.label}"><span>${d.name[0]}</span></div>`).join("")}
          </div>
        </div>
      </section>

      ${state.escalations.length ? `
        <div class="vb-banner tl-banner">
          <strong>Escalation:</strong>
          ${state.escalations.map((e) => `${e.category.name} (${e.count} misses)`).join(", ")}
          — threshold is ${state.escalation_rule.misses}/${state.escalation_rule.window_days} days.
          <button id="tl-recovery">Start Recovery Session</button>
        </div>` : ""}

      <section id="tl-today" class="tl-section">
        <h2>Today — ${state.todayName}</h2>
        <div class="vc-messages tl-chat" id="tl-chat-messages"></div>
      </section>

      <section id="tl-week" class="tl-section">
        <h2>This week</h2>
        <p class="vb-sub">${state.weekly_plan.week_label}</p>
        ${renderCalendar(state)}
      </section>

      <section id="tl-categories" class="tl-section">
        <h2>Categories</h2>
        <div class="va-cat-row vb-cat-row-wide">
          ${state.categories.map((c) => {
            const floorPct = c.floor_status === "decided" ? Math.min(1, state.hoursThisWeek[c.id] / c.floor_hours_per_week) : null;
            const risk = state.floorRisk.find((r) => r.category.id === c.id);
            return `
            <div class="va-cat" title="${c.floor_note}">
              ${donutSVG({ size: 64, stroke: 7, pct: floorPct ?? 0, color: `var(--cat-${c.slot})`, track: `var(--cat-${c.slot}-soft)` })}
              <span>${c.name}</span>
              <small>${c.floor_status === "decided" ? c.floor_hours_per_week + "h floor" : "floor open"}</small>
              ${risk ? `<span class="vb-risk vb-risk--${risk.atRisk ? "behind" : "ontrack"}">${risk.atRisk ? "behind pace" : "on pace"}</span>` : ""}
            </div>`;
          }).join("")}
        </div>
      </section>

      <section id="tl-history" class="tl-section">
        <h2>History</h2>
        <div class="vb-history-grid">
          <div><h3>Last 5 weeks</h3><div class="va-heatmap-wrap">${heatmapSVG(state.history)}</div></div>
          <div><h3>Miss reasons</h3><div class="va-hbar-wrap">${hbarSVG(state.reasonTally)}</div></div>
        </div>
      </section>
    </div>

    <nav class="tl-scrollspy">
      ${TL_SECTIONS.map((s) => `<button class="tl-spy-dot" data-target="${s.id}" title="${s.label}"></button>`).join("")}
    </nav>
  `;

  const recoveryBtn = document.getElementById("tl-recovery");
  if (recoveryBtn) recoveryBtn.onclick = () => alert("Recovery Session started — 15 minutes on the clock. (Prototype stub.)");

  root.querySelectorAll(".tl-spy-dot").forEach((dot) => {
    dot.onclick = () => document.getElementById(dot.dataset.target).scrollIntoView({ behavior: "smooth", block: "start" });
  });

  mountCheckinChat(state, document.getElementById("tl-chat-messages"), () => renderVariantC(state, root));

  wireScrollspy(root);
}

function wireScrollspy(root) {
  const dots = root.querySelectorAll(".tl-spy-dot");
  const setActive = (id) => dots.forEach((d) => d.classList.toggle("active", d.dataset.target === id));
  setActive("tl-today");

  // Not available outside a real browser (e.g. the jsdom test harness) —
  // the dots still render and are still clickable without it.
  if (typeof IntersectionObserver === "undefined") return;

  if (tlObserver) tlObserver.disconnect();
  tlObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive(visible[0].target.id);
    },
    { threshold: [0.3, 0.6] }
  );
  root.querySelectorAll(".tl-section").forEach((sec) => tlObserver.observe(sec));
}
