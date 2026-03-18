# QuotePart — Guide Frontend

Ce document définit les conventions d'implémentation frontend pour QuotePart. Il est la **source de vérité** pour toute nouvelle interface ou composant.

Le design system de référence est `docs/reference/quotepart-design-system.md` (thème "Data Journalism"). Ce guide traduit ce design system en conventions Next.js / Tailwind CSS.

---

## 1. Stack & Configuration

### Fonts — `next/font/google` obligatoire

Les polices **doivent** etre chargees via `next/font/google` dans `src/app/layout.tsx`, jamais via une balise `<link>` ni une classe Tailwind arbitraire.

```tsx
// src/app/layout.tsx
import { DM_Sans, Fraunces, DM_Mono } from "next/font/google";

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "700", "900"],
  style: ["normal", "italic"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});
```

Exposer via les variables CSS `--font-body`, `--font-display` et `--font-mono`.

### Tailwind — declarer les tokens dans `globals.css`

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme inline {
  /* Fonts */
  --font-body: var(--font-body);
  --font-display: var(--font-display);
  --font-mono: var(--font-mono);

  /* Backgrounds */
  --color-bg: #0c0c0c;
  --color-surface: #161616;
  --color-surface-hover: #1e1e1e;
  --color-border: #2a2a2a;

  /* Text */
  --color-text: #e8e8e8;
  --color-text-dim: #888888;
  --color-text-muted: #555555;
  --color-white: #ffffff;

  /* Accent */
  --color-accent: #ff6b35;
  --color-accent-dim: rgba(255, 107, 53, 0.15);

  /* Semantic */
  --color-green: #34d399;
  --color-green-dim: rgba(52, 211, 153, 0.12);
  --color-red: #f87171;
  --color-red-dim: rgba(248, 113, 113, 0.12);
  --color-amber: #fbbf24;
  --color-amber-dim: rgba(251, 191, 36, 0.12);
}
```

Utiliser ensuite `text-text-dim`, `bg-accent`, `border-border`, etc.

**Regle absolue : jamais de valeur hexadecimale en dur dans les classNames ou les inline styles.** Toute couleur doit passer par un token Tailwind defini dans `globals.css`. Les seules exceptions sont les variables CSS dans `globals.css` elle-meme.

---

## 2. Typographie

| Usage                      | Police   | Tailwind class       |
| -------------------------- | -------- | -------------------- |
| Titres de pages, hero      | Fraunces | `font-display`       |
| Corps, UI                  | DM Sans  | `font-body` (defaut) |
| Labels techniques, donnees | DM Mono  | `font-mono`          |

### Scale typographique

```
Hero title            : font-display, font-black (900), text-[32px] md:text-[44px], tracking-[-0.03em]
Section title         : font-display, font-bold (700), text-2xl md:text-[28px], tracking-[-0.02em]
Big number (impact)   : font-display, font-black (900), text-[36px] md:text-[56px], tracking-[-0.03em]
Body                  : text-sm md:text-[15px], leading-relaxed (1.7)
Label uppercase       : font-mono, font-medium, text-[10px], uppercase, tracking-[0.1em]
Formula block         : font-mono, text-[13px], leading-[1.8]
Tag                   : font-mono, font-medium, text-[10px], uppercase, tracking-[0.1em]
Data (tableaux)       : font-mono, text-[13px], tabular-nums
```

Ne **pas** redeclarer `font-[DM_Sans,sans-serif]` dans chaque composant — DM Sans est la police du body.

Toujours `font-variant-numeric: tabular-nums` (classe `tabular-nums`) sur les chiffres dans les tableaux et comparaisons.

---

## 3. Couleurs & Theme

### Palette — Theme sombre "Data Journalism"

| Token           | Valeur                      | Usage                                    |
| --------------- | --------------------------- | ---------------------------------------- |
| `bg`            | `#0C0C0C`                   | Background general (quasi noir)          |
| `surface`       | `#161616`                   | Cards, inputs, sidebars                  |
| `surface-hover` | `#1E1E1E`                   | Hover sur surfaces                       |
| `border`        | `#2A2A2A`                   | Separateurs, bordures                    |
| `text`          | `#E8E8E8`                   | Texte principal (ratio 16.5:1 sur bg)    |
| `text-dim`      | `#888888`                   | Labels, descriptions (ratio 5.9:1 — AA)  |
| `text-muted`    | `#555555`                   | Labels mono uppercase only (ratio 3.2:1) |
| `white`         | `#FFFFFF`                   | Titres impact                            |
| `accent`        | `#FF6B35`                   | CTA, highlights, tabs actifs             |
| `accent-dim`    | `rgba(255, 107, 53, 0.15)`  | Background badges accent                 |
| `green`         | `#34D399`                   | Resultat positif, transferts favorables  |
| `green-dim`     | `rgba(52, 211, 153, 0.12)`  | Background tags positifs                 |
| `red`           | `#F87171`                   | Negatif, alertes, non viable             |
| `red-dim`       | `rgba(248, 113, 113, 0.12)` | Background tags negatifs                 |
| `amber`         | `#FBBF24`                   | Warning, attention                       |
| `amber-dim`     | `rgba(251, 191, 36, 0.12)`  | Background tags warning                  |

