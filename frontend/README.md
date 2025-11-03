# ReFabric Marketplace - Frontend

A modern, responsive React web application for an AI-powered fabric resale platform.

## Features

- 🏠 **Landing Page** - Hero section, how it works, sustainability impact, testimonials
- 🔐 **Authentication** - Login, Signup with role selection (Vendor/Buyer), Google OAuth placeholder
- 📦 **Vendor Dashboard** - Upload fabrics with AI analysis, manage listings, view orders
- 🛒 **Buyer Dashboard** - Browse marketplace with filters, search, view fabric details
- 🤖 **AI Integration** - Automatic fabric analysis (type, pattern, colors) on image upload
- 🎨 **Modern UI** - Tailwind CSS with shadcn/ui components, Framer Motion animations
- 📱 **Responsive** - Fully responsive design for all screen sizes

## Tech Stack

- React 18
- Vite
- React Router v6
- Tailwind CSS
- **Supabase** - Database, Authentication, Storage, Real-time
- Framer Motion
- Lucide React (icons)
- Axios

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account (for database and authentication)
- Flask backend running on port 5000 (for AI fabric analysis)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `SUPABASE_SETUP.md` in your Supabase SQL Editor
   - Create a storage bucket called `fabric-images`

3. Create a `.env` file in the `frontend` directory:
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000
```

4. Start development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

### Supabase Setup

See `SUPABASE_SETUP.md` for detailed database schema and setup instructions.

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components (Button, Card, etc.)
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── context/         # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── FabricContext.jsx
│   ├── lib/             # Utilities and API calls
│   │   └── api.js
│   ├── pages/           # Page components
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── BuyerDashboard.jsx
│   │   └── vendor/
│   │       ├── VendorDashboard.jsx
│   │       ├── UploadFabric.jsx
│   │       ├── MyListings.jsx
│   │       └── Orders.jsx
│   ├── utils/           # Helper functions
│   ├── App.jsx          # Main app component with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Backend Integration

### Supabase (Primary Backend)

The frontend uses Supabase for:
- **Authentication** - User login, signup, Google OAuth
- **Database** - Fabric listings, user profiles
- **Storage** - Fabric images
- **Real-time** - Live updates when fabrics are added/updated/deleted

### Flask Backend (AI Analysis)

The Flask backend is still used for:
- `POST /upload` - AI fabric image analysis (detects type, pattern, colors)

Update `VITE_API_URL` in your `.env` file to point to your Flask backend server.

## Features in Detail

### Vendor Features
- Upload fabric images with automatic AI analysis
- View detected fabric type, pattern, and colors
- Manage fabric listings
- View order history

### Buyer Features
- Browse fabric marketplace
- Advanced filters (type, color, pattern, price)
- Search functionality
- View detailed fabric information
- Add to cart / Buy now

### AI Integration
When a vendor uploads a fabric image, the app:
1. Sends image to `/upload` endpoint
2. Receives analysis results (fabric type, pattern, colors)
3. Displays results in a preview card
4. Auto-fills form fields with detected information

## Styling

The app uses Tailwind CSS with a custom eco-friendly theme:
- Primary: Green tones (`#22c55e`)
- Background: Beige/cream tones
- Minimal, clean design

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## License

MIT

