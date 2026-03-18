# QuotePart — Design System & Frontend Guide

> Ce document est la référence pour toute implémentation frontend du projet QuotePart.
> Il est destiné à être utilisé comme contexte par un agent IA (Claude Code) ou par un développeur humain.
> Toute décision UI/UX doit être conforme à ce document.

---

## 1. Principes fondamentaux

### 1.1 Mobile first, sans exception

Tout le CSS est écrit en mobile-first. Les breakpoints élargissent, jamais l'inverse.

```
Base (0px+)       → Layout mobile, une colonne, touch targets 48px min
sm  (640px+)      → Ajustements mineurs de spacing
md  (768px+)      → Grids 2 colonnes, sidebar possible
lg  (1024px+)     → Layout desktop complet, sidebar fixe
xl  (1280px+)     → Max-width du contenu, marges auto
```

Règles strictes :

- Pas de `display: none` sur mobile pour cacher du contenu essentiel. Réorganiser, pas masquer.
- Tout élément interactif : min 48×48px de zone tactile (WCAG 2.5.8).
- Les tableaux de données se transforment en cards empilées sous `md`. Pas de scroll horizontal comme solution par défaut.
- Les formulaires sont toujours single-column sous `md`.
- Les modales deviennent des écrans plein-page sous `sm`.

### 1.2 Accessibilité WCAG 2.2 AA (cible AAA sur contrastes)

Non négociable. Chaque composant doit respecter :

- **Contrastes** : ratio minimum 4.5:1 pour le texte, 3:1 pour les éléments UI larges (WCAG 1.4.3). On vise 7:1 quand possible (AAA).
- **Navigation clavier** : tout élément interactif est focusable et opérable au clavier. Ordre de focus logique (pas de `tabindex > 0`).
- **Focus visible** : outline de 2px minimum, offset de 2px, jamais `outline: none` sans remplacement visible. Utiliser `focus-visible` pour ne montrer le focus qu'au clavier.
- **Texte** : jamais de taille inférieure à 14px pour le body. Les labels `mono` à 10-11px dans le proto sont des exceptions acceptables mais doivent être `uppercase` + `letter-spacing` élevé pour compenser.
- **ARIA** : chaque section a un `aria-label` ou un heading. Les icônes décoratives ont `aria-hidden="true"`. Les icônes fonctionnelles ont un `aria-label`.
- **Animations** : respecter `prefers-reduced-motion`. Si actif : pas d'AnimNum (afficher la valeur finale directement), pas de fadeUp/slideIn, transitions réduites à `opacity` uniquement et durée ≤ 200ms.
- **Curseurs domestiques** : les sliders sont des `<input type="range">` avec `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-label="Répartition [catégorie] entre [P1] et [P2]"`.
- **Couleurs** : ne jamais encoder de l'information uniquement par la couleur. Toujours doubler avec un texte, une icône, ou un pattern (WCAG 1.4.1).
- **Langue** : `<html lang="fr">`. Si contenu en anglais (ex : noms de modèles techniques), marquer avec `<span lang="en">`.

---

## 2. Thème — "Data Journalism"

### 2.1 Identité visuelle

Fond sombre, les chiffres sont le héros. Ambiance éditoriale, inspirée du dataviz journalistique (The Pudding, Reuters Graphics). Le design doit donner l'impression de lire un article de fond interactif, pas d'utiliser une app SaaS.

Principes :

- Les chiffres d'impact sont toujours les éléments les plus grands visuellement.
- Le texte explicatif est secondaire, en `textDim` ou `textMuted`.
- Les blocs de formule sont visibles mais discrets (monospace, fond surface).
- Les couleurs sémantiques (vert/rouge/ambre) sont utilisées avec parcimonie et toujours doublées d'un label textuel.

### 2.2 Palette de couleurs

