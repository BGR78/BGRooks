/*
  Ben's Shed / bOS
  Socceroos World Cup 2026 Forecaster

  Design rule: match-score forecasts use tournament results only.
  No betting odds, historical ratings, Elo, squads or FIFA rankings for prediction.
*/

const CONFIG = {
  dataBaseUrl: 'https://worldcup26.ir',
  gamesEndpoint: '/get/games',
  teamsEndpoint: '/get/teams',
  stadiumsEndpoint: '/get/stadiums',
  annexeEndpoint: 'https://en.wikipedia.org/w/api.php?action=parse&page=Template:2026_FIFA_World_Cup_third-place_table&prop=text&format=json&origin=*',
  melbourneTimeZone: 'Australia/Melbourne',
  defaultTeamGoalsPerMatch: 1.25,
  australiaNames: ['Australia', 'Socceroos'],
  thirdPlaceSlots: ['1A', '1B', '1D', '1E', '1G', '1I', '1K', '1L'],
  groups: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
};

const STAGE_LABELS = {
  group: 'Group',
  r32: 'Round of 32',
  r16: 'Round of 16',
  qf: 'Quarter-final',
  sf: 'Semi-final',
  third: 'Third-place play-off',
  final: 'Final'
};

const state = {
  teams: new Map(),
  stadiums: new Map(),
  matches: [],
  annexeC: new Map(),
  simulation: null,
  loadedAt: null
};

const els = {
  loadStatus: document.getElementById('loadStatus'),
  errorPanel: document.getElementById('errorPanel'),
  australiaCard: document.getElementById('australiaCard'),
  nextMatchCard: document.getElementById('nextMatchCard'),
  tournamentCard: document.getElementById('tournamentCard'),
  australiaPath: document.getElementById('australiaPath'),
  scenarioGrid: document.getElementById('scenarioGrid'),
  groupsTab: document.getElementById('groupsTab'),
  thirdsTab: document.getElementById('thirdsTab'),
  bracketList: document.getElementById('bracketList'),
  matchesBody: document.getElementById('matchesBody'),
  dataSourceNote: document.getElementById('dataSourceNote'),
  refreshButton: document.getElementById('refreshButton')
};

init();

function init() {
  renderLoadingSkeletons();
  setupTabs();
  els.refreshButton.addEventListener('click', () => loadAndRender());
  loadAndRender();
}

async function loadAndRender() {
  setStatus('Loading live World Cup data…', 'loading');
  hideError();

  try {
    const [teamsPayload, stadiumsPayload, gamesPayload, annexeMap] = await Promise.all([
      fetchJson(CONFIG.dataBaseUrl + CONFIG.teamsEndpoint, 'teams'),
      fetchJson(CONFIG.dataBaseUrl + CONFIG.stadiumsEndpoint, 'stadiums'),
      fetchJson(CONFIG.dataBaseUrl + CONFIG.gamesEndpoint, 'matches'),
      loadAnnexeC()
    ]);

    state.teams = normaliseTeams(teamsPayload);
    state.stadiums = normaliseStadiums(stadiumsPayload);
    state.matches = normaliseMatches(gamesPayload);
    state.annexeC = annexeMap;
    state.loadedAt = new Date();

    validateDataShape();
    state.simulation = simulateTournament(state.matches, state.teams, state.stadiums, state.annexeC);
    renderApp();
    setStatus(`Live data loaded · ${formatMelbourneDateTime(state.loadedAt, { includeTimeZone: true })}`, 'ok');
  } catch (error) {
    console.error(error);
    setStatus('Live data failed', 'error');
    renderFatalError(error);
  }
}

async function fetchJson(url, label) {
  let response;
  try {
    response = await fetch(url, { cache: 'no-store' });
  } catch (error) {
    throw new Error(`Could not reach the ${label} data source. This may be a temporary network or CORS issue. Try refreshing in a minute. Details: ${error.message}`);
  }

  if (!response.ok) {
    const reason = response.status === 401
      ? 'The data source is asking for authorisation. The app may need rebuilding or a new data source.'
      : response.status === 429
        ? 'The data source is rate limiting requests. Wait a bit and refresh.'
        : response.status >= 500
          ? 'The data source appears to be down. Try refreshing later.'
          : 'The data source returned an unexpected response. The app may need checking.';
    throw new Error(`${label} failed with HTTP ${response.status}. ${reason}`);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error(`${label} returned data, but it was not valid JSON. The source structure may have changed.`);
  }
}

async function loadAnnexeC() {
  try {
    const payload = await fetchJson(CONFIG.annexeEndpoint, 'FIFA Annexe C mapping');
    const html = payload?.parse?.text?.['*'];
    if (!html) throw new Error('Annexe C HTML was missing from the response.');

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const rows = [...doc.querySelectorAll('tr')];
    const map = new Map();

    rows.forEach(row => {
      const cells = [...row.querySelectorAll('th,td')]
        .map(cell => cell.textContent.trim().replace(/\s+/g, ' '))
        .filter(Boolean);

      // Expected data row:
      // option, eight qualified third-place group letters, then assignments for 1A,1B,1D,1E,1G,1I,1K,1L.
      if (cells.length < 17 || !/^\d+$/.test(cells[0])) return;

      const qualifiedGroups = cells.slice(1, 9).join('');
      const assignments = cells.slice(9, 17);
      if (assignments.length !== 8 || assignments.some(value => !/^3[A-L]$/.test(value))) return;

      map.set(qualifiedGroups, Object.fromEntries(
        CONFIG.thirdPlaceSlots.map((slot, index) => [slot, assignments[index]])
      ));
    });

    if (map.size < 400) {
      throw new Error(`Only ${map.size} Annexe C combinations were found.`);
    }

    return map;
  } catch (error) {
    throw new Error(`Could not load the Round of 32 third-place allocation table. ${error.message}`);
  }
}

function normaliseTeams(payload) {
  const teams = Array.isArray(payload) ? payload : payload?.teams || payload?.data || [];
  if (!Array.isArray(teams) || teams.length === 0) {
    throw new Error('The teams endpoint did not return a usable teams list. The source structure may have changed.');
  }

  return new Map(teams.map(team => {
    const id = asString(team.id ?? team._id ?? team.team_id);
    const name = asString(team.name_en ?? team.name ?? team.team_name_en ?? team.country ?? team.team);
    return [id, {
      id,
      name,
      fifaCode: asString(team.fifa_code ?? team.fifaCode ?? team.code ?? ''),
      group: asString(team.groups ?? team.group ?? team.group_name ?? ''),
      flag: asString(team.flag ?? team.flag_url ?? team.image ?? '')
    }];
  }).filter(([, team]) => team.id && team.name));
}

