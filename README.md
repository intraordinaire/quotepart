<p align="center">
  <img src="public/logo.png" alt="QuotePart" height="48">
</p>

<p align="center">
  <em>"Pas une calculette. Un outil de dialogue."</em>
</p>

<p align="center">
  <a href="https://github.com/intraordinaire/quotepart/actions/workflows/ci.yml">
    <img src="https://github.com/intraordinaire/quotepart/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
</p>

<p align="center">
  <strong><a href="https://quotepart.intraordinai.re/">quotepart.intraordinai.re</a></strong>
</p>

---

Simulateur d'équité financière. 4 modèles de répartition des dépenses communes, appliqués à vos vrais chiffres — du 50/50 au temps ajusté, avec une option pour intégrer la valeur du travail domestique.

## Fonctionnement

1. **Revenus & charges** — saisissez l'essentiel en 90 secondes, deux modèles débloqués immédiatement
2. **Contexte** — temps partiel, charges personnelles, répartition domestique : chaque palier affine la simulation
3. **Comparez** — 4 modèles côte à côte, aucun n'est présenté comme "le bon"
4. **Partagez** — envoyez le lien à votre partenaire, comparez vos perceptions, choisissez ensemble

## Vie privée

- **Zéro compte, zéro serveur** — toutes les données restent dans le navigateur
- **Aucun tracking** — pas de cookies, pas d'analytics invasifs
- **Code source ouvert** — vérifiable par quiconque

## Données de référence

Le travail domestique est estimé à partir de l'enquête [Emploi du temps 2010](https://www.insee.fr/fr/statistiques/2123967) de l'INSEE (28h/semaine avec enfants, 23h sans) et valorisé au SMIC horaire net.

## Stack

Next.js · TypeScript · Tailwind CSS · Vitest · Playwright

## Démarrage

```bash
nvm use       # Node 24
npm install
npm run dev   # http://localhost:3000
```

## Tests

```bash
npm test          # unit (Vitest)
npm run test:e2e  # e2e (Playwright)
```

## Documentation

- [`CLAUDE.md`](CLAUDE.md) — conventions et architecture du projet
- [`quotepart-cadrage-v03.md`](quotepart-cadrage-v03.md) — spécification produit complète
- [`docs/plans/`](docs/plans/) — plans d'implémentation
