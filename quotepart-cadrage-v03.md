# QuotePart — Document de cadrage produit v0.3

> *Simulateur d'équité financière pour couples et foyers*
> *"Pas une calculette. Un outil de dialogue."*

---

## 1. Vision & Positionnement

### Le problème

Les couples à revenus inégaux n'ont pas d'outil pour **choisir en connaissance de cause** un modèle de répartition des dépenses. Les apps existantes (Splitwise, Tricount, Cino) traitent le prorata comme un paramètre de configuration parmi d'autres — elles répondent à "combien ?", jamais à "pourquoi ce modèle plutôt qu'un autre ?".

Résultat : la plupart des couples appliquent un 50/50 par défaut ou un arrangement flou jamais formalisé, source de frustrations silencieuses et d'inégalités patrimoniales à long terme.

### La proposition de valeur

QuotePart est un **simulateur comparatif** qui présente côte à côte plusieurs modèles d'équité appliqués aux vrais chiffres du couple, pour déclencher une conversation éclairée et aboutir à un accord explicite.

### Ce que c'est / Ce que ce n'est pas

| QuotePart EST | QuotePart N'EST PAS |
|---|---|
| Un simulateur de scénarios | Une app de suivi de dépenses au quotidien |
| Un outil de dialogue pour le couple | Un juge qui dit quel modèle est "le bon" |
| Un comparateur de modèles d'équité | Un outil de comptabilité ou de budget |
| Un déclencheur de conversation | Un substitut au conseil juridique/financier |

### Tone of voice

Bienveillant, factuel, non moralisateur. On montre les chiffres, on n'impose rien. Le ton doit être celui d'un ami pragmatique qui pose les bonnes questions, pas celui d'un militant ou d'un comptable.

---

## 2. Personas

### Persona 1 — Léa & Thomas (coeur de cible)

- Couple 30-40 ans, 2 enfants, comptes séparés
- Thomas gagne 3200 EUR net, Léa 2100 EUR net (temps partiel 80% le mercredi)
- Ils splittent "à peu près 50/50" mais Léa se sent lésée sans savoir le formuler
- Léa gère 70% de l'administratif et des RDV enfants
- **Besoin** : objectiver la situation, trouver un modèle juste pour les deux
- **Déclencheur** : une discussion tendue sur l'argent, un article lu sur Instagram

### Persona 2 — Sophie & Amine (transition de vie)

- Couple 28-35 ans, premier enfant en route
- Revenus proches aujourd'hui (~2800 EUR chacun)
- Sophie va prendre un congé parental de 6 mois, puis reprendre à 80%
- **Besoin** : anticiper l'impact financier du congé parental, se mettre d'accord avant
- **Déclencheur** : la grossesse, les discussions sur "qui reprend quand"

### Persona 3 — Colocation (secondaire, v2+)

- 3-4 colocataires, revenus très différents (étudiant boursier, jeune actif, freelance)
- **Besoin** : un split plus juste que le 1/N sur le loyer
- **Déclencheur** : nouveau colocataire, renouvellement du bail

> **Note v0.3** : Le persona "famille recomposée" (garde alternée, pension alimentaire, enfants de plusieurs unions) est reporté en v1.3. Le MVP se concentre sur le couple avec ou sans enfants communs.

---

## 3. Parcours utilisateur

### 3.1 — Vue d'ensemble

```
                    +---------------+
                    |   LANDING     |
                    |   PAGE        |
                    +-------+-------+
                            |
                  +---------+---------+
                  v                   v
           +-----------+      +--------------+
           | MODE SOLO |      | MODE COUPLE  |
           | (decouverte)     | (complet)    |
           +-----+-----+     +------+-------+
                 |                   |
                 v                   v
           +-----------+      +--------------+
           | Saisie    |      | Lien partage |
           | rapide    |      | P1 saisit    |
           | (1 ecran) |      | puis P2      |
           +-----+-----+     +------+-------+
                 |                   |
                 v                   v
           +-----------+      +--------------+
           | Resultats |      | Resultats    |
           | (5 modeles)      | complets     |
           +-----+-----+     | (5 modeles)  |
                 |            +------+-------+
                 v                   |
           +-----------+             v
           | CTA -->   |      +--------------+
           | partager  |      | Scenarios    |
           | en couple |      | "Et si..."   |
           +-----------+      +--------------+
```

