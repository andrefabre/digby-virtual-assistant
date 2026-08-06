const state = { data: null };

async function load() {
  const res = await fetch("/api/state");
  state.data = await res.json();
  render();
}

function render() {
  renderPathway();
  renderCategories();
  renderCommitments();
  renderCheckinStatus();
}

function renderPathway() {
  const { pathway } = state.data;
  const el = document.getElementById("pathway");
  el.innerHTML = `
    <h2>${pathway.destination_label}</h2>
    <ul>${pathway.parts.map((p) => `<li>${p}</li>`).join("")}</ul>
    <p class="source">Source: ${pathway.source}</p>
  `;
}

function renderCategories() {
  const el = document.getElementById("categories");
  el.innerHTML = state.data.categories
    .map((c) => {
      const floorText =
        c.floor_status === "decided"
          ? `${c.floor_hours_per_week}h/week`
          : "not yet set";
      return `
        <div class="category">
          <h3>${c.name}</h3>
          <p class="floor ${c.floor_status}">Floor: ${floorText}</p>
          <p>${c.role_note}</p>
          <p class="hint">${c.floor_note}</p>
          <p class="source">Source: ${c.source}</p>
        </div>
      `;
    })
    .join("");
}

function renderCommitments() {
  document.getElementById("week-label").textContent =
    state.data.weekly_plan.week_label;

  const reasonOptions = state.data.reason_codes
    .map((r) => `<option value="${r}">${r.replace(/_/g, " ")}</option>`)
    .join("");

  const tbody = document.querySelector("#commitments tbody");
  tbody.innerHTML = state.data.weekly_plan.commitments
    .map((c) => {
      const categoryName =
        state.data.categories.find((cat) => cat.id === c.category)?.name ??
        c.category;
      return `
        <tr data-id="${c.id}">
          <td>${categoryName}</td>
          <td>${c.title}</td>
          <td>${c.hours}</td>
          <td>
            <select class="status-select" data-id="${c.id}">
              <option value="pending" ${c.status === "pending" ? "selected" : ""}>pending</option>
              <option value="done" ${c.status === "done" ? "selected" : ""}>done</option>
              <option value="missed" ${c.status === "missed" ? "selected" : ""}>missed</option>
            </select>
          </td>
          <td>
            <select class="reason-select" data-id="${c.id}" ${c.status !== "missed" ? "disabled" : ""}>
              <option value="">—</option>
              ${reasonOptions}
            </select>
          </td>
        </tr>
      `;
    })
    .join("");

  tbody.querySelectorAll(".status-select").forEach((sel) => {
    sel.addEventListener("change", (e) => {
      const id = e.target.dataset.id;
      const commitment = state.data.weekly_plan.commitments.find((c) => c.id === id);
      commitment.status = e.target.value;
      if (commitment.status !== "missed") commitment.reason_code = null;
      renderCommitments();
    });
  });

  tbody.querySelectorAll(".reason-select").forEach((sel) => {
    sel.value = state.data.weekly_plan.commitments.find(
      (c) => c.id === sel.dataset.id
    ).reason_code || "";
    sel.addEventListener("change", (e) => {
      const id = e.target.dataset.id;
      const commitment = state.data.weekly_plan.commitments.find((c) => c.id === id);
      commitment.reason_code = e.target.value || null;
    });
  });
}

function renderCheckinStatus() {
  const today = new Date().toISOString().slice(0, 10);
  const already = state.data.checkins.some((c) => c.date === today);
  const el = document.getElementById("checkin-status");
  const btn = document.getElementById("submit-checkin");
  if (already) {
    el.textContent = "Already checked in today.";
    btn.disabled = true;
  } else {
    el.textContent = "";
    btn.disabled = false;
  }
}

async function submitCheckin() {
  const updates = state.data.weekly_plan.commitments
    .filter((c) => c.status !== "pending")
    .map((c) => ({
      commitment_id: c.id,
      status: c.status,
      reason_code: c.reason_code,
    }));

  const res = await fetch("/api/checkin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates }),
  });

  const body = await res.json();
  if (!res.ok) {
    alert(body.error);
    return;
  }
  state.data = body;
  render();
}

document.getElementById("submit-checkin").addEventListener("click", submitCheckin);
load();
