# 📦 StockFlow - Application de Gestion de Stock Moderne

Une application web moderne, épurée et **non conventionnelle** de gestion de stock pour les PME. StockFlow offre une expérience utilisateur unique avec un design immersif et fluide.

## ✨ Caractéristiques

### 🎨 Design Non-Conventionnel
- **Interface unique** : Pas de sidebar gauche traditionnelle ni de topbar bleue
- **Navigation flottante** : Menu orbiculaire avec animations fluides
- **Cartes flottantes** : Effet de verre (glassmorphism) avec ombres dynamiques
- **Palette moderne** : Gris clair, bleu nuit, vert clair/turquoise
- **Animations fluides** : Transitions douces et micro-interactions

### 🚀 Fonctionnalités Principales

#### 📊 Dashboard
- Vue d'ensemble des stocks en temps réel
- Graphiques interactifs (Recharts)
- Statistiques détaillées (ventes, alertes, tendances)
- Produits en seuil critique avec alertes visuelles

#### 📦 Gestion des Produits
- Liste interactive avec filtres avancés
- Détails complets : nom, catégorie, fournisseur, stock, prix
- Système d'alertes automatiques pour stock faible
- Recherche rapide et filtres multiples

#### 📋 Commandes
- Création et suivi des commandes
- Statuts visuels (livré, expédié, en attente, annulé)
- Filtres par client, date, statut
- Import/Export de données

#### 📈 Rapports
- 6 types de rapports prédéfinis
- Graphiques interactifs
- Export PDF et Excel
- Rapports personnalisables

#### ⚙️ Paramètres
- Configuration complète de l'application
- Gestion des notifications
- Paramètres de sécurité
- Personnalisation de l'apparence

## 🛠️ Technologies Utilisées

### Frontend
- **Next.js 14** - Framework React moderne
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Framer Motion** - Animations fluides
- **Recharts** - Graphiques interactifs
- **Lucide React** - Icônes modernes
- **React Hook Form** - Gestion des formulaires

### Design System
- **Palette de couleurs** : Gris clair, bleu nuit, turquoise
- **Typographie** : Inter (Google Fonts)
- **Effets visuels** : Glassmorphism, ombres dynamiques
- **Animations** : Transitions fluides, micro-interactions

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd stockflow-app
```

2. **Installer les dépendances**
```bash
npm install
# ou
yarn install
```

3. **Lancer le serveur de développement**
```bash
npm run dev
# ou
yarn dev
```

4. **Ouvrir l'application**
```
http://localhost:3000
```

## 📁 Structure du Projet

```
stockflow-app/
├── app/                    # App Router (Next.js 14)
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/             # Composants React
│   ├── Dashboard.tsx      # Dashboard principal
│   ├── Products.tsx       # Gestion des produits
│   ├── Orders.tsx         # Gestion des commandes
│   ├── Reports.tsx        # Rapports et analytics
│   └── Settings.tsx       # Paramètres
├── public/                # Assets statiques
├── tailwind.config.js     # Configuration Tailwind
├── next.config.js         # Configuration Next.js
└── package.json           # Dépendances
```

## 🎨 Design System

### Couleurs
```css
/* Primary Colors */
primary-500: #0ea5e9 (Bleu)
primary-600: #0284c7

/* Night Colors */
night-50: #f8fafc
night-800: #1e293b
night-900: #0f172a

/* Turquoise Colors */
turquoise-500: #14b8a6
turquoise-600: #0d9488
```

### Composants
- **Floating Cards** : Cartes avec effet glassmorphism
- **Navigation Orb** : Menu circulaire flottant
- **Gradient Text** : Texte avec dégradé
- **Pulse Glow** : Effet de pulsation lumineuse

## 🔧 Configuration

### Tailwind CSS
Le projet utilise une configuration personnalisée de Tailwind CSS avec :
- Palette de couleurs étendue
- Animations personnalisées
- Composants utilitaires

### Animations
Les animations sont gérées par Framer Motion avec :
- Transitions fluides entre les pages
- Micro-interactions sur les éléments
- Animations d'entrée et de sortie

## 📱 Responsive Design

L'application est entièrement responsive avec :
- **Mobile First** : Optimisé pour les petits écrans
- **Tablet** : Adaptation pour les tablettes
- **Desktop** : Expérience complète sur grand écran

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
npm run build
vercel --prod
```

### Autres plateformes
- **Netlify** : Compatible avec Next.js
- **Railway** : Déploiement simple
- **Render** : Alternative gratuite

## 📊 Fonctionnalités Avancées

### Gestion des Données
- **État local** : Gestion avec React hooks
- **Filtres dynamiques** : Recherche et filtrage en temps réel
- **Validation** : Formulaires avec validation

### Performance
- **Lazy Loading** : Chargement optimisé
- **Code Splitting** : Séparation automatique du code
- **Optimisations** : Images et assets optimisés

## 🔒 Sécurité

- **Authentification** : Système JWT (à implémenter)
- **Validation** : Validation côté client et serveur
- **Sanitisation** : Protection contre les injections

## 📈 Roadmap

### Phase 1 (Actuelle)
- ✅ Interface utilisateur complète
- ✅ Navigation non-conventionnelle
- ✅ Composants principaux
- ✅ Design system

### Phase 2 (Prochaine)
- 🔄 Backend API (Node.js + Express)
- 🔄 Base de données (MongoDB/PostgreSQL)
- 🔄 Authentification JWT
- 🔄 API REST complète

### Phase 3 (Future)
- 📋 Notifications en temps réel
- 📋 Export PDF/Excel
- 📋 Intégration paiements
- 📋 Mobile app (React Native)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- **Design** : Interface non-conventionnelle et moderne
- **Développement** : Next.js, React, TypeScript
- **UX/UI** : Expérience utilisateur immersive

## 📞 Support

Pour toute question ou support :
- 📧 Email : support@stockflow.com
- 📱 Discord : [Serveur StockFlow]
- 📖 Documentation : [Wiki du projet]

---

**StockFlow** - Révolutionnez votre gestion de stock avec une interface moderne et non-conventionnelle ! 🚀 