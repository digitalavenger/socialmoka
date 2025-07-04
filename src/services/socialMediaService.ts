import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

export interface SocialAccount {
  platform: string;
  accountId: string;
  username: string;
  profilePicture?: string;
  connectedAt: Date;
}

export interface PostData {
  content: string;
  imageUrl?: string;
  platforms: string[];
  scheduledDate?: Date;
}

class SocialMediaService {
  private readonly isDevelopment = import.meta.env.DEV;
  private readonly functionsUrl = this.isDevelopment 
    ? 'http://localhost:5001/your-project-id/us-central1/api'
    : 'https://us-central1-your-project-id.cloudfunctions.net/api';

  // Get user's ID token for authenticated requests
  private async getAuthToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    return await user.getIdToken();
  }

  // Facebook Integration
  async connectFacebook(): Promise<void> {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!appId) {
      throw new Error('Facebook App ID not configured');
    }

    const redirectUri = encodeURIComponent(window.location.origin + '/auth/facebook');
    const scope = 'pages_manage_posts,pages_read_engagement,pages_show_list';
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    // Store current user ID for callback
    localStorage.setItem('pendingAuth', JSON.stringify({
      platform: 'facebook',
      userId: auth.currentUser?.uid
    }));
    
    window.location.href = authUrl;
  }

  // Twitter/X Integration
  async connectTwitter(): Promise<void> {
    const clientId = import.meta.env.VITE_TWITTER_CLIENT_ID;
    if (!clientId) {
      throw new Error('Twitter Client ID not configured');
    }

    const redirectUri = encodeURIComponent(window.location.origin + '/auth/twitter');
    const scope = 'tweet.read tweet.write users.read offline.access';
    
    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=state&code_challenge=challenge&code_challenge_method=plain`;
    
    localStorage.setItem('pendingAuth', JSON.stringify({
      platform: 'twitter',
      userId: auth.currentUser?.uid
    }));
    
    window.location.href = authUrl;
  }

  // Instagram Integration (via Facebook)
  async connectInstagram(): Promise<void> {
    const appId = import.meta.env.VITE_INSTAGRAM_APP_ID || import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!appId) {
      throw new Error('Instagram App ID not configured');
    }

    const redirectUri = encodeURIComponent(window.location.origin + '/auth/instagram');
    const scope = 'instagram_basic,instagram_content_publish';
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    localStorage.setItem('pendingAuth', JSON.stringify({
      platform: 'instagram',
      userId: auth.currentUser?.uid
    }));
    
    window.location.href = authUrl;
  }

  // LinkedIn Integration
  async connectLinkedIn(): Promise<void> {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    if (!clientId) {
      throw new Error('LinkedIn Client ID not configured');
    }

    const redirectUri = encodeURIComponent(window.location.origin + '/auth/linkedin');
    const scope = 'w_member_social';
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    localStorage.setItem('pendingAuth', JSON.stringify({
      platform: 'linkedin',
      userId: auth.currentUser?.uid
    }));
    
    window.location.href = authUrl;
  }

  // Handle OAuth callback (call this from your auth callback pages)
  async handleOAuthCallback(platform: string, code: string): Promise<void> {
    if (this.isDevelopment) {
      // For development, simulate successful connection
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const mockAccount: SocialAccount = {
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        accountId: `mock_${platform}_${Date.now()}`,
        username: `@test_${platform}_user`,
        profilePicture: `https://via.placeholder.com/100?text=${platform[0].toUpperCase()}`,
        connectedAt: new Date()
      };

      // Save to Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const existingAccounts = userDoc.data().connectedAccounts || [];
        const updatedAccounts = [...existingAccounts, mockAccount];
        await updateDoc(userDocRef, { connectedAccounts: updatedAccounts });
      } else {
        await setDoc(userDocRef, { connectedAccounts: [mockAccount] });
      }

      localStorage.removeItem('pendingAuth');
      return;
    }

    // Production OAuth handling
    const token = await this.getAuthToken();
    const user = auth.currentUser;
    
    const response = await fetch(`${this.functionsUrl}/auth/${platform}/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        code,
        userId: user?.uid
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to connect ${platform}`);
    }

    localStorage.removeItem('pendingAuth');
  }

  // Get user's connected accounts (only returns safe data)
  async getConnectedAccounts(): Promise<SocialAccount[]> {
    const user = auth.currentUser;
    if (!user) return [];

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const accounts = userDoc.data().connectedAccounts || [];
      // Return only safe data (no tokens)
      return accounts.map((acc: any) => ({
        platform: acc.platform,
        accountId: acc.accountId,
        username: acc.username,
        profilePicture: acc.profilePicture,
        connectedAt: acc.connectedAt?.toDate ? acc.connectedAt.toDate() : new Date(acc.connectedAt)
      }));
    }
    
    return [];
  }

  // Post to social media platforms
  async publishPost(postData: PostData): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    if (this.isDevelopment) {
      // For development, simulate posting
      console.log('📝 Simulating post publication:', postData);
      
      // Save to published posts collection
      const publishedPostRef = doc(collection(db, 'publishedPosts'));
      await setDoc(publishedPostRef, {
        userId: user.uid,
        content: postData.content,
        imageUrl: postData.imageUrl,
        platforms: postData.platforms,
        publishedAt: new Date(),
        status: 'published',
        results: postData.platforms.map(platform => ({
          platform,
          success: true,
          postId: `mock_${platform}_${Date.now()}`
        }))
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return;
    }

    // Production posting
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.functionsUrl}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      throw new Error('Failed to publish post');
    }

    const result = await response.json();
    
    // Handle partial failures
    const failures = result.results.filter((r: any) => !r.success);
    if (failures.length > 0) {
      console.warn('Some posts failed:', failures);
    }
  }

  // Schedule post for later
  async schedulePost(postData: PostData): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const scheduledPostsRef = doc(collection(db, 'scheduledPosts'));
    
    await setDoc(scheduledPostsRef, {
      userId: user.uid,
      content: postData.content,
      imageUrl: postData.imageUrl,
      platforms: postData.platforms,
      scheduledDate: postData.scheduledDate,
      status: 'scheduled',
      createdAt: new Date()
    });
  }

  // Get scheduled posts
  async getScheduledPosts(): Promise<any[]> {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(
      collection(db, 'scheduledPosts'),
      where('userId', '==', user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledDate: doc.data().scheduledDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  }

  // Get published posts
  async getPublishedPosts(): Promise<any[]> {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(
      collection(db, 'publishedPosts'),
      where('userId', '==', user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      publishedAt: doc.data().publishedAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  }
}

export const socialMediaService = new SocialMediaService();