function normaliseStadiums(payload) {
  const stadiums = Array.isArray(payload) ? payload : payload?.stadiums || payload?.data || [];
  if (!Array.isArray(stadiums)) return new Map();

  return new Map(stadiums.map(stadium => {
    const id = asString(stadium.id ?? stadium._id ?? stadium.stadium_id);
    const city = asString(stadium.city_en ?? stadium.city ?? '');
    return [id, {
      id,
      name: asString(stadium.fifa_name ?? stadium.name_en ?? stadium.name ?? 'Venue TBC'),
      city,
      country: asString(stadium.country_en ?? stadium.country ?? ''),
      timeZone: inferVenueTimeZone(city, asString(stadium.country_en ?? stadium.country ?? ''))
    }];
  }).filter(([, stadium]) => stadium.id));
}

function normaliseMatches(payload) {
  const games = Array.isArray(payload) ? payload : payload?.games || payload?.matches || payload?.data || [];
  if (!Array.isArray(games) || games.length === 0) {
    throw new Error('The matches endpoint did not return a usable matches list. The source structure may have changed.');
  }

  return games.map(game => {
    const type = asString(game.type ?? game.stage ?? '').toLowerCase();
    const id = Number(game.id ?? game.match_id ?? game.matchNo ?? 0);
    const homeTeamId = asString(game.home_team_id ?? game.homeTeamId ?? game.home?.id ?? '');
    const awayTeamId = asString(game.away_team_id ?? game.awayTeamId ?? game.away?.id ?? '');
    const finished = toBoolean(game.finished ?? game.is_finished ?? game.status === 'finished');

    return {
      raw: game,
      id,
      type: type || inferStageFromId(id),
      group: asString(game.group ?? game.group_name ?? ''),
      matchday: asString(game.matchday ?? game.match_day ?? ''),
      localDate: asString(game.local_date ?? game.date ?? game.kickoff ?? game.start_time ?? ''),
      stadiumId: asString(game.stadium_id ?? game.stadiumId ?? game.venue_id ?? ''),
      homeTeamId: homeTeamId && homeTeamId !== '0' ? homeTeamId : '',
      awayTeamId: awayTeamId && awayTeamId !== '0' ? awayTeamId : '',
      homeLabel: asString(game.home_team_label ?? game.home_label ?? game.homeTeamLabel ?? ''),
      awayLabel: asString(game.away_team_label ?? game.away_label ?? game.awayTeamLabel ?? ''),
      homeName: asString(game.home_team_name_en ?? game.home_name ?? game.home?.name ?? ''),
      awayName: asString(game.away_team_name_en ?? game.away_name ?? game.away?.name ?? ''),
      homeScore: parseScore(game.home_score ?? game.homeScore ?? game.home?.score),
      awayScore: parseScore(game.away_score ?? game.awayScore ?? game.away?.score),
      finished,
      timeElapsed: asString(game.time_elapsed ?? game.status ?? '')
    };
  }).sort((a, b) => a.id - b.id);
}

function validateDataShape() {
  if (state.teams.size < 40) {
    throw new Error(`Only ${state.teams.size} teams were loaded. Expected close to 48. The data source may have changed.`);
  }
  if (state.matches.length < 90) {
    throw new Error(`Only ${state.matches.length} matches were loaded. Expected close to 104. The data source may have changed.`);
  }
  if (state.annexeC.size < 400) {
    throw new Error(`Only ${state.annexeC.size} Round of 32 allocation combinations were loaded. The mapping source may have changed.`);
  }
}

function simulateTournament(matches, teams, stadiums, annexeC, scenarioOverride = null) {
  const actualMatches = matches.filter(match => match.finished && hasBothScores(match));
  const statsContext = buildTeamStats(actualMatches, teams);
  const groupMatches = matches.filter(match => match.type === 'group');
  const projectedGroupMatches = groupMatches.map(match => resolveGroupMatch(match, statsContext, teams, scenarioOverride));
  const groupTables = buildGroupTables(projectedGroupMatches, teams);
  const thirds = rankThirdPlacedTeams(groupTables);
  const qualifiedThirds = thirds.slice(0, 8);
  const thirdQualifiedGroups = qualifiedThirds.map(row => row.group).sort().join('');
  const thirdMapping = annexeC.get(thirdQualifiedGroups) || null;
  const knockoutMatches = resolveKnockout(matches, groupTables, qualifiedThirds, thirdMapping, statsContext, teams);
  const allResolvedMatches = [...projectedGroupMatches, ...knockoutMatches].sort((a, b) => a.id - b.id);
  const australia = findAustralia(teams);
  const australiaProjection = buildAustraliaProjection(australia, groupTables, thirds, knockoutMatches);

  return {
    actualMatches,
    statsContext,
    groupTables,
    thirds,
    qualifiedThirds,
    thirdQualifiedGroups,
    thirdMapping,
    knockoutMatches,
    allResolvedMatches,
    australia,
    australiaProjection
  };
}

function resolveGroupMatch(match, statsContext, teams, scenarioOverride) {
  const override = scenarioOverride && scenarioOverride.matchId === match.id ? scenarioOverride : null;
  const homeTeam = getTeam(teams, match.homeTeamId, match.homeName || match.homeLabel);
  const awayTeam = getTeam(teams, match.awayTeamId, match.awayName || match.awayLabel);

  if (match.finished && hasBothScores(match)) {
    return decorateResolvedMatch(match, homeTeam, awayTeam, {
      homeGoals: match.homeScore,
      awayGoals: match.awayScore,
      rawHome: match.homeScore,
      rawAway: match.awayScore,
      source: 'actual'
    });
  }

  if (override) {
    return decorateResolvedMatch(match, homeTeam, awayTeam, {
      homeGoals: override.homeGoals,
      awayGoals: override.awayGoals,
      rawHome: override.homeGoals,
      rawAway: override.awayGoals,
      source: 'scenario',
      forecast: null
    });
  }

  const forecast = forecastMatch(homeTeam, awayTeam, statsContext, false);
  return decorateResolvedMatch(match, homeTeam, awayTeam, {
    homeGoals: forecast.homeRounded,
    awayGoals: forecast.awayRounded,
    rawHome: forecast.homeBlend,
    rawAway: forecast.awayBlend,
    source: 'forecast',
    forecast
  });
}

function decorateResolvedMatch(match, homeTeam, awayTeam, result) {
  const winner = result.homeGoals > result.awayGoals ? homeTeam : result.awayGoals > result.homeGoals ? awayTeam : null;
  const loser = result.homeGoals > result.awayGoals ? awayTeam : result.awayGoals > result.homeGoals ? homeTeam : null;

  return {
    ...match,
    homeTeam,
    awayTeam,
    homeGoals: result.homeGoals,
    awayGoals: result.awayGoals,
    rawHome: result.rawHome,
    rawAway: result.rawAway,
    source: result.source,
    forecast: result.forecast ?? null,
    winner,
    loser,
    isDraw: !winner
  };
}

