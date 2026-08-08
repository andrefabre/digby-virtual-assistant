// Seed data + in-memory store. No persistence — a reload resets everything.
// This is what's being prototyped for real: pathway/categories/floors are
// taken from CONTEXT.md and the ADRs; the weekly plan and history below are
// sample data, not a real Weekly Execution Plan.

const SEED = {
  pathway: {
    destination_label: "Destination — end of 2033",
    parts: [
      "Unrestricted Practising Certificate held",
      "Specialist practitioner role in Legal Tech (employed or contracted)",
      "Exegesis running as a revenue-generating product business",
    ],
    source: "CONTEXT.md, ADR 0003",
  },
  categories: [
    {
      id: "education",
      name: "Education",
      slot: 1,
      role_note: "Outranks Business — Business is gated on Proof",
      floor_status: "decided",
      floor_hours_per_week: 40,
      floor_note: "40h/week in-semester. 0h in the Break; Security+ instead at 5h/week.",
      source: "issue #30",
    },
    {
      id: "career",
      name: "Career",
      slot: 2,
      role_note: "Separate fifth Category",
      floor_status: "open",
      floor_hours_per_week: null,
      floor_note: "Floor not yet defined.",
      source: "issue #27",
    },
    {
      id: "business",
      name: "Business",
      slot: 3,
      role_note: "Exegesis — four Pillars",
      floor_status: "open",
      floor_hours_per_week: null,
      floor_note: "Floor undecided; what Exegesis sells is still open.",
      source: "issue #33",
    },
    {
      id: "health_fitness",
      name: "Health & Fitness",
      slot: 4,
      role_note: "Enabler — defended, not traded",
      floor_status: "open",
      floor_hours_per_week: null,
      floor_note: "Floor not yet set.",
      source: "issue #31",
    },
    {
      id: "financial",
      name: "Financial",
      slot: 5,
      role_note: "Mostly money, not hours",
      floor_status: "open",
      floor_hours_per_week: null,
      floor_note: "Whether Floors even apply here is unresolved.",
      source: "issue #34",
    },
  ],
  reason_codes: [
    "underestimated_time",
    "interruption",
    "low_energy",
    "deprioritized",
    "external_blocker",
  ],
  escalation_rule: { misses: 2, window_days: 7, action: "15-minute Recovery Session", source: "issue #4" },
  weekly_plan: {
    week_label: "Sample week — demo data, not a real Weekly Execution Plan",
    commitments: [
      { id: "c1", category: "education", title: "MAS183 tutorial", hours: 2, day: "Mon", start: "10:00", status: "pending", reason_code: null },
      { id: "c1b", category: "health_fitness", title: "Morning session", hours: 1, day: "Mon", start: "07:00", status: "pending", reason_code: null },
      { id: "c2", category: "education", title: "ICT169 lab", hours: 3, day: "Thu", start: "13:00", status: "pending", reason_code: null },
      { id: "c3", category: "education", title: "Independent study block", hours: 4, day: "Tue", start: "09:00", status: "pending", reason_code: null },
      { id: "c3b", category: "business", title: "Exegesis Door metrics review", hours: 1, day: "Tue", start: "17:00", status: "pending", reason_code: null },
      { id: "c4", category: "health_fitness", title: "Training session", hours: 1, day: "Thu", start: "07:00", status: "pending", reason_code: null },
      { id: "c5", category: "career", title: "JSO application follow-up", hours: 1, day: "Wed", start: "11:00", status: "pending", reason_code: null },
      { id: "c5b", category: "education", title: "Revision block", hours: 2, day: "Wed", start: "14:00", status: "pending", reason_code: null },
      { id: "c6", category: "business", title: "Exegesis Door copy review", hours: 2, day: "Thu", start: "18:00", status: "pending", reason_code: null },
      { id: "c7", category: "financial", title: "Review Security+ exam fee savings", hours: 0.5, day: "Fri", start: "12:00", status: "pending", reason_code: null },
      { id: "c7b", category: "education", title: "Independent study block", hours: 3, day: "Fri", start: "09:00", status: "pending", reason_code: null },
      { id: "c8", category: "education", title: "Revision — networking unit", hours: 3, day: "Sat", start: "10:00", status: "pending", reason_code: null },
      { id: "c9", category: "health_fitness", title: "Long run", hours: 1.5, day: "Sun", start: "08:00", status: "pending", reason_code: null },
    ],
  },
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Deterministic PRNG so the demo heatmap/streak look the same on every reload.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoDaysAgo(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// Monday..Sunday for the real current week, so the calendar shows actual dates.
function currentWeekDates() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const mondayOffset = now.getDay() === 0 ? -6 : 1 - now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  return DAY_ORDER.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      name,
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      isToday: d.toISOString().slice(0, 10) === isoDaysAgo(0),
    };
  });
}

function buildDemoHistory() {
  const rng = mulberry32(42);
  const history = [];
  const reasonLog = [];
  const categoryIds = SEED.categories.map((c) => c.id);

  for (let i = 35; i >= 1; i--) {
    const date = isoDaysAgo(i);
    const weekday = new Date(date).getDay(); // 0=Sun..6=Sat
    const isWeekend = weekday === 0 || weekday === 6;
    const done = isWeekend ? Math.floor(rng() * 4) : 2 + Math.floor(rng() * 4);
    let missed = isWeekend ? Math.floor(rng() * 3) : rng() < 0.7 ? 0 : 1;

    // Force two Health & Fitness misses inside the last 7 days so the
    // escalation rule (2 misses / 7 days, issue #4) has something to show.
    let forcedCategory = null;
    if (i === 3 || i === 6) {
      missed = Math.max(missed, 1);
      forcedCategory = "health_fitness";
    }

    history.push({ date, done, missed });

    for (let m = 0; m < missed; m++) {
      reasonLog.push({
        date,
        category: forcedCategory && m === 0 ? forcedCategory : categoryIds[Math.floor(rng() * categoryIds.length)],
        reason_code: SEED.reason_codes[Math.floor(rng() * SEED.reason_codes.length)],
      });
    }
  }
  return { history, reasonLog };
}

