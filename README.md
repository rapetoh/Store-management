# 📦 StockFlow — Modern Inventory Management App
<img width="1427" height="811" alt="image" src="https://github.com/user-attachments/assets/b61c4001-7dc0-4b10-8bea-e2ae1f5f076e" />
<img width="1899" height="672" alt="image" src="https://github.com/user-attachments/assets/ed8ce7e9-9181-4adc-a03c-516c088c861a" />
<img width="1900" height="908" alt="image" src="https://github.com/user-attachments/assets/1d6fb7ed-005b-4a6a-9879-57c1a3a88ef7" />
<img width="1912" height="594" alt="image" src="https://github.com/user-attachments/assets/b0bb7479-604f-4be2-9036-2501ecfcc66c" />
<img width="1816" height="870" alt="image" src="https://github.com/user-attachments/assets/a14ed1da-f9ad-4fd3-a632-bc56abb91736" />





**StockFlow** is a modern, sleek, and **non-conventional** web application for small and medium-sized businesses.  
It delivers a smooth, immersive user experience with a unique visual design and fluid navigation.

---

## ✨ Key Features

### 🎨 Non-Conventional Design
- **Unique Interface:** No traditional left sidebar or blue top bar  
- **Floating Navigation:** Circular, animated orb-style menu  
- **Floating Cards:** Glassmorphism effects with dynamic shadows  
- **Modern Palette:** Light gray, midnight blue, soft turquoise  
- **Smooth Animations:** Gentle transitions and micro-interactions  

### 🚀 Core Functionality

#### 📊 Dashboard
- Real-time overview of stock levels  
- Interactive charts (Recharts)  
- Detailed statistics (sales, alerts, trends)  
- Visual alerts for low-stock items  

#### 📦 Product Management
- Interactive product list with advanced filters  
- Full details: name, category, supplier, stock, price  
- Automatic low-stock alerts  
- Instant search and multi-filtering  

#### 📋 Orders
- Create and track orders  
- Visual statuses (Delivered, Shipped, Pending, Canceled)  
- Filters by client, date, or status  
- Import/export data  

#### 📈 Reports
- 6 built-in report types  
- Interactive visual analytics  
- Export to PDF or Excel  
- Fully customizable reports  

#### ⚙️ Settings
- Complete configuration options  
- Notification management  
- Security settings  
- Theme and appearance customization  

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** — Modern React framework  
- **React 18** — UI library  
- **TypeScript** — Static typing  
- **Tailwind CSS** — Utility-first styling  
- **Framer Motion** — Smooth animations  
- **Recharts** — Interactive charts  
- **Lucide React** — Icon set  
- **React Hook Form** — Form management  

### Design System
- **Color Palette:** Light gray, midnight blue, turquoise  
- **Font:** Inter (Google Fonts)  
- **Visual Effects:** Glassmorphism, soft shadows  
- **Animations:** Subtle transitions and micro-interactions  

---

## 🚀 Installation

### Prerequisites
- Node.js 18+  
- npm or yarn  

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stockflow-app
2. **Install dependencies**
   
npm install
# or
yarn install

3. **Run the development server**

npm run dev
# or
yarn dev

## 📁 Project Structure
stockflow-app/
├── app/                    # App Router (Next.js 14)
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Main layout
│   └── page.tsx            # Home page
├── components/              # React components
│   ├── Dashboard.tsx        # Dashboard
│   ├── Products.tsx         # Product management
│   ├── Orders.tsx           # Order management
│   ├── Reports.tsx          # Reports and analytics
│   └── Settings.tsx         # Settings page
├── public/                 # Static assets
├── tailwind.config.js      # Tailwind config
├── next.config.js          # Next.js config
└── package.json            # Dependencies

## Components

Floating Cards: Glassmorphism effect
Orb Navigation: Circular floating menu
Gradient Text: Gradient typography
Pulse Glow: Subtle glowing animation

## 🚀 Deployment

npm run build
vercel --prod

Other Platforms
Netlify: Next.js-ready
Railway: Simple deployment
Render: Free alternative

## 🔒 Security

Authentication: JWT system (coming soon)
Validation: Client + server side
Sanitization: Injection protection

## 🤝 Contributing

Fork the project
Create a feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add AmazingFeature')
Push to your branch (git push origin feature/AmazingFeature)
Open a Pull Request
