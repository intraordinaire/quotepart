# QuotePart — Guide Frontend

Ce document définit les conventions de design et d'implémentation frontend pour QuotePart. Il est la **source de vérité** pour toute nouvelle interface ou composant.

---

## 1. Stack & Configuration

### Fonts — `next/font/google` obligatoire

Les polices **doivent** être chargées via `next/font/google` dans `src/app/layout.tsx`, jamais via une balise `<link>` ni une classe Tailwind arbitraire.

```tsx
// src/app/layout.tsx
import { Manrope, Instrument_Serif } from "next/font/google";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});
```

Exposer via les variables CSS `--font-body` et `--font-display`.

### Tailwind — déclarer les tokens dans `globals.css`

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme inline {
  /* Fonts */
  --font-body: var(--font-body);
  --font-display: var(--font-display);

  /* Brand colors */
  --color-bg: #fafaf8;
  --color-bg-elevated: #ffffff;
  --color-surface: #f2f2ef;
  --color-text: #1a1a1a;
  --color-text-secondary: #6b6b67; /* ≥ 4.6:1 sur blanc — WCAG AA */
  --color-text-tertiary: #9a9a96; /* réservé déco, ne pas utiliser pour texte informatif */
  --color-accent: #d4593a;
  --color-accent-light: #fdf0ec;
  --color-border: #e8e8e4;
  --color-border-strong: #d1d1cc;
  --color-green: #2d8a56;
  --color-green-light: #edf7f0;
  --color-amber: #c48a1a;
  --color-amber-light: #fff8e8;
}

html {
  background-color: theme(--color-bg);
  color: theme(--color-text);
  font-family: theme(--font-body);
  -webkit-font-smoothing: antialiased;
}
```

Utiliser ensuite `text-text-secondary`, `bg-accent`, `border-border`, etc. — **jamais de valeurs hexadécimales en dur** dans les classNames.

---

## 2. Typographie

| Usage                 | Police           | Tailwind class       |
| --------------------- | ---------------- | -------------------- |
| Titres de pages, hero | Instrument Serif | `font-display`       |
| Corps, UI             | Manrope          | `font-body` (défaut) |
| Code/monospace        | Geist Mono       | `font-mono`          |

### Scale typographique

```
Titre de section (h2)  : font-display, text-[28px], font-normal
Titre de palier         : font-display, text-2xl, font-normal
Label de champ          : text-xs, font-medium, text-text-secondary
Texte corps             : text-sm, leading-relaxed
Texte secondaire        : text-sm, text-text-secondary
Note/italique           : text-xs, italic, text-text-secondary
Badge/tag               : text-[10px], font-bold, uppercase, tracking-[0.08em]
```

Ne **pas** redéclarer `font-[Manrope,sans-serif]` dans chaque composant — Manrope est la police du body.

---

## 3. Couleurs & Thème

### Palette

| Token            | Hex       | Usage                                 |
| ---------------- | --------- | ------------------------------------- |
| `bg`             | `#FAFAF8` | Background général (warm white)       |
| `bg-elevated`    | `#FFFFFF` | Cards, sidebars, header               |
| `surface`        | `#F2F2EF` | Inputs non focus, pill inactif        |
| `text`           | `#1A1A1A` | Texte principal                       |
| `text-secondary` | `#6B6B67` | Labels, descriptions                  |
| `text-tertiary`  | `#9A9A96` | Décoratif (heures, badges discrets)   |
| `accent`         | `#D4593A` | CTA primaire, tab active, accent      |
| `accent-light`   | `#FDF0EC` | Background badge accent, hover shared |
| `border`         | `#E8E8E4` | Séparateurs, bordures inputs          |
| `border-strong`  | `#D1D1CC` | Bordures plus marquées                |
| `green`          | `#2D8A56` | Résultat positif, équité élevée       |
| `amber`          | `#C48A1A` | Résultat moyen                        |

### Ratios de contraste (WCAG AA minimum 4.5:1 sur fond blanc)

| Couleur   | Fond      | Ratio  | AA Normal | AA Small      |
| --------- | --------- | ------ | --------- | ------------- |
| `#1A1A1A` | blanc     | ~16:1  | ✅        | ✅            |
| `#6B6B67` | blanc     | ~4.6:1 | ✅        | ❌            |
| `#7A7A75` | blanc     | ~4.4:1 | ❌        | ❌            |
| `#D4593A` | blanc     | ~3.3:1 | ❌        | ❌            |
| `#D4593A` | `#FDF0EC` | ~2.9:1 | ❌ texte  | ✅ gros titre |

**Règle :** `text-secondary` (`#6B6B67`) pour tout texte informatif. `text-tertiary` **uniquement** pour éléments décoratifs non porteurs d'information (ex : heures de référence, numéros de palier discrets). Ne jamais afficher d'erreur ou d'état en tertiary seul.

L'accent `#D4593A` sur fond blanc est insuffisant pour du texte — l'utiliser exclusivement sur fond blanc uniquement pour les grands éléments (≥ 24px, bold) ou avec un autre signal visuel.

---

## 4. Composants UI

### FormField

- Toujours un `<label>` associé via `htmlFor` (pas de placeholder-only)
- Pour inputs monétaires : `inputMode="numeric"` + `pattern="[0-9 ]*"`
- Focus ring : `focus:border-accent focus:ring-1 focus:ring-accent/20`
- Bordure : `border-border`, background : `bg-bg-elevated`