function buildTeamStats(actualMatches, teams) {
  const stats = new Map();
  teams.forEach(team => stats.set(team.id, {
    team,
    played: 0,
    gf: 0,
    ga: 0,
    avgFor: CONFIG.defaultTeamGoalsPerMatch,
    avgAgainst: CONFIG.defaultTeamGoalsPerMatch
  }));

  let totalGoals = 0;
  actualMatches.forEach(match => {
    const home = stats.get(match.homeTeamId);
    const away = stats.get(match.awayTeamId);
    if (!home || !away) return;
    home.played += 1;
    away.played += 1;
    home.gf += match.homeScore;
    home.ga += match.awayScore;
    away.gf += match.awayScore;
    away.ga += match.homeScore;
    totalGoals += match.homeScore + match.awayScore;
  });

  const teamGamesPlayed = actualMatches.length * 2;
  const tournamentAvg = teamGamesPlayed > 0
    ? totalGoals / teamGamesPlayed
    : CONFIG.defaultTeamGoalsPerMatch;

  stats.forEach(row => {
    row.avgFor = row.played > 0 ? row.gf / row.played : tournamentAvg;
    row.avgAgainst = row.played > 0 ? row.ga / row.played : tournamentAvg;
  });

  return { stats, tournamentAvg: tournamentAvg || CONFIG.defaultTeamGoalsPerMatch };
}

function forecastMatch(homeTeam, awayTeam, context, knockout) {
  const home = context.stats.get(homeTeam.id) || fallbackStats(homeTeam, context.tournamentAvg);
  const away = context.stats.get(awayTeam.id) || fallbackStats(awayTeam, context.tournamentAvg);
  const avg = context.tournamentAvg || CONFIG.defaultTeamGoalsPerMatch;

  const homeComponents = [
    home.avgFor,
    away.avgAgainst,
    home.avgFor * safeRatio(away.avgAgainst, avg),
    away.avgAgainst * safeRatio(home.avgFor, avg)
  ];

  const awayComponents = [
    away.avgFor,
    home.avgAgainst,
    away.avgFor * safeRatio(home.avgAgainst, avg),
    home.avgAgainst * safeRatio(away.avgFor, avg)
  ];

  const homeMean = mean(homeComponents);
  const awayMean = mean(awayComponents);
  const homeMedian = median(homeComponents);
  const awayMedian = median(awayComponents);
  const homeBlend = mean([homeMean, homeMedian]);
  const awayBlend = mean([awayMean, awayMedian]);

  let homeRounded = roundGoal(homeBlend);
  let awayRounded = roundGoal(awayBlend);
  let knockoutTieBreak = null;

  if (knockout && homeRounded === awayRounded) {
    if (Math.abs(homeBlend - awayBlend) > 0.000001) {
      knockoutTieBreak = homeBlend > awayBlend ? homeTeam : awayTeam;
    } else {
      // Very rare. Keep the app moving without pretending this is model evidence.
      const homeTournament = context.stats.get(homeTeam.id) || fallbackStats(homeTeam, context.tournamentAvg);
      const awayTournament = context.stats.get(awayTeam.id) || fallbackStats(awayTeam, context.tournamentAvg);
      const homeGD = homeTournament.gf - homeTournament.ga;
      const awayGD = awayTournament.gf - awayTournament.ga;
      knockoutTieBreak = homeGD !== awayGD
        ? (homeGD > awayGD ? homeTeam : awayTeam)
        : homeTeam;
    }
  }

  return {
    homeComponents,
    awayComponents,
    homeMean,
    awayMean,
    homeMedian,
    awayMedian,
    homeBlend,
    awayBlend,
    homeRounded,
    awayRounded,
    homeRange: [Math.min(homeMean, homeMedian), Math.max(homeMean, homeMedian)],
    awayRange: [Math.min(awayMean, awayMedian), Math.max(awayMean, awayMedian)],
    knockoutTieBreak
  };
}

function buildGroupTables(groupMatches, teams) {
  const groups = new Map();

  CONFIG.groups.forEach(group => groups.set(group, []));
  teams.forEach(team => {
    const group = team.group || inferTeamGroupFromMatches(team, groupMatches);
    if (!group) return;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(blankTableRow(team, group));
  });

  const byTeamId = new Map();
  groups.forEach(rows => rows.forEach(row => byTeamId.set(row.team.id, row)));

  groupMatches.forEach(match => {
    const home = byTeamId.get(match.homeTeam.id);
    const away = byTeamId.get(match.awayTeam.id);
    if (!home || !away) return;

    home.played += 1;
    away.played += 1;
    home.gf += match.homeGoals;
    home.ga += match.awayGoals;
    away.gf += match.awayGoals;
    away.ga += match.homeGoals;

    if (match.homeGoals > match.awayGoals) {
      home.points += 3;
      home.wins += 1;
      away.losses += 1;
    } else if (match.awayGoals > match.homeGoals) {
      away.points += 3;
      away.wins += 1;
      home.losses += 1;
    } else {
      home.points += 1;
      away.points += 1;
      home.draws += 1;
      away.draws += 1;
    }
  });

  const groupMatchMap = new Map();
  groupMatches.forEach(match => {
    if (!groupMatchMap.has(match.group)) groupMatchMap.set(match.group, []);
    groupMatchMap.get(match.group).push(match);
  });

  groups.forEach((rows, group) => {
    rows.forEach(row => row.gd = row.gf - row.ga);
    const sorted = sortGroupRows(rows, groupMatchMap.get(group) || []);
    sorted.forEach((row, index) => row.rank = index + 1);
    groups.set(group, sorted);
  });

  return groups;
}

function sortGroupRows(rows, matches) {
  return [...rows].sort((a, b) => compareGroupRows(a, b, rows, matches));
}

function compareGroupRows(a, b, groupRows, matches) {
  const primary = b.points - a.points;
  if (primary !== 0) return primary;

  const tiedRows = groupRows.filter(row => row.points === a.points);
  const mini = buildMiniTable(tiedRows, matches);
  const aMini = mini.get(a.team.id);
  const bMini = mini.get(b.team.id);

  const headToHead = compareNumbers([
    bMini.points - aMini.points,
    bMini.gd - aMini.gd,
    bMini.gf - aMini.gf
  ]);
  if (headToHead !== 0) return headToHead;

  const overall = compareNumbers([
    b.gd - a.gd,
    b.gf - a.gf
  ]);
  if (overall !== 0) return overall;

  // We usually will not have conduct data. FIFA ranking is only a competition-rule fallback.
  const rankA = Number(a.team.fifaRanking ?? Number.POSITIVE_INFINITY);
  const rankB = Number(b.team.fifaRanking ?? Number.POSITIVE_INFINITY);
  if (Number.isFinite(rankA) && Number.isFinite(rankB) && rankA !== rankB) {
    return rankA - rankB;
  }

  return a.team.name.localeCompare(b.team.name);
}

