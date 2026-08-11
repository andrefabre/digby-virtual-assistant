// Boots the Command Center prototype (command-center.js) — the winning
// design from the prototype round, see README.md for what else was tried
// and why this one won. No variant switching anymore; this is it.
// All state is in-memory (data.js) — reload resets everything.

let latestState = null;

const actions = {
  submitCheckin: (updates) => store.submitCheckin(updates),
};

store.subscribe((state) => {
  latestState = state;
  renderApp(state, document.getElementById("app"));
});