### Regles d'usage des couleurs

- `text-muted` (`#555`) est reserve aux labels secondaires en uppercase monospace. **Jamais** pour du texte courant.
- Les fonds `*-dim` (rgba) servent uniquement de background pour les tags et les alertes. Jamais en aplat large.
- `accent` (`#FF6B35`) n'apparait que sur les CTA, les chiffres cles, et les tags. Pas de surface entiere en accent.
- Les badges d'etat utilisent toujours le couple `color` + `*-dim` background (ex : `text-red bg-red-dim`).
- Ne jamais encoder de l'information uniquement par la couleur. Toujours doubler avec un texte, une icone, ou un pattern (WCAG 1.4.1).

---

## 4. Composants UI

### FormField

- Toujours un `<label>` associe via `htmlFor` (pas de placeholder-only)
- Pour inputs monetaires : `inputMode="numeric"` + `pattern="[0-9 ]*"` (prop `numeric`)
- Focus ring : `focus:border-accent transition-colors`
- Bordure : `border-border`, background : `bg-surface`

### Boutons

```
Primaire (CTA) : bg-accent text-white font-semibold rounded-lg min-h-[48px] mobile
Secondaire     : bg-transparent border border-border text-text-dim rounded-md
```

Toujours `type="button"` sur les boutons dans un formulaire. `type="submit"` uniquement si dans un `<form>` avec handler `onSubmit`.

### Onglets (Tab nav)

Utiliser les roles ARIA corrects :

```tsx
<nav role="tablist">
  <button role="tab" aria-selected={isActive} aria-controls="panel-saisie">
    Saisie
  </button>
</nav>
<div role="tabpanel" id="panel-saisie">...</div>
```

Un onglet non disponible : `aria-disabled="true"` + `opacity-50 cursor-not-allowed pointer-events-none`.

Tab active : `border-b-2 border-accent text-text font-semibold`.
Tab inactive : `border-transparent text-text-dim hover:text-text`.

### Sidebar / TierNav

- `aria-current="step"` sur le tier actif
- `aria-label="Progression"` sur l'`<aside>`
- Background : `bg-surface`, bordure : `border-border`

### Inputs range (SliderField)

Toujours `aria-label` sur le `<input type="range">`. Styliser le thumb via CSS :

```css
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-text);
  cursor: pointer;
}
```

### Tags

```
Font      : font-mono, font-medium, text-[10px], uppercase, tracking-[0.1em]
Padding   : px-2 py-0.5
Radius    : rounded-sm (3px)
Couleur   : couleur semantique + fond *-dim correspondant
```

### EdgeCard (alerte)

```
Background   : bg-surface
Border       : border border-border
Border-left  : border-l-[3px] border-l-[couleur semantique]
Padding      : p-6 md:p-7
Radius       : rounded-xl (10px)
Role         : role="alert" si critique, role="note" sinon
```

---

## 5. Layout & Structure

### Page `/simulate`

```
<header>           — h-14, bg-surface, border-b border-border
<nav role="tablist"> — tabs Saisie / Resultats / Et si...
<div class="flex flex-1">
  <aside>          — w-60, TierNav (conditionnel si tier > 0), bg-surface
  <main>           — flex-1, overflow-y-auto, p-8
    <div class="max-w-2xl mx-auto"> — contenu centre
```

### Grille formulaire