function buildMiniTable(tiedRows, matches) {
  const ids = new Set(tiedRows.map(row => row.team.id));
  const mini = new Map(tiedRows.map(row => [row.team.id, { points: 0, gf: 0, ga: 0, gd: 0 }]));

  matches.forEach(match => {
    if (!ids.has(match.homeTeam.id) || !ids.has(match.awayTeam.id)) return;
    const home = mini.get(match.homeTeam.id);
    const away = mini.get(match.awayTeam.id);
    home.gf += match.homeGoals;
    home.ga += match.awayGoals;
    away.gf += match.awayGoals;
    away.ga += match.homeGoals;
    if (match.homeGoals > match.awayGoals) home.points += 3;
    else if (match.awayGoals > match.homeGoals) away.points += 3;
    else {
      home.points += 1;
      away.points += 1;
    }
  });

  mini.forEach(row => row.gd = row.gf - row.ga);
  return mini;
}

function rankThirdPlacedTeams(groupTables) {
  const thirds = [];
  groupTables.forEach((rows, group) => {
    const third = rows[2];
    if (third) thirds.push({ ...third, group });
  });

  thirds.sort((a, b) => compareNumbers([
    b.points - a.points,
    b.gd - a.gd,
    b.gf - a.gf
  ]) || a.group.localeCompare(b.group));

  thirds.forEach((row, index) => {
    row.thirdRank = index + 1;
    row.qualifies = index < 8;
  });

  return thirds;
}

function resolveKnockout(matches, groupTables, qualifiedThirds, thirdMapping, statsContext, teams) {
  const knockoutRaw = matches.filter(match => match.type !== 'group').sort((a, b) => a.id - b.id);
  const resolved = [];
  const byId = new Map();
  const thirdsByGroup = new Map(qualifiedThirds.map(row => [row.group, row.team]));

  knockoutRaw.forEach(match => {
    const homeTeam = resolveKnockoutSide(match.homeTeamId, match.homeName, match.homeLabel, groupTables, thirdsByGroup, thirdMapping, byId, teams);
    const awayTeam = resolveKnockoutSide(match.awayTeamId, match.awayName, match.awayLabel, groupTables, thirdsByGroup, thirdMapping, byId, teams);

    let resolvedMatch;
    if (match.finished && hasBothScores(match) && homeTeam && awayTeam) {
      resolvedMatch = decorateResolvedMatch(match, homeTeam, awayTeam, {
        homeGoals: match.homeScore,
        awayGoals: match.awayScore,
        rawHome: match.homeScore,
        rawAway: match.awayScore,
        source: 'actual'
      });
      if (resolvedMatch.isDraw) {
        const forecast = forecastMatch(homeTeam, awayTeam, statsContext, true);
        resolvedMatch.winner = forecast.knockoutTieBreak;
        resolvedMatch.loser = forecast.knockoutTieBreak.id === homeTeam.id ? awayTeam : homeTeam;
        resolvedMatch.forecast = forecast;
        resolvedMatch.penaltyNote = 'Actual knockout match was level in the available score data. Model split used because penalty winner was not available from the source.';
      }
    } else if (homeTeam && awayTeam) {
      const forecast = forecastMatch(homeTeam, awayTeam, statsContext, true);
      const winner = forecast.homeRounded > forecast.awayRounded
        ? homeTeam
        : forecast.awayRounded > forecast.homeRounded
          ? awayTeam
          : forecast.knockoutTieBreak;
      const loser = winner.id === homeTeam.id ? awayTeam : homeTeam;

      resolvedMatch = {
        ...match,
        homeTeam,
        awayTeam,
        homeGoals: forecast.homeRounded,
        awayGoals: forecast.awayRounded,
        rawHome: forecast.homeBlend,
        rawAway: forecast.awayBlend,
        source: 'forecast',
        forecast,
        winner,
        loser,
        isDraw: forecast.homeRounded === forecast.awayRounded,
        penaltyNote: forecast.homeRounded === forecast.awayRounded
          ? `${teamName(winner)} advances on the unrounded model result.`
          : ''
      };
    } else {
      resolvedMatch = {
        ...match,
        homeTeam: homeTeam || placeholderTeam(match.homeLabel || match.homeName || 'TBC'),
        awayTeam: awayTeam || placeholderTeam(match.awayLabel || match.awayName || 'TBC'),
        homeGoals: null,
        awayGoals: null,
        rawHome: null,
        rawAway: null,
        source: 'pending',
        forecast: null,
        winner: null,
        loser: null,
        isDraw: false,
        penaltyNote: 'Opponent could not be resolved from current data.'
      };
    }

    resolved.push(resolvedMatch);
    byId.set(String(match.id), resolvedMatch);
  });

  return resolved;
}

function resolveKnockoutSide(teamId, name, label, groupTables, thirdsByGroup, thirdMapping, previousMatches, teams) {
  if (teamId) return getTeam(teams, teamId, name || label);
  const text = `${label || name || ''}`.trim();
  if (!text) return null;

  let match = text.match(/Winner\s+Group\s+([A-L])/i);
  if (match) return groupTables.get(match[1])?.[0]?.team || null;

  match = text.match(/Runner[- ]up\s+Group\s+([A-L])/i);
  if (match) return groupTables.get(match[1])?.[1]?.team || null;

  match = text.match(/3(?:rd)?\s+Group\s+([A-L](?:\s*\/\s*[A-L])*)/i);
  if (match) {
    const targetWinnerGroup = findNearbyWinnerGroup(label, name);
    if (!thirdMapping || !targetWinnerGroup) return null;
    const assignment = thirdMapping[`1${targetWinnerGroup}`];
    const sourceGroup = assignment?.replace('3', '');
    return sourceGroup ? thirdsByGroup.get(sourceGroup) || null : null;
  }

  match = text.match(/Winner\s+(?:Match\s*)?(\d+)/i);
  if (match) return previousMatches.get(match[1])?.winner || null;

  match = text.match(/Loser\s+(?:Match\s*)?(\d+)/i);
  if (match) return previousMatches.get(match[1])?.loser || null;

  return null;
}

function findNearbyWinnerGroup(label, name) {
  // The third-place side itself does not always include the destination slot.
  // The caller supplies only one side at a time, so this is a placeholder hook.
  // The actual destination is resolved in resolveKnockoutSideFromFixture below if needed.
  return null;
}

