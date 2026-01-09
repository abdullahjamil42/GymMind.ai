# Google OAuth Setup Guide

## 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
   - Copy the Client ID and Client Secret

## 2. Environment Variables

Add these to your `.env.local` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here
```

Generate a secret key with: `openssl rand -base64 32`

## 3. Features Added

### Authentication Flow
- Users can sign in/up with Google OAuth
- Automatic user creation in MongoDB for new Google users
- Seamless integration with existing credential authentication

### Database Changes
- Added `googleId` field to User schema
- Made `password` field optional for OAuth users
- Updated authentication callbacks to handle Google users

### UI Updates
- Added Google sign-in buttons to login and signup pages
- Consistent styling with existing design
- Proper error handling and loading states

## 4. Usage

Users can now:
1. Click "Continue with Google" on login/signup pages
2. Authorize with their Google account
3. Be automatically redirected to dashboard (existing users) or onboarding (new users)
4. Use the same account across both credential and Google authentication

## 5. Security

- Google OAuth follows industry standard security practices
- User emails are validated through Google's secure authentication
- No passwords stored for OAuth users
- Secure JWT token handling with NextAuth.js