function computeStreak(history, checkins) {
  const byDate = new Map(history.map((h) => [h.date, h.done > 0]));
  for (const c of checkins) {
    const anyDone = c.updates.some((u) => u.status === "done");
    byDate.set(c.date, anyDone);
  }
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const date = isoDaysAgo(i);
    if (byDate.get(date)) streak++;
    else if (i === 0) continue; // today may not be checked in yet — don't break the streak on it
    else break;
  }
  return streak;
}

function computeEscalations(reasonLog, checkins, categories, rule) {
  const cutoff = isoDaysAgo(rule.window_days);
  const counts = {};
  for (const entry of reasonLog) {
    if (entry.date >= cutoff) counts[entry.category] = (counts[entry.category] || 0) + 1;
  }
  for (const c of checkins) {
    if (c.date >= cutoff) {
      for (const u of c.updates) {
        if (u.status === "missed") counts[u.category] = (counts[u.category] || 0) + 1;
      }
    }
  }
  return categories
    .filter((cat) => (counts[cat.id] || 0) >= rule.misses)
    .map((cat) => ({ category: cat, count: counts[cat.id] }));
}

function reasonTally(reasonLog) {
  const tally = {};
  for (const r of SEED.reason_codes) tally[r] = 0;
  for (const entry of reasonLog) tally[entry.reason_code]++;
  return Object.entries(tally).sort((a, b) => b[1] - a[1]);
}

// Is each decided-Floor Category on pace to hit it by Sunday, at this
// week's rate so far? Projected pace, not a real week-end guarantee.
function computeFloorRisk(categories, hoursThisWeek, weekDates) {
  const elapsedDays = weekDates.findIndex((d) => d.isToday) + 1 || 7;
  return categories
    .filter((c) => c.floor_status === "decided")
    .map((c) => {
      const pace = Math.round(((hoursThisWeek[c.id] || 0) / elapsedDays) * 7 * 10) / 10;
      return { category: c, pace, atRisk: pace < c.floor_hours_per_week };
    });
}

// Where "today" sits on the Pathway's remaining horizon. 2026 is this
// planning cycle's start, not a tracked start date for the Pathway itself
// — illustrative, not a decision.
function pathwayProgress() {
  const start = new Date(2026, 0, 1);
  const end = new Date(2033, 11, 31);
  const pct = Math.max(0, Math.min(1, (Date.now() - start) / (end - start)));
  return { pct, startYear: 2026, endYear: 2033 };
}

// Last 14 days of check-in completions, oldest first — for a trend sparkline.
function recentDoneTrend(history) {
  return history.slice(-14).map((h) => h.done);
}

const store = (function () {
  const { history, reasonLog } = buildDemoHistory();
  const state = {
    ...JSON.parse(JSON.stringify(SEED)),
    today: isoDaysAgo(0),
    todayName: DAY_NAMES[new Date().getDay()],
    checkins: [], // in-memory only
    history,
    reasonLog,
  };
  const listeners = [];

  function derived() {
    const weekDates = currentWeekDates();
    const hoursThisWeek = Object.fromEntries(
      state.categories.map((c) => [
        c.id,
        state.weekly_plan.commitments
          .filter((cm) => cm.category === c.id && cm.status === "done")
          .reduce((sum, cm) => sum + cm.hours, 0),
      ])
    );
    return {
      ...state,
      weekDates,
      hoursThisWeek,
      streak: computeStreak(state.history, state.checkins),
      escalations: computeEscalations(state.reasonLog, state.checkins, state.categories, state.escalation_rule),
      reasonTally: reasonTally(state.reasonLog),
      floorRisk: computeFloorRisk(state.categories, hoursThisWeek, weekDates),
      pathwayProgress: pathwayProgress(),
      recentDoneTrend: recentDoneTrend(state.history),
      alreadyCheckedInToday: state.checkins.some((c) => c.date === state.today),
    };
  }

  function notify() {
    const snapshot = derived();
    listeners.forEach((fn) => fn(snapshot));
  }

  return {
    subscribe(fn) {
      listeners.push(fn);
      fn(derived());
    },
    getState: derived,
    submitCheckin(updates) {
      if (state.checkins.some((c) => c.date === state.today)) {
        return { error: "Already checked in today — one check-in per day." };
      }
      for (const u of updates) {
        const commitment = state.weekly_plan.commitments.find((c) => c.id === u.commitment_id);
        if (!commitment) continue;
        if (u.status === "missed" && !state.reason_codes.includes(u.reason_code)) {
          return { error: `Missed "${commitment.title}" needs a reason code.` };
        }
        commitment.status = u.status;
        commitment.reason_code = u.status === "missed" ? u.reason_code : null;
      }
      state.checkins.push({
        date: state.today,
        updates: updates.map((u) => ({
          ...u,
          category: state.weekly_plan.commitments.find((c) => c.id === u.commitment_id)?.category,
        })),
      });
      notify();
      return { ok: true };
    },
  };
})();
