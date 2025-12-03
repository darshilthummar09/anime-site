# AnimeFlix - Netflix Clone for Anime

A full-featured Netflix-like streaming platform for anime content built with Next.js 14. This project includes all the core functionality of a modern streaming service.

## ✨ Features

### Core Functionality
- 🎬 **Homepage** - Hero banner with featured content and multiple content rows
- 🎥 **Video Player** - Full-featured player with iframe support:
  - Supports iframe embeds from anime APIs
  - Direct video file playback
  - Fullscreen mode
  - Auto-hiding controls
  - Progress tracking and resume
- 🔍 **Browse & Search** - Real-time search using Consumet API
- 💳 **Premium Subscriptions** - Stripe integration for premium users
- 🔒 **Premium Content** - Restrict content access to premium subscribers
- 📺 **Continue Watching** - Automatically tracks your progress and shows where you left off
- 📋 **My List** - Save anime to your personal watchlist
- 👤 **User Profile** - View watch history and continue watching
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Beautiful design with smooth animations using Framer Motion

### Pages
- `/` - Homepage with featured content
- `/browse` - Browse and search all anime
- `/anime/[id]` - Individual anime detail page with episodes
- `/watch/[animeId]/[episodeId]` - Video player page with iframe support
- `/subscription` - Premium subscription plans
- `/subscription/success` - Payment success page
- `/my-list` - Your saved anime list
- `/profile` - User profile with watch history
- `/account` - Account settings

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Stripe account (optional, for payment functionality)

### Installation

1. Install dependencies:
```bash
npm install
```

2. **Set up Stripe (Optional but Recommended):**

   **Quick Setup (5 minutes):**
   ```bash
   npm run setup-stripe
   ```
   This interactive script will help you create `.env.local` with your Stripe keys.

   **Manual Setup:**
   - Copy `env.local.template` to `.env.local`
   - Get your Stripe keys from: https://dashboard.stripe.com/test/apikeys
   - Create products in Stripe Dashboard: https://dashboard.stripe.com/test/products
   - Add your keys and price IDs to `.env.local`

   **See detailed instructions:** `QUICK_STRIPE_SETUP.md` or `STRIPE_SETUP.md`

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

**Note:** The site works without Stripe! You can test all features except payments. Stripe is only needed for the subscription functionality.

### Build for Production

```bash
npm run build
npm start
```

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Video**: Iframe embeds and HTML5 video player
- **Anime API**: Consumet API (https://api.consumet.org)
- **Payments**: Stripe
- **Icons**: React Icons

## 📁 Project Structure

```
anime-site/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage
│   ├── browse/           # Browse/search page
│   ├── anime/[id]/       # Anime detail page
│   ├── watch/            # Video player pages
│   ├── my-list/          # User's saved list
│   ├── profile/          # User profile
│   └── account/          # Account settings
├── components/            # React components
│   ├── Navbar.tsx        # Navigation bar
│   ├── Hero.tsx          # Hero banner
│   ├── Row.tsx           # Content row
│   ├── VideoPlayer.tsx   # Video player
│   └── ContinueWatching.tsx
├── data/                 # Mock data
│   └── animeData.ts     # Anime content data
└── types/               # TypeScript types
    └── index.ts
```

## 🎯 Key Features Explained

### Video Progress Tracking
- Automatically saves your watch progress every 10 seconds
- Resume from where you left off when you return
- Progress bars show completion status

### Continue Watching
- Automatically appears on homepage if you have in-progress videos
- Shows progress bars for each video
- Quick access to resume watching

### My List
- Add/remove anime from your personal list
- Persistent storage using localStorage
- Easy access from navigation

### Search & Filter
- Real-time search across titles and descriptions
- Filter by genre (Action, Adventure, Comedy, etc.)
- Filter by type (Series or Movies)

## 🎨 Customization

### Adding More Anime
Edit `data/animeData.ts` to add more anime content. Each anime needs:
- Title, description, thumbnail, banner
- Genre array, year, rating
- Episodes with video URLs

### Styling
The site uses Tailwind CSS with custom Netflix-inspired colors defined in `tailwind.config.ts`.

## 📝 Notes

### Anime API
- Uses Consumet API for fetching anime data and streaming links
- The API provides iframe URLs and direct video sources
- Episodes are fetched dynamically from the API

### Payment Integration
- Stripe is integrated for subscription payments
- Premium status is stored in localStorage (replace with database in production)
- Webhook endpoint handles subscription events
- Test mode: Use Stripe test keys for development

### Premium Features
- Premium users can access all content
- Free users see premium badges and upgrade prompts
- Subscription status is checked on each page load

### Production Considerations
- Replace localStorage with a proper database for user data
- Implement proper authentication (NextAuth.js, Supabase, etc.)
- Set up proper error handling and logging
- Configure CORS for API routes
- Set up proper video CDN for better performance
- Implement rate limiting for API calls

## 🔮 Future Enhancements

- User authentication and accounts
- Backend API integration
- Real video streaming
- Recommendations engine
- Social features (reviews, ratings)
- Multiple user profiles
- Parental controls

## 📄 License

This project is for educational purposes.