### Boutons

```
Primaire   : bg-text text-bg (ou bg-accent text-white pour CTA de fin)
Secondaire : bg-transparent border border-border text-text-secondary
Danger     : bg-accent text-white
Lien       : bg-none text-text-secondary underline
```

Toujours `type="button"` sur les boutons dans un formulaire. `type="submit"` uniquement si dans un `<form>` avec handler `onSubmit`.

### Onglets (Tab nav)

Utiliser les rôles ARIA corrects :

```tsx
<nav role="tablist">
  <button role="tab" aria-selected={isActive} aria-controls="panel-saisie">
    Saisie
  </button>
</nav>
<div role="tabpanel" id="panel-saisie">...</div>
```

Un onglet non disponible : `aria-disabled="true"` + `opacity-50 cursor-not-allowed pointer-events-none`.

### Sidebar / TierNav

- `aria-current="step"` sur le tier actif
- `aria-label="Progression"` sur l'`<aside>`

### Inputs range (SliderField)

Toujours `aria-label` sur le `<input type="range">`. Styliser le thumb via Tailwind ou CSS pour éviter le rendu navigateur par défaut (très inconsistant) :

```css
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1a1a1a;
  cursor: pointer;
}
```

---

## 5. Layout & Structure

### Page `/simulate`

```
<header>           — h-14, bg-elevated, border-b
<nav role="tablist"> — tabs Saisie / Résultats / Et si...
<div class="flex flex-1">
  <aside>          — w-60, TierNav (conditionnel si tier > 0)
  <main>           — flex-1, overflow-y-auto, p-8
    <div class="max-w-2xl mx-auto"> — contenu centré
```

### Grille formulaire

2 colonnes pour P1/P2 : `grid grid-cols-2 gap-4`. Sur mobile : `grid-cols-1`.

---

## 6. Animations

Utiliser des classes utilitaires légères, pas de librairie externe pour les transitions de tiers :

```css
/* globals.css */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-tier-in {
  animation: fadeIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
}
```

Appliquer `animate-tier-in` à la div racine de chaque `TierX` composant.

Transitions CSS : `transition-colors duration-150` sur les éléments interactifs (boutons, inputs, onglets). Jamais de transition sur `background` seul sans `transition-colors`.

---

## 7. Accessibilité — checklist

- [ ] `<html lang="fr">` dans `layout.tsx`
- [ ] Toute icône SVG décorative : `aria-hidden="true"`
- [ ] Toute icône SVG fonctionnelle : `aria-label` ou titre adjacent
- [ ] Inputs monétaires : `inputMode="numeric"`
- [ ] Ratio de contraste texte secondaire ≥ 4.5:1 (utiliser `#6B6B67` minimum)
- [ ] Focus visible sur tous les éléments interactifs (pas de `outline-none` sans alternative)
- [ ] Tab nav avec rôles ARIA (`tablist`, `tab`, `tabpanel`, `aria-selected`)
- [ ] État désactivé : `aria-disabled="true"` + style visuel distinct
- [ ] Labels toujours liés aux inputs via `htmlFor`/`id`

---

## 8. Pièges courants

### Ne pas faire

```tsx
// ❌ Police hardcodée en classe arbitraire (non chargée)
<h2 className="font-[Instrument_Serif,serif]">Titre</h2>

// ❌ Couleur hexadécimale en dur
<p className="text-[#7A7A75]">Description</p>

// ❌ Font body redéclarée dans chaque composant
<div className="font-[Manrope,sans-serif]">...</div>

// ❌ Placeholder comme seul label
<FormField placeholder="3 000" suffix="€/mois" value={...} onChange={...} />

// ❌ lang anglais sur app française
<html lang="en">
```

### Faire à la place

```tsx
// ✅ Police via token Tailwind configuré
<h2 className="font-display text-2xl">Titre</h2>

// ✅ Token couleur
<p className="text-text-secondary">Description</p>

// ✅ Body police = défaut, rien à redéclarer

// ✅ Input avec label explicite
<FormField
  id="common-charges"
  label="Charges communes mensuelles"
  placeholder="3 000"
  suffix="€/mois"
  value={...}
  onChange={...}
/>

// ✅
<html lang="fr">
```

---

## 9. Qualité visuelle — standards

Le design de référence est `docs/reference/prototype.jsx`. Les écrans implémentés doivent correspondre à ce prototype en termes de hiérarchie, spacing, et rendu typographique.

Points de vigilance :

- **Spacing** : `p-6` pour les cards, `gap-4` entre champs en grille, `mb-8` avant boutons de navigation
- **Radius** : `rounded-md` (6px) pour inputs, `rounded-[10px]` pour cards de mode/palier
- **Borders** : `border border-border` pour les conteneurs, `border-[1.5px]` pour les cards d'action primaires
- **Shadows** : éviter les ombres lourdes — `shadow-sm` au maximum, uniquement sur les cards flottantes

---

## 10. Fichiers clés

| Fichier                        | Rôle                                       |
| ------------------------------ | ------------------------------------------ |
| `src/app/layout.tsx`           | Chargement des polices, lang, metadata     |
| `src/app/globals.css`          | Tokens Tailwind (`@theme`), styles globaux |
| `src/components/ui/`           | Composants atomiques réutilisables         |
| `src/components/form/`         | Composants de formulaire par palier        |
| `docs/reference/prototype.jsx` | Référence visuelle originale               |
