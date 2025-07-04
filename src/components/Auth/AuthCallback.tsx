import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { socialMediaService } from '../../services/socialMediaService';
import toast from 'react-hot-toast';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      
      if (error) {
        toast.error(`Authentication failed: ${error}`);
        navigate('/');
        return;
      }

      if (!code) {
        toast.error('No authorization code received');
        navigate('/');
        return;
      }

      try {
        const pendingAuth = localStorage.getItem('pendingAuth');
        if (!pendingAuth) {
          toast.error('No pending authentication found');
          navigate('/');
          return;
        }

        const { platform } = JSON.parse(pendingAuth);
        
        toast.loading(`Connecting to ${platform}...`);
        await socialMediaService.handleOAuthCallback(platform, code);
        toast.dismiss();
        toast.success(`Successfully connected to ${platform}!`);
        
        navigate('/?tab=accounts');
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Failed to connect account');
        navigate('/');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p>Connecting your account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;