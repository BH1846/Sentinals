# Herbal Collector PWA

A Progressive Web App for herbal collectors that works offline-first and automatically syncs data to the cloud with blockchain integration for immutable traceability.

## Features

- **Offline-First**: Works completely without internet connection
- **Simple Interface**: Large buttons and inputs optimized for farmers
- **Auto GPS & Timestamps**: Automatically captures location and time
- **Smart Sync**: Syncs data automatically when connection is restored  
- **Blockchain Integration**: Immutable logging for full traceability
- **PWA Support**: Installable on any device, works like a native app

## Architecture

```
Frontend (React PWA) → Backend (Node.js + Supabase) → Blockchain (Smart Contract)
```

### Frontend Stack
- React 18 with TypeScript
- Tailwind CSS for styling
- IndexedDB for offline storage
- Service Worker for PWA functionality
- Geolocation API for GPS tracking

### Backend Stack  
- Node.js with Express
- Supabase for database
- Web3.js for blockchain integration
- CORS enabled for PWA access

### Blockchain
- Solidity smart contract
- Immutable collection logging
- Event emission for transparency
- Gas-optimized operations

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Blockchain network access (optional)

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The PWA will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# SUPABASE_URL=your_supabase_url
# SUPABASE_SERVICE_KEY=your_service_key

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3001`

### Database Setup

1. Create a new Supabase project
2. Run the migration SQL in Supabase SQL Editor:

```sql
-- See supabase/migrations/create_collections.sql
```

3. Update your `.env` file with Supabase credentials

### Blockchain Setup (Optional)

1. Deploy the smart contract:
```bash
cd blockchain
node deploy.js
```

2. Update backend `.env` with contract details:
```env
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...
```

## Usage

### For Farmers

1. **Open the app** in any web browser
2. **Grant location permission** when prompted
3. **Fill in herb type** from dropdown or enter custom
4. **Enter quantity** in kilograms
5. **Tap "Save Collection"** - GPS and timestamp are captured automatically
6. **Data syncs automatically** when internet is available

### Data Flow

1. **Collection** → Saved to IndexedDB (works offline)
2. **Sync** → Uploaded to Supabase when online
3. **Blockchain** → Logged to smart contract for immutability
4. **Status** → Visual indicators show sync progress

## API Endpoints

### POST `/api/collections`
Create a new collection record

```json
{
  "id": "uuid-v4",
  "herbType": "Basil", 
  "quantity": 2.5,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET `/api/collections`
Retrieve all collections (admin endpoint)

## Security

- **Row Level Security** enabled on Supabase
- **HTTPS required** for production
- **Geolocation permissions** properly requested
- **Service worker** caches only public assets
- **Blockchain verification** for data integrity

## Production Deployment

### Frontend (PWA)
```bash
npm run build
# Deploy 'dist' folder to any static hosting
```

### Backend
```bash
# Deploy to Node.js hosting (Railway, Render, etc.)
npm start
```

### Environment Variables
```env
# Frontend (.env)
VITE_API_URL=https://your-backend.com/api

# Backend (.env) 
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test offline functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details