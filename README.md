# 🎨 Dreambox Studio

A simple, fun website that lets kids design **2D Roblox clothing** (shirts, pants, t-shirts)
and export an **upload-ready 585×559 PNG** — then upload it on Roblox.

**Live site:** https://phill-svg.github.io/blockbox-studio/

## Why it's safe for kids
- **No accounts, no server, no tracking.** It's a single static site.
- **Nothing leaves the browser** — uploaded pictures never get sent anywhere.
- No runtime network calls: the font and the editor library are bundled in `vendor/`.

## What it can do
- Design **Shirt / Pants / T-shirt**, part by part (Front · Back · Sleeves) with big tabs.
- **Colours** — paint colour + whole-outfit base, custom colour picker, "fill this part".
- **Patterns** — stripes, dots, checker, camo, zigzag, hearts, stars + gradient fade, in any two colours.
- **Stickers** — 17 recolourable shapes (stars, hearts, crown, paw, rainbow, ball…).
- **Text** — fun fonts, colours, and outlines.
- **Upload your own image** (with a kid-friendly copyright/moderation reminder).
- **Starter outfits** to remix, **Undo/Redo**, **Save/Open** projects, and **autosave**.
- A **live blocky avatar preview** (front & back) that updates as you design.
- **Export** a real Roblox template PNG and a built-in "how to upload" guide.

## Why the site can't upload for you
Roblox has no public API for classic-clothing uploads, and automating a Roblox login
breaks their Terms of Service. So Dreambox Studio does everything up to the file, then shows
you exactly how to finish on **create.roblox.com**. (This also keeps age-verification, fees,
and moderation on Roblox's side, where they belong.)

## How the wrapping is correct
`js/regions.js` holds the exact face rectangles extracted from Roblox's official 585×559
R15 template — e.g. the **front torso is x 231–358, y 74–201**. `js/export.js` paints each
design panel into its real face rectangle, so what you see on the preview is what wraps onto
the avatar.

## Run locally
It's plain static files — open `index.html`, or serve the folder:
```
npx serve .
```

## Project layout
```
index.html          UI shell
css/styles.css       kid-friendly "toy workshop" theme
js/regions.js        template face coordinate map (the source of truth)
js/patterns.js       pattern-tile generator
js/stickers.js       built-in sticker set (inline SVG)
js/presets.js        starter outfits
js/preview.js        live blocky avatar
js/export.js         composites panels → 585×559 upload PNG
js/app.js            editor, tools, undo, save/load
vendor/              Fabric.js + Fredoka font (bundled, offline)
assets/templates/    official Roblox templates (reference)
```

## Tech
Vanilla HTML/CSS/JS + [Fabric.js](http://fabricjs.com/). No build step, no framework.
