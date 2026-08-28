# Listen Back Reader visual system

## Direction

**Dithered / halftone print system.** The product behaves like a careful reader's
margin mark: high contrast ink, paper warmth, and a bright ruler that makes the
current sentence hard to lose. It avoids a soft wellness-app look. Dense pages
need an unmistakable place marker, not extra visual noise.

## Tokens

| token | value | use |
| --- | --- | --- |
| `--paper` | `#f7f1e3` | warm reading surface |
| `--ink` | `#17212b` | primary text, contrast 12.8:1 on paper |
| `--muted` | `#53616d` | supporting copy, contrast 5.8:1 |
| `--blue` | `#075985` | links and structural accents |
| `--signal` | `#c2410c` | current-sentence marker and primary action |
| `--signal-ink` | `#fff8ee` | text on signal |
| `--night` | `#101a24` | dark extension popup background |
| `--mint` | `#b6e2bf` | completed/reassuring state |

The light site uses paper and ink. The extension uses night and paper for a
calm, high-contrast control surface. The orange signal is never the only state
cue: labels and an outline accompany it.

## Type and spacing

Headlines use Georgia (the familiar texture of printed articles); interface and
body copy use the self-hosted-free system stack `ui-sans-serif, system-ui`.
There are no remote font requests. Reading type is 18px with 1.62 leading;
controls use 16px minimum. Spacing follows an 8px rhythm, with 16px default
card padding and 24px between reading regions.

## Shapes, interaction, motion

Halftone dots appear only as borders, bands, and the original illustration's
paper grain. Controls have square-ish 10px corners, solid ink outlines, and a
small offset shadow that compresses on press. The active sentence receives an
orange left rule and a dotted wash. It moves in with a 180ms opacity/transform
transition. With reduced motion, it appears immediately; speech itself is not
automatically started.

## Asset plan and provenance

One original editorial hero illustration shows a reader's page, a listening
loop, and a high-visibility sentence ruler in a limited ink/vermillion/mint
risograph palette. It contains no readable text, logos, brands, or people.
Generated with the factory image deployment on 2026-08-28; source prompt is
stored beside the asset in `assets/src/hero-prompt.json`. The delivered WebP is
optimised below 300 KB. Product icons are hand-authored inline SVG.