### 3.2 — Parcours A : Mode Solo (decouverte)

**Objectif** : faire gouter la valeur en 3 minutes, inciter au partage.

| Etape | Ecran | Contenu | Notes UX |
|-------|-------|---------|----------|
| A1 | Landing | Accroche + CTA "Simuler maintenant" | Pas de signup requis |
| A2 | Saisie palier 1 | Revenus P1 & P2 + charges communes | Formulaire minimal, exemples pré-remplis |
| A3 | Saisie palier 2 | Charges perso (optionnel, déplié au clic) | Peut être sauté |
| A4 | Saisie palier 3 | Temps de travail, quotité (optionnel) | Peut être sauté |
| A5 | Saisie palier 4 | Charge domestique — curseurs (optionnel) | Rempli par P1 seul en mode solo |
| A6 | Résultats | 5 modèles côte à côte | Modèles 4-5 grisés si paliers non remplis |
| A7 | CTA partage | "Envoyez ce lien à votre partenaire" | Le lien contient les données encodées |

**Règles** :
- Zéro création de compte
- Données encodées dans l'URL (pas de stockage serveur)
- Les paliers 2/3/4 sont dépliables mais pas obligatoires
- Les modèles dont les données manquent sont visibles mais grisés avec un label "Remplissez [palier X] pour débloquer ce modèle"
- Temps de complétion cible : < 3 min (paliers 1-2), < 5 min (tout)

### 3.3 — Parcours B : Mode Couple (partagé)

**Objectif** : les deux partenaires saisissent leurs données, résultats enrichis.

| Etape | Ecran | Contenu | Notes UX |
|-------|-------|---------|----------|
| B1 | Initiation | P1 remplit les paliers 1 à 4 (son côté) | Même flow que le mode solo |
| B2 | Partage | Génération d'un lien à envoyer à P2 | Le lien contient les données communes (charges) mais PAS les données perso de P1 |
| B3 | Saisie P2 | P2 ouvre le lien, voit les charges pré-remplies, saisit ses données perso (revenus, charges perso, temps de travail) ET ses propres curseurs domestiques (sa perception) | P2 ne voit PAS les revenus/données/curseurs de P1 avant validation |
| B4 | Résultats | Dashboard complet avec les vraies données des deux + confrontation des perceptions domestiques | Les deux voient tout, y compris les écarts de perception |
| B5 | Scénarios | Simulateur "Et si..." | Accessible depuis les résultats |

**Mécanisme technique (sans backend)** :
- P1 saisit tout -> les données sont encodées dans un lien (base64 ou similar)
- Le lien contient : charges communes + données P1 chiffrées
- P2 ouvre le lien, saisit ses propres données
- Le calcul se fait côté client avec les données des deux
- Les données de P1 ne sont PAS affichées à P2 pendant la saisie (elles sont dans l'URL mais non décodées visuellement avant l'étape résultats)

> **Limite assumée du MVP** : ce n'est pas un vrai cloisonnement cryptographique. Un P2 techniquement averti pourrait décoder l'URL et voir les données de P1 (revenus, curseurs) avant l'étape résultats. On l'assume — le vrai cloisonnement viendra avec un backend en v1.1.

### 3.4 — Parcours C : Simulateur "Et si..."

Accessible depuis l'écran de résultats (modes solo et couple).

| Etape | Action | Résultat |
|-------|--------|---------|
| C1 | Clic sur "Et si..." | Le formulaire des 4 paliers s'affiche, pré-rempli avec les valeurs actuelles |
| C2 | Modification libre de n'importe quel paramètre | Recalcul temps réel des 5 modèles |
| C3 | Comparaison | Vue avant/après côte à côte, deltas mis en évidence |

---

## 4. Données d'entrée — Paliers de saisie

### Principe : saisie progressive, chaque palier débloque des modèles

