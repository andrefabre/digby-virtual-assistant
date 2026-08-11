// Command Center — the winning design from the prototype round (see
// README.md for the other two directions considered and why this one won).
// Cockpit, not tabs: a row of 4 always-visible cards (KPIs, View Plan,
// Categories, History — View Plan/History are teasers that open a full
// modal on click), then Calendar full-width, then Check-in full-width.
// Ctrl+K search jumps straight to any commitment.

let ccPaletteOpen = false;
let ccModal = null; // "viewplan" | "history" | null

function renderApp(state, root) {
  root.classList.add("cc-shell-wrap");

  const commitments = state.weekly_plan.commitments;
  const planStats = {
    total: commitments.length,
    done: commitments.filter((c) => c.status === "done").length,
    missed: commitments.filter((c) => c.status === "missed").length,
    pending: commitments.filter((c) => c.status === "pending").length,
  };

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
        <div class="cc-row-4">
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

          <section class="cc-panel cc-panel--teaser" id="cc-open-viewplan" data-modal="viewplan" tabindex="0" role="button">
            <h2>View Plan</h2>
            <div class="cc-card-stat"><span class="cc-card-number">${planStats.total}</span><span class="cc-card-sub">commitments this week</span></div>
            <div class="cc-card-substats">
              <span>${planStats.done} done</span>
              <span>${planStats.missed} missed</span>
              <span>${planStats.pending} pending</span>
            </div>
            <div class="cc-card-cta">View full plan →</div>
          </section>

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

          <section class="cc-panel cc-panel--teaser" id="cc-open-history" data-modal="history" tabindex="0" role="button">
            <h2>History</h2>
            <div class="cc-mini-heatmap">${heatmapSVG(state.history, { cell: 6, gap: 2 })}</div>
            <div class="cc-card-cta">View history →</div>
          </section>
        </div>

        <section class="cc-panel cc-panel--calendar">
          <h2>This week</h2>
          ${renderCalendar(state)}
        </section>

        <section class="cc-panel cc-panel--chat">
          <h2>Check-in — ${state.todayName}</h2>
          <div class="vc-messages cc-chat" id="cc-chat-messages"></div>
        </section>
      </div>
    </div>

    <div class="cc-palette-backdrop ${ccPaletteOpen ? "open" : ""}" id="cc-palette-backdrop">
      <div class="cc-palette" id="cc-palette">
        <input type="text" id="cc-palette-input" placeholder="Search commitments by title, category, or day…" autocomplete="off" />
        <ul class="cc-palette-results" id="cc-palette-results"></ul>
      </div>
    </div>

    ${ccModal ? renderModal(state, root) : ""}
  `;

  wireTopbar(state, root);
  wirePalette(state, root);
  wireTeasers(state, root);
  wireModal(state, root);

  mountCheckinChat(state, document.getElementById("cc-chat-messages"), () => renderApp(state, root));
}

function renderModal(state, root) {
  const title = ccModal === "viewplan" ? "Weekly Execution Plan — View Plan" : "History";
  const body = ccModal === "viewplan"
    ? renderTableSwitch(state, () => renderApp(state, root)).html
    : `
      <div class="vb-history-grid">
        <div><h2>Last 5 weeks</h2><div class="va-heatmap-wrap">${heatmapSVG(state.history)}</div></div>
        <div><h2>Miss reasons</h2><div class="va-hbar-wrap">${hbarSVG(state.reasonTally)}</div></div>
      </div>
    `;
  return `
    <div class="cc-modal-backdrop" id="cc-modal-backdrop">
      <div class="cc-modal">
        <header><h1>${title}</h1><button id="cc-modal-close">✕</button></header>
        <div class="cc-modal-body">${body}</div>
      </div>
    </div>
  `;
}

function wireTopbar(state, root) {
  document.getElementById("cc-search-btn").onclick = () => { ccPaletteOpen = true; renderApp(state, root); };
  const recoveryBtn = document.getElementById("cc-recovery");
  if (recoveryBtn) recoveryBtn.onclick = () => alert("Recovery Session started — 15 minutes on the clock. (Prototype stub.)");
}

function wireTeasers(state, root) {
  root.querySelectorAll(".cc-panel--teaser").forEach((card) => {
    const open = () => { ccModal = card.dataset.modal; renderApp(state, root); };
    card.onclick = open;
    card.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } };
  });
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
        renderApp(state, root);
        alert(`${c.title}\n${c.day} at ${c.start} · ${c.hours}h · ${c.status}`);
      };
    });
  }

  input.oninput = () => renderResults(input.value);
  if (ccPaletteOpen) { input.focus(); renderResults(""); }

  backdrop.onclick = (e) => { if (e.target === backdrop) { ccPaletteOpen = false; renderApp(state, root); } };
}

function wireModal(state, root) {
  const backdrop = document.getElementById("cc-modal-backdrop");
  if (!backdrop) return;
  document.getElementById("cc-modal-close").onclick = () => { ccModal = null; renderApp(state, root); };
  backdrop.onclick = (e) => { if (e.target === backdrop) { ccModal = null; renderApp(state, root); } };
  if (ccModal === "viewplan") renderTableSwitch(state, () => renderApp(state, root)).wire(document.querySelector(".cc-modal-body"));
}

document.addEventListener("keydown", (e) => {
  const root = document.getElementById("app");
  if (!root || !latestState) return;
  const typing = document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA");
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    ccPaletteOpen = !ccPaletteOpen;
    renderApp(latestState, root);
  } else if (e.key === "Escape" && ccPaletteOpen) {
    ccPaletteOpen = false;
    renderApp(latestState, root);
  } else if (e.key === "Escape" && ccModal && !typing) {
    ccModal = null;
    renderApp(latestState, root);
  }
});
