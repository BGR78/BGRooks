(() => {
  'use strict';

  const STORAGE_KEY = 'bens-shed-socceroos-wc2026-manual-results-v1';
  const STARTER_VERSION = '2026-06-18-aest-snapshot';
  const TZ = 'Australia/Melbourne';
  const AUS = 'AUS';
  const DEFAULT_GOALS_PER_TEAM = 1.35;

  const TEAMS = {
    MEX: { name: 'Mexico', flag: '🇲🇽', group: 'A' }, RSA: { name: 'South Africa', flag: '🇿🇦', group: 'A' }, KOR: { name: 'South Korea', flag: '🇰🇷', group: 'A' }, CZE: { name: 'Czechia', flag: '🇨🇿', group: 'A' },
    CAN: { name: 'Canada', flag: '🇨🇦', group: 'B' }, BIH: { name: 'Bosnia and Herzegovina', flag: '🇧🇦', group: 'B' }, QAT: { name: 'Qatar', flag: '🇶🇦', group: 'B' }, SUI: { name: 'Switzerland', flag: '🇨🇭', group: 'B' },
    BRA: { name: 'Brazil', flag: '🇧🇷', group: 'C' }, MAR: { name: 'Morocco', flag: '🇲🇦', group: 'C' }, HTI: { name: 'Haiti', flag: '🇭🇹', group: 'C' }, SCO: { name: 'Scotland', flag: '🏴', group: 'C' },
    USA: { name: 'United States', flag: '🇺🇸', group: 'D' }, PAR: { name: 'Paraguay', flag: '🇵🇾', group: 'D' }, AUS: { name: 'Australia', flag: '🇦🇺', group: 'D' }, TUR: { name: 'Türkiye', flag: '🇹🇷', group: 'D' },
    GER: { name: 'Germany', flag: '🇩🇪', group: 'E' }, CUW: { name: 'Curaçao', flag: '🇨🇼', group: 'E' }, CIV: { name: 'Ivory Coast', flag: '🇨🇮', group: 'E' }, ECU: { name: 'Ecuador', flag: '🇪🇨', group: 'E' },
    NED: { name: 'Netherlands', flag: '🇳🇱', group: 'F' }, JPN: { name: 'Japan', flag: '🇯🇵', group: 'F' }, SWE: { name: 'Sweden', flag: '🇸🇪', group: 'F' }, TUN: { name: 'Tunisia', flag: '🇹🇳', group: 'F' },
    BEL: { name: 'Belgium', flag: '🇧🇪', group: 'G' }, EGY: { name: 'Egypt', flag: '🇪🇬', group: 'G' }, IRI: { name: 'Iran', flag: '🇮🇷', group: 'G' }, NZL: { name: 'New Zealand', flag: '🇳🇿', group: 'G' },
    ESP: { name: 'Spain', flag: '🇪🇸', group: 'H' }, CPV: { name: 'Cape Verde', flag: '🇨🇻', group: 'H' }, KSA: { name: 'Saudi Arabia', flag: '🇸🇦', group: 'H' }, URU: { name: 'Uruguay', flag: '🇺🇾', group: 'H' },
    FRA: { name: 'France', flag: '🇫🇷', group: 'I' }, SEN: { name: 'Senegal', flag: '🇸🇳', group: 'I' }, IRQ: { name: 'Iraq', flag: '🇮🇶', group: 'I' }, NOR: { name: 'Norway', flag: '🇳🇴', group: 'I' },
    ARG: { name: 'Argentina', flag: '🇦🇷', group: 'J' }, DZA: { name: 'Algeria', flag: '🇩🇿', group: 'J' }, AUT: { name: 'Austria', flag: '🇦🇹', group: 'J' }, JOR: { name: 'Jordan', flag: '🇯🇴', group: 'J' },
    POR: { name: 'Portugal', flag: '🇵🇹', group: 'K' }, COD: { name: 'DR Congo', flag: '🇨🇩', group: 'K' }, UZB: { name: 'Uzbekistan', flag: '🇺🇿', group: 'K' }, COL: { name: 'Colombia', flag: '🇨🇴', group: 'K' },
    ENG: { name: 'England', flag: '🏴', group: 'L' }, CRO: { name: 'Croatia', flag: '🇭🇷', group: 'L' }, GHA: { name: 'Ghana', flag: '🇬🇭', group: 'L' }, PAN: { name: 'Panama', flag: '🇵🇦', group: 'L' }
  };

  const GROUPS = Object.freeze(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']);

  const GROUP_MATCHES = [
    gm('g01', '2026-06-12T05:00:00+10:00', 'A', 'MEX', 'RSA'), gm('g02', '2026-06-12T12:00:00+10:00', 'A', 'KOR', 'CZE'),
    gm('g03', '2026-06-13T05:00:00+10:00', 'B', 'CAN', 'BIH'), gm('g04', '2026-06-13T11:00:00+10:00', 'D', 'USA', 'PAR'),
    gm('g05', '2026-06-14T05:00:00+10:00', 'B', 'QAT', 'SUI'), gm('g06', '2026-06-14T08:00:00+10:00', 'C', 'BRA', 'MAR'),
    gm('g07', '2026-06-14T11:00:00+10:00', 'C', 'HTI', 'SCO'), gm('g08', '2026-06-14T14:00:00+10:00', 'D', 'AUS', 'TUR'),
    gm('g09', '2026-06-15T03:00:00+10:00', 'E', 'GER', 'CUW'), gm('g10', '2026-06-15T06:00:00+10:00', 'F', 'NED', 'JPN'),
    gm('g11', '2026-06-15T09:00:00+10:00', 'E', 'CIV', 'ECU'), gm('g12', '2026-06-15T12:00:00+10:00', 'F', 'SWE', 'TUN'),
    gm('g13', '2026-06-16T02:00:00+10:00', 'H', 'ESP', 'CPV'), gm('g14', '2026-06-16T05:00:00+10:00', 'G', 'BEL', 'EGY'),
    gm('g15', '2026-06-16T08:00:00+10:00', 'H', 'KSA', 'URU'), gm('g16', '2026-06-16T11:00:00+10:00', 'G', 'IRI', 'NZL'),
    gm('g17', '2026-06-17T05:00:00+10:00', 'I', 'FRA', 'SEN'), gm('g18', '2026-06-17T08:00:00+10:00', 'I', 'IRQ', 'NOR'),
    gm('g19', '2026-06-17T11:00:00+10:00', 'J', 'ARG', 'DZA'), gm('g20', '2026-06-17T14:00:00+10:00', 'J', 'AUT', 'JOR'),
    gm('g21', '2026-06-18T03:00:00+10:00', 'K', 'POR', 'COD'), gm('g22', '2026-06-18T06:00:00+10:00', 'L', 'ENG', 'CRO'),
    gm('g23', '2026-06-18T09:00:00+10:00', 'L', 'GHA', 'PAN'), gm('g24', '2026-06-18T12:00:00+10:00', 'K', 'UZB', 'COL'),
    gm('g25', '2026-06-19T02:00:00+10:00', 'A', 'CZE', 'RSA'), gm('g26', '2026-06-19T05:00:00+10:00', 'B', 'SUI', 'BIH'),
    gm('g27', '2026-06-19T08:00:00+10:00', 'B', 'CAN', 'QAT'), gm('g28', '2026-06-19T11:00:00+10:00', 'A', 'MEX', 'KOR'),
    gm('g29', '2026-06-20T05:00:00+10:00', 'D', 'USA', 'AUS'), gm('g30', '2026-06-20T08:00:00+10:00', 'C', 'SCO', 'MAR'),
    gm('g31', '2026-06-20T10:30:00+10:00', 'C', 'BRA', 'HTI'), gm('g32', '2026-06-20T13:00:00+10:00', 'D', 'TUR', 'PAR'),
    gm('g33', '2026-06-21T03:00:00+10:00', 'F', 'NED', 'SWE'), gm('g34', '2026-06-21T06:00:00+10:00', 'E', 'GER', 'CIV'),
    gm('g35', '2026-06-21T10:00:00+10:00', 'E', 'ECU', 'CUW'), gm('g36', '2026-06-21T14:00:00+10:00', 'F', 'TUN', 'JPN'),
    gm('g37', '2026-06-22T02:00:00+10:00', 'H', 'ESP', 'KSA'), gm('g38', '2026-06-22T05:00:00+10:00', 'G', 'BEL', 'IRI'),
    gm('g39', '2026-06-22T08:00:00+10:00', 'H', 'URU', 'CPV'), gm('g40', '2026-06-22T11:00:00+10:00', 'G', 'NZL', 'EGY'),
    gm('g41', '2026-06-23T03:00:00+10:00', 'J', 'ARG', 'AUT'), gm('g42', '2026-06-23T07:00:00+10:00', 'I', 'FRA', 'IRQ'),
    gm('g43', '2026-06-23T10:00:00+10:00', 'I', 'NOR', 'SEN'), gm('g44', '2026-06-23T13:00:00+10:00', 'J', 'JOR', 'DZA'),
    gm('g45', '2026-06-24T03:00:00+10:00', 'K', 'POR', 'UZB'), gm('g46', '2026-06-24T06:00:00+10:00', 'L', 'ENG', 'GHA'),
    gm('g47', '2026-06-24T09:00:00+10:00', 'L', 'PAN', 'CRO'), gm('g48', '2026-06-24T12:00:00+10:00', 'K', 'COL', 'COD'),
    gm('g49', '2026-06-25T05:00:00+10:00', 'B', 'SUI', 'CAN'), gm('g50', '2026-06-25T05:00:00+10:00', 'B', 'BIH', 'QAT'),
    gm('g51', '2026-06-25T08:00:00+10:00', 'C', 'SCO', 'BRA'), gm('g52', '2026-06-25T08:00:00+10:00', 'C', 'MAR', 'HTI'),
    gm('g53', '2026-06-25T11:00:00+10:00', 'A', 'CZE', 'MEX'), gm('g54', '2026-06-25T11:00:00+10:00', 'A', 'RSA', 'KOR'),
    gm('g55', '2026-06-26T06:00:00+10:00', 'E', 'ECU', 'GER'), gm('g56', '2026-06-26T06:00:00+10:00', 'E', 'CUW', 'CIV'),
    gm('g57', '2026-06-26T09:00:00+10:00', 'F', 'TUN', 'NED'), gm('g58', '2026-06-26T09:00:00+10:00', 'F', 'JPN', 'SWE'),
    gm('g59', '2026-06-26T12:00:00+10:00', 'D', 'TUR', 'USA'), gm('g60', '2026-06-26T12:00:00+10:00', 'D', 'PAR', 'AUS'),
    gm('g61', '2026-06-27T05:00:00+10:00', 'I', 'NOR', 'FRA'), gm('g62', '2026-06-27T05:00:00+10:00', 'I', 'SEN', 'IRQ'),
    gm('g63', '2026-06-27T10:00:00+10:00', 'H', 'URU', 'ESP'), gm('g64', '2026-06-27T10:00:00+10:00', 'H', 'CPV', 'KSA'),
    gm('g65', '2026-06-27T13:00:00+10:00', 'G', 'NZL', 'BEL'), gm('g66', '2026-06-27T13:00:00+10:00', 'G', 'EGY', 'IRI'),
    gm('g67', '2026-06-28T07:00:00+10:00', 'L', 'PAN', 'ENG'), gm('g68', '2026-06-28T07:00:00+10:00', 'L', 'CRO', 'GHA'),
    gm('g69', '2026-06-28T09:30:00+10:00', 'K', 'COL', 'POR'), gm('g70', '2026-06-28T09:30:00+10:00', 'K', 'COD', 'UZB'),
    gm('g71', '2026-06-28T12:00:00+10:00', 'J', 'JOR', 'ARG'), gm('g72', '2026-06-28T12:00:00+10:00', 'J', 'DZA', 'AUT')
  ];

  const STARTER_RESULTS = {
    g01: [2, 0], g02: [2, 1], g03: [1, 1], g04: [4, 1], g05: [1, 1], g06: [1, 1],
    g07: [0, 1], g08: [2, 0], g09: [7, 1], g10: [2, 2], g11: [1, 0], g12: [5, 1],
    g13: [0, 0], g14: [1, 1], g15: [1, 1], g16: [2, 2], g17: [3, 1], g18: [1, 4],
    g19: [3, 0], g20: [3, 1], g21: [1, 1], g22: [4, 2], g23: [1, 0]
  };

  const ROUND32 = [
    ko('k45', '2026-06-29T05:00:00+10:00', 'Round of 32', { rank: 2, group: 'A' }, { rank: 2, group: 'B' }, 'k11'),
    ko('k57', '2026-06-30T03:00:00+10:00', 'Round of 32', { rank: 1, group: 'C' }, { rank: 2, group: 'F' }, 'k17'),
    ko('k41', '2026-06-30T06:30:00+10:00', 'Round of 32', { rank: 1, group: 'E' }, { thirdSlot: 'slot41', possible: ['A', 'B', 'C', 'D', 'F'] }, 'k09'),
    ko('k47', '2026-06-30T11:00:00+10:00', 'Round of 32', { rank: 1, group: 'F' }, { rank: 2, group: 'C' }, 'k11'),
    ko('k61', '2026-07-01T03:00:00+10:00', 'Round of 32', { rank: 2, group: 'E' }, { rank: 2, group: 'I' }, 'k17'),
    ko('k43', '2026-07-01T07:00:00+10:00', 'Round of 32', { rank: 1, group: 'I' }, { thirdSlot: 'slot43', possible: ['C', 'D', 'F', 'G', 'H'] }, 'k09'),
    ko('k63', '2026-07-01T11:00:00+10:00', 'Round of 32', { rank: 1, group: 'A' }, { thirdSlot: 'slot63', possible: ['C', 'E', 'F', 'H', 'I'] }, 'k19'),
    ko('k65', '2026-07-02T02:00:00+10:00', 'Round of 32', { rank: 1, group: 'L' }, { thirdSlot: 'slot65', possible: ['E', 'H', 'I', 'J', 'K'] }, 'k19'),
    ko('k55', '2026-07-02T06:00:00+10:00', 'Round of 32', { rank: 1, group: 'G' }, { thirdSlot: 'slot55', possible: ['A', 'E', 'H', 'I', 'J'] }, 'k15'),
    ko('k53', '2026-07-02T10:00:00+10:00', 'Round of 32', { rank: 1, group: 'D' }, { thirdSlot: 'slot53', possible: ['B', 'E', 'F', 'I', 'J'] }, 'k15'),
    ko('k51', '2026-07-03T05:00:00+10:00', 'Round of 32', { rank: 1, group: 'H' }, { rank: 2, group: 'J' }, 'k13'),
    ko('k49', '2026-07-03T09:00:00+10:00', 'Round of 32', { rank: 2, group: 'K' }, { rank: 2, group: 'L' }, 'k13'),
    ko('k05', '2026-07-03T13:00:00+10:00', 'Round of 32', { rank: 1, group: 'B' }, { thirdSlot: 'slot05', possible: ['E', 'F', 'G', 'I', 'J'] }, 'k23'),
    ko('k03', '2026-07-04T04:00:00+10:00', 'Round of 32', { rank: 2, group: 'D' }, { rank: 2, group: 'G' }, 'k21'),
    ko('k69', '2026-07-04T08:00:00+10:00', 'Round of 32', { rank: 1, group: 'J' }, { rank: 2, group: 'H' }, 'k21'),
    ko('k07', '2026-07-04T11:30:00+10:00', 'Round of 32', { rank: 1, group: 'K' }, { thirdSlot: 'slot07', possible: ['D', 'E', 'I', 'J', 'L'] }, 'k23')
  ];

  const KNOCKOUT_REST = [
    ko('k11', '2026-07-05T03:00:00+10:00', 'Round of 16', { winnerOf: 'k45' }, { winnerOf: 'k47' }, 'k25'),
    ko('k09', '2026-07-05T07:00:00+10:00', 'Round of 16', { winnerOf: 'k41' }, { winnerOf: 'k43' }, 'k25'),
    ko('k17', '2026-07-06T06:00:00+10:00', 'Round of 16', { winnerOf: 'k57' }, { winnerOf: 'k61' }, 'k29'),
    ko('k19', '2026-07-06T10:00:00+10:00', 'Round of 16', { winnerOf: 'k63' }, { winnerOf: 'k65' }, 'k29'),
    ko('k13', '2026-07-07T05:00:00+10:00', 'Round of 16', { winnerOf: 'k49' }, { winnerOf: 'k51' }, 'k27'),
    ko('k15', '2026-07-07T10:00:00+10:00', 'Round of 16', { winnerOf: 'k53' }, { winnerOf: 'k55' }, 'k27'),
    ko('k21', '2026-07-08T02:00:00+10:00', 'Round of 16', { winnerOf: 'k69' }, { winnerOf: 'k03' }, 'k31'),
    ko('k23', '2026-07-08T06:00:00+10:00', 'Round of 16', { winnerOf: 'k05' }, { winnerOf: 'k07' }, 'k31'),
    ko('k25', '2026-07-10T06:00:00+10:00', 'Quarter-final', { winnerOf: 'k09' }, { winnerOf: 'k11' }, 'k33'),
    ko('k27', '2026-07-11T05:00:00+10:00', 'Quarter-final', { winnerOf: 'k13' }, { winnerOf: 'k15' }, 'k33'),
    ko('k29', '2026-07-12T07:00:00+10:00', 'Quarter-final', { winnerOf: 'k17' }, { winnerOf: 'k19' }, 'k35'),
    ko('k31', '2026-07-12T11:00:00+10:00', 'Quarter-final', { winnerOf: 'k21' }, { winnerOf: 'k23' }, 'k35'),
    ko('k33', '2026-07-15T05:00:00+10:00', 'Semi-final', { winnerOf: 'k25' }, { winnerOf: 'k27' }, 'k37', 'k39'),
    ko('k35', '2026-07-16T05:00:00+10:00', 'Semi-final', { winnerOf: 'k29' }, { winnerOf: 'k31' }, 'k37', 'k39'),
    ko('k39', '2026-07-19T07:00:00+10:00', 'Third-place play-off', { loserOf: 'k33' }, { loserOf: 'k35' }, null),
    ko('k37', '2026-07-20T05:00:00+10:00', 'Final', { winnerOf: 'k33' }, { winnerOf: 'k35' }, null)
  ];

  const ALL_KNOCKOUT = [...ROUND32, ...KNOCKOUT_REST];
  const MATCH_LOOKUP = Object.fromEntries([...GROUP_MATCHES, ...ALL_KNOCKOUT].map(match => [match.id, match]));

  let state = loadState();
  let entryFilter = 'australia';

  document.addEventListener('DOMContentLoaded', () => {
    bindControls();
    render();
  });

  function gm(id, date, group, home, away) {
    return { id, date, stage: `Group ${group}`, group, home, away, type: 'group' };
  }

  function ko(id, date, stage, homeSpec, awaySpec, nextId, loserNextId = null) {
    return { id, date, stage, homeSpec, awaySpec, nextId, loserNextId, type: 'knockout' };
  }

  function bindControls() {
    document.getElementById('showAustraliaOnly').addEventListener('click', () => { entryFilter = 'australia'; render(); });
    document.getElementById('showAllGroupMatches').addEventListener('click', () => { entryFilter = 'all'; render(); });
    document.getElementById('resetStarter').addEventListener('click', () => {
      if (confirm('Reset to the starter results snapshot? This will replace your current saved scores.')) {
        state = { starterVersion: STARTER_VERSION, results: cloneResults(STARTER_RESULTS), updatedAt: new Date().toISOString() };
        saveState();
        render();
      }
    });
    document.getElementById('clearButton').addEventListener('click', () => {
      if (confirm('Clear every saved score on this device?')) {
        state = { starterVersion: STARTER_VERSION, results: {}, updatedAt: new Date().toISOString() };
        saveState();
        render();
      }
    });
    document.getElementById('exportButton').addEventListener('click', exportScores);
    document.getElementById('importFile').addEventListener('change', importScores);
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { starterVersion: STARTER_VERSION, results: cloneResults(STARTER_RESULTS), updatedAt: new Date().toISOString() };
      }
      const parsed = JSON.parse(raw);
      return {
        starterVersion: parsed.starterVersion || STARTER_VERSION,
        results: normaliseResults(parsed.results || {}),
        updatedAt: parsed.updatedAt || null
      };
    } catch (error) {
      console.warn('Could not load saved results. Using starter results.', error);
      return { starterVersion: STARTER_VERSION, results: cloneResults(STARTER_RESULTS), updatedAt: new Date().toISOString() };
    }
  }

  function saveState() {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateSaveStatus();
  }

  function cloneResults(results) {
    return normaliseResults(results);
  }

  function normaliseResults(results) {
    const clean = {};
    Object.entries(results).forEach(([id, value]) => {
      if (Array.isArray(value) && Number.isFinite(Number(value[0])) && Number.isFinite(Number(value[1]))) {
        clean[id] = [Number(value[0]), Number(value[1])];
      }
    });
    return clean;
  }

  function render() {
    const model = buildModel(state.results);
    renderScoreEntry(model);
    renderCards(model);
    renderAustraliaPath(model);
    renderScenarios(model);
    renderTables(model);
    renderBracket(model);
    renderMatches(model);
    updateSaveStatus();
  }

  function buildModel(results) {
    const actualGroupMatches = GROUP_MATCHES.map(match => enrichGroupMatch(match, results));
    const actualStats = calculateStats(actualGroupMatches.filter(m => m.isActual));
    const projectedGroupMatches = actualGroupMatches.map(match => {
      if (match.isActual) return match;
      const forecast = forecastMatch(match.home, match.away, actualStats);
      return { ...match, ...forecastToScoreFields(forecast), forecast, isForecast: true };
    });
    const groups = buildGroupTables(projectedGroupMatches);
    const currentGroups = buildGroupTables(actualGroupMatches.filter(m => m.isActual));
    const thirds = GROUPS.map(group => groups[group][2]).sort(compareTableRows);
    const qualifyingThirds = thirds.slice(0, 8);
    const thirdSlotAssignments = assignThirdSlots(qualifyingThirds.map(row => row.group));
    const knockout = simulateKnockout(groups, thirdSlotAssignments, actualStats, results);
    return { actualGroupMatches, projectedGroupMatches, actualStats, groups, currentGroups, thirds, qualifyingThirds, thirdSlotAssignments, knockout };
  }

  function enrichGroupMatch(match, results) {
    const score = results[match.id];
    if (!score) return { ...match, isActual: false };
    return { ...match, homeScore: score[0], awayScore: score[1], isActual: true };
  }

  function calculateStats(matches) {
    const teams = {};
    Object.keys(TEAMS).forEach(code => {
      teams[code] = { played: 0, gf: 0, ga: 0 };
    });
    let goals = 0;
    let played = 0;
    matches.forEach(match => {
      if (!Number.isFinite(match.homeScore) || !Number.isFinite(match.awayScore)) return;
      teams[match.home].played += 1;
      teams[match.home].gf += match.homeScore;
      teams[match.home].ga += match.awayScore;
      teams[match.away].played += 1;
      teams[match.away].gf += match.awayScore;
      teams[match.away].ga += match.homeScore;
      goals += match.homeScore + match.awayScore;
      played += 1;
    });
    const tournamentAvg = played > 0 ? goals / (played * 2) : DEFAULT_GOALS_PER_TEAM;
    return { teams, tournamentAvg, playedMatches: played };
  }

  function forecastMatch(home, away, stats) {
    const homeForecast = forecastGoals(home, away, stats);
    const awayForecast = forecastGoals(away, home, stats);
    return {
      homeRaw: homeForecast.blend,
      awayRaw: awayForecast.blend,
      homeMean: homeForecast.mean,
      awayMean: awayForecast.mean,
      homeMedian: homeForecast.median,
      awayMedian: awayForecast.median,
      homeComponents: homeForecast.components,
      awayComponents: awayForecast.components,
      homeRounded: Math.max(0, Math.round(homeForecast.blend)),
      awayRounded: Math.max(0, Math.round(awayForecast.blend))
    };
  }

  function forecastGoals(team, opponent, stats) {
    const teamStats = stats.teams[team] || { played: 0, gf: 0, ga: 0 };
    const opponentStats = stats.teams[opponent] || { played: 0, gf: 0, ga: 0 };
    const teamFor = teamStats.played ? teamStats.gf / teamStats.played : stats.tournamentAvg;
    const opponentAgainst = opponentStats.played ? opponentStats.ga / opponentStats.played : stats.tournamentAvg;
    const safeAvg = stats.tournamentAvg || DEFAULT_GOALS_PER_TEAM;
    const components = [
      teamFor,
      opponentAgainst,
      teamFor * (opponentAgainst / safeAvg),
      opponentAgainst * (teamFor / safeAvg)
    ].map(value => Number.isFinite(value) ? Math.max(0, value) : safeAvg);
    const mean = average(components);
    const med = median(components);
    return { components, mean, median: med, blend: average([mean, med]) };
  }

  function forecastToScoreFields(forecast) {
    return { homeScore: forecast.homeRounded, awayScore: forecast.awayRounded };
  }

  function buildGroupTables(matches) {
    const tables = {};
    GROUPS.forEach(group => {
      tables[group] = Object.entries(TEAMS)
        .filter(([, team]) => team.group === group)
        .map(([code]) => emptyRow(code, group));
    });
    const lookup = {};
    GROUPS.forEach(group => tables[group].forEach(row => { lookup[row.code] = row; }));
    matches.forEach(match => {
      if (!Number.isFinite(match.homeScore) || !Number.isFinite(match.awayScore)) return;
      const h = lookup[match.home];
      const a = lookup[match.away];
      if (!h || !a) return;
      h.played += 1; a.played += 1;
      h.gf += match.homeScore; h.ga += match.awayScore;
      a.gf += match.awayScore; a.ga += match.homeScore;
      if (match.homeScore > match.awayScore) { h.w += 1; a.l += 1; h.pts += 3; }
      else if (match.homeScore < match.awayScore) { a.w += 1; h.l += 1; a.pts += 3; }
      else { h.d += 1; a.d += 1; h.pts += 1; a.pts += 1; }
    });
    GROUPS.forEach(group => {
      tables[group].forEach(row => { row.gd = row.gf - row.ga; });
      tables[group].sort(compareTableRows);
      tables[group].forEach((row, index) => { row.rank = index + 1; });
    });
    return tables;
  }

  function emptyRow(code, group) {
    return { code, group, played: 0, w: 0, d: 0, l: 0, pts: 0, gf: 0, ga: 0, gd: 0, rank: null };
  }

  function compareTableRows(a, b) {
    return (b.pts - a.pts)
      || (b.gd - a.gd)
      || (b.gf - a.gf)
      || (a.ga - b.ga)
      || a.code.localeCompare(b.code);
  }

  function assignThirdSlots(qualifiedGroups) {
    const slots = ROUND32
      .filter(match => match.awaySpec && match.awaySpec.thirdSlot)
      .map(match => ({ id: match.awaySpec.thirdSlot, matchId: match.id, possible: match.awaySpec.possible }));
    const qualifiedSet = new Set(qualifiedGroups);
    const usableSlots = slots.map(slot => ({ ...slot, options: slot.possible.filter(group => qualifiedSet.has(group)) }));
    const orderedSlots = [...usableSlots].sort((a, b) => a.options.length - b.options.length || a.id.localeCompare(b.id));
    let best = null;

    function backtrack(index, used, assignment) {
      if (index === orderedSlots.length) {
        const assignedGroups = new Set(Object.values(assignment));
        if (qualifiedGroups.every(group => assignedGroups.has(group))) best = { ...assignment };
        return Boolean(best);
      }
      const slot = orderedSlots[index];
      for (const group of slot.options) {
        if (used.has(group)) continue;
        used.add(group);
        assignment[slot.id] = group;
        if (backtrack(index + 1, used, assignment)) return true;
        delete assignment[slot.id];
        used.delete(group);
      }
      assignment[slot.id] = null;
      return backtrack(index + 1, used, assignment);
    }

    backtrack(0, new Set(), {});
    const finalAssignment = best || {};
    slots.forEach(slot => { if (!(slot.id in finalAssignment)) finalAssignment[slot.id] = null; });
    return finalAssignment;
  }

  function simulateKnockout(groups, thirdAssignments, actualStats, results) {
    const matchResults = {};
    const byId = {};
    const allMatches = ALL_KNOCKOUT.map(match => ({ ...match }));
    allMatches.forEach(match => {
      const resolved = resolveKnockoutTeams(match, groups, thirdAssignments, matchResults);
      const score = results[match.id];
      let forecast = null;
      let homeScore = null;
      let awayScore = null;
      let isActual = false;
      let winner = null;
      let loser = null;
      if (resolved.home && resolved.away) {
        forecast = forecastMatch(resolved.home, resolved.away, actualStats);
        if (score) {
          homeScore = score[0];
          awayScore = score[1];
          isActual = true;
          if (homeScore !== awayScore) {
            winner = homeScore > awayScore ? resolved.home : resolved.away;
            loser = homeScore > awayScore ? resolved.away : resolved.home;
          } else {
            winner = forecast.homeRaw >= forecast.awayRaw ? resolved.home : resolved.away;
            loser = winner === resolved.home ? resolved.away : resolved.home;
          }
        } else {
          homeScore = forecast.homeRounded;
          awayScore = forecast.awayRounded;
          if (homeScore === awayScore) {
            winner = forecast.homeRaw >= forecast.awayRaw ? resolved.home : resolved.away;
          } else {
            winner = homeScore > awayScore ? resolved.home : resolved.away;
          }
          loser = winner === resolved.home ? resolved.away : resolved.home;
        }
      }
      const enriched = { ...match, home: resolved.home, away: resolved.away, unresolved: resolved.unresolved, forecast, homeScore, awayScore, isActual, isForecast: !isActual && Boolean(resolved.home && resolved.away), winner, loser };
      byId[match.id] = enriched;
      matchResults[match.id] = { winner, loser };
    });
    return { allMatches: Object.values(byId), byId, matchResults };
  }

  function resolveKnockoutTeams(match, groups, thirdAssignments, matchResults) {
    return {
      home: resolveSpec(match.homeSpec, groups, thirdAssignments, matchResults),
      away: resolveSpec(match.awaySpec, groups, thirdAssignments, matchResults),
      unresolved: null
    };
  }

  function resolveSpec(spec, groups, thirdAssignments, matchResults) {
    if (!spec) return null;
    if (spec.rank && spec.group) return groups[spec.group]?.[spec.rank - 1]?.code || null;
    if (spec.thirdSlot) {
      const group = thirdAssignments[spec.thirdSlot];
      return group ? groups[group]?.[2]?.code || null : null;
    }
    if (spec.winnerOf) return matchResults[spec.winnerOf]?.winner || null;
    if (spec.loserOf) return matchResults[spec.loserOf]?.loser || null;
    return null;
  }

  function renderCards(model) {
    const australiaCurrent = model.currentGroups.D?.find(row => row.code === AUS) || emptyRow(AUS, 'D');
    const australiaProjected = model.groups.D?.find(row => row.code === AUS) || emptyRow(AUS, 'D');
    const next = findNextAustraliaMatch(model);
    const final = model.knockout.byId.k37;
    const enteredCount = Object.keys(state.results).length;

    document.getElementById('australiaCard').innerHTML = `
      <p class="eyebrow">Australia</p>
      <h2>${teamLabel(AUS)}</h2>
      <p class="big-number">${ordinal(australiaProjected.rank || 4)}</p>
      <p class="muted">Projected Group D finish. Current entered table: ${australiaCurrent.pts} pts, GD ${formatSigned(australiaCurrent.gd)}.</p>
      <div class="stat-grid">
        ${statPill('Pts', australiaProjected.pts)}
        ${statPill('GF', australiaProjected.gf)}
        ${statPill('GA', australiaProjected.ga)}
        ${statPill('GD', formatSigned(australiaProjected.gd))}
      </div>
    `;

    document.getElementById('nextMatchCard').innerHTML = next ? `
      <p class="eyebrow">Next Australia match</p>
      <h2>${next.stage}</h2>
      <p class="match-line">${teamLabel(next.home)} v ${teamLabel(next.away)}</p>
      <p class="muted">${formatDate(next.date)}</p>
      <p>${scoreBadge(next)} ${statusText(next)}</p>
      ${next.forecast ? `<p class="muted">Range: ${rangeText(next.forecast)}</p>` : ''}
    ` : `
      <p class="eyebrow">Next Australia match</p>
      <h2>No unresolved Australia match</h2>
      <p class="muted">Australia is either out, the path is not yet resolved, or every Australia match in this model has a saved result.</p>
    `;

    document.getElementById('tournamentCard').innerHTML = `
      <p class="eyebrow">Tournament forecast</p>
      <h2>${final?.winner ? `${teamLabel(final.winner)} to win` : 'Winner unresolved'}</h2>
      <p class="muted">Based on ${enteredCount} saved score${enteredCount === 1 ? '' : 's'} on this device.</p>
      <div class="chip-row">
        <span class="chip">Mean/median blend</span>
        <span class="chip">Manual results</span>
        <span class="chip">AEST</span>
      </div>
    `;
  }

  function renderScoreEntry(model) {
    const grid = document.getElementById('scoreEntryGrid');
    const resolvedKnockout = model
      ? model.knockout.allMatches.filter(match => match.home && match.away)
      : [];
    const sourceMatches = entryFilter === 'all'
      ? [...GROUP_MATCHES, ...resolvedKnockout]
      : [...GROUP_MATCHES, ...resolvedKnockout].filter(match => match.home === AUS || match.away === AUS);
    const matches = sourceMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
    grid.innerHTML = matches.map(match => {
      const saved = state.results[match.id] || ['', ''];
      const ausClass = match.home === AUS || match.away === AUS ? ' entry-card--australia' : '';
      return `
        <article class="entry-card${ausClass}" data-match-id="${match.id}">
          <div class="entry-meta"><span>${formatDate(match.date)}</span><span>${match.stage}</span></div>
          ${scoreInputRow(match.id, 'home', match.home, saved[0])}
          ${scoreInputRow(match.id, 'away', match.away, saved[1])}
        </article>
      `;
    }).join('');
    grid.querySelectorAll('.score-input').forEach(input => {
      input.addEventListener('change', handleScoreInput);
      input.addEventListener('input', handleScoreInput);
    });
  }

  function scoreInputRow(matchId, side, team, value) {
    return `
      <label class="score-row">
        <span class="score-team">${teamLabel(team)} <small>${side === 'home' ? 'Home/listed first' : 'Away/listed second'}</small></span>
        <input class="score-input" type="number" min="0" step="1" inputmode="numeric" data-match-id="${matchId}" data-side="${side}" value="${value === '' ? '' : Number(value)}" aria-label="${TEAMS[team].name} score">
      </label>
    `;
  }

  function handleScoreInput(event) {
    const input = event.target;
    const card = input.closest('[data-match-id]');
    if (!card) return;
    const matchId = card.dataset.matchId;
    const homeInput = card.querySelector('[data-side="home"]');
    const awayInput = card.querySelector('[data-side="away"]');
    const home = homeInput.value === '' ? null : Number(homeInput.value);
    const away = awayInput.value === '' ? null : Number(awayInput.value);
    if (home === null && away === null) {
      delete state.results[matchId];
    } else if (Number.isInteger(home) && Number.isInteger(away) && home >= 0 && away >= 0) {
      state.results[matchId] = [home, away];
    } else {
      return;
    }
    saveState();
    render();
  }

  function renderAustraliaPath(model) {
    const path = [];
    model.projectedGroupMatches.forEach(match => {
      if (match.home === AUS || match.away === AUS) path.push(match);
    });
    model.knockout.allMatches.forEach(match => {
      if (match.home === AUS || match.away === AUS) path.push(match);
    });
    document.getElementById('australiaPath').innerHTML = path.length ? path.map(renderPathItem).join('') : '<p class="muted">Australia does not currently appear in the projected knockout path.</p>';
  }

  function renderPathItem(match) {
    return `
      <article class="path-item">
        <div class="path-item__top">
          <div>
            <p class="eyebrow">${match.stage}</p>
            <div class="match-line">${teamLabel(match.home)} v ${teamLabel(match.away)}</div>
            <p class="muted">${formatDate(match.date)}</p>
          </div>
          <div>${scoreBadge(match)}</div>
        </div>
        <div class="chip-row">
          <span class="chip">${statusText(match)}</span>
          ${match.forecast ? `<span class="chip">${rangeText(match.forecast)}</span>` : ''}
          ${match.winner ? `<span class="chip">Winner: ${teamLabel(match.winner)}</span>` : ''}
        </div>
      </article>
    `;
  }

  function renderScenarios(model) {
    const next = model.projectedGroupMatches.find(match => !match.isActual && (match.home === AUS || match.away === AUS));
    const grid = document.getElementById('scenarioGrid');
    if (!next) {
      grid.innerHTML = '<p class="muted">No remaining Australia group match for simple win/draw/loss scenarios.</p>';
      return;
    }
    const scenarios = [
      { label: 'Australia win', score: scoreForScenario(next, 'win') },
      { label: 'Australia draw', score: scoreForScenario(next, 'draw') },
      { label: 'Australia lose', score: scoreForScenario(next, 'loss') }
    ];
    grid.innerHTML = scenarios.map(scenario => {
      const overridden = { ...state.results, [next.id]: scenario.score };
      const scenarioModel = buildModel(overridden);
      const row = scenarioModel.groups.D.find(item => item.code === AUS);
      return `
        <article class="scenario-card">
          <strong>${scenario.label}</strong>
          <p class="muted">${teamLabel(next.home)} ${scenario.score[0]}-${scenario.score[1]} ${teamLabel(next.away)}</p>
          <p>Projected Group D finish: <strong>${ordinal(row.rank)}</strong></p>
          <p class="muted">${row.pts} pts, GD ${formatSigned(row.gd)}, GF ${row.gf}</p>
        </article>
      `;
    }).join('');
  }

  function scoreForScenario(match, outcome) {
    const ausHome = match.home === AUS;
    if (outcome === 'draw') return [1, 1];
    if (outcome === 'win') return ausHome ? [1, 0] : [0, 1];
    return ausHome ? [0, 1] : [1, 0];
  }

  function renderTables(model) {
    const groupsTab = document.getElementById('groupsTab');
    groupsTab.innerHTML = `<div class="group-grid">${GROUPS.map(group => renderGroupCard(group, model.groups[group])).join('')}</div>`;
    const thirdsTab = document.getElementById('thirdsTab');
    thirdsTab.innerHTML = `<div class="group-grid">${model.thirds.map((row, index) => renderThirdCard(row, index)).join('')}</div>`;
  }

  function renderGroupCard(group, rows) {
    const table = document.getElementById('miniTableTemplate').content.cloneNode(true);
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = rows.map(row => `
      <tr${row.code === AUS ? ' class="aus-row"' : ''}>
        <td>${row.rank}</td>
        <td class="team-cell">${teamLabel(row.code)} <span class="code">${row.code}</span></td>
        <td>${row.pts}</td><td>${formatSigned(row.gd)}</td><td>${row.gf}</td><td>${row.ga}</td>
      </tr>
    `).join('');
    const wrapper = document.createElement('article');
    wrapper.className = 'group-card';
    wrapper.innerHTML = `<h3>Group ${group}</h3>`;
    wrapper.appendChild(table);
    return wrapper.outerHTML;
  }

  function renderThirdCard(row, index) {
    const qualifies = index < 8;
    return `
      <article class="third-card">
        <p class="eyebrow">${qualifies ? 'Qualifies' : 'Misses out'}</p>
        <h3>${index + 1}. ${teamLabel(row.code)}</h3>
        <p class="muted">Group ${row.group} third place</p>
        <div class="chip-row">
          <span class="chip">${row.pts} pts</span>
          <span class="chip">GD ${formatSigned(row.gd)}</span>
          <span class="chip">GF ${row.gf}</span>
        </div>
      </article>
    `;
  }

  function renderBracket(model) {
    const list = document.getElementById('bracketList');
    list.innerHTML = model.knockout.allMatches.map(match => `
      <article class="bracket-item">
        <div class="bracket-item__top">
          <div>
            <p class="eyebrow">${match.stage}</p>
            <div class="match-line">${teamOrPlaceholder(match.home, match.homeSpec)} v ${teamOrPlaceholder(match.away, match.awaySpec)}</div>
            <p class="muted">${formatDate(match.date)}</p>
          </div>
          <div>${scoreBadge(match)}</div>
        </div>
        <div class="chip-row">
          <span class="chip">${statusText(match)}</span>
          ${match.forecast ? `<span class="chip">${rangeText(match.forecast)}</span>` : ''}
          ${match.winner ? `<span class="chip">Winner: ${teamLabel(match.winner)}</span>` : '<span class="chip">Winner unresolved</span>'}
        </div>
      </article>
    `).join('');
  }

  function renderMatches(model) {
    const rows = [
      ...model.projectedGroupMatches,
      ...model.knockout.allMatches
    ].sort((a, b) => new Date(a.date) - new Date(b.date));
    document.getElementById('matchesBody').innerHTML = rows.map(match => `
      <tr>
        <td>${formatDate(match.date)}</td>
        <td>${match.stage}</td>
        <td>${teamOrPlaceholder(match.home, match.homeSpec)} v ${teamOrPlaceholder(match.away, match.awaySpec)}</td>
        <td>${scoreBadge(match)}<br><span class="${match.isActual ? 'status-actual' : match.isForecast ? 'status-forecast' : 'status-pending'}">${statusText(match)}</span></td>
        <td>${match.forecast ? rangeText(match.forecast) : '—'}</td>
      </tr>
    `).join('');
    document.getElementById('dataSourceNote').textContent = `Starter snapshot: ${STARTER_VERSION}. This version has ${GROUP_MATCHES.length} group fixtures and ${ALL_KNOCKOUT.length} knockout fixtures baked into the app.`;
  }

  function findNextAustraliaMatch(model) {
    const matches = [
      ...model.projectedGroupMatches,
      ...model.knockout.allMatches
    ].filter(match => (match.home === AUS || match.away === AUS) && !match.isActual)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return matches[0] || null;
  }

  function scoreBadge(match) {
    if (Number.isFinite(match.homeScore) && Number.isFinite(match.awayScore)) {
      const klass = match.isActual ? 'score-badge--actual' : 'score-badge--forecast';
      return `<span class="score-badge ${klass}">${match.homeScore}-${match.awayScore}</span>`;
    }
    return '<span class="score-badge score-badge--pending">TBD</span>';
  }

  function statusText(match) {
    if (match.isActual) return 'Actual result';
    if (match.isForecast) return 'Forecast';
    return 'Pending';
  }

  function teamOrPlaceholder(code, spec) {
    if (code) return teamLabel(code);
    if (!spec) return 'TBD';
    if (spec.rank && spec.group) return `${ordinal(spec.rank)} Group ${spec.group}`;
    if (spec.thirdSlot) return `3rd Group ${spec.possible.join('/')}`;
    if (spec.winnerOf) return `Winner of ${spec.winnerOf.toUpperCase()}`;
    if (spec.loserOf) return `Loser of ${spec.loserOf.toUpperCase()}`;
    return 'TBD';
  }

  function teamLabel(code) {
    const team = TEAMS[code];
    return team ? `${team.flag} ${team.name}` : 'TBD';
  }

  function statPill(label, value) {
    return `<div class="stat-pill"><span>${label}</span><strong>${value}</strong></div>`;
  }

  function average(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function rangeText(forecast) {
    const homeLow = Math.min(forecast.homeMean, forecast.homeMedian);
    const homeHigh = Math.max(forecast.homeMean, forecast.homeMedian);
    const awayLow = Math.min(forecast.awayMean, forecast.awayMedian);
    const awayHigh = Math.max(forecast.awayMean, forecast.awayMedian);
    return `Range ${homeLow.toFixed(1)}-${homeHigh.toFixed(1)} v ${awayLow.toFixed(1)}-${awayHigh.toFixed(1)}`;
  }

  function formatDate(iso) {
    return new Intl.DateTimeFormat('en-AU', {
      weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: TZ, timeZoneName: 'short'
    }).format(new Date(iso));
  }

  function formatSigned(number) {
    return number > 0 ? `+${number}` : String(number);
  }

  function ordinal(number) {
    if (!number) return '—';
    const suffix = number === 1 ? 'st' : number === 2 ? 'nd' : number === 3 ? 'rd' : 'th';
    return `${number}${suffix}`;
  }

  function updateSaveStatus() {
    const status = document.getElementById('saveStatus');
    if (!status) return;
    const savedText = state.updatedAt ? `Saved ${new Intl.DateTimeFormat('en-AU', { hour: 'numeric', minute: '2-digit', timeZone: TZ }).format(new Date(state.updatedAt))}` : 'Saved on this device';
    status.innerHTML = `<span class="status-dot"></span>${savedText}`;
  }

  function switchTab(tab) {
    document.querySelectorAll('.tab-button').forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
    document.getElementById('groupsTab').classList.toggle('hidden', tab !== 'groups');
    document.getElementById('thirdsTab').classList.toggle('hidden', tab !== 'thirds');
  }

  function exportScores() {
    const payload = {
      app: 'Ben\'s Shed Socceroos World Cup 2026 Forecaster',
      version: STARTER_VERSION,
      exportedAt: new Date().toISOString(),
      results: state.results
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `socceroos-world-cup-2026-scores-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function importScores(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const imported = normaliseResults(parsed.results || parsed);
        state = { starterVersion: STARTER_VERSION, results: imported, updatedAt: new Date().toISOString() };
        saveState();
        render();
      } catch (error) {
        alert('Could not import that scores file. It does not look like valid JSON from this app.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }
})();