```
PALIER 1 (obligatoire)               Débloque : Modèle 1 (50/50) + Modèle 2 (Prorata revenus)
--------------------------
- Prénom Personne 1
- Prénom Personne 2
- Revenu net mensuel P1
- Revenu net mensuel P2
- Charges communes mensuelles
  (montant global OU détail par catégorie)

PALIER 2 (recommandé)                Débloque : Modèle 3 (Reste à vivre égal)
--------------------------
- Charges personnelles non négociables P1
  (transport, prêt perso, mutuelle individuelle...)
- Charges personnelles non négociables P2

PALIER 3 (optionnel)                 Débloque : Modèle 4 (Prorata ajusté temps)
--------------------------
- Quotité de temps de travail P1
  (temps plein / 90% / 80% / mi-temps / autre)
- Quotité de temps de travail P2
- Si temps partiel :
  salaire théorique temps plein (pré-calculé si possible)
- Motif du temps partiel
  (choix du couple / contrainte médicale / choix personnel)

PALIER 4 (optionnel)                 Débloque : Modèle 5 (Contribution totale)
--------------------------
- Questionnaire charge domestique (cf. 4.2)
```

### 4.1 — Catégories de charges communes

L'utilisateur peut soit saisir un montant global, soit détailler par catégorie. On propose des catégories pré-remplies (cochables) :

**Logement** : Loyer ou crédit immobilier, charges de copropriété, taxe foncière, assurance habitation

**Énergie & connectivité** : Électricité/gaz, eau, internet, forfaits mobiles (si partagés)

**Vie quotidienne** : Courses alimentaires, produits ménagers/hygiène

**Enfants** (affiché seulement si "avez-vous des enfants ?" = oui) : Crèche/nounou/périscolaire, cantine scolaire, activités extrascolaires, vêtements enfants, fournitures, mutuelle enfants

**Transport partagé** : Crédit auto/leasing, assurance auto, carburant

**Loisirs communs** : Abonnements streaming, sorties/vacances

**Épargne commune** : Épargne projet, épargne de précaution

**UX** : Chaque catégorie est un champ montant avec un toggle on/off. Total calculé en temps réel en bas. Option "Autre" pour ajouter une ligne libre.

### 4.2 — Questionnaire charge domestique (Palier 4)

8 catégories, chacune un curseur visuel.

| Catégorie | Libellé affiché | Heures/semaine référence INSEE |
|-----------|----------------|-------------------------------|
| Courses | "Qui fait les courses ?" | 3h |
| Cuisine | "Qui prépare les repas ?" | 7h |
| Ménage & linge | "Qui s'occupe du ménage et du linge ?" | 6h |
| Admin & paperasse | "Qui gère la paperasse (factures, impôts, banque) ?" | 2h |
| RDV enfants | "Qui gère les RDV (médecin, école, activités) ?" | 2h |
| Accompagnement scolaire | "Qui aide aux devoirs, gère le quotidien scolaire ?" | 3h |
| Bricolage & entretien | "Qui s'occupe de l'entretien (maison, voiture, jardin) ?" | 2h |
| Organisation & planification | "Qui anticipe, organise, planifie le quotidien ?" | 3h |

**Format du curseur** :

```
[Prénom P1] ====|========= [Prénom P2]
                40%
```

Position par défaut : 50%. Le curseur renvoie un pourcentage (0-100) représentant la part de P1.

**Valorisation** : Heures référence x position curseur x valeur horaire (SMIC net ~9,57 EUR/h par défaut, paramétrable).

**En mode solo** : P1 remplit seul les curseurs (sa perception). Disclaimer affiché : "Ces estimations reflètent la perception d'une seule personne. Pour un résultat plus juste, partagez la simulation." Le modèle 5 est calculé sur la base des curseurs de P1 uniquement.

**En mode couple** : P1 remplit ses curseurs, qui sont encodés dans le lien partagé. Quand P2 ouvre le lien, P2 remplit **ses propres curseurs** (sa propre perception). À l'étape résultats, les deux jeux de curseurs sont disponibles. On affiche alors :
- La perception de P1 pour chaque catégorie
- La perception de P2 pour chaque catégorie
- L'écart de perception (en points)
- Le **point médian** des deux perceptions, utilisé comme base de calcul pour le modèle 5

Ce mécanisme fonctionne dès le MVP grâce à l'encodage dans l'URL (les curseurs de P1 sont dans le lien, ceux de P2 sont en local côté client).

---

## 5. Les 5 modèles d'équité

### Modèle 1 — Le 50/50

**Palier requis** : 1

**Calcul** :
```
Contribution P1 = Total charges / 2
Contribution P2 = Total charges / 2
```

