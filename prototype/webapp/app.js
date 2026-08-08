// Orchestrator: three creative evolutions of the validated Cascade shell
// (Command Center / Cascade / Timeline), switchable via ?variant=A|B|C.
// Sub-shape B (new throwaway route) — Digby has no existing app to embed into.
// All state is in-memory (data.js) — reload resets everything.

let latestState = null;

const actions = {
  submitCheckin: (updates) => store.submitCheckin(updates),
};

function renderApp() {
  const root = document.getElementById("app");
  const renderers = { A: renderVariantA, B: renderVariantB, C: renderVariantC };
  const key = currentVariant();
  root.className = "";
  root.innerHTML = "";
  renderers[key](latestState, root, actions);
  mountSwitcher();
}

store.subscribe((state) => {
  latestState = state;
  renderApp();
});
