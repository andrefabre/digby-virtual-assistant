// Variant A — "Command Center". Andre's pick. Cockpit, not tabs: everything
// lives on one screen. Order top to bottom: KPIs, then Check-in / View Plan
// / History side by side, then Categories, then this week's Calendar.
// Ctrl+K search still jumps straight to any commitment.

let ccPaletteOpen = false;

function renderVariantA(state, root) {
  root.classList.add("cc-shell-wrap");

  root.innerHTML = `
    <div class="cc-shell">
      <header class="cc-topbar">
        <span class="cc-word">Digby</span>
        <button class="cc-search" id="cc-search-btn">🔍 Jump to a commitment… <kbd>Ctrl K</kbd></button>
        <span class="cc-streak">🔥 ${state.streak}d</span>
      </header>

      ${state.escalations.length ? `
        <div class="vb-banner">
          <strong>Escalation:</strong>
          ${state.escalations.map((e) => `${e.category.name} (${e.count} misses)`).join(", ")}
          — threshold is ${state.escalation_rule.misses}/${state.escalation_rule.window_days} days.
          <button id="cc-recovery">Start Recovery Session</button>
        </div>` : ""}

      <div class="cc-grid">
        <section class="cc-panel cc-panel--kpis">
          <div class="cc-kpi">
            <div class="cc-kpi-top"><span class="cc-kpi-label">Check-ins, last 14 days</span></div>
            <div class="cc-kpi-row">
              <span class="cc-kpi-value">${state.streak}</span>
              ${sparklineSVG(state.recentDoneTrend)}
            </div>
          </div>
          <div class="cc-kpi-mini">
            <div><b>${state.floorRisk.filter((r) => r.atRisk).length}</b><span>Floors behind pace</span></div>
            <div><b>${state.escalations.length}</b><span>Escalations</span></div>
            <div><b>${state.alreadyCheckedInToday ? "✓" : "—"}</b><span>Checked in today</span></div>
          </div>
        </section>

        <div class="cc-row-3">
          <section class="cc-panel cc-panel--chat">
            <h2>Check-in — ${state.todayName}</h2>
            <div class="vc-messages cc-chat" id="cc-chat-messages"></div>
          </section>

          <section class="cc-panel cc-panel--viewplan">
            <h2>View Plan</h2>
            <div class="cc-scroll">${renderTableSwitch(state, () => renderVariantA(state, root)).html}</div>
          </section>

          <section class="cc-panel cc-panel--history">
            <h2>History</h2>
            <div class="cc-scroll">
              <div class="vb-history-grid">
                <div><h3>Last 5 weeks</h3><div class="va-heatmap-wrap">${heatmapSVG(state.history)}</div></div>
                <div><h3>Miss reasons</h3><div class="va-hbar-wrap">${hbarSVG(state.reasonTally)}</div></div>
              </div>
            </div>
          </section>
        </div>

        <section class="cc-panel cc-panel--categories">
          <h2>Categories</h2>
          <ul class="cc-cat-list">
            ${state.categories.map((c) => {
              const risk = state.floorRisk.find((r) => r.category.id === c.id);
              return `
              <li>
                <span class="va-dot" style="background:var(--cat-${c.slot})"></span>
                <span class="cc-cat-name">${c.name}</span>
                <span class="cc-cat-floor">${c.floor_status === "decided" ? `${c.floor_hours_per_week}h/wk` : "floor open"}</span>
                ${risk ? `<span class="vb-risk vb-risk--${risk.atRisk ? "behind" : "ontrack"}">${risk.atRisk ? `behind (pace ${risk.pace}h)` : "on pace"}</span>` : ""}
              </li>`;
            }).join("")}
          </ul>
        </section>

        <section class="cc-panel cc-panel--calendar">
          <h2>This week</h2>
          ${renderCalendar(state)}
        </section>
      </div>
    </div>

    <div class="cc-palette-backdrop ${ccPaletteOpen ? "open" : ""}" id="cc-palette-backdrop">
      <div class="cc-palette" id="cc-palette">
        <input type="text" id="cc-palette-input" placeholder="Search commitments by title, category, or day…" autocomplete="off" />
        <ul class="cc-palette-results" id="cc-palette-results"></ul>
      </div>
    </div>
  `;

  wireTopbar(state, root);
  wirePalette(state, root);
  renderTableSwitch(state, () => renderVariantA(state, root)).wire(root);

  mountCheckinChat(state, document.getElementById("cc-chat-messages"), () => renderVariantA(state, root));
}

function wireTopbar(state, root) {
  document.getElementById("cc-search-btn").onclick = () => { ccPaletteOpen = true; renderVariantA(state, root); };
  const recoveryBtn = document.getElementById("cc-recovery");
  if (recoveryBtn) recoveryBtn.onclick = () => alert("Recovery Session started — 15 minutes on the clock. (Prototype stub.)");
}

function wirePalette(state, root) {
  const backdrop = document.getElementById("cc-palette-backdrop");
  const input = document.getElementById("cc-palette-input");
  const results = document.getElementById("cc-palette-results");

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    const matches = !q ? [] : state.weekly_plan.commitments.filter((c) => {
      const cat = state.categories.find((cc) => cc.id === c.category);
      return `${c.title} ${cat.name} ${c.day}`.toLowerCase().includes(q);
    });
    results.innerHTML = matches.slice(0, 8).map((c) => {
      const cat = state.categories.find((cc) => cc.id === c.category);
      return `<li data-id="${c.id}"><span class="va-dot" style="background:var(--cat-${cat.slot})"></span> <b>${c.title}</b> — ${cat.name}, ${c.day} ${c.start}, ${c.hours}h</li>`;
    }).join("") || (q ? `<li class="cc-palette-empty">No matches.</li>` : "");
    results.querySelectorAll("li[data-id]").forEach((li) => {
      li.onclick = () => {
        const c = state.weekly_plan.commitments.find((cc) => cc.id === li.dataset.id);
        ccPaletteOpen = false;
        renderVariantA(state, root);
        alert(`${c.title}\n${c.day} at ${c.start} · ${c.hours}h · ${c.status}`);
      };
    });
  }

  input.oninput = () => renderResults(input.value);
  if (ccPaletteOpen) { input.focus(); renderResults(""); }

  backdrop.onclick = (e) => { if (e.target === backdrop) { ccPaletteOpen = false; renderVariantA(state, root); } };
}

document.addEventListener("keydown", (e) => {
  if (!document.querySelector(".cc-shell-wrap")) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    ccPaletteOpen = !ccPaletteOpen;
    renderApp();
  } else if (e.key === "Escape" && ccPaletteOpen) {
    ccPaletteOpen = false;
    renderApp();
  }
});