**Indicateurs affichés** :
- Montant payé par chacun
- % du revenu que cela représente pour chacun
- Reste à vivre : Revenu - Contribution
- Écart de reste à vivre (en EUR et en %)

**Quand c'est pertinent** : revenus quasi identiques. Sert surtout de **baseline de comparaison** pour montrer l'impact des autres modèles.

---

### Modèle 2 — Prorata revenus nets

**Palier requis** : 1

**Calcul** :
```
Ratio P1 = Revenu_P1 / (Revenu_P1 + Revenu_P2)
Contribution P1 = Total charges x Ratio P1
Contribution P2 = Total charges x (1 - Ratio P1)
```

**Indicateurs affichés** : mêmes que modèle 1 + ratio affiché (ex : "60/40")

**Quand c'est pertinent** : quand les deux ont peu de charges perso contraintes. Le modèle "raisonnable par défaut".

---

### Modèle 3 — Reste à vivre égal

**Palier requis** : 2

**Calcul** :
```
Disponible P1 = Revenu P1 - Charges perso P1
Disponible P2 = Revenu P2 - Charges perso P2
Total disponible = Disponible P1 + Disponible P2

Contribution P1 = (Disponible P1 / Total disponible) x Total charges
Contribution P2 = (Disponible P2 / Total disponible) x Total charges

Reste à vivre P1 = Disponible P1 - Contribution P1
Reste à vivre P2 = Disponible P2 - Contribution P2
```

**Vérification** : Reste à vivre P1 doit être proche de Reste à vivre P2.

**Indicateurs affichés** : mêmes + charges perso de chacun rendues visibles + mise en valeur de l'égalisation du reste à vivre.

**Quand c'est pertinent** : quand un des deux a des charges contraintes significatives (prêt étudiant, transport coûteux...).

**Edge case** :
- Si Disponible d'un des deux est négatif : afficher une alerte "Les charges personnelles de [Prénom] dépassent son revenu. Ce modèle ne peut pas s'appliquer tel quel — une discussion sur la mutualisation de certaines charges est recommandée."

---

### Modèle 4 — Prorata ajusté temps

**Palier requis** : 3

**Principe** : si un des deux est à temps partiel par choix de couple (typiquement pour les enfants), on peut calculer le prorata sur la base de son salaire théorique à temps plein plutôt que son salaire réel.

**Calcul — deux sous-options affichées côte à côte** :

```
Option A — "Sur revenus réels" (identique au modèle 2) :
  Ratio = Revenu réel P1 / (Revenu réel P1 + Revenu réel P2)

Option B — "Sur revenus théoriques temps plein" :
  Revenu théorique P1 = Revenu réel P1 / Quotité P1
    (ex : 2100 / 0.80 = 2625 EUR)
  Ratio = Rev théorique P1 / (Rev théorique P1 + Rev théorique P2)
```

**Indicateurs affichés** :
- Les deux sous-options côte à côte
- Le "coût du temps partiel" : différence de contribution entre option A et B
- Formulation : "Le temps partiel de [Prénom] représente un écart de [X] EUR/mois sur la contribution. Ce temps partiel est-il un choix de couple ou un choix individuel ?"

**Quand c'est pertinent** : dès qu'un des deux n'est pas à temps plein. Particulièrement parlant pour le congé parental ou le 80% du mercredi.

**Edge case** :
- Les deux à temps plein : le modèle est identique au modèle 2. On l'affiche quand même avec une mention "Pas de différence avec le prorata classique — vous êtes tous les deux à temps plein."
- Temps partiel "choix personnel" (ex : pour un projet perso) : le modèle reste disponible mais avec un disclaimer adapté.

---

### Modèle 5 — Contribution totale (financière + domestique)

**Palier requis** : 4

**Principe** : on valorise le travail domestique pour calculer la "contribution totale" de chacun au foyer, et on ajuste le ratio financier en conséquence.

