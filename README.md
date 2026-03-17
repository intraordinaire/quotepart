# QuotePart

> _"Pas une calculette. Un outil de dialogue."_

Simulateur d'équité financière pour les couples. Compare 5 modèles de répartition des charges appliqués aux données réelles d'un foyer, pour faciliter des conversations éclairées sur l'argent.

## Fonctionnement

- **5 modèles d'équité** : de la répartition 50/50 jusqu'à la contribution totale (incluant le travail domestique)
- **Sans compte** : toutes les données restent dans le navigateur, aucun serveur
- **Mode couple** : P1 remplit le formulaire, partage un lien — P2 complète ses données de son côté
- **Progressif** : chaque tier débloque de nouveaux modèles

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

- `CLAUDE.md` — conventions et architecture du projet
- `quotepart-cadrage-v03.md` — spécification produit complète
- `docs/plans/` — plans d'implémentation
