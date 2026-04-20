# 📦 StockFlow — Gestion de stock avec Google Sheets

Application web de gestion de stock hébergée sur **GitHub Pages**, avec **Google Sheets** comme base de données.

![Preview](https://img.shields.io/badge/status-production-green) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Fonctionnalités

- **Dashboard** — Vue d'ensemble avec alertes, graphiques flux, derniers mouvements
- **Stock temps réel** — Cartes visuelles avec indicateurs OK / ALERTE / RUPTURE
- **Entrées & Sorties horodatées** — Enregistrement avec opérateur, motif, timestamp automatique
- **Récapitulatifs** — Jour / Semaine / Mois avec graphiques et tableau par produit
- **Gestion produits** — CRUD complet avec seuils d'alerte configurables
- **Zéro backend** — Google Sheets fait office de base de données
- **Mode démo** — Fonctionne sans Google Sheets pour tester

---

## 🚀 Déploiement en 3 étapes

### Étape 1 — GitHub Pages

1. **Fork** ce repository ou crée un nouveau repo
2. Pousse les fichiers (`index.html`, `Code.gs`, `README.md`)
3. Va dans **Settings → Pages**
4. Source : `Deploy from a branch` → branche `main` → dossier `/ (root)`
5. Attends ~1 minute → ton app est en ligne sur `https://TON_USERNAME.github.io/NOM_DU_REPO`

---

### Étape 2 — Google Apps Script (backend)

1. Crée un **nouveau Google Sheets** (ou utilise un existant)
2. Menu : **Extensions → Apps Script**
3. Supprime le code par défaut, colle le contenu de **`Code.gs`**
4. Sauvegarde (`Ctrl+S`)
5. Clique sur **Déployer → Nouvelle déploiement**

Dans la fenêtre de déploiement :
```
Type                  : Application Web
Description           : StockFlow v1
Exécuter en tant que  : Moi
Qui a accès           : Tout le monde (anonyme)
```

6. Clique **Déployer** → autorise les permissions demandées
7. **Copie l'URL** qui ressemble à :
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

> ⚠️ **Important** : à chaque modification du script, crée un **nouveau déploiement** (pas "Mettre à jour"), sinon l'ancienne version reste active.

---

### Étape 3 — Connecter l'app

1. Ouvre ton app GitHub Pages
2. Colle l'URL `/exec` dans le champ de configuration
3. Clique **Connecter**
4. Les feuilles `Produits` et `Mouvements` sont créées automatiquement dans Google Sheets

---

## 📁 Structure du projet

```
stockflow/
├── index.html    # Application complète (HTML + CSS + JS vanilla)
├── Code.gs       # Google Apps Script (API backend)
└── README.md     # Ce fichier
```

---

## 🔧 Architecture technique

```
┌─────────────────────┐       JSONP (contourne CORS)      ┌──────────────────────┐
│   GitHub Pages      │  ─────────────────────────────►  │  Google Apps Script  │
│   (index.html)      │  ◄─────────────────────────────  │  (Web App /exec)     │
└─────────────────────┘                                    └──────────────────────┘
                                                                      │
                                                                      ▼
                                                           ┌──────────────────────┐
                                                           │    Google Sheets     │
                                                           │  ┌────────────────┐  │
                                                           │  │   Produits     │  │
                                                           │  │   Mouvements   │  │
                                                           └──┴────────────────┴──┘
```

**Pourquoi JSONP ?** Les navigateurs bloquent les requêtes `fetch()` vers des domaines tiers (CORS). JSONP contourne cela en injectant une balise `<script>` — Google Apps Script détecte le paramètre `callback` et enveloppe la réponse.

---

## 📊 Structure des données Google Sheets

### Feuille `Produits`
| ID | Nom | Catégorie | Unité | Stock Initial | Seuil Alerte | Description | Créé le |
|-----|-----|-----------|-------|---------------|--------------|-------------|---------|

### Feuille `Mouvements`
| ID | Horodatage | Produit ID | Produit | Type | Quantité | Motif | Opérateur | Stock Avant | Stock Après |
|-----|------------|------------|---------|------|----------|-------|-----------|-------------|-------------|

---

## 🧪 Tester le script Apps Script

Dans l'éditeur Apps Script, tu peux exécuter la fonction `TEST_run()` manuellement pour vérifier que tout fonctionne :

```javascript
function TEST_run() {
  initSheets();
  Logger.log(addProduit({nom:"Test", categorie:"Test", unite:"kg", stockInitial:100, seuilAlerte:20}));
  Logger.log(getStockActuel());
}
```

---

## 🐛 Dépannage

| Problème | Solution |
|---------|---------|
| "Impossible de joindre le script" | Vérifie que l'accès est bien **Tout le monde (anonyme)** |
| "Action inconnue" | Crée un **nouveau** déploiement (pas mettre à jour) |
| Données qui ne s'affichent pas | Clique ↻ pour actualiser, ou vérifie les feuilles dans Sheets |
| Erreur de permission | Dans Apps Script, ré-autorise les permissions |

---

## 📄 Licence

MIT — libre d'utilisation, modification et distribution.
