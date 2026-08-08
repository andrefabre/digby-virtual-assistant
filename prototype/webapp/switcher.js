// Shared floating variant switcher — identical across all variants.
// All three are now creative evolutions of the validated Cascade shell —
// B keeps its letter since that's the one Andre already knows; A and C are
// the new ones. Momentum and the old Conversation variant are retired —
// still recoverable from this branch's git history if wanted later.
const VARIANTS = [
  { key: "A", name: "Command Center" },
  { key: "B", name: "Cascade" },
  { key: "C", name: "Timeline" },
];

function currentVariant() {
  const key = new URLSearchParams(location.search).get("variant") || "B";
  return VARIANTS.find((v) => v.key === key) ? key : "B";
}

function setVariant(key) {
  const url = new URL(location.href);
  url.searchParams.set("variant", key);
  history.replaceState(null, "", url);
  renderApp();
}

function cycleVariant(dir) {
  const idx = VARIANTS.findIndex((v) => v.key === currentVariant());
  const next = VARIANTS[(idx + dir + VARIANTS.length) % VARIANTS.length];
  setVariant(next.key);
}

function mountSwitcher() {
  let bar = document.getElementById("proto-switcher");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "proto-switcher";
    document.body.appendChild(bar);
  }
  const key = currentVariant();
  const variant = VARIANTS.find((v) => v.key === key);
  bar.innerHTML = `
    <button aria-label="Previous variant" id="proto-prev">&larr;</button>
    <span class="label"><b>${variant.key}</b> — ${variant.name}</span>
    <button aria-label="Next variant" id="proto-next">&rarr;</button>
    <span class="dots">${VARIANTS.map((v) => `<span class="dot ${v.key === key ? "active" : ""}"></span>`).join("")}</span>
  `;
  document.getElementById("proto-prev").onclick = () => cycleVariant(-1);
  document.getElementById("proto-next").onclick = () => cycleVariant(1);
}

document.addEventListener("keydown", (e) => {
  const el = document.activeElement;
  const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
  if (typing) return;
  if (e.key === "ArrowLeft") cycleVariant(-1);
  if (e.key === "ArrowRight") cycleVariant(1);
});
