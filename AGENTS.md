# AGENTS.md - Skin Profile Shopify Theme

## Project Overview

Shopify Online Store 2.0 theme for a Latvian dermatology clinic. Built on Skeleton Theme with Tailwind CSS 4.x and Alpine.js.

**Primary language:** Latvian (`lv.default.json`)

## Build & Development Commands

```bash
# Theme Development (primary)
shopify theme dev                    # Start live preview (main command)
shopify theme push                   # Push to store
shopify theme pull                   # Pull from store
shopify theme check                  # Lint theme files
shopify theme check sections/file.liquid  # Lint single file

# CSS (only if editing src/tailwind.css)
npm run build                        # One-time Tailwind build
npx @tailwindcss/cli -i src/tailwind.css -o assets/application.css --watch
```

**Workflow:** Usually just `shopify theme dev` is enough. Only run Tailwind CLI in a second terminal if actively editing `src/tailwind.css`.

**No test suite** - use `shopify theme check` for validation.

## Project Structure

```
assets/        # CSS, JS, images, SVG icons
config/        # settings_schema.json, settings_data.json
layout/        # theme.liquid, password.liquid
locales/       # lv.default.json (primary), en.json
sections/      # Section files (39 total)
snippets/      # Reusable snippets (55 total)
templates/     # JSON page templates
src/           # Tailwind source (tailwind.css)
```

## Code Style Guidelines

### Liquid

- Use `{% render %}` for snippets (never `{% include %}`)
- Use `{% liquid %}` tag for multi-line logic
- Always check object existence: `{% if product.featured_image %}`
- Use translation filter: `{{ 'key.path' | t }}`
- Access metafields: `{{ product.metafields.custom.field_name }}`

```liquid
{% liquid
  assign items = collection.products
  if items.size > 0
    for item in items limit: 4
      render 'product-card', product: item
    endfor
  endif
%}
```

### Section Schema

```liquid
{% schema %}
{
  "name": "Section Name",
  "tag": "section",
  "class": "section-name",
  "settings": [...],
  "blocks": [...],
  "presets": [{ "name": "Section Name" }]
}
{% endschema %}
```

### CSS / Tailwind

- Source: `src/tailwind.css` -> Output: `assets/application.css`
- Use Tailwind utilities primarily
- Custom classes use `sp-` prefix (e.g., `sp-button`)
- Use `@layer base`, `@layer components`, `@layer utilities`

**CSS Variables:**
- `--color-brand-primary`, `--color-brand-secondary`
- Fonts: Belleza-Regular (headings), Manrope (body)

### JavaScript

- Vanilla JS in `assets/` (no build step)
- Alpine.js for reactivity (`x-data`, `x-show`, `x-cloak`)
- Fancyapps Carousel for sliders (CDN)
- IIFE pattern for module isolation
- Use `defer` on script tags

```javascript
(function() {
  'use strict';
  async function fetchCart() {
    const response = await fetch('/cart.js');
    return response.json();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Sections/Snippets | kebab-case | `product-card.liquid` |
| CSS classes | `sp-` prefix | `sp-hero-banner` |
| Liquid variables | snake_case | `product_card_class` |
| JS files | kebab-case | `cart-update.js` |

### Error Handling

```liquid
{% if product.featured_image %}
  {{ product.featured_image | image_url: width: 400 | image_tag }}
{% else %}
  {{ 'placeholder.svg' | asset_url | img_tag }}
{% endif %}

{{ section.settings.heading | default: 'Default Heading' }}
```

### Image Optimization

```liquid
{{ image | image_url: width: 600 | image_tag: loading: 'lazy', alt: image.alt }}
```

## Key Files

| File | Purpose |
|------|---------|
| `layout/theme.liquid` | Main layout, CDN deps |
| `src/tailwind.css` | Tailwind source |
| `assets/application.js` | Mobile menu, scroll |
| `assets/cart-update.js` | AJAX cart |

## Common Tasks

### Adding a Section
1. Create `sections/name.liquid`
2. Add markup and `{% schema %}` with presets
3. Section appears in theme editor

### Adding a Snippet
1. Create `snippets/name.liquid`
2. Use: `{% render 'name', param: value %}`

### Translations
- Edit `locales/lv.default.json` (Latvian)
- Edit `locales/en.json` (English)
- Access: `{{ 'key' | t }}`

### AJAX Cart
```
GET  /cart.js          # Fetch cart
POST /cart/add.js      # Add item
POST /cart/change.js   # Update quantity
```

## Performance

- Use `loading="lazy"` on below-fold images
- Avoid nested Liquid loops
- Use `{% render %}` over `{% include %}`
- Defer non-critical JS
- Use Shopify CDN image params

## Accessibility

- Semantic HTML (`<nav>`, `<main>`, `<article>`)
- ARIA labels on interactive elements
- Keyboard navigation support
- Alt text on all images
