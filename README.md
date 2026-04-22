# 📦 StockFlow

Application de gestion de stock hébergée sur **GitHub Pages**, base de données sur **Google Sheets**.

## Fichiers

| Fichier | Rôle |
|---------|------|
| `index.html` | Application complète (HTML + CSS + JS, zéro dépendance) |
| `Code.gs` | Backend Google Apps Script (API + base de données) |

## Déploiement en 2 étapes

### 1. Google Apps Script (backend + BDD)

1. Créer un **nouveau Google Sheets**
2. **Extensions → Apps Script**
3. Remplacer tout le contenu par `Code.gs` → **Ctrl+S**
4. Dans le menu déroulant, sélectionner **`TEST_init`** → cliquer **▶ Exécuter**
   - Accepter les permissions demandées
   - Vérifier que les logs affichent `TOUT OK`
5. **Déployer → Nouvelle déploiement**
   - Type : **Application Web**
   - Exécuter en tant que : **Moi**
   - Accès : **Tout le monde**
6. Copier l'URL `/exec`

### 2. GitHub Pages (frontend)

1. Créer un repo GitHub et pousser `index.html`
2. **Settings → Pages → Source : `main` / `root`**
3. Ouvrir l'app → coller l'URL `/exec` → **Connecter**

## Architecture

```
GitHub Pages          JSONP (contourne CORS)       Google Apps Script
(index.html)    ─────────────────────────────►     (Code.gs / Web App)
                ◄─────────────────────────────           │
                                                         ▼
                                                    Google Sheets
                                                  ┌──────────────┐
                                                  │  Produits    │
                                                  │  Mouvements  │
                                                  └──────────────┘
```

**Pourquoi JSONP ?**  
Les navigateurs bloquent les appels `fetch()` vers des domaines tiers (CORS). JSONP injecte une balise `<script>` — Apps Script détecte le paramètre `callback` et enveloppe la réponse.

## Structure des données

### Feuille `Produits`
`id` | `nom` | `categorie` | `unite` | `seuil` | `description` | `cree_le`

### Feuille `Mouvements`
`id` | `horodatage` | `produit_id` | `produit_nom` | `type` | `quantite` | `motif` | `operateur` | `stock_avant` | `stock_apres`

## Fonctionnalités

- **Dashboard** — stats, alertes, graphique flux, derniers mouvements
- **Stock temps réel** — cartes visuelles OK / ALERTE / RUPTURE
- **Mouvements horodatés** — entrées & sorties avec opérateur et motif
- **Récapitulatifs** — Jour / Semaine / Mois avec graphiques
- **Gestion produits** — CRUD complet, seuils d'alerte
- **Mode démo** — fonctionne sans Google Sheets
