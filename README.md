### Frontend README (rf-online-frontend)
# RF-Online Fitness Platform

# **Modern React Frontend for Gym Management System**  
[![React](https://img.shields.io/badge/React-18.x-61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.x-646CFF)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4)](https://tailwindcss.com/)

> Beautiful, minimalistic and brutalist interface for managing workouts, schedules, and client-coach interactions

## Live Demo
Coming soon! (Currently in production testing)

## Tech Stack
- **Framework**: React 18
- **State Management**: Context API + useReducer
- **Styling**: TailwindCSS + HeadlessUI
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Icons**: Heroicons
- **Deployment**: Vercel

## Key Features
- Dynamic role-based dashboards (Client/Coach/Admin)
- Real-time chat interface with Socket.io
- Interactive calendar for session booking
- Payment integration flows
- Responsive mobile-first design
- Dark/light mode support
- Form validation with React Hook Form

## Performance Highlights
- 95+ Lighthouse accessibility score
- <100ms component load times
- Code-splitting with React.lazy()
- Optimized image loading

## Installation
# Clone repository
git clone https://github.com/nahuelmieres/rf-online-frontend.git
# Install dependencies
npm install
# Start development server
npm run dev

# Connecting to Backend
Set in .env.local:
VITE_API_BASE_URL=your_vite_api_url
# Project Structure
src/
├── components/      # Reusable UI components
├── context/         # State management
├── pages/           # Route-based views
├── services/        # API communication
├── utils/           # Helper functions
└── assets/          # Static resources

# Contact: nahuelmieres.dev@gmail.com