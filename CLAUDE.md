# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Shopify Online Store 2.0 theme for a Latvian dermatology/aesthetics clinic ("Skin Profile"), forked from Shopify's Skeleton Theme and heavily customized. Storefront-facing copy is **Latvian-first** (`locales/lv.default.json` is the default locale; `locales/en.json` is secondary).

`AGENTS.md` holds the detailed Liquid/CSS/JS style guide and naming conventions — read it for code-style specifics. This file covers the architecture and the few things that aren't obvious from the file tree.

## Commands

```bash
shopify theme dev            # Primary dev loop — live preview against the store
shopify theme check          # Lint all theme files
shopify theme check sections/<file>.liquid   # Lint one file
shopify theme push / pull    # Sync with the store
```

There is **no test suite**; `shopify theme check` is the only validation.

### CSS build (important)

CSS is compiled by the **Tailwind CLI**, not Vite. The `dev`/`build` npm scripts point at `vite`, but there is no Vite config in the repo and the dependencies are `@tailwindcss/cli` + `tailwindcss` — treat the Vite scripts as vestigial. The real command:

```bash
npx @tailwindcss/cli -i src/tailwind.css -o assets/application.css --watch
```

Only run this when editing `src/tailwind.css`. `assets/application.css` is the committed build output that the theme actually serves — regenerate it after Tailwind source changes. For pure Liquid/markup work, `shopify theme dev` alone is enough.

## Architecture

**Page composition.** `layout/theme.liquid` is the single layout. It renders `header-group` and `footer-group` (section groups defined in `sections/*-group.json`) and injects `content_for_layout`. JSON templates in `templates/` (e.g. `page.dermatology.json`, `index.json`) wire up which sections appear per page. Most clinic service pages are individual `page.<service>.json` templates composed from the custom `template-*.liquid` sections.

**Sections are the unit of work.** `sections/template-*.liquid` are the bespoke, merchant-editable building blocks (hero carousels, before/after, FAQ dropdowns, team grids, etc.); the non-prefixed sections (`product.liquid`, `cart.liquid`, `collection.liquid`...) are the standard storefront pages. Each section carries its own `{% schema %}` with presets so it shows up in the theme editor.

**Styling is brand-driven at runtime.** Brand colors are not hardcoded — `theme.liquid` reads `shop.brand.colors.*` into CSS custom properties (`--color-brand-primary`, `--color-brand-secondary`), and `snippets/css-variables.liquid` injects font/page-width/foreground variables from theme `settings`. Tailwind utilities (with custom `sp-`-prefixed classes in `src/tailwind.css`) consume these variables. Don't introduce literal hex colors for brand color; go through the CSS variables.

**JavaScript is per-feature, no bundler.** Each interactive feature is a standalone IIFE file in `assets/` (e.g. `cart-update.js`, `product-carousel.js`, `header-carousel.js`). Global scripts (`application.js`, `policy-redirect.js`) load `defer` from `theme.liquid`; feature scripts are loaded by the section that needs them via `<script src="{{ 'x.js' | asset_url }}" defer>`. Reactivity uses **Alpine.js** (`x-data`/`x-show`/`x-cloak`) and carousels use **Fancyapps Carousel** — both pulled from CDN in `theme.liquid` (not npm dependencies).

**AJAX cart** uses Shopify's cart endpoints (`/cart.js`, `/cart/add.js`, `/cart/change.js`) from `assets/cart-update.js`.

## Working with the repo

- `git` history is dominated by automated "Update from Shopify for theme skin-profile/main" commits — the theme editor pushes merchant changes back into the repo. Expect `templates/*.json` and `config/settings_data.json` to drift from the editor; don't treat editor-generated churn as hand-authored code.
- Add new copy to **both** `locales/lv.default.json` and `locales/en.json`, and reference it with the `| t` filter rather than inlining text.