// Patch resolver for R32 third-place fixtures where one side is Winner Group X and the other is a third-place placeholder.
function resolveKnockout(matches, groupTables, qualifiedThirds, thirdMapping, statsContext, teams) {
  const knockoutRaw = matches.filter(match => match.type !== 'group').sort((a, b) => a.id - b.id);
  const resolved = [];
  const byId = new Map();
  const thirdsByGroup = new Map(qualifiedThirds.map(row => [row.group, row.team]));

  knockoutRaw.forEach(match => {
    const destinationGroup = extractWinnerGroup(match.homeLabel || match.homeName) || extractWinnerGroup(match.awayLabel || match.awayName);
    const homeTeam = resolveKnockoutSideFromFixture(match.homeTeamId, match.homeName, match.homeLabel, destinationGroup, groupTables, thirdsByGroup, thirdMapping, byId, teams);
    const awayTeam = resolveKnockoutSideFromFixture(match.awayTeamId, match.awayName, match.awayLabel, destinationGroup, groupTables, thirdsByGroup, thirdMapping, byId, teams);

    let resolvedMatch;
    if (match.finished && hasBothScores(match) && homeTeam && awayTeam) {
      resolvedMatch = decorateResolvedMatch(match, homeTeam, awayTeam, {
        homeGoals: match.homeScore,
        awayGoals: match.awayScore,
        rawHome: match.homeScore,
        rawAway: match.awayScore,
        source: 'actual'
      });
      if (resolvedMatch.isDraw) {
        const forecast = forecastMatch(homeTeam, awayTeam, statsContext, true);
        resolvedMatch.winner = forecast.knockoutTieBreak;
        resolvedMatch.loser = forecast.knockoutTieBreak.id === homeTeam.id ? awayTeam : homeTeam;
        resolvedMatch.forecast = forecast;
        resolvedMatch.penaltyNote = 'Actual knockout match was level in the available score data. Model split used because penalty winner was not available from the source.';
      }
    } else if (homeTeam && awayTeam) {
      const forecast = forecastMatch(homeTeam, awayTeam, statsContext, true);
      const winner = forecast.homeRounded > forecast.awayRounded
        ? homeTeam
        : forecast.awayRounded > forecast.homeRounded
          ? awayTeam
          : forecast.knockoutTieBreak;
      const loser = winner.id === homeTeam.id ? awayTeam : homeTeam;

      resolvedMatch = {
        ...match,
        homeTeam,
        awayTeam,
        homeGoals: forecast.homeRounded,
        awayGoals: forecast.awayRounded,
        rawHome: forecast.homeBlend,
        rawAway: forecast.awayBlend,
        source: 'forecast',
        forecast,
        winner,
        loser,
        isDraw: forecast.homeRounded === forecast.awayRounded,
        penaltyNote: forecast.homeRounded === forecast.awayRounded
          ? `${teamName(winner)} advances on the unrounded model result.`
          : ''
      };
    } else {
      resolvedMatch = {
        ...match,
        homeTeam: homeTeam || placeholderTeam(match.homeLabel || match.homeName || 'TBC'),
        awayTeam: awayTeam || placeholderTeam(match.awayLabel || match.awayName || 'TBC'),
        homeGoals: null,
        awayGoals: null,
        rawHome: null,
        rawAway: null,
        source: 'pending',
        forecast: null,
        winner: null,
        loser: null,
        isDraw: false,
        penaltyNote: 'Opponent could not be resolved from current data.'
      };
    }

    resolved.push(resolvedMatch);
    byId.set(String(match.id), resolvedMatch);
  });

  return resolved;
}

function resolveKnockoutSideFromFixture(teamId, name, label, destinationGroup, groupTables, thirdsByGroup, thirdMapping, previousMatches, teams) {
  if (teamId) return getTeam(teams, teamId, name || label);
  const text = `${label || name || ''}`.trim();
  if (!text) return null;

  let match = text.match(/Winner\s+Group\s+([A-L])/i);
  if (match) return groupTables.get(match[1])?.[0]?.team || null;

  match = text.match(/Runner[- ]up\s+Group\s+([A-L])/i);
  if (match) return groupTables.get(match[1])?.[1]?.team || null;

  match = text.match(/3(?:rd)?\s+Group\s+([A-L](?:\s*\/\s*[A-L])*)/i);
  if (match) {
    if (!thirdMapping || !destinationGroup) return null;
    const assignment = thirdMapping[`1${destinationGroup}`];
    const sourceGroup = assignment?.replace('3', '');
    return sourceGroup ? thirdsByGroup.get(sourceGroup) || null : null;
  }

  match = text.match(/Winner\s+(?:Match\s*)?(\d+)/i);
  if (match) return previousMatches.get(match[1])?.winner || null;

  match = text.match(/Loser\s+(?:Match\s*)?(\d+)/i);
  if (match) return previousMatches.get(match[1])?.loser || null;

  return null;
}

function extractWinnerGroup(text = '') {
  const match = `${text}`.match(/Winner\s+Group\s+([A-L])/i);
  return match ? match[1] : null;
}

function buildAustraliaProjection(australia, groupTables, thirds, knockoutMatches) {
  if (!australia) return null;

  const group = australia.group || [...groupTables.entries()].find(([, rows]) => rows.some(row => row.team.id === australia.id))?.[0];
  const table = groupTables.get(group) || [];
  const row = table.find(entry => entry.team.id === australia.id);
  const thirdRow = thirds.find(entry => entry.team.id === australia.id);
  const qualified = row ? row.rank <= 2 || Boolean(thirdRow?.qualifies) : false;

  let exit = qualified ? 'Qualified, knockout path pending' : 'Projected out in group stage';
  let champion = false;
  let lastMatch = null;

  knockoutMatches.forEach(match => {
    const involved = match.homeTeam?.id === australia.id || match.awayTeam?.id === australia.id;
    if (!involved) return;
    lastMatch = match;
    if (match.winner?.id === australia.id) {
      exit = match.type === 'final' ? 'Projected World Cup champions' : `Projected beyond ${stageLabel(match.type)}`;
      champion = match.type === 'final';
    } else {
      exit = match.type === 'third'
        ? 'Projected fourth place'
        : `Projected exit: ${stageLabel(match.type)}`;
    }
  });

  return { group, row, qualified, thirdRow, exit, champion, lastMatch };
}

