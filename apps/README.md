# Socceroos World Cup 2026 Forecaster

Part of Ben's Shed / bOS.

A standalone browser app that forecasts the Socceroos' World Cup 2026 path using manually entered tournament results only.

## Version

Manual-first V2.

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
- Scores are saved using `localStorage` in the current browser on the current device.
- The app recalculates group tables, best third-placed teams, the Socceroos path and knockout forecasts instantly.
- No accounts, logins, backend, live fetches or paid services are required.

## Single-device storage

`localStorage` means scores stay on the same browser and device between uses. For example, Safari on your iPhone and Chrome on your laptop will not automatically share scores.

The app includes export/import buttons as a safety valve, but you can ignore them if you only use one device.

## Starter results

The app starts with a 2026-06-18 AEST snapshot of completed group results through Ghana 1-0 Panama. Uzbekistan v Colombia was live in the source snapshot and is left blank for manual entry.

Use **Reset starter results** to go back to that snapshot, or **Clear all saved scores** to start blank.

## Forecast model

For each future match, the app calculates four score components:

1. Team attacking average
2. Opponent defensive concession average
3. Team attacking average adjusted by opponent defence
4. Opponent concession average adjusted by team attack

It then calculates:

```text
mean = average of the four components
median = median of the four components
forecast = average(mean, median)
```

The forecast score is rounded for display. The raw/unrounded forecast is kept for tie-breaking knockout matches.

## Prediction limits

Forecasts use only scores entered as completed matches in this tournament. They do not use betting odds, squad strength, Elo, historical results or FIFA rankings to predict match scores.

## Round of 32 note

The app includes the published Round of 32 slot constraints, such as `1D v 3rd B/E/F/I/J`. It provisionally allocates qualifying third-placed teams into those slots using a matching algorithm.

This is useful for forecasting, but it is not a hard-coded copy of FIFA's full Annexe C 495-combination table. If Australia ends up relying on a third-place pathway or the exact Round of 32 allocation becomes critical, the next improvement should be hard-coding Annexe C.
