# Socceroos World Cup 2026 Forecaster

Part of Ben's Shed / bOS.

A standalone browser app that forecasts the Socceroos' World Cup 2026 path using manually entered tournament results only.

## Version

Manual-first V4.

This version deliberately removes the live API dependency. The previous live-data version could hang if an external source stalled or changed. This version has the World Cup schedule baked into the app and saves scores locally in the browser.

## Files

- `index.html`
- `style.css`
- `app.js`
- `README.md`

Put the folder under your GitHub Pages site, for example:

```text
/apps/socceroos-world-cup-2026/
```

Then link to:

```text
/apps/socceroos-world-cup-2026/index.html
```

## How it works

- Enter final scores as matches finish.
- Scores are saved using `localStorage` in the current browser on the current device. Use **Save scores & update forecast** after entering results so it is clear when the forecast has recalculated.
- The app recalculates group tables, best third-placed teams, the Socceroos path and knockout forecasts instantly.
- No accounts, logins, backend, live fetches or paid services are required.

## Single-device storage

`localStorage` means scores stay on the same browser and device between uses. For example, Safari on your iPhone and Chrome on your laptop will not automatically share scores.

The app includes export/import buttons as a safety valve, but you can ignore them if you only use one device.

## Starter results

The app starts with a 2026-06-18 AEST snapshot of completed group results through Ghana 1-0 Panama. Uzbekistan v Colombia was live in the source snapshot and is left blank for manual entry.

Use **Save scores & update forecast** after entering results. Use **Reset starter results** to go back to that snapshot, or **Clear all saved scores** to start blank.

## Forecast model

The forecast model mirrors Ben's spreadsheet. For each team it calculates, from completed results only:

1. Average goals for
2. Average goals against
3. Average opponent goals against
4. Average opponent goals for
5. Additive scoring modifier: average goals for minus average opponent goals against
6. Additive conceding modifier: average goals against minus average opponent goals for
7. Percentage scoring modifier: average goals for divided by average opponent goals against
8. Percentage conceding modifier: average goals against divided by average opponent goals for

For a future match, each team's predicted goals are the median of eight components:

1. That team's average goals for
2. The opponent's average goals against
3. The opponent's average goals against again, matching the spreadsheet structure
4. That team's average goals for again, matching the spreadsheet structure
5. The opponent's average goals against plus that team's additive scoring modifier
6. That team's average goals for plus the opponent's additive conceding modifier
7. The opponent's average goals against multiplied by that team's percentage scoring modifier
8. That team's average goals for multiplied by the opponent's percentage conceding modifier

The displayed model range is the first-to-third quartile range of those same eight components. Rounded scores are clamped to zero or higher. Raw median scores are kept for knockout tie-breaking.

## Prediction limits

Forecasts use only scores entered as completed matches in this tournament. They do not use betting odds, squad strength, Elo, historical results or FIFA rankings to predict match scores.

## Round of 32 note

This version fixes the post-group-stage Round of 32 bracket. The app no longer tries to infer the third-place allocation from slot constraints. The confirmed Round of 32 fixtures are hard-coded, but Round of 32 scores/results are deliberately left editable so Ben can test forecast scenarios.

Confirmed Round of 32 pairings baked into v5:

- South Africa v Canada
- Brazil v Japan
- Germany v Paraguay
- Netherlands v Morocco
- Ivory Coast v Norway
- France v Sweden
- Mexico v Ecuador
- England v DR Congo
- Belgium v Senegal
- United States v Bosnia and Herzegovina
- Spain v Austria
- Portugal v Croatia
- Switzerland v Algeria
- Australia v Egypt
- Argentina v Cape Verde
- Colombia v Ghana
