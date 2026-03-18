# QuotePart — Correctifs formules & edge cases négatifs

> Annexe au document de cadrage v0.3
> Données de référence : Thomas 3 200 €, Léa 2 100 € (80%), charges communes 3 000 €, charges perso Thomas 500 €, Léa 400 €, Léa assure ~70% du domestique.

---

## Modèle 1 — 50/50 (inchangé)

### Formule

```
Contribution P1 = Charges / 2
Contribution P2 = Charges / 2
```

### Exemple

```
Thomas = 3000 / 2 = 1 500 € (47% de son revenu)
Léa    = 3000 / 2 = 1 500 € (71% de son revenu)
RAV Thomas = 1 700 € | RAV Léa = 600 € | Écart = 1 100 €
```

### Edge case négatif

**Contribution > revenu** : quand `Charges / 2 > Revenu` d'un des deux.

Exemple : charges communes = 5 000 €. Léa devrait payer 2 500 € sur un revenu de 2 100 €.

> Message : "Dans ce modèle, la contribution de **[Prénom]** (X €) dépasse son revenu (Y €). Ce modèle n'est pas viable en l'état."

---

## Modèle 2 — Prorata revenus nets (inchangé)

### Formule

```
Ratio P1 = Revenu_P1 / (Revenu_P1 + Revenu_P2)
Contribution P1 = Charges × Ratio P1
Contribution P2 = Charges × (1 - Ratio P1)
```

### Exemple

```
Ratio Thomas = 3200 / 5300 = 60,4%
Thomas = 3000 × 0,604 = 1 811 €
Léa    = 3000 × 0,396 = 1 189 €
RAV Thomas = 1 389 € | RAV Léa = 911 € | Écart = 478 €
```

### Edge case négatif

**Contribution > revenu** : possible uniquement si `Charges > Revenu_P1 + Revenu_P2`. Par construction du prorata, la contribution de chacun ne peut pas dépasser son revenu tant que les charges restent inférieures au total des revenus.

Exemple : charges communes = 6 000 € (> 5 300 €). Thomas paierait 3 626 € (> 3 200 €).

> Message : "Vos charges communes (X €) dépassent vos revenus combinés (Y €). Aucun modèle au prorata ne peut fonctionner — une révision du budget est nécessaire."

**Revenu à 0** : si un des deux a un revenu de 0 €, le ratio est 100/0 — l'autre paie la totalité. C'est mathématiquement correct mais peut surprendre.

> Message : "[Prénom] n'a pas de revenu déclaré. Dans ce modèle, la totalité des charges repose sur [Autre Prénom]."

---

## Modèle 3 — Reste à vivre égal (⚠️ CORRIGÉ)

### Problème v0.3

La formule actuelle fait un prorata sur le disponible. C'est un prorata pondéré, **pas une égalisation du reste à vivre**. Avec les données du persona, elle donne un écart de 318 € — ce qui contredit le nom du modèle.

### Formule corrigée

```
Disponible P1 = Revenu P1 - Charges perso P1
Disponible P2 = Revenu P2 - Charges perso P2

RAV cible = (Disponible P1 + Disponible P2 - Charges communes) / 2

Contribution P1 = Disponible P1 - RAV cible
Contribution P2 = Disponible P2 - RAV cible
```

Vérification : Contribution P1 + Contribution P2 = Disponible P1 + Disponible P2 - 2 × RAV cible = Charges communes ✓

### Exemple

```
Dispo Thomas = 3200 - 500 = 2 700 €
Dispo Léa   = 2100 - 400 = 1 700 €

RAV cible = (2700 + 1700 - 3000) / 2 = 700 €

Thomas paie = 2700 - 700 = 2 000 €
Léa paie   = 1700 - 700 = 1 000 €

RAV Thomas = 700 € | RAV Léa = 700 € | Écart = 0 €  ✓
```

### Edge cases négatifs

**① RAV cible négatif** : quand `Disponible P1 + Disponible P2 < Charges communes`.

