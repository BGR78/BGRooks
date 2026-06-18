# Deck Crawl V1

A tiny browser card duel built for GitHub Pages.

## How to play

Each round you see four cards. Assign one card to each action:

- **Play now**: resolve this card immediately.
- **Hold**: carry this card into the next round.
- **Burn**: remove this card from the current deck.
- **Recycle**: shuffle this card randomly back into the current deck.

## Suit meanings

- **Hearts** heal you.
- **Diamonds** store charge.
- **Spades** build shield.
- **Clubs** attack the enemy.

Card values are 2-10 as shown, Jack = 11, Queen = 12, King = 13. Aces resolve as either 1 or 14 when played.

Diamonds are stored as charge. When playing a heart, spade or club, you can choose to spend all stored charge to boost that card.

## Win / lose

Defeat as many enemies as possible before your health reaches 0. After each defeated enemy, you start the next duel with a fresh deck, current health, no shield and no charge.

## GitHub Pages setup

Put these files in a folder such as `/apps/deck-crawl/` in your GitHub Pages repository:

- `index.html`
- `styles.css`
- `script.js`

Then open the folder URL in your browser.
