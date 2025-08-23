KALA# Kala4Reason - Indian Art & Culture Platform

## Overview
Kala4Reason is a Next.js-based web application dedicated to showcasing the rich heritage of Indian art and culture. The platform provides an interactive experience for users to explore various art forms from different states of India, including Karnataka, Kerala, Rajasthan, and West Bengal.

## Features

### 1. Interactive State Pages
- Dedicated pages for each Indian state showcasing their unique art forms
- Responsive design that works on all devices
- High-quality images with fallback mechanisms
- Detailed descriptions of art forms and cultural significance

### 2. User Authentication
- Secure login/signup functionality
- User profile management
- Protected routes for authenticated users

### 3. Content Management
- Dynamic content rendering
- Image optimization with fallbacks
- SEO-friendly pages with proper metadata

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.0
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Authentication**: Firebase Authentication
- **Fonts**:
  - Geist (Sans & Mono)
  - Inter
  - Instrument Serif

### Development Tools
- TypeScript
- ESLint
- PostCSS
- Tailwind CSS

## Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── images/             # Image assets
│   └── svg/                # SVG icons and illustrations
├── src/
│   ├── app/                # Next.js app directory
│   │   ├── explore/        # State-specific pages
│   │   │   ├── karnataka/
│   │   │   ├── kerala/
│   │   │   ├── rajasthan/
│   │   │   └── west-bengal/
│   │   ├── login/          # Authentication pages
│   │   ├── profile/        # User profile
│   │   └── post/           # Blog/Post pages
│   ├── components/         # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── BackButton.tsx
│   │   └── ImageWithFallback.tsx
│   └── styles/             # Global styles
├── .eslintrc.json          # ESLint configuration
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies
└── tsconfig.json           # TypeScript configuration
```

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Firebase account (for authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/kala4reason.git
   cd kala4reason/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the frontend directory and add your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

The application can be deployed on Vercel, Netlify, or any other platform that supports Next.js applications.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js and React communities
- Tailwind CSS for the utility-first CSS framework
- Firebase for authentication services
- All the artists and cultural experts who contributed to the content
