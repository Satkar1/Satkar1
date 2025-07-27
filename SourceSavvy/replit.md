# KachaMaal - Street Food Raw Material Sourcing Platform

## Overview

KachaMaal is a complete web application that solves raw material sourcing challenges for Indian street food vendors. It's a dual-interface platform connecting vendors with suppliers through a modern, mobile-first design with real-time capabilities and location-based services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack
- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS with Radix UI components (shadcn/ui)
- **State Management**: React Query for server state, React Context for app state
- **Routing**: Wouter for client-side routing

### Architectural Pattern
The application follows a monorepo structure with clear separation of concerns:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Common types and database schema
- Component-based architecture with reusable UI components

## Key Components

### Database Layer (Drizzle ORM)
- **Users**: Base user information with phone/email authentication
- **Vendors**: Street food vendor profiles with stall details
- **Suppliers**: Business supplier profiles with delivery capabilities
- **Products**: Inventory items with pricing and availability
- **Orders**: Transaction records with status tracking
- **Reviews**: Rating and feedback system
- **Notifications**: Real-time messaging system

### Backend Services
- **Authentication**: Phone/email based user registration and login
- **Storage Layer**: Comprehensive data access layer with type-safe queries
- **Location Services**: Geolocation-based supplier discovery
- **Order Management**: Complete order lifecycle handling
- **Real-time Updates**: Live order tracking and status updates

### Frontend Architecture
- **Mobile-First Design**: Responsive components optimized for mobile devices
- **State Management**: App-wide context for user state and navigation
- **Real-time Features**: Live order tracking and notifications
- **Voice Integration**: Voice note recording for emergency orders
- **Offline Capabilities**: Service worker ready architecture

### UI Components
- **Layout Components**: Mobile header, bottom navigation
- **Business Components**: Category grid, supplier cards, order cards
- **Modal System**: Voice notes, QR codes, order tracking
- **Form Components**: Complete form handling with validation

## Data Flow

### User Authentication Flow
1. User registers with phone/email and user type (vendor/supplier)
2. Profile created based on user type with specific business details
3. Location permissions requested for proximity-based services
4. Dashboard access granted with role-specific features

### Order Management Flow
1. **Vendor Side**: Browse categories → Find suppliers → Place orders → Track delivery
2. **Supplier Side**: Manage inventory → Receive orders → Update status → Process delivery
3. **Emergency Orders**: Voice-enabled quick ordering with 30-minute delivery guarantee

### Real-time Updates
- Order status changes broadcast to relevant parties
- Inventory updates reflected immediately
- Location-based supplier availability updates
- Push notifications for critical updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **drizzle-orm**: Type-safe database queries and migrations
- **wouter**: Lightweight React router

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

### Optional Integrations
- **OpenAI API**: Smart recommendations and AI-powered features
- **Geolocation API**: Browser-based location services
- **Web Audio API**: Voice recording capabilities

## Deployment Strategy

### Development Environment
- Hot module reloading with Vite
- TypeScript compilation checking
- Database migrations with Drizzle Kit
- Environment variable configuration

### Production Build
- Vite builds optimized React bundle to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Single deployment artifact with both frontend and backend
- Static file serving from Express server

### Database Management
- Drizzle migrations in `migrations/` directory
- Schema definitions in `shared/schema.ts`
- Connection pooling with Neon serverless PostgreSQL
- Environment-based database URL configuration

### Scalability Considerations
- Stateless server design for horizontal scaling
- Database connection pooling for concurrent requests
- CDN-ready static asset serving
- Real-time features ready for WebSocket upgrade