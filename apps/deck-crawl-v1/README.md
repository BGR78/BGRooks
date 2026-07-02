# Deck Crawl V1.1

A small browser-based card duel built for GitHub Pages.

## How to play

Each round you see four cards. Use the action slots above the hand to assign exactly one card to each action:

1. **Play now**: resolves the card immediately.
2. **Hold**: carries the card into the next round.
3. **Burn**: removes the card from this run.
4. **Recycle**: shuffles the card back into your draw pile.

The enemy's next card is visible, so you can plan around the incoming pressure.

## Suit meanings

- **Hearts** heal.
- **Diamonds** store charge.
- **Spades** build shield.
- **Clubs** attack.

Diamonds are stored as charge. When playing a heart, spade or club, you can choose to spend all stored charge to boost that card.

## Card values

- 2 to 10 are worth their number.
- Jack = 11.
- Queen = 12.
- King = 13.
- Ace randomly resolves as either 1 or 14 when played.

## Win condition

Defeat as many enemies as possible before your health reaches zero. After each enemy, you continue with your current health, regain a little health, lose shield and charge, and face a stronger enemy with a fresh deck.

## V1.1 changes

- Fixed duplicate visible cards breaking selections by giving every physical card a unique instance ID.
- Moved the action choices above the cards for a more natural top-to-bottom selection flow.
- Made the enemy's next card visible before you choose, reducing the sense that the enemy is purely random.
- Clarified deck refresh behaviour in the game log.
