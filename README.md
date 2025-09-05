# SEO YouGrow - YouTube Creator Studio

A mobile app for YouTube creators to generate SEO metadata, analyze thumbnails, and learn best practices.

## Setup Instructions

### 1. Backend Setup (Render)
1. Create GitHub repository
2. Connect to Render.com
3. Set environment variables in Render dashboard:
   - `GEMINI_API_KEY_1`
   - `GEMINI_API_KEY_2` 
   - `YOUTUBE_API_KEY`
   - `PORT=10000`
   - `NODE_ENV=production`

### 2. Frontend Setup (Expo)
1. Update `frontend/app.json` with your backend URL
2. Install dependencies: `cd frontend && npm install`
3. Start development: `npm start`

### 3. Build APK for Uptodown
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Build: `eas build -p android --profile preview`
4. Download APK from Expo dashboard

## Environment Variables
Backend requires these environment variables:
- Gemini API Keys (2)
- YouTube Data API Key
- PORT (default: 10000)
