# Socceroos World Cup 2026 Forecaster

A Ben's Shed / bOS app for manually tracking the FIFA World Cup 2026 and forecasting the Socceroos' path using only tournament results already entered in the app.

## Version

Manual v7, 1 July 2026.

## What this version does

- Uses a fixed baked-in World Cup 2026 schedule.
- Uses manually entered scores only. No live API calls.
- Saves scores in this browser on this device using `localStorage`.
- Keeps the confirmed Round of 32 fixtures hard-coded.
- Leaves Round of 32 and later results editable for scenario testing.
- Supports tied knockout scores, with a separate penalty-winner selector.
- Uses tied knockout scores as normal scoring evidence, but uses the selected penalty winner to progress the bracket.
- Adds a small bOS utility strip with:
  - Back to Ben's Shed
  - Refresh app
- Collapses group-stage score entry and group tables so the active knockout stage is easier to reach.

## Forecast model

The forecast model mirrors Ben's spreadsheet approach:

- calculates each team's tournament average for and against
- calculates the average strength of opponents already played
- calculates additive scoring/conceding modifiers
- calculates percentage scoring/conceding modifiers
- forecasts each team score using the median of the eight components
- shows the first-to-third quartile range as the model range

Forecasts do not use betting odds, Elo, squad strength, historical results, player data, or FIFA rankings to predict match scores.

## Knockout draw handling

For knockout matches:

- if one side scores more, the winner is automatic
- if the entered score is level, the app asks which listed side advanced on penalties
- penalty winners affect bracket progression only
- the tied score remains the evidence used by the forecast model

## Deployment

Place the folder at:

```text
/apps/socceroos-world-cup-2026/
```

Open:

```text
/apps/socceroos-world-cup-2026/index.html
```

If an iPhone home-screen app shows an older version, use the in-app Refresh app button, then force-close and reopen the home-screen app if needed.