**Calcul** :
```
Pour chaque catégorie domestique i :

  EN MODE SOLO (perception unique) :
    Curseur utilisé = Curseur P1(i)

  EN MODE COUPLE (deux perceptions) :
    Curseur utilisé = (Curseur P1(i) + Curseur P2(i)) / 2   [point médian]

  Heures P1(i) = Heures référence(i) x Curseur utilisé / 100
  Heures P2(i) = Heures référence(i) x (1 - Curseur utilisé / 100)

Total heures domestiques P1 = somme des Heures P1(i)
Total heures domestiques P2 = somme des Heures P2(i)

Valeur domestique P1 = Total heures P1 x Valeur horaire x 4.33 (semaines/mois)
Valeur domestique P2 = Total heures P2 x Valeur horaire x 4.33

Contribution totale P1 = Revenu P1 + Valeur domestique P1
Contribution totale P2 = Revenu P2 + Valeur domestique P2

Ratio ajusté = Contribution totale P1 / (CT P1 + CT P2)
Contribution financière P1 = Total charges x Ratio ajusté
Contribution financière P2 = Total charges x (1 - Ratio ajusté)
```

**Indicateurs affichés** :
- Valeur domestique estimée de chacun (EUR/mois)
- Heures domestiques estimées de chacun (/semaine)
- Ratio AVANT intégration domestique vs APRÈS
- Phrase de synthèse : "La prise en compte du travail domestique fait passer le ratio de [X/Y] à [X'/Y']"
- Impact en euros : différence de contribution mensuelle
- **En mode couple uniquement** : bloc de confrontation des perceptions (cf. 6.5)

**Quand c'est pertinent** : quand un des deux assure une part significativement plus grande du domestique. C'est le modèle le plus "révélateur" et le plus susceptible de déclencher une vraie conversation.

**Disclaimers obligatoires** :
- "Ce modèle repose sur des estimations déclaratives et des moyennes statistiques (source : INSEE). Il vise à nourrir le dialogue, pas à établir une vérité comptable."
- "La valeur horaire de référence utilisée est le SMIC net horaire ([montant]). Vous pouvez ajuster ce paramètre."

**Edge case** :
- Pas d'enfants : les catégories "RDV enfants" et "accompagnement scolaire" sont masquées. Le total d'heures de référence est réduit.
- Curseurs tous à 50% : le modèle est identique au modèle 2. Mention : "Votre répartition domestique est perçue comme équilibrée — pas d'ajustement."

---

## 6. Écrans de résultats

### 6.1 — Le tableau comparatif (vue principale)

Affichage des 5 modèles côte à côte. Exemple avec données Léa & Thomas :

```
Thomas (3200 EUR)                                    Léa (2100 EUR, 80%)

              50/50    Prorata   RAV      Ajusté    Contribution
              (M1)     revenus   égal     temps     totale
                       (M2)     (M3)     (M4-B)    (M5)
 -----------------------------------------------------------------
 Thomas      1500 EUR  1811 EUR  1920 EUR  1734 EUR  1650 EUR
 paie        47% rev   57% rev   60% rev   54% rev   52% rev

 Léa         1500 EUR  1189 EUR  1080 EUR  1266 EUR  1350 EUR
 paie        71% rev   57% rev   51% rev   60% rev   64% rev

 Reste       T: 1200   T:  889   T:  780   T:  966   T: 1050
 à vivre     L:  100   L:  411   L:  520   L:  334   L:  250

 Écart       1100 EUR   478 EUR   260 EUR   632 EUR   800 EUR
```

**UX** :
- Chaque colonne est cliquable pour voir le détail du modèle
- Les modèles non débloqués (palier non rempli) sont visibles mais grisés
- Un indicateur visuel (jauge ou couleur) montre le niveau d'équité de chaque modèle
- Le modèle "le plus équilibré" est mis en évidence (bordure, badge) mais sans hiérarchie morale

### 6.2 — Jauge d'équité par modèle

Pour chaque modèle, une barre horizontale :

```
Calcul : Score = 1 - |RAV_P1 - RAV_P2| / max(RAV_P1, RAV_P2)
         0 = totalement déséquilibré, 1 = parfaitement égal

50/50 :          [##                        ] 8%
Prorata :        [###########               ] 46%
RAV égal :       [####################      ] 80%
Ajusté temps :   [########                  ] 35%
Contribution :   [##############            ] 58%
```

### 6.3 — Projection temporelle

Sous le tableau, un bloc "Dans la durée" :