2 colonnes pour P1/P2 : `grid grid-cols-2 gap-4`. Sur mobile : `grid-cols-1`.

### Espacements (base 4px)

- Padding de page : 32px
- Max-width du contenu : 720px centre
- Gap entre sections majeures : 64px
- Padding des cards/surfaces : `p-5 md:p-6 md:px-7`
- Margin entre un label uppercase et son contenu : 12-16px

---

## 6. Animations

Toutes conditionnees a `prefers-reduced-motion: no-preference`. Pas de librairie externe.

```css
/* globals.css */
@keyframes tierFadeIn {
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
  animation: tierFadeIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
}
```

Appliquer `animate-tier-in` a la div racine de chaque `TierX` composant.

Transitions CSS : `transition-colors duration-150` sur les elements interactifs (boutons, inputs, onglets).

---

## 7. Accessibilite — checklist

- [ ] `<html lang="fr">` dans `layout.tsx`
- [ ] Toute icone SVG decorative : `aria-hidden="true"`
- [ ] Toute icone SVG fonctionnelle : `aria-label` ou titre adjacent
- [ ] Inputs monetaires : `inputMode="numeric"`
- [ ] Ratio de contraste texte dim >= 4.5:1 (utiliser `text-dim` #888 minimum)
- [ ] `text-muted` (#555) uniquement pour labels mono uppercase, jamais pour texte informatif
- [ ] Focus visible sur tous les elements interactifs (pas de `outline-none` sans alternative)
- [ ] Tab nav avec roles ARIA (`tablist`, `tab`, `tabpanel`, `aria-selected`)
- [ ] Etat desactive : `aria-disabled="true"` + style visuel distinct
- [ ] Labels toujours lies aux inputs via `htmlFor`/`id`
- [ ] Respecter `prefers-reduced-motion` pour toutes les animations
- [ ] Zone tactile minimum 48x48px pour tout element interactif mobile

---

## 8. Pieges courants

### Ne pas faire

```tsx
// !! Police hardcodee en classe arbitraire
<h2 className="font-[Fraunces,serif]">Titre</h2>

// !! Couleur hexadecimale en dur
<p className="text-[#888888]">Description</p>

// !! Couleur Tailwind generique (non tokenisee)
<div className="bg-neutral-900 text-white">...</div>
<div className="bg-zinc-500">...</div>

// !! Font body redeclaree
<div className="font-[DM_Sans,sans-serif]">...</div>

// !! Placeholder comme seul label
<FormField placeholder="3 000" suffix="EUR/mois" value={...} onChange={...} />
```

### Faire a la place

```tsx
// Police via token Tailwind configure
<h2 className="font-display text-2xl">Titre</h2>

// Token couleur
<p className="text-text-dim">Description</p>

// Bouton primaire avec token
<button className="bg-accent text-white">Action</button>

// Body police = defaut, rien a redeclarer

// Input avec label explicite
<FormField
  id="common-charges"
  label="Charges communes mensuelles"
  placeholder="3 000"
  suffix="EUR/mois"
  value={...}
  onChange={...}
/>
```

---

## 9. Qualite visuelle — standards

Le design de reference est `docs/reference/quotepart-design-system.md`. Les ecrans implementes doivent correspondre a ce design system en termes de hierarchie, spacing, et rendu typographique.

Points de vigilance :

- **Spacing** : base 4px, `p-5` pour les cards, `gap-4` entre champs en grille, `mb-8` avant boutons de navigation
- **Radius** : `rounded-sm` (3px) pour tags, `rounded-md` (6px) pour inputs/boutons, `rounded-lg` (8px) pour alertes, `rounded-xl` (10px) pour cards
- **Borders** : `border border-border` pour les conteneurs, `border-l-[3px]` pour les EdgeCards
- **Shadows** : aucune ombre dans le theme sombre

---

## 10. Fichiers cles

| Fichier                                     | Role                                         |
| ------------------------------------------- | -------------------------------------------- |
| `src/app/layout.tsx`                        | Chargement des polices, lang, metadata       |
| `src/app/globals.css`                       | Tokens Tailwind (`@theme`), styles globaux   |
| `src/components/ui/`                        | Composants atomiques reutilisables           |
| `src/components/form/`                      | Composants de formulaire par palier          |
| `docs/reference/quotepart-design-system.md` | Design system de reference (Data Journalism) |
