# Watch & Vintage — Refonte Haute Horlogerie & Présentation Avant / Après

Dossier de présentation stratégique et maquettage complet de la refonte du site e-commerce **Watch & Vintage** ([watchandvintage.fr](https://www.watchandvintage.fr/en/)), spécialisé dans les montres de collection révisées (Seiko, Longines, Citizen, Omega).

---

## 🎯 Objectif du Projet

Proposer une refonte visuelle et ergonomique de niveau agence horlogère (standard 50 000 €) destinée au gérant de la boutique (David Broglin), valorisant son savoir-faire d'horloger réviseur et rassurant immédiatement les acheteurs sur ordinateur et mobile.

---

## 🌟 Contenu Réalisé

### 1. Page de Présentation Avant / Après (`/presentation/index.html`)
- **Dossier de présentation complet** : explications stratégiques simples, sans jargon technique.
- **5 Chapitres comparatifs détaillés** :
  1. **Page d'Accueil** : immersion haute horlogerie, mise en avant de la révision et réassurance immédiate.
  2. **Catalogue « Watches »** : filtres instantanés (marque, époque, prix, disponibilité), séparation nette des pièces vendues.
  3. **Fiche Montre en Stock (Citizen Date Flake 1966)** : galerie photo haute définition sous tous les angles, zoom interactif, dossier technique du calibre, bouton de commande accessible.
  4. **Fiche Montre Vendue (Longines Ultra-Chron 1967)** : gestion de l'archive, formulaire d'alerte conciergerie personnalisé pour sourcer une pièce équivalente.
  5. **Panier & Début de Tunnel d'Achat** : transparence totale des frais de port avec assurance (18 €), modes de paiement sécurisés, garantie 1 an atelier rappelée.
- **Comparateur interactif à curseur** :
  - Rideau découvrant la **Version de base** à gauche et la **Version faite (Proposition)** à droite sans déformation ni zoom d'image.
  - Bascule instantanée entre **Ordinateur (1440px)** et **Téléphone tactile (390px)** avec encoche iPhone réaliste.
  - Boutons de pourcentage rapide (0%, 50/50, 100%) et mode **Plein écran**.
  - Liens directs pour tester chaque écran en direct.

### 2. Démo Live de la Refonte Haute Horlogerie (`/redesign/`)
- Site complet reconstruit de zéro en **HTML5, CSS3 et JavaScript moderne**.
- Charte graphique inspirée des grandes maisons horlogères : *Playfair Display*, *Plus Jakarta Sans*, *Caveat* (touches manuscrites).
- Micro-animations vectorielles SVG (échappement, cadrans, aiguilles).
- Données, prix, mentions légales et photographies 100% réelles issues du site officiel (aucun faux contenu, avis Chrono24 5.0/5 certifiés).

---

## 🚀 Lancement en Local

Le projet intègre un serveur HTTP Node.js local prêt à l'emploi avec en-têtes confidentiels (`X-Robots-Tag: noindex, nofollow`).

```bash
# Lancer le serveur local
npm start
# ou
node scripts/server.js
```

Le serveur démarre sur le port **4000** :
- **Boutique Démo Refondue (Site Principal)** : [http://localhost:4000/](http://localhost:4000/)
  - Catalogue : [http://localhost:4000/catalog.html](http://localhost:4000/catalog.html)
  - Montre en stock : [http://localhost:4000/product-available.html](http://localhost:4000/product-available.html)
  - Montre vendue : [http://localhost:4000/product-soldout.html](http://localhost:4000/product-soldout.html)
  - Panier : [http://localhost:4000/cart.html](http://localhost:4000/cart.html)
  - Validation commande : [http://localhost:4000/checkout.html](http://localhost:4000/checkout.html)
- **Présentation Avant / Après** : [http://localhost:4000/presentation/](http://localhost:4000/presentation/)

---

## 📁 Architecture du Projet

```text
├── index.html                   # Page d'accueil de la boutique refondue (Site Principal)
├── catalog.html                 # Catalogue avec filtres & tri dynamiques
├── product-available.html       # Fiche produit en stock (Citizen Flake)
├── product-soldout.html         # Fiche produit archivée (Longines Ultra-Chron)
├── cart.html                    # Panier d'achat
├── checkout.html                # Tunnel de commande sécurisé
├── styles.css                   # Feuilles de style haute horlogerie
├── main.js                      # Scripts interactifs et navigation mobile
├── assets/                      # Photos réelles des montres & logo officiel
├── presentation/                # Page de présentation interactive Avant / Après
│   ├── index.html               # Comparateur avec curseurs, plein écran & bascule mobile
│   ├── assets/                  # Captures WebP optimisées (before/after desktop & mobile)
│   └── portal.html              # Archive portail de redirection
├── redesign/                    # Copie miroir de sauvegarde du prototype
├── data/                        # Données structurées des pièces horlogères
├── captures/                    # Captures d'écran sources haute définition (1440px & 390px)
├── scripts/                     # Scripts de capture Playwright, conversion WebP et serveur HTTP
└── package.json                 # Dépendances du projet
```

---

## 🔒 Confidentialité & Déploiement

- **En-têtes anti-indexation** : `X-Robots-Tag: noindex, nofollow` actif sur toutes les requêtes.
- **Statut** : Proposition de maquettage pour présentation au client. Aucune modification n'a été apportée au site de production.