```
Écart d'épargne potentiel entre Thomas et Léa :

                  Sur 1 an     Sur 5 ans     Sur 10 ans
 50/50            13 200 EUR    66 000 EUR   132 000 EUR
 Prorata           5 736 EUR    28 680 EUR    57 360 EUR
 RAV égal          3 120 EUR    15 600 EUR    31 200 EUR
 Ajusté temps      7 584 EUR    37 920 EUR    75 840 EUR
 Contribution      9 600 EUR    48 000 EUR    96 000 EUR
```

Formulation d'accroche : "En 50/50, au bout de 10 ans, Thomas aura pu épargner 132 000 EUR de plus que Léa. En modèle reste à vivre égal, cet écart tombe à 31 200 EUR."

### 6.4 — Vue détail par modèle (au clic)

Chaque modèle, quand on clique dessus, affiche :
- Le détail du calcul (transparent, pédagogique)
- Une explication en langage simple de la "philosophie" du modèle
- Les avantages et limites
- Un schéma visuel (barres empilées ou camembert)

### 6.5 — Confrontation des perceptions (mode couple uniquement, palier 4)

Affiché dans les résultats du modèle 5 quand les deux partenaires ont rempli leurs curseurs.

```
COMMENT VOUS PERCEVEZ VOTRE RÉPARTITION

                          Thomas pense     Léa pense      Écart
Courses                   40% / 60%        20% / 80%      20 pts
Cuisine                   50% / 50%        30% / 70%      20 pts
Ménage & linge            30% / 70%        15% / 85%      15 pts
Admin & paperasse         20% / 80%        10% / 90%      10 pts
Bricolage & entretien     80% / 20%        75% / 25%       5 pts
Organisation              30% / 70%        15% / 85%      15 pts

Valeur retenue pour le calcul : point médian des deux perceptions.
```

**UX** :
- Les catégories avec un écart > 15 points sont mises en évidence (couleur, icône)
- Message contextuel si écarts importants : "Vos perceptions diffèrent significativement sur certaines tâches. C'est très courant — c'est justement l'intérêt d'en discuter."
- Pas de jugement sur qui a "raison" : les deux perceptions sont affichées à égalité

---

## 7. Garde-fous & Edge cases (MVP)

### 7.1 — Revenus

| Situation | Comportement |
|-----------|-------------|
| Un revenu = 0 (parent au foyer, chômage sans ARE) | Tous les modèles restent calculables. Modèle 5 mis en avant ("la contribution domestique est votre seule contribution chiffrée — elle a de la valeur"). |
| Revenus très proches (écart < 5%) | Message : "Vos revenus sont quasi identiques. Tous les modèles donneront des résultats proches. Le 50/50 est probablement le plus simple." |
| Revenus variables (freelance) | Option de saisie : "Revenu mensuel moyen sur les 6 derniers mois" avec infobulle explicative. |
| Congé parental en cours | Champ "Revenu actuel (indemnités)" + "Dernier salaire avant congé" pour alimenter le modèle 4. |

### 7.2 — Charges