function renderApp() {
  const sim = state.simulation;
  const australia = sim.australia;
  renderAustraliaCard(sim);
  renderNextMatchCard(sim);
  renderTournamentCard(sim);
  renderAustraliaPath(sim);
  renderScenarios(sim);
  renderGroups(sim);
  renderThirds(sim);
  renderBracket(sim);
  renderMatches(sim);
  els.dataSourceNote.textContent = `Data loaded from ${CONFIG.dataBaseUrl}. Annexe C allocation loaded from the public Wikipedia rendering of FIFA's published table. App loaded at ${formatMelbourneDateTime(state.loadedAt, { includeTimeZone: true })}.`;

  if (!australia) {
    showError('Australia could not be found in the current teams data. The app loaded, but the Socceroos-specific sections may be incomplete.');
  }
}

function renderAustraliaCard(sim) {
  const projection = sim.australiaProjection;
  if (!projection?.row) {
    els.australiaCard.innerHTML = `<h2>Australia</h2><p class="meta">Australia was not found in the loaded data.</p>`;
    return;
  }

  const row = projection.row;
  const qualifyText = projection.qualified ? 'Projected to qualify' : 'Projected not to qualify';
  const chipClass = projection.qualified ? 'status-chip' : 'status-chip status-chip--danger';

  els.australiaCard.innerHTML = `
    <p class="eyebrow">Socceroos status</p>
    <h2>${teamCell(row.team)}</h2>
    <p class="big-number">${ordinal(row.rank)} in Group ${projection.group}</p>
    <p><span class="${chipClass}">${qualifyText}</span></p>
    <p class="meta">${escapeHtml(projection.exit)}</p>
    <div class="stat-grid">
      ${statPill('Pts', row.points)}
      ${statPill('GD', signed(row.gd))}
      ${statPill('GF', row.gf)}
      ${statPill('GA', row.ga)}
    </div>
  `;
}

function renderNextMatchCard(sim) {
  const next = findNextAustraliaMatch(sim);
  if (!next) {
    els.nextMatchCard.innerHTML = `
      <p class="eyebrow">Next up</p>
      <h2>No future Australia match found</h2>
      <p class="meta">Either Australia are projected out, or the data source has not resolved their next opponent.</p>
    `;
    return;
  }

  const opponent = next.homeTeam?.id === sim.australia.id ? next.awayTeam : next.homeTeam;
  els.nextMatchCard.innerHTML = `
    <p class="eyebrow">Next up</p>
    <h2>${teamCell(opponent)}</h2>
    <p class="scoreline">${scoreText(next)}</p>
    <p class="meta">${stageLabel(next.type)} · ${formatMatchTime(next)} · ${venueText(next)}</p>
    <p class="range-text">${rangeText(next)}</p>
  `;
}

function renderTournamentCard(sim) {
  const final = sim.knockoutMatches.find(match => match.type === 'final');
  const winner = final?.winner;
  const runnerUp = final?.loser;

  els.tournamentCard.innerHTML = `
    <p class="eyebrow">Tournament forecast</p>
    <h2>${winner ? teamCell(winner) : 'Winner unresolved'}</h2>
    <p class="meta">${runnerUp ? `Projected runner-up: ${teamName(runnerUp)}` : 'The final could not be simulated from current data.'}</p>
    <div class="stat-grid">
      ${statPill('Played', sim.actualMatches.length)}
      ${statPill('Forecast', sim.allResolvedMatches.filter(m => m.source === 'forecast').length)}
      ${statPill('3rd map', sim.thirdMapping ? 'OK' : 'Missing')}
      ${statPill('Avg goals', formatDecimal(sim.statsContext.tournamentAvg))}
    </div>
  `;
}

function renderAustraliaPath(sim) {
  const matches = sim.allResolvedMatches.filter(match =>
    match.homeTeam?.id === sim.australia?.id || match.awayTeam?.id === sim.australia?.id
  );

  if (matches.length === 0) {
    els.australiaPath.innerHTML = `<p class="meta">No Australia matches could be resolved.</p>`;
    return;
  }

  els.australiaPath.innerHTML = matches.map(match => {
    const opponent = match.homeTeam.id === sim.australia.id ? match.awayTeam : match.homeTeam;
    return `
      <article class="path-item">
        <div><span class="${match.source === 'actual' ? 'status-chip' : 'status-chip status-chip--forecast'}">${match.source}</span></div>
        <div>
          <div class="match-title">${stageLabel(match.type)} · ${teamCell(opponent)}</div>
          <div class="meta">${formatMatchTime(match)} · ${venueText(match)}</div>
          ${match.penaltyNote ? `<div class="small-note">${escapeHtml(match.penaltyNote)}</div>` : ''}
        </div>
        <div class="scoreline">${scoreText(match)}</div>
      </article>
    `;
  }).join('');
}

function renderScenarios(sim) {
  const nextGroupMatch = sim.allResolvedMatches.find(match =>
    match.type === 'group' &&
    match.source !== 'actual' &&
    (match.homeTeam?.id === sim.australia?.id || match.awayTeam?.id === sim.australia?.id)
  );

  if (!nextGroupMatch) {
    els.scenarioGrid.innerHTML = `<p class="meta">No remaining Australia group match found. Scenario cards are only needed during the group stage.</p>`;
    return;
  }

  const scenarios = [
    { label: 'Australia win', kind: 'win' },
    { label: 'Australia draw', kind: 'draw' },
    { label: 'Australia loss', kind: 'loss' }
  ];

  els.scenarioGrid.innerHTML = scenarios.map(scenario => {
    const override = buildScenarioOverride(nextGroupMatch, sim.australia, scenario.kind);
    const scenarioSim = simulateTournament(state.matches, state.teams, state.stadiums, state.annexeC, override);
    const projection = scenarioSim.australiaProjection;
    const row = projection?.row;
    return `
      <article class="scenario-card">
        <p class="eyebrow">${escapeHtml(scenario.label)}</p>
        <strong>${row ? `${ordinal(row.rank)} in Group ${projection.group}` : 'Unresolved'}</strong>
        <p class="meta">${row ? `${row.points} pts, GD ${signed(row.gd)}, ${projection.qualified ? 'qualifies' : 'projected out'}` : 'Could not calculate scenario.'}</p>
        <p class="small-note">Assumes this one match result, then forecasts the rest normally.</p>
      </article>
    `;
  }).join('');
}

function renderGroups(sim) {
  els.groupsTab.innerHTML = `<div class="group-grid">${[...sim.groupTables.entries()].map(([group, rows]) => `
    <article class="group-card">
      <h3>Group ${group}<span class="stage-chip">Projected</span></h3>
      ${miniTable(rows, 2)}
    </article>
  `).join('')}</div>`;
}

function renderThirds(sim) {
  els.thirdsTab.innerHTML = `
    <article class="third-card">
      <h3>Best third-placed teams <span class="stage-chip">Top 8 qualify</span></h3>
      ${miniTable(sim.thirds, 8, { useThirdRank: true })}
      <p class="small-note">Annexe C combination: ${sim.thirdQualifiedGroups || 'unresolved'} · ${sim.thirdMapping ? 'mapping loaded' : 'mapping unavailable'}</p>
    </article>
  `;
}

