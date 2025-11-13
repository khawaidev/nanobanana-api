# Banana API Callback Server

Simple Express backend server to handle Banana API callbacks and provide results to the frontend.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables (optional):
```bash
PORT=3000
FRONTEND_URL=https://your-frontend-url.com
```

## Running Locally

```bash
npm start
# or for development with auto-reload
npm run dev
```

## Deploying to Render

1. Create a new Web Service on Render
2. Connect your repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Set environment variables if needed:
   - `PORT` (usually auto-set by Render)
   - `FRONTEND_URL` (your frontend URL for CORS)

## Endpoints

- `GET /health` - Health check
- `POST /callback` - Receives callbacks from Banana API
- `GET /result/:taskId` - Get result for a specific task ID
- `GET /results` - Get all results (for debugging)

## Usage

1. Deploy this server to Render
2. Get your Render URL (e.g., `https://your-app.onrender.com`)
3. Use `https://your-app.onrender.com/callback` as the `callBackUrl` in Banana API requests
4. Poll `https://your-app.onrender.com/result/:taskId` from your frontend to get results

