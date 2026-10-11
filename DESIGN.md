---
version: alpha
name: "TEMPER — a weather instrument"
description: "Weather/Nature glassmorphism with orb, blur, glow — dark translucent."
colors:
  primary: "#DCE3F2"
  secondary: "#7C87A6"
  tertiary: "#9FD8FF"
  neutral: "#141B2E"
  ink: "#DCE3F2"
  dim: "#7C87A6"
  panel: "rgba(22, 26, 40, 0.72)"
  hair: "rgba(180, 195, 235, 0.16)"
  glow: "#9FD8FF"
  bg: "#070A14"
  bg2: "#1A2238"
typography:
  h1:
    fontFamily: system-ui
    fontSize: 2.5rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h2:
    fontFamily: system-ui
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.2
  body-md:
    fontFamily: system-ui
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  label-caps:
    fontFamily: "Courier New"
    fontSize: 0.7rem
    fontWeight: 600
    letterSpacing: "0.12em"
rounded:
  sm: 4px
  md: 8px
  lg: 16px
  full: 9999px
spacing:
  sm: 1rem
  md: 2rem
  lg: 4rem
components:
  button-primary:
    backgroundColor: "{colors.glow}"
    textColor: "{colors.bg}"
    rounded: "{rounded.full}"
    padding: 14px
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-hair:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.dim}"
    rounded: "{rounded.md}"
    padding: 16px
---

## Overview

TEMPER — a weather instrument. Dark translucent atmosphere: orb glow, glass panels, backdrop blur. Density 5/10, motion 8/10. Experimental, calm, instrument-like.

## Colors

- **Primary (#DCE3F2):** Ink text on dark.
- **Dim (#7C87A6):** Secondary text, hairlines.
- **Glow (#9FD8FF):** Orb, highlights, primary action.
- **Panel (rgba(22,26,40,.72)):** Glass cards with backdrop blur.
- **Bg (#070A14 → #1A2238 → #141B2E):** Deep gradient sky.

## Typography

system-ui for UI, Courier New for labels/caps. Tight tracking on h1.

## Layout

CSS Grid + Flexbox. Backdrop-filter blur on panels. Max-width centered, grid gaps at md/lg.

## Elevation & Depth

Blur + glow + translucent. Soft shadows, inner glows on orb.

## Shapes

lg (16px) on panels, full pill on CTAs/badges.

## Components

- `button-primary` glow pill — single high-emphasis per section.
- `card` glass panel with hair border + blur.