Exemple : charges communes = 5 000 €. RAV cible = (2700 + 1700 - 5000) / 2 = **-300 €**.
Thomas paierait 3 000 €, Léa paierait 2 000 €. Les deux finissent à -300 € de reste à vivre.

> Message : "Vos charges communes dépassent vos revenus disponibles combinés. Le modèle reste à vivre égal aboutit à un reste à vivre négatif pour les deux (-X €/mois). Une révision du budget est recommandée."

**② Contribution négatif** (P doit recevoir de l'argent) : quand le disponible d'un des deux est inférieur au RAV cible, donc quand `Disponible P < RAV cible`.

Exemple concret : Thomas 4 500 €, charges perso 500 € → dispo 4 000 €. Léa 800 €, charges perso 400 € → dispo 400 €. Charges communes = 3 000 €.

```
RAV cible = (4000 + 400 - 3000) / 2 = 700 €
Thomas paie = 4000 - 700 = 3 300 €
Léa paie   = 400 - 700 = -300 €
```

Léa devrait recevoir 300 €/mois de Thomas pour que les deux aient le même reste à vivre.

> Message : "Pour égaliser le reste à vivre, **[Prénom qui gagne plus]** devrait non seulement couvrir la totalité des charges communes, mais aussi verser **X €/mois** à [Autre Prénom]. Cela reflète un écart de revenus important. Ce transfert n'est pas une obligation — c'est une option à discuter."

**③ Contribution > revenu** : quand le disponible d'un des deux est très élevé par rapport à l'autre, la contribution peut théoriquement dépasser le revenu brut (pas seulement le disponible). Peu probable en pratique si les charges perso sont faibles, mais possible.

> Message : identique au M1 — "la contribution de [Prénom] (X €) dépasse son revenu (Y €). Ce modèle n'est pas viable en l'état."

**④ Disponible négatif** (déjà géré en v0.3) : charges perso > revenu.

> Message (existant) : "Les charges personnelles de [Prénom] dépassent son revenu. Ce modèle ne peut pas s'appliquer tel quel — une discussion sur la mutualisation de certaines charges est recommandée."

---

## Modèle 4 — Prorata ajusté temps de travail (complément)

### Formule (inchangée)

```
Option A — sur revenus réels (= M2)
Option B — sur revenus théoriques temps plein :
  Rev théorique = Rev réel / Quotité
  Ratio P1 = Rev théorique P1 / (Rev théorique P1 + Rev théorique P2)
  Contributions au prorata de ce ratio
```

### Exemple (inchangé)

```
Léa théorique = 2100 / 0,80 = 2 625 €
Ratio Thomas = 3200 / (3200 + 2625) = 54,9%

Option A : Thomas 1 811 € / Léa 1 189 €
Option B : Thomas 1 647 € / Léa 1 353 €

Coût du temps partiel = 164 €/mois
```

### Edge cases négatifs

**① Division par zéro** : quotité = 0% (congé parental total, cessation d'activité). `Revenu / 0` est impossible.

> Comportement : si quotité = 0%, demander la saisie manuelle du "dernier salaire temps plein" au lieu de calculer. Si non renseigné, griser l'option B avec le message : "Le revenu théorique temps plein ne peut pas être estimé automatiquement pour une cessation totale d'activité. Renseignez le dernier salaire à temps plein pour débloquer ce calcul."

**② Quotité très basse → ratio inversé** : si P2 est à 20%, son revenu théorique est multiplié par 5. Ça peut inverser le ratio de façon spectaculaire.

Exemple : Thomas 3 200 € (100%), Léa 600 € (20%) → Léa théorique = 3 000 €.
Ratio Thomas option B = 3200 / 6200 = 51,6% (quasi 50/50) alors qu'option A = 3200/3800 = 84%.

Ce n'est pas un bug — c'est le sens du modèle. Mais l'écart est tellement grand qu'il faut le signaler.

> Message : "La quotité très réduite de [Prénom] (X%) fait basculer fortement le ratio entre les deux options. L'écart de contribution est de **Y €/mois**. Vérifiez que le revenu théorique temps plein (Z €) vous semble réaliste."

**③ Contribution > revenu (option B)** : avec un ratio option B très différent de l'option A, P1 peut se retrouver à devoir payer plus que son revenu réel.

Même mécanisme que M2 — ne peut arriver que si charges > total des revenus théoriques.

> Message : identique au M2.

---

## Modèle 5 — Contribution totale (⚠️ CORRIGÉ)

### Problème v0.3

La formule actuelle additionne la valeur domestique au revenu pour calculer un ratio. Résultat : celui qui fait le plus de domestique a une "contribution totale" plus élevée, donc un ratio plus élevé, et **paie plus financièrement**. C'est l'inverse de l'intention.

### Formule corrigée

Le principe : le coût total du foyer = charges financières + travail domestique. Chacun doit sa part de ce coût total au prorata des revenus. Le domestique déjà fourni vient **en déduction** de la part financière.

```
Valeur domestique P1 = Total heures P1 × Valeur horaire × 4,33
Valeur domestique P2 = Total heures P2 × Valeur horaire × 4,33

Coût total foyer = Charges communes + Valeur domestique P1 + Valeur domestique P2

Ratio revenus = Revenu P1 / (Revenu P1 + Revenu P2)

Part équitable P1 = Coût total foyer × Ratio revenus
Part équitable P2 = Coût total foyer × (1 - Ratio revenus)

Contribution financière P1 = Part équitable P1 - Valeur domestique P1
Contribution financière P2 = Part équitable P2 - Valeur domestique P2
```

Vérification : CF_P1 + CF_P2 = (Part P1 - VD P1) + (Part P2 - VD P2) = Coût total - VD total = Charges communes ✓

### Exemple

```
Heures référence : 28h/semaine (avec enfants)
Thomas (30%) : 8,4h → 8,4 × 9,57 × 4,33 = 348 €/mois
Léa (70%)    : 19,6h → 19,6 × 9,57 × 4,33 = 812 €/mois

Coût total foyer = 3000 + 348 + 812 = 4 160 €

Ratio Thomas = 3200 / 5300 = 60,4%

Part équitable Thomas = 4160 × 0,604 = 2 513 €
Part équitable Léa   = 4160 × 0,396 = 1 647 €

Contribution financière Thomas = 2513 - 348 = 2 165 €
Contribution financière Léa   = 1647 - 812 =   835 €

Vérification : 2165 + 835 = 3 000 € ✓
```

**Comparaison M2 → M5 corrigé :**

|             | M2 (prorata) | M5 corrigé | Δ      |
| ----------- | ------------ | ---------- | ------ |
| Thomas paie | 1 811 €      | 2 165 €    | +354 € |
| Léa paie    | 1 189 €      | 835 €      | -354 € |

Le sens est maintenant correct : Léa fait 70% du domestique, elle paie 354 € de moins par mois.

### Deuxième exemple — Sophie & Amine (transition congé parental)

Données : Amine 2 800 €, Sophie 428 € (PreParE taux plein), charges communes 2 200 €, Sophie fait 85% du domestique (elle est au foyer), pas d'enfants en bas âge → 23h/semaine.

```
Amine (15%) : 3,45h → 3,45 × 9,57 × 4,33 = 143 €/mois
Sophie (85%) : 19,55h → 19,55 × 9,57 × 4,33 = 810 €/mois

Coût total foyer = 2200 + 143 + 810 = 3 153 €

Ratio Amine = 2800 / 3228 = 86,7%

Part équitable Amine  = 3153 × 0,867 = 2 734 €
Part équitable Sophie = 3153 × 0,133 =   419 €

CF Amine  = 2734 - 143 = 2 591 €
CF Sophie = 419 - 810  =  -391 €   ← NÉGATIF
```

Sophie devrait recevoir 391 €/mois d'Amine. Sa contribution domestique massive dépasse largement sa "part équitable" du coût total.

Recalibrage : `2591 + (-391) = 2200 € ✓`

En pratique Amine paie la totalité des 2 200 € de charges + 391 € de compensation à Sophie.

### Edge cases négatifs

**① Contribution financière négative** (le cas courant et attendu) : quand la valeur domestique de P dépasse sa part équitable du coût total. C'est le cas typique du parent au foyer ou du partenaire à faible revenu qui assure l'essentiel du domestique.

> Message : "La contribution domestique de **[Prénom]** (X €/mois) dépasse sa part équitable du coût total du foyer. Dans ce modèle, **[Autre Prénom]** couvrirait la totalité des charges communes et verserait **Y €/mois** à [Prénom] en reconnaissance de son travail domestique."
>
> Sous-message : "Ce transfert est une traduction en euros de l'asymétrie domestique — c'est un outil de dialogue, pas une obligation."

**② Contribution > revenu pour le plus gros salaire** : si la valeur domestique de P2 est massive et son revenu faible, la compensation peut pousser la contribution financière de P1 au-delà de son revenu.

Exemple extrême : Thomas 2 000 €, Léa 0 € (au foyer), charges 1 800 €, Léa fait 95% du domestique (26,6h) → valeur domestique Léa = 1 102 €/mois.

```
Coût total = 1800 + 58 + 1102 = 2 960 €
Ratio Thomas = 100% (seul revenu)

CF Thomas = 2960 - 58 = 2 902 €
CF Léa   = 0 - 1102 = -1 102 €
```

Thomas devrait payer 2 902 €… pour un revenu de 2 000 €.

> Message : "Dans ce modèle, la contribution financière de **[Prénom]** (X €) dépasserait son revenu (Y €). Le modèle met en évidence un désQuotePart structurel important, mais ne peut pas s'appliquer en l'état. Cela signifie que les charges communes actuelles ne sont pas soutenables dans cette configuration."

**③ Les deux contributions négatives** : impossible par construction (la somme = charges communes > 0, donc au moins une contribution est positive).

**④ Tous les curseurs à 50/50** : le modèle est identique au M2 (valeurs domestiques égales, elles s'annulent dans le ratio). Déjà géré en v0.3.

**⑤ Valeur horaire = 0** : si l'utilisateur paramètre la valeur horaire à 0 €, le modèle devient identique au M2.

> Message : "La valeur horaire est à 0 € — le travail domestique n'est pas valorisé. Ce modèle donne le même résultat que le prorata des revenus."

---

## Synthèse : quand un modèle peut-il produire un négatif ?

| Modèle                   | Contribution > revenu                                    | Contribution négative (doit recevoir)                |
| ------------------------ | -------------------------------------------------------- | ---------------------------------------------------- |
| M1 — 50/50               | Oui, si `charges/2 > revenu` du plus petit salaire       | Non (toujours ≥ 0)                                   |
| M2 — Prorata revenus     | Seulement si `charges > revenus combinés`                | Non (toujours ≥ 0)                                   |
| M3 — RAV égal            | Oui, dans des cas extrêmes                               | **Oui** : si le disponible d'un des deux < RAV cible |
| M4 — Ajusté temps        | Comme M2 (sur base théorique)                            | Non (toujours ≥ 0)                                   |
| M5 — Contribution totale | **Oui** : si la compensation domestique pousse trop haut | **Oui** : si la valeur domestique > part équitable   |

### Règle d'affichage transversale

Pour tout modèle, si `Contribution financière < 0` :

- Afficher le montant **en positif** avec une flèche inversée : "[Autre] → [Prénom] : X €/mois"
- Ne pas afficher comme "-X €" dans le tableau (confusant)
- Ajouter une icône ou un badge distinct ("transfert", pas "paiement")

Pour tout modèle, si `Contribution > Revenu` :

- Marquer le modèle comme **"non viable"** (badge orange)
- Le résultat reste affiché (valeur informative) mais clairement identifié
- CTA : "Ce modèle met en lumière un désQuotePart, mais n'est pas applicable en l'état. Explorez les autres modèles ou ajustez vos paramètres."

---

_Annexe au cadrage v0.3 — À intégrer dans la v0.4_
