import React from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Posts',
      value: '128',
      change: '+12%',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Total Reach',
      value: '45.2K',
      change: '+8%',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Followers',
      value: '12.8K',
      change: '+15%',
      icon: Users,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Scheduled',
      value: '24',
      change: '+3%',
      icon: Calendar,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const recentPosts = [
    {
      id: 1,
      content: "Just launched our new product! 🚀 Excited to share this with our community.",
      platform: 'LinkedIn',
      time: '2 hours ago',
      engagement: { likes: 142, comments: 23, shares: 8 }
    },
    {
      id: 2,
      content: "Beautiful sunset from today's photo walk 📸",
      platform: 'Instagram',
      time: '5 hours ago',
      engagement: { likes: 89, comments: 12, shares: 3 }
    },
    {
      id: 3,
      content: "Quick tip: Always backup your data before major updates! 💾",
      platform: 'Twitter',
      time: '1 day ago',
      engagement: { likes: 67, comments: 8, shares: 15 }
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/70">Welcome back! Here's what's happening with your social media.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-green-400 text-sm">{stat.change}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6">Recent Posts</h2>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                      <span className="text-white font-medium">{post.platform}</span>
                      <span className="text-white/50 text-sm">{post.time}</span>
                    </div>
                  </div>
                  <p className="text-white/90 mb-3">{post.content}</p>
                  <div className="flex items-center space-x-4 text-white/60">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.engagement.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.engagement.comments}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">{post.engagement.shares}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
                Create New Post
              </button>
              <button className="w-full bg-white/10 text-white py-3 rounded-lg font-medium hover:bg-white/20 transition-all duration-200 border border-white/20">
                Schedule Post
              </button>
              <button className="w-full bg-white/10 text-white py-3 rounded-lg font-medium hover:bg-white/20 transition-all duration-200 border border-white/20">
                View Analytics
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6">Connected Accounts</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                  <span className="text-white">Facebook</span>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-black rounded-full"></div>
                  <span className="text-white">Twitter</span>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  <span className="text-white">Instagram</span>
                </div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-800 rounded-full"></div>
                  <span className="text-white">LinkedIn</span>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;