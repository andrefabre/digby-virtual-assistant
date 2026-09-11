# Digby

Digby is a life-management assistant for a single user (Andre). It holds a planning cascade — long-range Pathway down to weekly commitments — and runs a daily accountability loop against it across five goal Categories.

## The Pathway

**Pathway**:
The long-range arc above the yearly layer — the multi-year Destination every Category's yearly outcomes derive from. There is exactly one Pathway.
_Avoid_: Vision, 5-year plan, long-term plan

**Destination**:
What completing the Pathway looks like, reached **end of 2033**. Three parts, all required: the **Unrestricted Practising Certificate** held, a **specialist practitioner role** in Legal Tech worked as an employee or contractor, and **Exegesis running as a revenue-generating product business**. Not an Incorporated Legal Practice — that stays available as a choice after 2033, but is not part of the Destination. The canonical record, including the milestone dates, is [docs/pathway.md](./docs/pathway.md); the reasoning is in ADR 0003.

**Legal Tech**:
The convergence point of every Category — the market and expertise domain where the credential, the business and the employable skillset all compound. Adopted mid-2026 when previously separate goals were recognised as pointing the same way.
_Avoid_: Lawtech, legal technology, legal AI (that is one Pillar, not the domain)

**Enabler**:
A Category that other Categories depend on for capacity, and whose Floor is therefore defended rather than traded when demand exceeds capacity. Health & Fitness is an Enabler. This is "and also", never "instead of" — an Enabler carries its own yearly goals like any other Category, and for Health & Fitness those goals (an event to train for, a target set by a doctor) are what produce the daily exercise in the first place.
_Avoid_: Support goal, side quest

**Cascade**:
The derivation chain from Pathway down to daily commitments. Every level is traceable to the level above it.

## Planning structure

**Category**:
One of the five top-level areas every goal belongs to: Education, Career, Business, Health & Fitness, Financial. The taxonomy the whole Cascade hangs off. Each Category has a durable purpose (what it is for) kept separate from its current target, contents and goal-kinds, which can change without the definition changing. The canonical record is [docs/categories.md](./docs/categories.md); priority order is ADR 0002.
_Avoid_: Domain, life area, area, pillar

**Phase**:
A stage of building, delivering or releasing something — a package of work in a product build. Established and widespread: `01-drmo-business/`, `02-dlv-business/`, `11-legal-agentic-business/`, and every one of the 21 uses in the Q1 2026 weekly plans. Resolved 2026-09-11 ([issue #35](https://github.com/andrefabre/digby-virtual-assistant/issues/35)) in favour of this sense over a competing one, on the grounds that it matches standard project-management usage.
_Avoid_: **A date-bounded study operating period** (pre-semester, semester in session, exam period, post-semester break) — this was wrongly called Phase in the three `13-strategic-plans/2026-Q3-Q4/` documents from July 2026. That concept still needs its own name — ⚠️ **unresolved, see [issue #42](https://github.com/andrefabre/digby-virtual-assistant/issues/42)** — do not call it Phase, Stage (too easily confused with this entry), or anything else until it lands.

**Break**:
The interval between the end of one semester's exams and the start of the next. Roughly fourteen weeks at end of year and six mid-year — about twenty weeks annually. The only period in which certification study carries a Floor.
_Avoid_: Holidays, semester break, downtime

**Q1/Q2 Plan**, **Q3/Q4 Plan**:
The Cascade's mid-layer, sitting between the yearly layer and the Weekly Execution Plan: a six-month plan, one per calendar half (Jan-Jun, Jul-Dec), each containing exactly one semester. Not an actual quarter — the name is kept from existing usage (`13-strategic-plans/2026-Q3-Q4/`) despite spanning two. Supersedes the quarterly mid-layer from [issue #3](https://github.com/andrefabre/digby-virtual-assistant/issues/3) in part; decided [issue #36](https://github.com/andrefabre/digby-virtual-assistant/issues/36), ADR 0009.
_Avoid_: Quarterly plan, Sprint (dropped from the Cascade entirely — see below)

**Sprint**:
A two-week block of committed work inside a Phase — delivery/build work, not the planning Cascade. Dropped from the Cascade's mid-layer (issue #36): weeks roll straight up to the Q1/Q2 or Q3/Q4 Plan, no layer between them.
_Avoid_: Iteration, cycle; do not use for anything in the Cascade

**Weekly Execution Plan**:
The markdown artifact holding one week's commitments, hour allocations and outcomes. The Cascade's lowest planning layer, and the document the daily loop reads and writes.
_Avoid_: Weekly plan, WEP, schedule

## Accountability

**Floor**:
A minimum weekly hour commitment for a Category, protected first when demand exceeds capacity. What overload trade-offs are measured against.
_Avoid_: Minimum, baseline, quota

**Check-in**:
The single daily exchange in which committed work is marked done or missed. One per day regardless of how many commitments it covers.
_Avoid_: Standup, review, daily review

**Reason Code**:
The required categorical explanation attached to a missed commitment. A miss cannot be finalised without one.
_Avoid_: Excuse, note, reason

**Escalation**:
The state entered when misses reach the defined threshold within one Category inside a rolling window, triggering a Recovery Session.

**Recovery Session**:
A short structured session triggered by Escalation, whose outcome feeds into subsequent planning.

**Rollover**:
The carrying of incomplete commitments into the following week, with reprioritisation.
_Avoid_: Carryover, rollup

## Business

**Exegesis**:
The business. Operates four Pillars under one platform in the Legal Tech domain.
_Avoid_: Exegete — that is the domain name, not the business

**exegete.com.au**:
The trading domain Exegesis publishes under. Correct for the website and its pages; wrong as the name of the business.

**Pillar**:
One of Exegesis's four business lines, each validated and then killed or scaled independently.
_Avoid_: Venture, business unit, product

**DRMO** (Digital Risk Management Officer):
Pillar 1. Digital risk and settlement-fraud services, originally targeting estate lawyers and conveyancing.

**Legal AI**:
Pillar 2. AI-assisted legal automation services.

**DLV** (Digital Legacy Vault):
Pillar 3. Digital estate and legacy custody product. Carries AUSTRAC and Privacy Act compliance obligations.

**Cyber Services**:
Pillar 4. Cybersecurity services for home users and small-to-medium business.
_Avoid_: Cyber Home+SMB

**Door**:
A published landing page designed to generate inbound signal passively, with no outbound prospecting. Pillars are validated by measuring Door signal.
_Avoid_: Landing page, funnel, lead page

**Review Gate**:
A scheduled date at which accumulated Door signal is judged and a kill, adjust or scale decision is recorded per Pillar.
_Avoid_: Checkpoint, milestone, decision point

## Education & career

**Bachelor of IT**:
The Bachelor of Information Technology at Murdoch University, taken as a double major in Cybersecurity & Forensics and Networking & Internetworking. Completes end of 2028.
_Avoid_: BIT, IT degree, Bachelor of Technology

**Law degree**:
The fast-tracked, full-time, online law degree running 2029–2030. Fast-tracked means two years rather than three, available because a degree in another field is already held, and structured as three semesters per year rather than two. Institution deliberately undecided. Runs alongside full-time work, and its three back-to-back semesters mean **there is no Break in 2029 or 2030**.

**PLT** (Practical Legal Training):
The Graduate Diploma of Legal Practice sat after the law degree, ~H1 2031. Fifteen weeks full-time online, plus a fifteen-day practical placement. Entry depends on a GPA threshold held through the law degree.

**Admission**:
The Supreme Court of WA ceremony at which the oath is taken and the Roll signed, ~mid 2031, following the Legal Practice Board's fit-and-proper check. Yields a **Restricted Practising Certificate** — practice only under supervision.

**SLP** (Supervised Legal Practice):
The 24 months of full-time-equivalent practice under an unrestricted supervisor, mid 2031 to mid 2033, required before an unrestricted certificate is issued. Compulsory — a qualification requirement, not an employment choice. Candidate settings: WA Department of Justice, AFP, ASD, corporate technology.

**Unrestricted Practising Certificate**:
Issued ~mid 2033 on the supervisor's declaration that SLP is complete. The point at which practice on one's own authority — including contracting — becomes possible. The credential half of the Destination.

**Full-time study**:
Four units per semester, two semesters per year, ten hours per unit per week — forty study hours in a semester week. The basis of the Education Floor.

**Proof**:
The demonstrable evidence that licenses Exegesis to sell a service: the degrees, certifications and delivered projects. Services cannot be sold before the Proof exists, which makes Education upstream of Business rather than competing with it.
_Avoid_: Credentials, qualifications, evidence

**JSO** (Judicial Support Officer):
The target entry-level role at the Department of Justice, working in the courts. Preferred over the current role on three counts: real legal work experience, steady hours rather than weekly-varying start times, and better compatibility with four units a semester.

**G4S**:
Current employer. Court Security & Custody Officer, 38 hours per week, the financial floor funding everything else. Start times vary week to week, which is what makes it a poorer fit for study than JSO.

**Casual work**:
The fallback employment mode considered if no JSO role is secured within roughly six months, adopted to protect study commitments — including future units that require on-campus attendance rather than the fully online mode used so far.

## External references

**AUSTRAC** (Australian Transaction Reports and Analysis Centre):
The Australian anti-money-laundering and counter-terrorism-financing regulator whose reporting obligations bind DLV.

**PEXA**:
The Australian electronic conveyancing platform through which property settlements execute. The fraud surface DRMO addresses.