| Situation | Comportement |
|-----------|-------------|
| Total charges > revenus combinés | Alerte rouge : "Attention : vos charges communes dépassent vos revenus combinés. Vérifiez vos montants." Lien vers des ressources (associations d'aide budgétaire). |
| Contribution calculée > revenu d'un des deux | Alerte orange : "Dans ce modèle, [Prénom] devrait contribuer plus que son revenu. Ce modèle n'est pas applicable en l'état." Le modèle reste affiché mais marqué "non viable". |
| Aucune charge saisie | Bloquer l'accès aux résultats : "Ajoutez au moins une charge commune pour lancer la simulation." |
| Charges perso (palier 2) très élevées | Pas de blocage mais une note : "Les charges personnelles de [Prénom] représentent [X]% de son revenu." |

### 7.3 — Charge domestique

| Situation | Comportement |
|-----------|-------------|
| Tous les curseurs à 50/50 | Modèle 5 = Modèle 2. Mention explicite. |
| Un curseur à 100/0 | Pas de blocage. Note : "Vous indiquez que [catégorie] repose entièrement sur [Prénom]." |
| Pas d'enfants | Masquer les 2 catégories enfants. Total heures de référence ajusté (de 28h à 23h/semaine). |
| Mode couple : écart de perception > 40 points sur une catégorie | Message neutre : "Vos perceptions diffèrent fortement sur [catégorie]. C'est courant — c'est justement l'intérêt d'en discuter." |
| Mode couple : P2 n'a pas rempli le palier 4 | Modèle 5 calculé sur les curseurs de P1 seul (comme en mode solo). Mention : "Seule la perception de [Prénom P1] a été saisie." |

### 7.4 — Parcours

| Situation | Comportement |
|-----------|-------------|
| P2 ne remplit jamais (mode couple) | Pas de problème technique — P1 peut consulter ses résultats en mode solo. Le lien reste valide indéfiniment (encodé dans l'URL). |
| Données aberrantes (revenu de 1 EUR) | Pas de blocage mais calculs potentiellement absurdes. On assume que l'utilisateur est responsable de ses données. |
| Retour en arrière dans la saisie | Tous les paliers sont ré-éditables depuis l'écran résultats. Modification = recalcul instantané. |
| Partage des résultats | Bouton "Copier le lien de cette simulation". Le lien encode TOUS les paramètres. |

---

## 8. Simulateur "Et si..." — Détail

### Principe : mode libre

Plutôt que des scénarios pré-définis, le "Et si..." est un **mode libre de modification des paramètres**. L'utilisateur accède au formulaire complet pré-rempli avec ses valeurs actuelles et peut modifier n'importe quel paramètre. Les résultats se recalculent en temps réel.

### UX

- **Accès** : bouton "Et si..." depuis l'écran de résultats
- **Interface** : le formulaire des 4 paliers s'affiche pré-rempli avec les valeurs actuelles. Tous les champs sont éditables.
- **Affichage** : vue split-screen (ou toggle sur mobile) — situation actuelle à gauche, scénario modifié à droite
- **Deltas** : chaque changement de valeur dans les résultats est mis en évidence (flèche haut/bas + couleur vert/rouge + montant de la différence)
- **Reset** : bouton "Revenir aux valeurs actuelles" toujours accessible
- **Pas de sauvegarde** : le scénario est exploratoire. Si l'utilisateur veut conserver un scénario, il copie le lien de la simulation modifiée.

### Exemples d'usages

L'utilisateur peut librement :
- Passer le revenu de P2 à 0 pour simuler un congé parental
- Changer une quotité de 80% à 100% pour simuler un retour temps plein
- Augmenter le revenu de P1 de 15% pour simuler une promotion
- Ajouter 500 EUR de charges enfants pour anticiper une naissance
- Déplacer les curseurs domestiques pour simuler une rééquilibrage des tâches

Le mode libre évite de maintenir une logique spécifique par scénario tout en offrant plus de flexibilité.

---

## 9. Roadmap & Priorisation

### MVP (v1.0) — "Les 5 modèles, zéro friction"

**Périmètre** :
- Landing page
- Mode solo avec les 4 paliers de saisie progressive
- 5 modèles calculés et affichés côte à côte
- Jauge d'équité + projections annuelles
- Vue détail par modèle (calcul transparent + explication)
- Simulateur "Et si..." en mode libre (modification de n'importe quel paramètre)
- Mode couple via lien encodé : P2 saisit ses propres données (y compris curseurs domestiques)
- Confrontation des perceptions domestiques en mode couple (point médian pour le calcul)
- Responsive mobile-first
- Zéro backend, tout dans l'URL/localStorage

**Exclu du MVP** :
- Cloisonnement cryptographique réel des données (P2 techniquement averti peut décoder l'URL)
- Export PDF
- Famille recomposée / pension alimentaire
- Mode colocation
- Benchmarks

### v1.1 — "Le vrai cloisonnement"
- Backend minimal (Supabase ou Firebase)
- Session avec cloisonnement cryptographique réel des données
- Salle d'attente ("en attente de [Prénom]")
- Notification par email quand P2 a terminé

### v1.2 — "La formalisation"
- Export PDF "accord de couple" (récap du modèle choisi + montants)
- Sauvegarde de simulation (compte optionnel)
- Historique des simulations

### v1.3 — "Les cas complexes"
- Famille recomposée (enfants de plusieurs unions, garde alternée)
- Pension alimentaire (versée et reçue)
- Revenus variables avancés (saisie de 12 mois)

### v2.0 — "L'ouverture"
- Mode colocation (N personnes)
- Benchmarks anonymisés
- Contenu éditorial
- Internationalisation

---

## 10. Métriques de succès

### Produit

| Métrique | Cible MVP |
|----------|-----------|
| Taux de complétion palier 1 (= résultats basiques) | > 75% |
| Taux de complétion paliers 1-4 (= 5 modèles) | > 35% |
| Temps de complétion (4 paliers) | < 5 min |
| Taux de clic sur "Partager en couple" | > 25% |
| Taux d'utilisation des scénarios "Et si" | > 15% |
| Taux de rebond landing page | < 50% |

### Traction (objectifs à 3 mois)

| Métrique | Cible |
|----------|-------|
| Visiteurs uniques / mois | 2 000 |
| Simulations complétées / mois | 500 |
| Partages (lien copié ou social) | 100 |

### Qualitatif
- Micro-survey post-simulation : "Cette simulation a-t-elle déclenché une conversation avec votre partenaire ?" (oui/non)
- "Quel modèle vous semble le plus juste pour votre situation ?" (choix)

---

## 11. Risques & Mitigations

| Risque | Mitigation |
|--------|------------|
| Perçu comme militant / moralisateur | Tone neutre. Tous les modèles présentés sans hiérarchie. Disclaimers. |
| Saisie trop longue, abandon | Paliers progressifs. Valeur dès le palier 1 (2 modèles). Modèles grisés = incentive à compléter. |
| Données sensibles = méfiance | Zéro backend. Mention explicite "Vos données restent sur votre appareil". |
| Mauvaise interprétation = conflit de couple | Explications pédagogiques. Ton non prescriptif. Disclaimer juridique. |
| Modèle 5 méthodologiquement fragile | Disclaimer clair. Sources citées. Valeur horaire paramétrable. Présenté comme "outil de dialogue", pas comme vérité. |
| Sujet genré = polémique | L'outil parle de P1/P2, pas de H/F. Comm' factuelle. |
| Usage ponctuel = faible rétention | Assumé. Compenser par la viralité. Les scénarios "Et si" sont un levier de retour. |

---

## 12. Orientations techniques

### Stack envisagé (MVP)
- **Frontend** : React (ou Preact pour la légèreté) + TypeScript
- **Styling** : Tailwind CSS
- **State** : tout dans l'URL (query params encodés base64) + localStorage comme fallback
- **Hébergement** : Vercel ou Netlify (gratuit pour ce volume)
- **Pas de backend** — le "mode couple" fonctionne par échange de liens encodés
- **PWA** : manifest + service worker pour usage offline

### RGPD
- Aucune donnée stockée côté serveur = pas de traitement au sens du RGPD
- Mentions légales obligatoires (identité éditeur, hébergeur)
- Pas de cookies tiers, pas d'analytics invasif (Plausible ou Umami)

### SEO & Distribution
- Pages statiques indexables : landing, explication de chaque modèle, FAQ
- Open Graph soigné pour le partage social (image de preview dynamique si possible)
- Content marketing : articles sur l'équité financière, la charge mentale, le congé parental
- Partenariats : blogs parentalité, podcasts couple/argent, médias type Madmoizelle / Slate / Les Échos Start

---

## Annexe — Données de référence

### Heures domestiques (source INSEE, Enquête Emploi du Temps)
- Temps domestique moyen femmes : ~4h/jour (28h/semaine)
- Temps domestique moyen hommes : ~2h30/jour (17h30/semaine)
- Écart : les femmes font en moyenne 1,6x plus de travail domestique

### Valorisation horaire
- SMIC net horaire 2025 : 9,57 EUR (à actualiser régulièrement)
- Alternative : salaire médian net horaire (~14 EUR)
- L'outil propose le SMIC par défaut avec option de personnaliser

### Congé parental — montants de référence (CAF 2025)
- PreParE taux plein (cessation totale) : ~428 EUR/mois
- PreParE taux partiel (< 50%) : ~277 EUR/mois
- PreParE taux partiel (50-80%) : ~160 EUR/mois

---

*Document vivant — Version 0.3*
*Changements v0.2 -> v0.3 : Confrontation des perceptions domestiques intégrée au MVP via l'encodage URL. "Et si..." passé en mode libre (plus de scénarios pré-définis). Modèle 5 mis à jour pour gérer les deux jeux de curseurs (point médian en mode couple).*
