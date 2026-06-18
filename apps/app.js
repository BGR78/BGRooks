:root {
  --navy: #07172f;
  --navy-soft: #0f274e;
  --green: #0f7a4f;
  --green-soft: #dff5e9;
  --gold: #f7c948;
  --gold-soft: #fff4c4;
  --cream: #fffaf0;
  --paper: #ffffff;
  --ink: #162033;
  --muted: #64748b;
  --border: rgba(15, 23, 42, 0.14);
  --danger: #b42318;
  --danger-soft: #fff1f0;
  --shadow: 0 18px 50px rgba(4, 12, 24, 0.16);
  --radius: 22px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(247, 201, 72, 0.24), transparent 32rem),
    linear-gradient(180deg, #eef5ff 0%, #fffaf0 26rem, #f8fafc 100%);
  color: var(--ink);
  line-height: 1.5;
}

.hero {
  background: linear-gradient(135deg, var(--navy) 0%, #0d2d5c 58%, #06351f 100%);
  color: white;
  padding: 34px 18px 86px;
  position: relative;
  overflow: hidden;
}

.hero::after {
  content: "";
  position: absolute;
  right: -80px;
  bottom: -160px;
  width: 360px;
  height: 360px;
  border-radius: 999px;
  background: rgba(247, 201, 72, 0.22);
}

.hero__inner,
.app-shell {
  max-width: 1220px;
  margin: 0 auto;
}

.hero__inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 28px;
  position: relative;
  z-index: 1;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  max-width: 820px;
  margin-bottom: 12px;
  font-size: clamp(2.1rem, 6vw, 4.7rem);
  letter-spacing: -0.07em;
  line-height: 0.96;
}

h2 {
  margin-bottom: 0;
  font-size: clamp(1.4rem, 3vw, 2.1rem);
  letter-spacing: -0.04em;
}

h3 {
  margin-bottom: 10px;
  font-size: 1.02rem;
}

.tagline {
  max-width: 680px;
  margin-bottom: 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 1.1rem;
}

.eyebrow {
  margin-bottom: 8px;
  color: var(--gold);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero__status {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: max-content;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14px);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.pulse {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--gold);
  box-shadow: 0 0 0 0 rgba(247, 201, 72, 0.72);
  animation: pulse 1.6s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(247, 201, 72, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(247, 201, 72, 0); }
  100% { box-shadow: 0 0 0 0 rgba(247, 201, 72, 0); }
}

.app-shell {
  margin-top: -54px;
  padding: 0 18px 54px;
  position: relative;
  z-index: 2;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.28fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px;
  margin-bottom: 22px;
}

.card,
.section-block,
.error-panel {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--shadow);
}

.card {
  padding: 22px;
  min-height: 190px;
}

.card--feature {
  background: linear-gradient(135deg, var(--paper), var(--gold-soft));
}

.big-number {
  margin: 6px 0 0;
  font-size: clamp(2.1rem, 6vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.06em;
  line-height: 1;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.stat-pill {
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.62);
}

.stat-pill span {
  display: block;
  color: var(--muted);
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
}

.stat-pill strong {
  font-size: 1.2rem;
}

.section-block {
  margin-top: 22px;
  padding: 22px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.section-title--with-button {
  align-items: center;
}

.path-list,
.bracket-list {
  display: grid;
  gap: 12px;
}

.path-item,
.bracket-item,
.scenario-card,
.group-card,
.third-card {
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--paper);
}

.path-item,
.bracket-item,
.scenario-card {
  padding: 16px;
}

.path-item {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}

.status-chip,
.stage-chip {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  gap: 6px;
  padding: 5px 9px;
  border-radius: 999px;
  background: var(--green-soft);
  color: #075633;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-chip--forecast {
  background: var(--gold-soft);
  color: #7a4b00;
}

.status-chip--danger {
  background: var(--danger-soft);
  color: var(--danger);
}

.match-title {
  margin-bottom: 4px;
  font-weight: 850;
}

.meta,
.range-text,
.small-note {
  color: var(--muted);
  font-size: 0.9rem;
}

.scoreline {
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  white-space: nowrap;
}

.scenario-grid,
.group-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.scenario-card strong {
  display: block;
  font-size: 1.15rem;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.tab-button,
.secondary-button {
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--paper);
  color: var(--ink);
  cursor: pointer;
  font: inherit;
  font-weight: 800;
}

.tab-button {
  padding: 9px 14px;
}

.secondary-button {
  padding: 10px 15px;
}

.tab-button.active,
.secondary-button:hover {
  background: var(--navy);
  color: white;
  border-color: var(--navy);
}

.group-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.group-card,
.third-card {
  padding: 16px;
  overflow: hidden;
}

.group-card h3,
.third-card h3 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.mini-table,
.matches-table {
  width: 100%;
  border-collapse: collapse;
}

.mini-table th,
.mini-table td,
.matches-table th,
.matches-table td {
  padding: 10px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  vertical-align: top;
}

.mini-table th,
.matches-table th {
  color: var(--muted);
  font-size: 0.74rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.mini-table tr:last-child td,
.matches-table tr:last-child td {
  border-bottom: 0;
}

.team-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.team-cell img {
  width: 22px;
  height: 15px;
  object-fit: cover;
  border-radius: 3px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.qualifies {
  background: rgba(15, 122, 79, 0.08);
}

.australia-row {
  outline: 2px solid rgba(247, 201, 72, 0.68);
  outline-offset: -2px;
}

.bracket-item {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) 120px;
  gap: 14px;
  align-items: center;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
}

.matches-table {
  min-width: 850px;
}

.note-block {
  background: rgba(7, 23, 47, 0.94);
  color: white;
}

.note-block p {
  color: rgba(255, 255, 255, 0.78);
}

.error-panel {
  margin-bottom: 22px;
  padding: 22px;
  border-color: rgba(180, 35, 24, 0.3);
  background: var(--danger-soft);
  color: var(--danger);
}

.hidden {
  display: none !important;
}

.loading-skeleton {
  min-height: 18px;
  border-radius: 10px;
  background: linear-gradient(90deg, #e2e8f0, #f8fafc, #e2e8f0);
  background-size: 200% 100%;
  animation: shimmer 1.3s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 980px) {
  .hero__inner,
  .dashboard-grid,
  .scenario-grid,
  .group-grid {
    grid-template-columns: 1fr;
  }

  .hero__inner {
    display: grid;
  }

  .hero__status {
    width: fit-content;
  }

  .dashboard-grid {
    display: grid;
  }
}

@media (max-width: 680px) {
  .hero {
    padding-top: 26px;
  }

  .app-shell {
    padding-inline: 12px;
  }

  .card,
  .section-block {
    padding: 16px;
    border-radius: 18px;
  }

  .path-item,
  .bracket-item {
    grid-template-columns: 1fr;
  }

  .scoreline {
    white-space: normal;
  }

  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
