import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { Clock, Edit, Trash2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import 'react-calendar/dist/Calendar.css';

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledDate: Date;
  status: 'scheduled' | 'published' | 'failed';
  image?: string;
}

const Schedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [scheduledPosts] = useState<ScheduledPost[]>([
    {
      id: '1',
      content: 'Exciting news coming tomorrow! Stay tuned for our big announcement 🎉',
      platforms: ['Facebook', 'Twitter', 'LinkedIn'],
      scheduledDate: new Date(2024, 11, 25, 10, 0),
      status: 'scheduled'
    },
    {
      id: '2',
      content: 'Behind the scenes of our latest project. The team has been working hard!',
      platforms: ['Instagram', 'Facebook'],
      scheduledDate: new Date(2024, 11, 25, 14, 30),
      status: 'scheduled',
      image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '3',
      content: 'Thank you to everyone who attended our webinar today! 🙏',
      platforms: ['Twitter', 'LinkedIn'],
      scheduledDate: new Date(2024, 11, 24, 18, 0),
      status: 'published'
    }
  ]);

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => 
      post.scheduledDate.toDateString() === date.toDateString()
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'published':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Facebook':
        return 'bg-blue-600';
      case 'Twitter':
        return 'bg-black';
      case 'Instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'LinkedIn':
        return 'bg-blue-800';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Schedule</h1>
        <p className="text-white/70">Manage your scheduled posts and content calendar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Calendar</h2>
            <div className="calendar-container">
              <Calendar
                value={selectedDate}
                onChange={(date) => setSelectedDate(date as Date)}
                className="react-calendar-dark"
                tileClassName={({ date }) => {
                  const postsForDate = getPostsForDate(date);
                  return postsForDate.length > 0 ? 'has-posts' : '';
                }}
              />
            </div>
            <div className="mt-4 text-white/70 text-sm">
              <p>• Blue dots indicate scheduled posts</p>
              <p>• Click on a date to view posts</p>
            </div>
          </div>
        </div>

        {/* Posts for Selected Date */}
        <div className="lg:col-span-2">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              Posts for {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            
            {getPostsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/70">No posts scheduled for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getPostsForDate(selectedDate).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(post.status)}`}></div>
                        <div>
                          <p className="text-white font-medium">
                            {format(post.scheduledDate, 'h:mm a')}
                          </p>
                          <p className="text-white/60 text-sm capitalize">{post.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-white/60 hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-white/60 hover:text-white transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-300 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      {post.image && (
                        <img
                          src={post.image}
                          alt="Post preview"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-white/90 mb-3">{post.content}</p>
                        <div className="flex items-center space-x-2">
                          {post.platforms.map((platform) => (
                            <span
                              key={platform}
                              className={`px-2 py-1 rounded-full text-xs text-white ${getPlatformColor(platform)}`}
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">12</p>
              <p className="text-white/60 text-sm">Scheduled Posts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">8</p>
              <p className="text-white/60 text-sm">Published Today</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">3</p>
              <p className="text-white/60 text-sm">Drafts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;