// Small shared SVG chart primitives — generic drawing helpers, not layout.
// Each variant is free to arrange/skip these however it likes.

function donutSVG({ size = 96, stroke = 10, pct = 0, color = "var(--cat-1)", track = "var(--gridline)", label = "" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, pct)) * c;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="donut">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${track}" stroke-width="${stroke}" />
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
        stroke-linecap="round" stroke-dasharray="${dash} ${c - dash}"
        transform="rotate(-90 ${size / 2} ${size / 2})" />
      ${label ? `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" class="donut-label">${label}</text>` : ""}
    </svg>
  `;
}

// Sequential blue ramp step for a 0..maxDone value (heatmap cell).
function seqStep(done, maxDone) {
  if (done <= 0) return "var(--gridline)";
  const ramp = ["var(--seq-100)", "var(--seq-200)", "var(--seq-300)", "var(--seq-400)", "var(--seq-500)", "var(--seq-600)"];
  const idx = Math.min(ramp.length - 1, Math.round((done / Math.max(1, maxDone)) * (ramp.length - 1)));
  return ramp[idx];
}

// GitHub-style contribution heatmap. `days` = [{date, done, missed}], oldest first.
function heatmapSVG(days, { cell = 12, gap = 3 } = {}) {
  const maxDone = Math.max(1, ...days.map((d) => d.done));
  // lay out into week columns, Sun..Sat rows
  const first = new Date(days[0].date);
  const startPad = first.getDay();
  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  days.forEach((d) => cells.push(d));
  const cols = Math.ceil(cells.length / 7);
  const w = cols * (cell + gap);
  const h = 7 * (cell + gap);
  let rects = "";
  cells.forEach((d, i) => {
    const col = Math.floor(i / 7);
    const row = i % 7;
    const x = col * (cell + gap);
    const y = row * (cell + gap);
    if (!d) return;
    const fill = seqStep(d.done, maxDone);
    rects += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" fill="${fill}"><title>${d.date} — ${d.done} done, ${d.missed} missed</title></rect>`;
  });
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" class="heatmap">${rects}</svg>`;
}

// Simple horizontal sequential bar chart. `data` = [[label, value], ...]
function hbarSVG(data, { width = 260, barH = 16, gap = 6 } = {}) {
  const max = Math.max(1, ...data.map(([, v]) => v));
  const labelW = 130;
  const plotW = width - labelW;
  const h = data.length * (barH + gap);
  let rows = "";
  data.forEach(([label, value], i) => {
    const y = i * (barH + gap);
    const w = (value / max) * plotW;
    rows += `
      <text x="${labelW - 8}" y="${y + barH / 2}" text-anchor="end" dominant-baseline="central" class="hbar-label">${label.replace(/_/g, " ")}</text>
      <rect x="${labelW}" y="${y}" width="${Math.max(2, w)}" height="${barH}" rx="4" fill="var(--seq-400)" />
      <text x="${labelW + w + 6}" y="${y + barH / 2}" dominant-baseline="central" class="hbar-value">${value}</text>
    `;
  });
  return `<svg width="${width}" height="${h}" viewBox="0 0 ${width} ${h}" class="hbar">${rows}</svg>`;
}
