# SocialHub - Social Media Management Platform

A beautiful, production-ready social media management application built with React, TypeScript, and Firebase.

## 🚀 Features

- **Multi-Platform Posting**: Post to Facebook, Twitter, Instagram, and LinkedIn
- **Content Scheduling**: Schedule posts for optimal timing
- **Media Upload**: Support for images with Firebase Storage
- **Real-time Dashboard**: Track your social media performance
- **Secure Authentication**: Firebase Auth with email/password
- **Responsive Design**: Beautiful UI that works on all devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **UI Components**: Lucide React icons, Framer Motion animations
- **Form Handling**: React Hook Form
- **State Management**: React Context API

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- A Firebase project created
- Social media developer accounts (Facebook, Twitter, LinkedIn)

## 🔧 Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo>
cd social-media-manager
npm run setup
```

### 2. Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Enable Storage
5. Get your Firebase config from Project Settings

### 3. Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Social Media API Setup

#### Facebook/Instagram:
1. Go to https://developers.facebook.com
2. Create a new app
3. Add Facebook Login product
4. Set redirect URI: `http://localhost:5173/auth/facebook`
5. Add your App ID to `.env`:
```env
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

#### Twitter:
1. Go to https://developer.twitter.com
2. Create a new project/app
3. Enable OAuth 2.0
4. Set redirect URI: `http://localhost:5173/auth/twitter`
5. Add your Client ID to `.env`:
```env
VITE_TWITTER_CLIENT_ID=your_twitter_client_id
```

#### LinkedIn:
1. Go to https://www.linkedin.com/developers
2. Create a new app
3. Add Sign In with LinkedIn product
4. Set redirect URI: `http://localhost:5173/auth/linkedin`
5. Add your Client ID to `.env`:
```env
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
```

### 5. Firebase Functions Setup (Optional for Development)

```bash
cd functions
npm install
firebase login
firebase use your-project-id
```

Set function environment variables:
```bash
firebase functions:config:set facebook.app_secret="your_secret"
firebase functions:config:set twitter.client_secret="your_secret"
firebase functions:config:set linkedin.client_secret="your_secret"
```

### 6. Start Development

```bash
# Start the frontend
npm run dev

# In another terminal, start Firebase emulators (optional)
npm run firebase:emulators
```

Visit `http://localhost:5173` to see your app!

## 🔒 Security Features

- **API Secrets Protected**: All sensitive keys stored server-side only
- **Token Encryption**: Access tokens encrypted before storage
- **User Authentication**: All API calls require valid Firebase ID token
- **CORS Protection**: Functions only accept requests from your domain
- **Firestore Rules**: Users can only access their own data

## 📱 Development Mode

In development mode, the app simulates social media connections and posting without requiring actual API setup. This allows you to:

- Test the complete user flow
- Develop and style components
- Test Firebase integration
- Prepare for production deployment

## 🚀 Production Deployment

### 1. Deploy Firebase Functions

```bash
cd functions
npm run deploy
```

### 2. Update Production URLs

Update `socialMediaService.ts` with your production function URL.

### 3. Deploy Frontend

```bash
npm run build
firebase deploy
```

### 4. Configure Production OAuth

Update redirect URIs in each platform's developer console to use your production domain.

## 📊 Project Structure

```
src/
├── components/
│   ├── Auth/           # Authentication components
│   ├── CreatePost/     # Post creation interface
│   ├── Dashboard/      # Main dashboard
│   ├── Layout/         # Sidebar, TopBar
│   ├── Schedule/       # Content calendar
│   └── ConnectedAccounts/ # Account management
├── contexts/           # React contexts
├── services/           # API services
└── firebase/           # Firebase configuration

functions/
└── src/
    └── index.ts        # Firebase Functions
```

## 🎨 Customization

The app uses Tailwind CSS for styling. Key design elements:

- **Color Scheme**: Purple to pink gradients
- **Glass Morphism**: Backdrop blur effects
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React icon library

## 🐛 Troubleshooting

### Common Issues:

1. **Firebase Config Error**: Ensure all environment variables are set correctly
2. **OAuth Redirect Error**: Check redirect URIs match exactly in developer consoles
3. **Function Deployment Error**: Ensure Firebase CLI is logged in and project is selected
4. **CORS Error**: Check function CORS configuration

### Development Tips:

- Use browser dev tools to check network requests
- Check Firebase console for authentication and database issues
- Use `console.log` in development mode for debugging
- Test with Firebase emulators for offline development

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review Firebase documentation
- Check social media platform API documentation
- Create an issue in the repository