function renderBracket(sim) {
  const grouped = groupBy(sim.knockoutMatches, match => match.type);
  const order = ['r32', 'r16', 'qf', 'sf', 'third', 'final'];

  els.bracketList.innerHTML = order.map(stage => {
    const matches = grouped.get(stage) || [];
    if (matches.length === 0) return '';
    return `
      <div>
        <h3>${stageLabel(stage)}</h3>
        <div class="path-list">
          ${matches.map(match => `
            <article class="bracket-item ${involvesAustralia(match, sim.australia) ? 'qualifies' : ''}">
              <div><span class="stage-chip">M${match.id}</span></div>
              <div>
                <div class="match-title">${teamCell(match.homeTeam)} v ${teamCell(match.awayTeam)}</div>
                <div class="meta">${formatMatchTime(match)} · ${venueText(match)}</div>
                ${match.penaltyNote ? `<div class="small-note">${escapeHtml(match.penaltyNote)}</div>` : ''}
              </div>
              <div class="scoreline">${scoreText(match)}</div>
            </article>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderMatches(sim) {
  els.matchesBody.innerHTML = sim.allResolvedMatches.map(match => `
    <tr class="${involvesAustralia(match, sim.australia) ? 'australia-row' : ''}">
      <td>M${match.id}</td>
      <td>${formatMatchTime(match)}</td>
      <td>${stageLabel(match.type)}</td>
      <td>${teamCell(match.homeTeam)}<br>v<br>${teamCell(match.awayTeam)}</td>
      <td><strong>${scoreText(match)}</strong><br><span class="${match.source === 'actual' ? 'status-chip' : 'status-chip status-chip--forecast'}">${match.source}</span></td>
      <td>${rangeText(match)}</td>
    </tr>
  `).join('');
}

function miniTable(rows, qualifyCutoff = 0, options = {}) {
  return `
    <table class="mini-table">
      <thead>
        <tr>
          <th>#</th><th>Team</th><th>Pts</th><th>GD</th><th>GF</th><th>GA</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((row, index) => {
          const rank = options.useThirdRank ? row.thirdRank : row.rank ?? index + 1;
          const isQual = qualifyCutoff && index < qualifyCutoff;
          const isAus = state.simulation?.australia?.id === row.team.id;
          return `
            <tr class="${isQual ? 'qualifies' : ''} ${isAus ? 'australia-row' : ''}">
              <td>${rank}</td>
              <td>${teamCell(row.team)}${options.useThirdRank ? ` <span class="meta">Group ${row.group}</span>` : ''}</td>
              <td>${row.points}</td>
              <td>${signed(row.gd)}</td>
              <td>${row.gf}</td>
              <td>${row.ga}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function buildScenarioOverride(match, australia, kind) {
  const ausHome = match.homeTeam.id === australia.id;
  let ausGoals;
  let opponentGoals;
  if (kind === 'win') {
    ausGoals = Math.max(1, match.forecast ? (ausHome ? match.forecast.homeRounded : match.forecast.awayRounded) : 1);
    opponentGoals = Math.max(0, ausGoals - 1);
  } else if (kind === 'loss') {
    opponentGoals = Math.max(1, match.forecast ? (ausHome ? match.forecast.awayRounded : match.forecast.homeRounded) : 1);
    ausGoals = Math.max(0, opponentGoals - 1);
  } else {
    const goals = Math.max(0, Math.round(((match.forecast?.homeBlend || 1) + (match.forecast?.awayBlend || 1)) / 2));
    ausGoals = goals;
    opponentGoals = goals;
  }

  return {
    matchId: match.id,
    homeGoals: ausHome ? ausGoals : opponentGoals,
    awayGoals: ausHome ? opponentGoals : ausGoals
  };
}

function findNextAustraliaMatch(sim) {
  const now = Date.now();
  return sim.allResolvedMatches.find(match =>
    match.source !== 'actual' &&
    (match.homeTeam?.id === sim.australia?.id || match.awayTeam?.id === sim.australia?.id) &&
    (!match.utcDate || match.utcDate.getTime() >= now - 3 * 60 * 60 * 1000)
  ) || sim.allResolvedMatches.find(match =>
    match.source !== 'actual' &&
    (match.homeTeam?.id === sim.australia?.id || match.awayTeam?.id === sim.australia?.id)
  );
}

function formatMatchTime(match) {
  const utc = getMatchUtcDate(match);
  if (!utc) return escapeHtml(match.localDate || 'Time TBC');
  return formatMelbourneDateTime(utc, { includeTimeZone: true });
}

function getMatchUtcDate(match) {
  if (match.utcDate) return match.utcDate;
  const stadium = state.stadiums.get(match.stadiumId);
  const parsed = parseLocalDate(match.localDate);
  if (!parsed) return null;
  const timeZone = stadium?.timeZone || 'America/New_York';
  match.utcDate = zonedTimeToUtc(parsed, timeZone);
  return match.utcDate;
}

function formatMelbourneDateTime(date, options = {}) {
  const formatted = new Intl.DateTimeFormat('en-AU', {
    timeZone: CONFIG.melbourneTimeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
  return options.includeTimeZone ? `${formatted} AEST` : formatted;
}

function parseLocalDate(value) {
  const text = `${value || ''}`.trim();
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (match) {
    return {
      month: Number(match[1]),
      day: Number(match[2]),
      year: Number(match[3]),
      hour: Number(match[4]),
      minute: Number(match[5])
    };
  }

  const iso = new Date(text);
  if (!Number.isNaN(iso.getTime())) return iso;
  return null;
}

function zonedTimeToUtc(local, timeZone) {
  if (local instanceof Date) return local;
  let utc = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute || 0, 0);
  for (let i = 0; i < 3; i += 1) {
    const offset = getTimeZoneOffsetMs(new Date(utc), timeZone);
    utc = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute || 0, 0) - offset;
  }
  return new Date(utc);
}

function getTimeZoneOffsetMs(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = Number(part.value);
    return acc;
  }, {});

  const localAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return localAsUtc - date.getTime();
}

function inferVenueTimeZone(city, country) {
  const value = `${city} ${country}`.toLowerCase();
  if (/vancouver|seattle|san francisco|santa clara|los angeles|inglewood/.test(value)) return 'America/Los_Angeles';
  if (/denver/.test(value)) return 'America/Denver';
  if (/mexico city|guadalajara|monterrey|dallas|arlington|houston|kansas city/.test(value)) return 'America/Chicago';
  if (/toronto|boston|foxborough|new york|new jersey|east rutherford|philadelphia|miami|atlanta/.test(value)) return 'America/New_York';
  return 'America/New_York';
}

function venueText(match) {
  const stadium = state.stadiums.get(match.stadiumId);
  if (!stadium) return 'Venue TBC';
  return `${escapeHtml(stadium.name)} · ${escapeHtml(stadium.city)}`;
}

function scoreText(match) {
  if (match.homeGoals === null || match.awayGoals === null || match.homeGoals === undefined || match.awayGoals === undefined) return 'TBC';
  return `${teamShort(match.homeTeam)} ${match.homeGoals}–${match.awayGoals} ${teamShort(match.awayTeam)}`;
}

function rangeText(match) {
  if (!match.forecast) return match.source === 'actual' ? 'Actual result' : 'No forecast range';
  const homeRange = match.forecast.homeRange.map(value => formatDecimal(value)).join('–');
  const awayRange = match.forecast.awayRange.map(value => formatDecimal(value)).join('–');
  return `${teamShort(match.homeTeam)} ${homeRange} · ${teamShort(match.awayTeam)} ${awayRange}`;
}

function teamCell(team) {
  if (!team) return 'TBC';
  const flag = team.flag ? `<img src="${escapeAttribute(team.flag)}" alt="" loading="lazy">` : '';
  return `<span class="team-cell">${flag}<span>${escapeHtml(team.name || 'TBC')}</span></span>`;
}

function teamName(team) {
  return team?.name || 'TBC';
}

function teamShort(team) {
  return team?.fifaCode || team?.name || 'TBC';
}

function stageLabel(stage) {
  return STAGE_LABELS[stage] || upperFirst(stage || 'Match');
}

function statPill(label, value) {
  return `<div class="stat-pill"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`;
}

function setStatus(text, type) {
  const dot = type === 'loading' ? '<span class="pulse"></span>' : type === 'error' ? '<span class="pulse" style="background:#ff6b5f"></span>' : '<span class="pulse" style="background:#21c879; animation:none"></span>';
  els.loadStatus.innerHTML = `${dot}${escapeHtml(text)}`;
}

function renderFatalError(error) {
  els.errorPanel.classList.remove('hidden');
  els.errorPanel.innerHTML = `
    <h2>Live data failed to load</h2>
    <p>${escapeHtml(error.message)}</p>
    <p><strong>Try first:</strong> refresh in a minute. <strong>If it keeps happening:</strong> the data source or its structure may have changed and the app may need rebuilding.</p>
  `;
}

function showError(message) {
  els.errorPanel.classList.remove('hidden');
  els.errorPanel.innerHTML = `<p>${escapeHtml(message)}</p>`;
}

function hideError() {
  els.errorPanel.classList.add('hidden');
  els.errorPanel.innerHTML = '';
}

function renderLoadingSkeletons() {
  [els.australiaCard, els.nextMatchCard, els.tournamentCard].forEach(el => {
    el.innerHTML = `<div class="loading-skeleton"></div><br><div class="loading-skeleton"></div><br><div class="loading-skeleton"></div>`;
  });
}

function setupTabs() {
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const tab = button.dataset.tab;
      els.groupsTab.classList.toggle('hidden', tab !== 'groups');
      els.thirdsTab.classList.toggle('hidden', tab !== 'thirds');
    });
  });
}