```css
:root {
  /* Fonds */
  --color-bg: #0c0c0c;
  --color-surface: #161616;
  --color-surface-hover: #1e1e1e;
  --color-border: #2a2a2a;

  /* Texte */
  --color-text: #e8e8e8; /* Primaire — ratio 16.5:1 sur bg → AAA */
  --color-text-dim: #888888; /* Secondaire — ratio 5.9:1 → AA */
  --color-text-muted: #555555; /* Tertiaire — ratio 3.2:1 → UI only, pas de body text */
  --color-white: #ffffff; /* Titres impact */

  /* Accent */
  --color-accent: #ff6b35; /* Orange — CTA, highlights */
  --color-accent-dim: rgba(255, 107, 53, 0.15);

  /* Sémantique */
  --color-green: #34d399; /* Positif, transferts favorables */
  --color-green-dim: rgba(52, 211, 153, 0.12);
  --color-red: #f87171; /* Négatif, alertes, non viable */
  --color-red-dim: rgba(248, 113, 113, 0.12);
  --color-amber: #fbbf24; /* Warning, attention */
  --color-amber-dim: rgba(251, 191, 36, 0.12);
}
```

Règles d'usage :

- `text-muted` (#555) est réservé aux labels secondaires en uppercase monospace. Jamais pour du texte courant.
- Les fonds `*-dim` (rgba) servent uniquement de background pour les tags et les alertes. Jamais en aplat large.
- `accent` (#FF6B35) n'apparaît que sur les CTA, les chiffres clés, et les tags. Pas de surface entière en accent.
- Les badges d'état utilisent toujours le couple `color` + `*-dim` background (ex : texte `red` sur fond `red-dim`).

### 2.3 Typographie

Trois familles, chacune avec un rôle strict :

```css
:root {
  --font-display: "Fraunces", Georgia, serif;
  --font-body: "DM Sans", system-ui, sans-serif;
  --font-mono: "DM Mono", monospace;
}
```

Chargement Google Fonts :

```
https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,300&family=DM+Sans:wght@400;500;600&display=swap
```

#### Échelle typographique

| Rôle                     | Font     | Poids   | Taille mobile | Taille desktop | Line-height | Letter-spacing |
| ------------------------ | -------- | ------- | ------------- | -------------- | ----------- | -------------- |
| Hero title               | Fraunces | 900     | 32px          | 44px           | 1.1         | -0.03em        |
| Section title            | Fraunces | 700     | 24px          | 28-32px        | 1.2         | -0.02em        |
| Big number (impact)      | Fraunces | 900     | 36px          | 56px           | 1.0         | -0.03em        |
| Model number (décoratif) | Fraunces | 300     | 48px          | 72px           | 1.0         | -0.04em        |
| Body                     | DM Sans  | 400     | 14px          | 15px           | 1.7         | normal         |
| Body emphasis            | DM Sans  | 600     | 14px          | 15px           | 1.7         | normal         |
| Label uppercase          | DM Mono  | 500     | 10px          | 10-12px        | 1.4         | 0.1em          |
| Formula block            | DM Mono  | 400     | 12px          | 13px           | 1.8         | normal         |
| Tag                      | DM Mono  | 500     | 10px          | 10px           | 1.4         | 0.1em          |
| Data (tableaux)          | DM Mono  | 400-500 | 12px          | 13-14px        | 1.5         | normal         |

Règles :

- `font-variant-numeric: tabular-nums` sur tous les chiffres dans les tableaux et comparaisons.
- Fraunces est optique (variable `opsz`). Laisser le navigateur gérer ou forcer `font-optical-sizing: auto`.
- Pas d'italique sauf pour Fraunces en citation ou en label de persona (ex : _Sophie & Amine_).

### 2.4 Espacements

Base : 4px. Toutes les valeurs sont des multiples de 4.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-30: 120px;
}
```

Patterns de spacing :

- Padding de page : `32px` mobile, `32px` desktop (le max-width fait le travail).
- Max-width du contenu : `720px` centré.
- Gap entre sections majeures : `64px` (Divider).
- Padding des cards/surfaces : `20px 24px` mobile, `24px 28px` desktop.
- Padding des formula blocks : `20px 24px`.
- Margin entre un label uppercase et son contenu : `12-16px`.

### 2.5 Bordures et rayons

```css
:root {
  --radius-sm: 3px; /* Tags */
  --radius-md: 6px; /* Formula blocks, petits boutons */
  --radius-lg: 8px; /* Alertes, callouts */
  --radius-xl: 10px; /* Cards, surfaces */
}
```

- Bordures : `1px solid var(--color-border)` partout. Pas de bordure plus épaisse sauf les `border-left: 3px` sur les EdgeCards.
- Séparateurs : `height: 1px; background: var(--color-border)`. Pas de `<hr>`.

### 2.6 Animations

Toutes conditionnées à `prefers-reduced-motion: no-preference`.

```css
@media (prefers-reduced-motion: no-preference) {
  .fade-up {
    animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- **AnimNum** (compteur animé) : durée 900ms, easing `1 - (1-t)^3` (ease-out cubic), déclenché par IntersectionObserver (threshold 0.3). Si `prefers-reduced-motion`, afficher la valeur finale instantanément.
- **Stagger** : délai de 100ms entre éléments (`.stagger-1` = 100ms, `.stagger-2` = 200ms, etc.). Max 4 niveaux.
- **Transitions hover** : `transition: background 0.2s, color 0.2s`. Pas de transition sur `transform` pour les éléments non-animés.
- **Tabs** : transition du border-bottom uniquement, pas de slide.

---

## 3. Composants

### 3.1 Tag

Petit badge contextuel. Toujours en `mono uppercase`.

```
Structure : <span> avec padding 3px 8px
Font      : DM Mono, 500, 10px, uppercase, letter-spacing 0.1em
Couleur   : la couleur sémantique sur fond *-dim correspondant
Radius    : 3px (sm)
```

Accessible : si le tag porte une information sémantique (ex : "Corrigé", "Non viable"), il doit être lisible par les screen readers. Si purement décoratif, `aria-hidden="true"`.

### 3.2 FormulaBlock

Bloc de code monospace pour les formules mathématiques.

```
Font       : DM Mono, 400, 13px, line-height 1.8
Background : var(--color-surface)
Border     : 1px solid var(--color-border)
Padding    : 20px 24px
Radius     : 8px (lg)
Couleur    : var(--color-text-dim)
Overflow   : overflow-x: auto (mobile)
White-space: pre
```

Accessible : utiliser `<pre><code>` sémantiquement. Ajouter un `aria-label` décrivant la formule en langage naturel si le contexte ne le fait pas déjà (le paragraphe qui précède fait généralement office d'explication).

### 3.3 EdgeCard

Carte d'alerte/avertissement avec bordure latérale colorée.

```
Background   : var(--color-surface)
Border       : 1px solid var(--color-border)
Border-left  : 3px solid [couleur sémantique]
Padding      : 24px 28px
Radius       : 10px (xl)
Margin-bottom: 16px
```

Structure interne :

- Ligne 1 : icône (emoji 18px) + titre (DM Sans 600, 14px, color text)
- Ligne 2 : message (DM Sans 400, 13px, color text-dim, line-height 1.7)

Accessible : `role="alert"` si c'est une alerte critique (contribution > revenu). Sinon `role="note"`. L'emoji est `aria-hidden="true"`, l'information est dans le texte.

### 3.4 CompareRow

Ligne de tableau comparatif (avant/après).

```
Layout  : CSS Grid, 4 colonnes [1fr 100px 100px 120px]
Padding : 14px 0
Border  : border-bottom 1px solid var(--color-border)
Font    : DM Sans 14px pour le label, DM Mono pour les valeurs
```

Mobile (< md) : passer en 2 lignes. Ligne 1 = label. Ligne 2 = grid 3 colonnes (avant, après, delta).

Delta : couleur sémantique (green si favorable au partenaire défavorisé, red sinon) + flèche textuelle (↑/↓).

### 3.5 SummaryTable

Matrice de synthèse des edge cases.

```
Layout desktop : CSS Grid [60px 1fr 140px 100px]
Header         : DM Mono 10px uppercase, color text-muted, border-bottom 2px
Rows           : padding 16px 0, border-bottom 1px
```

Mobile (< md) : transformer en liste de cards. Chaque modèle = une card avec les propriétés en lignes.

### 3.6 AnimNum

Compteur animé au scroll.

```
Font   : Fraunces 900, taille variable (36-56px), color variable
Feature: tabular-nums
Trigger: IntersectionObserver, threshold 0.3
Durée  : 900ms, ease-out cubic
```

Props : `value`, `suffix`, `prefix`, `delay`, `size`, `color`.

Accessible : le `<span>` contient toujours la valeur finale dans le DOM. L'animation est visuelle uniquement. Ajouter `aria-label="[prefix][value][suffix]"` pour que les screen readers lisent la valeur complète dès le rendu.

### 3.7 Boutons

Deux variantes :

**Primaire (CTA)** :

```
Background : var(--color-accent)
Color      : white
Font       : DM Sans, 600, 14px
Padding    : 12px 24px (mobile 14px 24px pour la zone tactile)
Radius     : 8px
Hover      : brightness(1.1)
Focus      : outline 2px solid var(--color-accent), offset 2px
Min-height : 48px mobile
```

**Secondaire** :

```
Background : transparent
Color      : var(--color-text)
Border     : 1px solid var(--color-border)
Hover      : background var(--color-surface-hover)
Min-height : 48px mobile
```

### 3.8 Tabs

Navigation par onglets.

```
Layout      : flex, gap 8px, border-bottom 1px solid var(--color-border)
Tab         : DM Sans, 14px, padding 12px 20px
Active      : font-weight 600, color text, border-bottom 2px solid [accent tab]
Inactive    : font-weight 400, color text-muted
```

Accessible : `role="tablist"` sur le conteneur, `role="tab"` + `aria-selected` sur chaque tab, `role="tabpanel"` + `aria-labelledby` sur le contenu. Navigation avec flèches gauche/droite.

Mobile : si les tabs débordent, `overflow-x: auto` avec `-webkit-overflow-scrolling: touch`. Pas de troncature de texte.

---

## 4. Patterns de layout

### 4.1 Page structure

```
<header>    padding-top 80px mobile (60px), max-width 720px centré
<nav>       tabs sticky en desktop, scroll horizontal mobile
<main>      max-width 720px centré, padding-bottom 120px
<footer>    border-top, centered, DM Mono 11px
```

### 4.2 Hero section

```
Mobile:
  - Tag + subtitle sur une ligne, wrap autorisé
  - Titre h1 : 32px, max-width 100%
  - Sous-titre : 15px
  - Chiffres impact : grid 1 colonne, gap 24px
  - Séparateurs top/bottom sur le bloc chiffres

Desktop:
  - Titre h1 : 44px, max-width 560px
  - Chiffres impact : grid 3 colonnes, gap 24px
```

### 4.3 Persona reference block

```
Mobile  : 1 colonne, les deux blocs empilés
Desktop : grid 2 colonnes
Background: var(--color-surface), border, radius xl, padding 20px 28px
```

### 4.4 Règles d'affichage (cards côte à côte)

```
Mobile  : 1 colonne, cards empilées
Desktop : grid 2 colonnes, gap 16px
```

### 4.5 Résultats chiffrés (trio de big numbers)

```
Mobile  : 1 colonne, gap 20px, texte centré
Desktop : grid 3 colonnes (ou 2 selon le contexte), gap 20px
Border  : top et bottom, padding vertical 28px
```

---

## 5. Migration depuis le thème Notion/Linear (remplacement définitif)

Le prototype initial (fichier `quotepart-prototype.jsx`) utilisait un thème "Épuré & moderne" inspiré Notion/Linear. Ce thème est abandonné. Le thème Data Journalism est le seul thème du projet. Ce chapitre documente la migration one-way. Une fois terminée, toute référence à l'ancien thème peut être supprimée du codebase.

### 5.1 Mapping des tokens de couleur

| Token Notion/Linear | Valeur ancienne        | Token Data Journalism        | Valeur nouvelle          |
| ------------------- | ---------------------- | ---------------------------- | ------------------------ |
| `--bg`              | `#FAFAF8`              | `--color-bg`                 | `#0C0C0C`                |
| `--bg-elevated`     | `#FFFFFF`              | (supprimé, utiliser surface) | —                        |
| `--text`            | `#1A1A1A`              | `--color-text`               | `#E8E8E8`                |
| `--text-secondary`  | `#7A7A75`              | `--color-text-dim`           | `#888888`                |
| `--text-tertiary`   | `#A8A8A3`              | `--color-text-muted`         | `#555555`                |
| `--accent`          | `#D4593A` (terracotta) | `--color-accent`             | `#FF6B35` (orange vif)   |
| `--accent-light`    | `#FDF0EC`              | `--color-accent-dim`         | `rgba(255,107,53,0.15)`  |
| `--border`          | `#E8E8E4`              | `--color-border`             | `#2A2A2A`                |
| `--border-strong`   | `#D1D1CC`              | (supprimé, un seul niveau)   | —                        |
| `--surface`         | `#F2F2EF`              | `--color-surface`            | `#161616`                |
| `--green`           | `#2D8A56`              | `--color-green`              | `#34D399`                |
| `--green-light`     | `#EDF7F0`              | `--color-green-dim`          | `rgba(52,211,153,0.12)`  |
| `--amber`           | `#C48A1A`              | `--color-amber`              | `#FBBF24`                |
| `--amber-light`     | `#FFF8E8`              | `--color-amber-dim`          | `rgba(251,191,36,0.12)`  |
| (absent)            | —                      | `--color-red`                | `#F87171`                |
| (absent)            | —                      | `--color-red-dim`            | `rgba(248,113,113,0.12)` |
| (absent)            | —                      | `--color-white`              | `#FFFFFF`                |
| (absent)            | —                      | `--color-surface-hover`      | `#1E1E1E`                |

### 5.2 Mapping des fonts

| Rôle    | Notion/Linear                  | Data Journalism                      |
| ------- | ------------------------------ | ------------------------------------ |
| Display | Instrument Serif (400, italic) | Fraunces (300, 700, 900, italic 300) |
| Body    | Manrope (300-700)              | DM Sans (400, 500, 600)              |
| Mono    | (absent)                       | DM Mono (400, 500)                   |

Changements majeurs :

- Fraunces est une variable font avec axe optique. Le poids 900 n'existait pas dans Instrument Serif : l'adapter partout où les titres doivent être "gras impact".
- DM Mono est nouveau. Il remplace l'usage inline de Manrope pour les chiffres et les labels techniques.
- Manrope avait un poids 300 (light) utilisé pour certains sous-titres. DM Sans minimum = 400. Compenser avec `color: text-dim` au lieu de font-weight light.

### 5.3 Changements structurels

| Élément             | Notion/Linear                           | Data Journalism                                 |
| ------------------- | --------------------------------------- | ----------------------------------------------- |
| Fond global         | Clair (#FAFAF8)                         | Sombre (#0C0C0C)                                |
| Hiérarchie visuelle | Titres serif élégants, contenu body     | Chiffres XXL en hero, texte secondaire          |
| Labels de section   | DM Sans small caps ou Manrope uppercase | DM Mono 10px uppercase, letter-spacing 0.1em    |
| Cards               | bg-elevated (#FFF) sur bg clair         | surface (#161616) sur bg sombre                 |
| Jauges d'équité     | Barres horizontales pleines             | Barres sur fond transparent, couleur sémantique |
| CTA final           | Bloc fond dark sur page claire          | Bloc accent ou surface sur page dark            |
| Animations          | fadeUp, fadeIn, slideIn basiques        | AnimNum (compteurs), IntersectionObserver       |
| Tableaux            | Colonnes fixes, hover row               | Grid CSS responsive, transform en cards mobile  |

### 5.4 Checklist de migration

Chaque item à valider composant par composant :

- [ ] Remplacer toutes les variables CSS par le nouveau naming (préfixe `--color-*`)
- [ ] Swapper les fonts : Instrument Serif → Fraunces, Manrope → DM Sans, ajouter DM Mono
- [ ] Inverser tous les contrastes (texte clair sur fond sombre)
- [ ] Vérifier les contrastes WCAG avec les nouvelles combinaisons (outil : WebAIM Contrast Checker)
- [ ] Ajouter `font-variant-numeric: tabular-nums` sur tous les blocs de chiffres
- [ ] Remplacer les labels inline par des labels DM Mono uppercase
- [ ] Implémenter AnimNum avec IntersectionObserver + fallback `prefers-reduced-motion`
- [ ] Convertir les tableaux en responsive (grid desktop → cards mobile)
- [ ] Ajouter les EdgeCards avec border-left sémantique
- [ ] Revoir les boutons : zone tactile 48px mobile, nouveau style primaire/secondaire
- [ ] Implémenter les tabs avec ARIA complet (tablist, tab, tabpanel)
- [ ] Ajouter `role="alert"` ou `role="note"` sur les EdgeCards selon criticité
- [ ] Supprimer `--bg-elevated` et `--border-strong` (simplification à un seul niveau)
- [ ] Tester avec VoiceOver (macOS/iOS) et NVDA (Windows)
- [ ] Tester avec `prefers-reduced-motion: reduce` activé
- [ ] Tester les 5 breakpoints avec les données réelles du persona Léa & Thomas
- [ ] Valider que les tirets cadratin `—` sont absents du texte (décision de style)
- [ ] Supprimer le fichier `quotepart-prototype.jsx` (ancien thème) du repo une fois la migration validée
- [ ] Purger toute référence aux anciens tokens (`--bg-elevated`, `--border-strong`, Instrument Serif, Manrope) du codebase

---

## 6. Règles éditoriales

### 6.1 Texte

- Pas de tirets cadratin (`—`). Utiliser des phrases courtes ou des deux-points.
- Les chiffres sont toujours formatés avec le séparateur de milliers français : `1 500 €`, pas `1500€`.
- Le symbole `€` est toujours précédé d'un espace insécable (`&nbsp;` ou ` `).
- Les pourcentages : `60,4 %` (espace avant le `%`).
- Les formules utilisent `×` (multiplication) et `−` (signe moins), pas `x` et `-`.
- Le ton est factuel. Pas de point d'exclamation. Pas d'emoji dans le body text (réservés aux EdgeCards icon).

### 6.2 Prénoms et genre

- L'outil parle de P1 et P2 en interne, mais affiche toujours les prénoms saisis.
- Aucune mention de genre. Les formulations neutres : "votre partenaire", "l'autre personne", ou le prénom.
- Les messages contextuels utilisent `[Prénom]` et `[Autre Prénom]` comme placeholders.

### 6.3 Disclaimers

Toujours en `text-dim`, `font-size 13px`, après le bloc concerné. Jamais en popup ou tooltip. Le disclaimer est du contenu, pas une note de bas de page.

---

## 7. Performance

- Les fonts sont chargées via Google Fonts avec `display=swap` pour éviter le FOIT.
- Fraunces est une variable font : un seul fichier couvre tous les poids. Privilégier le chargement variable plutôt que les instances individuelles.
- IntersectionObserver est utilisé pour les animations : pas de scroll listener.
- Pas de dépendance d'animation externe (pas de Framer Motion, pas de GSAP). CSS + JS vanilla.
- Les calculs des 5 modèles sont synchrones et instantanés (pas de worker, pas d'async). Le recalcul se fait sur chaque changement d'input.
- Images : zéro image dans le MVP. Tout est typographie, couleur, et layout.

---

_Document vivant. Mise à jour à chaque itération du design._
_Source de vérité pour Claude Code et tout contributeur frontend._
