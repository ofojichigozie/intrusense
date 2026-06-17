# IntruSense Frontend

This frontend provides the dashboard for viewing intrusion events, checking live readings, and managing system settings.

## Requirements

- Node.js 18+
- npm

## Setup

1. Clone the repository and move into the root folder:
   ```sh
   git clone https://github.com/ofojichigozie/intrusense.git
   cd intrusense
   ```
2. Move into the frontend folder:
   ```sh
   cd intrusense-frontend
   ```
3. Install dependencies:
   ```sh
   npm install
   ```

## Run the application

### Development server
```sh
npm run dev
```

The app will start on `http://localhost:5173` by default.

### Production build
```sh
npm run build
npm run preview
```

If your backend is not running on the default URL, create a `.env` file with:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
