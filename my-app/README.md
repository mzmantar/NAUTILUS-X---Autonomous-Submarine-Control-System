# 🎨 NAUTILUS-X Interface

Interface de contrôle Electron pour le sous-marin robotique autonome NAUTILUS-X.

> **⚠️ PROTECTED PROJECT**  
> This project and all its components are protected under intellectual property rights. Unauthorized copying, distribution, or modification is strictly prohibited. All rights reserved.

> **Asset Credit**  
> The file `public/nautilus_mk1.svg` is created by **Mohamed Mehdi Zmantar** and included as part of this project assets.

## 🚀 Description

Application desktop moderne construite avec Electron, React et Vite pour contrôler et monitorer le sous-marin NAUTILUS-X en temps réel.

### Fonctionnalités

- 🗺️ **Carte interactive** : Visualisation GPS en temps réel avec Leaflet/Mapbox
- 📊 **Dashboard** : Monitoring batterie, réseau, et capteurs
- 🎮 **Contrôles** : Interface pour moteurs, lumières, et systèmes
- 📸 **Galerie média** : Visualisation des captures sous-marines
- ⚡ **Hot Module Replacement** : Développement rapide avec Vite

## 🛠️ Technologies

- **Electron** 37+ - Application desktop multi-plateforme
- **React** 19+ - Framework UI avec hooks
- **Vite** 7+ - Build tool ultra-rapide
- **Leaflet / Mapbox GL** - Cartographie interactive
- **React Leaflet** - Intégration React pour Leaflet

## 📦 Installation

```bash
# Installer les dépendances
npm install
```

## 🚀 Utilisation

### Mode développement

```bash
# Lancer Vite dev server + Electron
npm run dev:all

# Ou séparément :
npm run dev      # Vite dev server (http://localhost:5173)
npm run electron # Lancer Electron
```

### Build production

```bash
# Build web
npm run build

# Créer l'application Electron
npm run build:electron

# Package complet (avec installeur)
npm run package
```

### Autres commandes

```bash
npm run lint     # Vérifier le code avec ESLint
npm run preview  # Prévisualiser le build production
```

## 📁 Structure

```
my-app/
├── electron/              # Code Electron (main process)
│   ├── main.js           # Process principal
│   └── preload.js        # Script preload
├── src/                  # Code React
│   ├── App.jsx          # Composant racine
│   ├── main.jsx         # Point d'entrée
│   ├── components/      # Composants UI
│   │   ├── HeaderBar.jsx
│   │   ├── MapView.jsx
│   │   └── Loader.jsx
│   └── Styles/          # CSS
├── public/              # Assets statiques
└── release/             # Build Electron (généré)
```

## 🔌 Connexion au backend

L'application se connecte automatiquement à l'API Gateway sur `http://localhost:8080`.

Assurez-vous que les services backend sont démarrés :

```bash
cd ../Nautilus-X
docker-compose up
```

## 📦 Packaging

Le packaging crée des installeurs pour différentes plateformes :

```bash
npm run package
```

**Sortie dans `release/`** :
- Windows : `.exe` installer
- macOS : `.dmg`
- Linux : `.AppImage`, `.deb`

### Configuration Electron Builder

Voir `package.json` section `"build"` pour personnaliser :
- ID de l'application
- Icônes
- Fichiers inclus
- Options plateforme

## 🎯 Composants principaux

### App.jsx
Composant racine gérant l'état global (GPS, batterie, réseau, statut robot).

### HeaderBar.jsx
Barre supérieure affichant :
- État batterie
- Connectivité réseau
- Bouton marche/arrêt

### MapView.jsx
Carte interactive Leaflet/Mapbox pour :
- Position GPS en temps réel
- Définition de waypoints
- Visualisation trajectoire

### Loader.jsx
Animation de chargement affichée au démarrage.

## 🔧 Développement

### Hot Module Replacement

Vite fournit le HMR automatique. Les modifications sont reflétées instantanément.

### DevTools

Les DevTools Chrome sont disponibles dans l'application Electron (F12 ou via menu).

### ESLint

Configuration ESLint incluse pour maintenir la qualité du code :

```bash
npm run lint
```

## 📝 Scripts package.json

| Script | Description |
|--------|-------------|
| `dev` | Démarrer serveur Vite |
| `electron` | Lancer Electron |
| `dev:all` | Vite + Electron simultanément |
| `build` | Build production Vite |
| `build:electron` | Build Electron |
| `package` | Créer installeur |
| `lint` | Vérifier avec ESLint |
| `preview` | Prévisualiser build |

## 🐛 Dépannage

### L'application Electron ne se lance pas
- Vérifier que Vite dev server tourne sur le port 5173
- Utiliser `npm run dev:all` pour démarrer les deux

### Erreur de connexion au backend
- Vérifier que Docker Compose est démarré
- Confirmer que l'API Gateway est sur le port 8080

### Build qui échoue
- Nettoyer : `rm -rf node_modules dist release`
- Réinstaller : `npm install`
- Rebuild : `npm run build`

## 📄 Licence

Partie du projet NAUTILUS-X - Licence MIT

## 🔗 Liens

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Leaflet Documentation](https://leafletjs.com/)
