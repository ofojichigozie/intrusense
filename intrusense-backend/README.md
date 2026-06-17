# IntruSense Backend

This backend powers the IntruSense intrusion detection system. It exposes the API used by the dashboard, stores readings, manages settings, handles admin authentication, and can send Telegram notifications.

## Requirements

- Node.js 18+
- npm
- MongoDB running locally or via a reachable MongoDB URI

## Setup

1. Clone the repository and move into the root folder:
   ```sh
   git clone https://github.com/ofojichigozie/intrusense.git
   cd intrusense
   ```
2. Move into the backend folder:
   ```sh
   cd intrusense-backend
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Create a `.env` file if needed and set values such as:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/intrusense
   JWT_SECRET=your_secret_here
   DEVICE_API_KEY=intrusense-device-secret
   TELEGRAM_BOT_TOKEN=
   CORS_ORIGIN=http://localhost:5173
   ```

## Run the application

### Development
```sh
npm run dev
```

### Production build
```sh
npm run build
npm start
```

### Seed sample data
```sh
npm run seed
```

The API will be available at `http://localhost:5000` by default.
