import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import * as express from 'express';

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

// Environment variables (set these in Firebase Functions config)
const FACEBOOK_APP_SECRET = functions.config().facebook?.app_secret;
const TWITTER_CLIENT_SECRET = functions.config().twitter?.client_secret;
const LINKEDIN_CLIENT_SECRET = functions.config().linkedin?.client_secret;

// Facebook OAuth callback
app.post('/auth/facebook/callback', async (req, res) => {
  try {
    const { code, userId } = req.body;
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: functions.config().facebook.app_id,
        client_secret: FACEBOOK_APP_SECRET,
        redirect_uri: `${req.headers.origin}/auth/facebook`,
        code: code
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.access_token) {
      // Get user info
      const userResponse = await fetch(`https://graph.facebook.com/me?access_token=${tokenData.access_token}&fields=id,name,picture`);
      const userData = await userResponse.json();
      
      // Save to Firestore (encrypted)
      await admin.firestore().collection('users').doc(userId).set({
        connectedAccounts: admin.firestore.FieldValue.arrayUnion({
          platform: 'Facebook',
          accountId: userData.id,
          username: userData.name,
          profilePicture: userData.picture?.data?.url,
          // Store encrypted token (implement encryption)
          accessToken: encrypt(tokenData.access_token),
          connectedAt: admin.firestore.FieldValue.serverTimestamp()
        })
      }, { merge: true });
      
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Failed to get access token' });
    }
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Twitter OAuth callback
app.post('/auth/twitter/callback', async (req, res) => {
  try {
    const { code, userId } = req.body;
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${functions.config().twitter.client_id}:${TWITTER_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${req.headers.origin}/auth/twitter`,
        code_verifier: 'challenge' // Use proper PKCE in production
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.access_token) {
      // Get user info
      const userResponse = await fetch('https://api.twitter.com/2/users/me', {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      });
      const userData = await userResponse.json();
      
      // Save to Firestore
      await admin.firestore().collection('users').doc(userId).set({
        connectedAccounts: admin.firestore.FieldValue.arrayUnion({
          platform: 'Twitter',
          accountId: userData.data.id,
          username: userData.data.username,
          accessToken: encrypt(tokenData.access_token),
          refreshToken: encrypt(tokenData.refresh_token),
          connectedAt: admin.firestore.FieldValue.serverTimestamp()
        })
      }, { merge: true });
      
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Failed to get access token' });
    }
  } catch (error) {
    console.error('Twitter auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Secure post publishing endpoint
app.post('/publish', async (req, res) => {
  try {
    // Verify user authentication
    const token = req.headers.authorization?.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token!);
    const userId = decodedToken.uid;
    
    const { content, imageUrl, platforms } = req.body;
    
    // Get user's connected accounts
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const connectedAccounts = userDoc.data()?.connectedAccounts || [];
    
    const results = [];
    
    for (const platform of platforms) {
      const account = connectedAccounts.find((acc: any) => 
        acc.platform.toLowerCase() === platform.toLowerCase()
      );
      
      if (!account) {
        results.push({ platform, success: false, error: 'Account not connected' });
        continue;
      }
      
      try {
        const decryptedToken = decrypt(account.accessToken);
        
        switch (platform.toLowerCase()) {
          case 'facebook':
            await postToFacebook(account.accountId, content, imageUrl, decryptedToken);
            break;
          case 'twitter':
            await postToTwitter(content, imageUrl, decryptedToken);
            break;
          case 'linkedin':
            await postToLinkedIn(account.accountId, content, imageUrl, decryptedToken);
            break;
        }
        
        results.push({ platform, success: true });
      } catch (error) {
        results.push({ platform, success: false, error: error.message });
      }
    }
    
    res.json({ results });
  } catch (error) {
    console.error('Publish error:', error);
    res.status(500).json({ error: 'Publishing failed' });
  }
});

// Platform-specific posting functions
async function postToFacebook(pageId: string, content: string, imageUrl: string | undefined, accessToken: string) {
  const url = `https://graph.facebook.com/v18.0/${pageId}/feed`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: content,
      access_token: accessToken,
      ...(imageUrl && { link: imageUrl })
    })
  });
  
  if (!response.ok) {
    throw new Error(`Facebook API error: ${response.statusText}`);
  }
}

async function postToTwitter(content: string, imageUrl: string | undefined, accessToken: string) {
  const url = 'https://api.twitter.com/2/tweets';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: content
      // Add media handling for images
    })
  });
  
  if (!response.ok) {
    throw new Error(`Twitter API error: ${response.statusText}`);
  }
}

async function postToLinkedIn(personId: string, content: string, imageUrl: string | undefined, accessToken: string) {
  const url = 'https://api.linkedin.com/v2/ugcPosts';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify({
      author: `urn:li:person:${personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`LinkedIn API error: ${response.statusText}`);
  }
}

// Simple encryption/decryption (use proper encryption in production)
function encrypt(text: string): string {
  // Implement proper encryption (AES-256)
  return Buffer.from(text).toString('base64');
}

function decrypt(encryptedText: string): string {
  // Implement proper decryption
  return Buffer.from(encryptedText, 'base64').toString();
}

export const api = functions.https.onRequest(app);