function getTeam(teams, id, fallbackName = 'TBC') {
  return teams.get(String(id)) || placeholderTeam(fallbackName, id);
}

function placeholderTeam(name, id = '') {
  return { id: id || `placeholder-${name}`, name: name || 'TBC', fifaCode: '', group: '', flag: '', placeholder: true };
}

function blankTableRow(team, group) {
  return { team, group, played: 0, wins: 0, draws: 0, losses: 0, points: 0, gf: 0, ga: 0, gd: 0, rank: 0 };
}

function inferTeamGroupFromMatches(team, matches) {
  const match = matches.find(item => item.homeTeam?.id === team.id || item.awayTeam?.id === team.id);
  return match?.group || '';
}

function findAustralia(teams) {
  return [...teams.values()].find(team => team.fifaCode === 'AUS')
    || [...teams.values()].find(team => CONFIG.australiaNames.some(name => team.name.toLowerCase().includes(name.toLowerCase())));
}

function fallbackStats(team, tournamentAvg) {
  return { team, played: 0, gf: 0, ga: 0, avgFor: tournamentAvg, avgAgainst: tournamentAvg };
}

function hasBothScores(match) {
  return Number.isFinite(match.homeScore) && Number.isFinite(match.awayScore);
}

function parseScore(value) {
  if (value === null || value === undefined || value === '' || String(value).toLowerCase() === 'null') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  const text = `${value}`.trim().toLowerCase();
  return ['true', 'yes', '1', 'finished', 'ft', 'fulltime'].includes(text);
}

function asString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function inferStageFromId(id) {
  if (id <= 72) return 'group';
  if (id <= 88) return 'r32';
  if (id <= 96) return 'r16';
  if (id <= 100) return 'qf';
  if (id <= 102) return 'sf';
  if (id === 103) return 'third';
  if (id === 104) return 'final';
  return 'match';
}

function safeRatio(numerator, denominator) {
  if (!denominator || !Number.isFinite(denominator)) return 1;
  return numerator / denominator;
}

function mean(values) {
  const valid = values.filter(Number.isFinite);
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0;
}

function median(values) {
  const valid = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!valid.length) return 0;
  const mid = Math.floor(valid.length / 2);
  return valid.length % 2 ? valid[mid] : (valid[mid - 1] + valid[mid]) / 2;
}

function roundGoal(value) {
  return Math.max(0, Math.round(value));
}

function compareNumbers(values) {
  return values.find(value => value !== 0) || 0;
}

function groupBy(items, getKey) {
  const map = new Map();
  items.forEach(item => {
    const key = getKey(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return map;
}

function involvesAustralia(match, australia) {
  return australia && (match.homeTeam?.id === australia.id || match.awayTeam?.id === australia.id);
}

function ordinal(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return value;
  const suffix = number % 10 === 1 && number % 100 !== 11 ? 'st'
    : number % 10 === 2 && number % 100 !== 12 ? 'nd'
      : number % 10 === 3 && number % 100 !== 13 ? 'rd'
        : 'th';
  return `${number}${suffix}`;
}

function signed(value) {
  return value > 0 ? `+${value}` : String(value);
}

function formatDecimal(value) {
  return Number.isFinite(value) ? value.toFixed(2) : '—';
}

function upperFirst(value) {
  return `${value}`.slice(0, 1).toUpperCase() + `${value}`.slice(1);
}

function escapeHtml(value) {
  return `${value}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}
