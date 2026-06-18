(() => {
  "use strict";

  const suits = ["hearts", "diamonds", "spades", "clubs"];
  const suitSymbols = { hearts: "♥", diamonds: "♦", spades: "♠", clubs: "♣" };
  const suitNames = { hearts: "Heart", diamonds: "Diamond", spades: "Spade", clubs: "Club" };
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const actionLabels = { play: "Play", hold: "Hold", burn: "Burn", recycle: "Recycle" };
  const storageKey = "deckCrawlBestDefeatedV1";

  const els = {
    cards: document.getElementById("cards"),
    actions: Array.from(document.querySelectorAll(".action-button")),
    resolve: document.getElementById("resolve"),
    undo: document.getElementById("undo"),
    boostToggle: document.getElementById("boostToggle"),
    boostWrap: document.getElementById("boostWrap"),
    log: document.getElementById("log"),
    clearLog: document.getElementById("clearLog"),
    newGameTop: document.getElementById("newGameTop"),
    modal: document.getElementById("modal"),
    modalKicker: document.getElementById("modalKicker"),
    modalTitle: document.getElementById("modalTitle"),
    modalText: document.getElementById("modalText"),
    modalPrimary: document.getElementById("modalPrimary"),
    modalSecondary: document.getElementById("modalSecondary"),
    wave: document.getElementById("wave"),
    defeated: document.getElementById("defeated"),
    rounds: document.getElementById("rounds"),
    best: document.getElementById("best"),
    playerHealthText: document.getElementById("playerHealthText"),
    playerHealthBar: document.getElementById("playerHealthBar"),
    playerShield: document.getElementById("playerShield"),
    playerCharge: document.getElementById("playerCharge"),
    playerDeckCount: document.getElementById("playerDeckCount"),
    enemyName: document.getElementById("enemyName"),
    enemyHealthText: document.getElementById("enemyHealthText"),
    enemyHealthBar: document.getElementById("enemyHealthBar"),
    enemyShield: document.getElementById("enemyShield"),
    enemyCharge: document.getElementById("enemyCharge"),
    enemyLast: document.getElementById("enemyLast"),
    turnHint: document.getElementById("turnHint"),
  };

  let state;
  let selectedAction = "play";

  function freshState() {
    return {
      active: true,
      wave: 1,
      defeated: 0,
      rounds: 0,
      best: Number(localStorage.getItem(storageKey) || 0),
      player: {
        health: 30,
        maxHealth: 30,
        shield: 0,
        maxShield: 12,
        charge: 0,
        maxCharge: 20,
        deck: shuffle(buildDeck()),
        held: null,
        hand: [],
      },
      enemy: buildEnemy(1),
      enemyDeck: shuffle(buildDeck()),
      assignments: {},
      messageQueue: [],
    };
  }

  function buildEnemy(wave) {
    const maxHealth = 40 + (wave - 1) * 12;
    return {
      name: `Enemy ${wave}`,
      health: maxHealth,
      maxHealth,
      shield: Math.min(4 + Math.floor(wave / 2), 12),
      maxShield: Math.min(10 + Math.floor(wave / 3), 18),
      charge: 0,
      maxCharge: Math.min(18 + wave, 28),
    };
  }

  function buildDeck() {
    let id = 0;
    return suits.flatMap((suit) => ranks.map((rank) => ({ id: `${suit}-${rank}-${id++}`, suit, rank })));
  }

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function cardLabel(card) {
    return `${card.rank}${suitSymbols[card.suit]}`;
  }

  function rankValue(card) {
    if (card.rank === "A") return Math.random() < 0.5 ? 1 : 14;
    if (card.rank === "J") return 11;
    if (card.rank === "Q") return 12;
    if (card.rank === "K") return 13;
    return Number(card.rank);
  }

  function previewValue(card) {
    if (card.rank === "A") return "1 or 14";
    return card.rank === "J" ? "11" : card.rank === "Q" ? "12" : card.rank === "K" ? "13" : card.rank;
  }

  function startGame() {
    state = freshState();
    selectedAction = "play";
    log("New run started. Defeat as many enemies as you can.");
    drawHand();
    render();
    hideModal();
  }

  function nextEnemy() {
    state.wave += 1;
    state.enemy = buildEnemy(state.wave);
    state.enemyDeck = shuffle(buildDeck());
    state.player.deck = shuffle(buildDeck());
    state.player.held = null;
    state.player.hand = [];
    state.assignments = {};
    state.player.shield = 0;
    state.player.charge = 0;
    const healAmount = Math.min(8, state.player.maxHealth - state.player.health);
    state.player.health += healAmount;
    log(`You catch your breath and recover ${healAmount} health. A stronger enemy appears.`);
    drawHand();
    render();
    hideModal();
  }

  function drawHand() {
    const hand = [];
    if (state.player.held) {
      hand.push(state.player.held);
      state.player.held = null;
    }
    while (hand.length < 4) {
      if (state.player.deck.length === 0) {
        state.player.deck = shuffle(buildDeck());
        log("Your deck is empty. A fresh deck is shuffled in.");
      }
      hand.push(state.player.deck.pop());
    }
    state.player.hand = hand;
    state.assignments = {};
  }

  function chooseAction(action) {
    selectedAction = action;
    renderActions();
  }

  function assignCard(cardId) {
    if (!state.active) return;
    const currentCardForAction = Object.entries(state.assignments).find(([, action]) => action === selectedAction);
    if (currentCardForAction) delete state.assignments[currentCardForAction[0]];

    if (state.assignments[cardId] === selectedAction) {
      delete state.assignments[cardId];
    } else {
      state.assignments[cardId] = selectedAction;
    }
    render();
  }

  function clearAssignments() {
    state.assignments = {};
    els.boostToggle.checked = false;
    render();
  }

  function isReadyToResolve() {
    const actions = Object.values(state.assignments);
    return ["play", "hold", "burn", "recycle"].every((action) => actions.includes(action));
  }

  function resolveRound() {
    if (!isReadyToResolve() || !state.active) return;

    const byAction = {};
    for (const card of state.player.hand) byAction[state.assignments[card.id]] = card;

    state.rounds += 1;
    log(`Round ${state.rounds}: ${cardLabel(byAction.play)} played, ${cardLabel(byAction.hold)} held, ${cardLabel(byAction.burn)} burned, ${cardLabel(byAction.recycle)} recycled.`);

    resolveCard("player", byAction.play, els.boostToggle.checked);

    state.player.held = byAction.hold;
    insertRandom(state.player.deck, byAction.recycle);

    if (state.enemy.health <= 0) {
      defeatEnemy();
      return;
    }

    enemyTurn();

    if (state.player.health <= 0) {
      gameOver();
      return;
    }

    drawHand();
    els.boostToggle.checked = false;
    render();
  }

  function resolveCard(actor, card, useBoost = false) {
    const subject = actor === "player" ? state.player : state.enemy;
    const target = actor === "player" ? state.enemy : state.player;
    const actorName = actor === "player" ? "You" : "Enemy";
    const targetName = actor === "player" ? "enemy" : "you";
    let value = rankValue(card);
    const aceText = card.rank === "A" ? ` The ace resolves as ${value}.` : "";
    let boost = 0;

    if (useBoost && card.suit !== "diamonds" && subject.charge > 0) {
      boost = subject.charge;
      value += boost;
      subject.charge = 0;
    }

    if (card.suit === "hearts") {
      const before = subject.health;
      subject.health = Math.min(subject.maxHealth, subject.health + value);
      const healed = subject.health - before;
      log(`${actorName} play ${cardLabel(card)}.${aceText}${boost ? ` Charge adds ${boost}.` : ""} Heal ${healed}.`);
      pulse(actor === "player" ? "playerHealthText" : "enemyHealthText");
    }

    if (card.suit === "diamonds") {
      const before = subject.charge;
      subject.charge = Math.min(subject.maxCharge, subject.charge + value);
      const gained = subject.charge - before;
      log(`${actorName} play ${cardLabel(card)}.${aceText} Store ${gained} charge.`);
      pulse(actor === "player" ? "playerCharge" : "enemyCharge");
    }

    if (card.suit === "spades") {
      const before = subject.shield;
      subject.shield = Math.min(subject.maxShield, subject.shield + value);
      const gained = subject.shield - before;
      log(`${actorName} play ${cardLabel(card)}.${aceText}${boost ? ` Charge adds ${boost}.` : ""} Gain ${gained} shield.`);
      pulse(actor === "player" ? "playerShield" : "enemyShield");
    }

    if (card.suit === "clubs") {
      const blocked = Math.min(target.shield, value);
      target.shield -= blocked;
      const damage = value - blocked;
      target.health = Math.max(0, target.health - damage);
      log(`${actorName} play ${cardLabel(card)}.${aceText}${boost ? ` Charge adds ${boost}.` : ""} Attack ${targetName} for ${value}. Shield blocks ${blocked}; ${damage} health damage.`);
      pulse(actor === "player" ? "enemyHealthText" : "playerHealthText");
    }
  }

  function enemyTurn() {
    if (state.enemyDeck.length === 0) state.enemyDeck = shuffle(buildDeck());
    const card = state.enemyDeck.pop();
    const shouldBoost = card.suit !== "diamonds" && state.enemy.charge > 0 && (
      card.suit === "clubs" ||
      (card.suit === "hearts" && state.enemy.health <= state.enemy.maxHealth * 0.7) ||
      (card.suit === "spades" && state.enemy.shield <= state.enemy.maxShield * 0.45)
    );
    els.enemyLast.textContent = cardLabel(card);
    resolveCard("enemy", card, shouldBoost);
  }

  function defeatEnemy() {
    state.defeated += 1;
    state.best = Math.max(state.best, state.defeated);
    localStorage.setItem(storageKey, String(state.best));
    render();
    showModal({
      kicker: "Enemy defeated",
      title: `You beat Enemy ${state.wave}`,
      text: `You have defeated ${state.defeated} ${state.defeated === 1 ? "enemy" : "enemies"}. Continue with your current health, a fresh deck, no shield and no charge.`,
      primary: "Next enemy",
      onPrimary: nextEnemy,
      secondary: "Restart",
      onSecondary: startGame,
    });
  }

  function gameOver() {
    state.active = false;
    state.best = Math.max(state.best, state.defeated);
    localStorage.setItem(storageKey, String(state.best));
    render();
    showModal({
      kicker: "Run ended",
      title: "You were defeated",
      text: `You defeated ${state.defeated} ${state.defeated === 1 ? "enemy" : "enemies"} and survived ${state.rounds} rounds. Best run: ${state.best}.`,
      primary: "New run",
      onPrimary: startGame,
      secondary: null,
    });
  }

  function insertRandom(deck, card) {
    const index = Math.floor(Math.random() * (deck.length + 1));
    deck.splice(index, 0, card);
  }

  function log(message) {
    if (!state) return;
    state.messageQueue.unshift(message);
    state.messageQueue = state.messageQueue.slice(0, 80);
  }

  function render() {
    renderStats();
    renderCards();
    renderActions();
    renderLog();
    updateResolveState();
  }

  function renderStats() {
    els.wave.textContent = state.wave;
    els.defeated.textContent = state.defeated;
    els.rounds.textContent = state.rounds;
    els.best.textContent = state.best;
    els.playerHealthText.textContent = `${state.player.health} / ${state.player.maxHealth}`;
    els.playerHealthBar.style.width = `${(state.player.health / state.player.maxHealth) * 100}%`;
    els.playerShield.textContent = `${state.player.shield} / ${state.player.maxShield}`;
    els.playerCharge.textContent = `${state.player.charge} / ${state.player.maxCharge}`;
    els.playerDeckCount.textContent = state.player.deck.length;
    els.enemyName.textContent = state.enemy.name;
    els.enemyHealthText.textContent = `${state.enemy.health} / ${state.enemy.maxHealth}`;
    els.enemyHealthBar.style.width = `${(state.enemy.health / state.enemy.maxHealth) * 100}%`;
    els.enemyShield.textContent = `${state.enemy.shield} / ${state.enemy.maxShield}`;
    els.enemyCharge.textContent = `${state.enemy.charge} / ${state.enemy.maxCharge}`;

    const playCard = state.player.hand.find((card) => state.assignments[card.id] === "play");
    const canBoost = state.player.charge > 0 && playCard && playCard.suit !== "diamonds";
    els.boostToggle.disabled = !canBoost;
    els.boostWrap.classList.toggle("disabled", !canBoost);
    if (!canBoost) els.boostToggle.checked = false;
  }

  function renderCards() {
    els.cards.innerHTML = "";
    for (const card of state.player.hand) {
      const action = state.assignments[card.id];
      const cardButton = document.createElement("button");
      cardButton.type = "button";
      cardButton.className = `card ${action ? `assigned ${action}` : ""}`;
      cardButton.setAttribute("aria-label", `${cardLabel(card)}, value ${previewValue(card)}${action ? `, assigned to ${action}` : ""}`);
      cardButton.innerHTML = `
        <span class="card-rank">${card.rank}</span>
        <span class="card-suit ${card.suit}">${suitSymbols[card.suit]}</span>
        <span class="card-value">${suitNames[card.suit]} · ${previewValue(card)}</span>
        ${action ? `<span class="card-badge">${actionLabels[action]}</span>` : ""}
      `;
      cardButton.addEventListener("click", () => assignCard(card.id));
      els.cards.appendChild(cardButton);
    }
  }

  function renderActions() {
    for (const button of els.actions) {
      button.classList.toggle("selected", button.dataset.action === selectedAction);
    }
  }

  function renderLog() {
    els.log.innerHTML = state.messageQueue
      .map((message) => `<li>${escapeHtml(message)}</li>`)
      .join("");
  }

  function updateResolveState() {
    els.resolve.disabled = !isReadyToResolve() || !state.active;
    const missing = ["play", "hold", "burn", "recycle"].filter((action) => !Object.values(state.assignments).includes(action));
    els.turnHint.textContent = missing.length
      ? `Select an action, then tap a card. Still needed: ${missing.map((m) => actionLabels[m]).join(", ")}.`
      : "Ready. Resolve the round when you’re happy with the choices.";
  }

  function pulse(id) {
    const el = els[id];
    if (!el) return;
    el.classList.remove("pulse");
    void el.offsetWidth;
    el.classList.add("pulse");
  }

  function showModal({ kicker, title, text, primary, onPrimary, secondary, onSecondary }) {
    els.modalKicker.textContent = kicker;
    els.modalTitle.textContent = title;
    els.modalText.textContent = text;
    els.modalPrimary.textContent = primary;
    els.modalPrimary.onclick = onPrimary;

    if (secondary && onSecondary) {
      els.modalSecondary.textContent = secondary;
      els.modalSecondary.onclick = onSecondary;
      els.modalSecondary.classList.remove("hidden");
    } else {
      els.modalSecondary.classList.add("hidden");
    }
    els.modal.classList.remove("hidden");
  }

  function hideModal() {
    els.modal.classList.add("hidden");
  }

  function escapeHtml(input) {
    return String(input)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  els.actions.forEach((button) => button.addEventListener("click", () => chooseAction(button.dataset.action)));
  els.resolve.addEventListener("click", resolveRound);
  els.undo.addEventListener("click", clearAssignments);
  els.newGameTop.addEventListener("click", startGame);
  els.clearLog.addEventListener("click", () => {
    state.messageQueue = [];
    renderLog();
  });
  state = freshState();
  drawHand();
  render();
  showModal({
    kicker: "Deck Crawl V1",
    title: "Ready to crawl?",
    text: "Each round, assign one card to play, one to hold, one to burn and one to recycle. Hearts heal, diamonds store charge, spades shield, clubs attack. Survive as many enemies as you can.",
    primary: "Start run",
    onPrimary: startGame,
    secondary: null,
  });
})();
