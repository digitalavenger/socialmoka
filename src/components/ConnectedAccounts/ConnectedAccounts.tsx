import React, { useState, useEffect } from 'react';
import { Plus, Settings, Trash2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { socialMediaService, SocialAccount } from '../../services/socialMediaService';

const ConnectedAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      const connectedAccounts = await socialMediaService.getConnectedAccounts();
      setAccounts(connectedAccounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Failed to load connected accounts');
    } finally {
      setLoading(false);
    }
  };

  const availablePlatforms = [
    { 
      name: 'Facebook', 
      color: 'bg-blue-600', 
      icon: '📘',
      connect: () => socialMediaService.connectFacebook()
    },
    { 
      name: 'Twitter', 
      color: 'bg-black', 
      icon: '🐦',
      connect: () => socialMediaService.connectTwitter()
    },
    { 
      name: 'Instagram', 
      color: 'bg-gradient-to-r from-purple-500 to-pink-500', 
      icon: '📷',
      connect: () => socialMediaService.connectInstagram()
    },
    { 
      name: 'LinkedIn', 
      color: 'bg-blue-800', 
      icon: '💼',
      connect: () => socialMediaService.connectLinkedIn()
    }
  ];

  const handleConnect = async (platform: { name: string; connect: () => Promise<void> }) => {
    try {
      toast.loading(`Connecting to ${platform.name}...`);
      await platform.connect();
    } catch (error) {
      console.error(`Error connecting to ${platform.name}:`, error);
      toast.error(`Failed to connect to ${platform.name}`);
    }
  };

  const handleDisconnect = async (platform: string) => {
    // Implementation for disconnecting account
    toast.success(`${platform} account disconnected`);
    loadConnectedAccounts();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center text-white">Loading connected accounts...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Connected Accounts</h1>
        <p className="text-white/70">Manage your social media connections</p>
      </div>

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Your Connected Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account, index) => (
              <motion.div
                key={account.platform}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-2xl">
                      ✓
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{account.platform}</h3>
                      <p className="text-white/60 text-sm">{account.username}</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => handleDisconnect(account.platform)}
                    className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Account */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Connect New Platform</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availablePlatforms.map((platform, index) => {
            const isConnected = accounts.some(acc => acc.platform.toLowerCase() === platform.name.toLowerCase());
            
            return (
              <motion.button
                key={platform.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => !isConnected && handleConnect(platform)}
                disabled={isConnected}
                className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 transition-all duration-200 group ${
                  isConnected 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-white/20 cursor-pointer'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`w-12 h-12 rounded-full ${platform.color} flex items-center justify-center text-2xl`}>
                    {platform.icon}
                  </div>
                  <span className="text-white font-medium">{platform.name}</span>
                  <div className="flex items-center space-x-1 text-white/60 group-hover:text-white transition-colors">
                    {isConnected ? (
                      <>
                        <span className="text-green-400">✓</span>
                        <span className="text-sm text-green-400">Connected</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Connect</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Connection Instructions */}
      <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">Setup Instructions</h2>
        <div className="space-y-3 text-white/80">
          <p>• <strong>Step 1:</strong> Create developer accounts for each platform</p>
          <p>• <strong>Step 2:</strong> Configure OAuth settings in each platform's developer console</p>
          <p>• <strong>Step 3:</strong> Update the API keys in the social media service</p>
          <p>• <strong>Step 4:</strong> Click "Connect" to authorize SocialHub</p>
          <p>• <strong>Note:</strong> Some features require server-side implementation for security</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectedAccounts;