import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, Calendar, Send, X, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { socialMediaService } from '../../services/socialMediaService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';

interface PostFormData {
  content: string;
  platforms: string[];
  scheduleDate?: string;
}

const CreatePost: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PostFormData>();

  const platforms = [
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
    { id: 'twitter', name: 'Twitter', color: 'bg-black' },
    { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-800' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `posts/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  };

  const onSubmit = async (data: PostFormData) => {
    if (data.platforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    setPosting(true);
    
    try {
      let imageUrl: string | undefined;
      
      // Upload image if selected
      if (selectedImage) {
        setUploading(true);
        toast.loading('Uploading image...');
        imageUrl = await uploadImage(selectedImage);
        toast.dismiss();
        toast.success('Image uploaded successfully');
        setUploading(false);
      }

      const postData = {
        content: data.content,
        imageUrl,
        platforms: data.platforms,
        scheduledDate: data.scheduleDate ? new Date(data.scheduleDate) : undefined
      };

      if (isScheduled && data.scheduleDate) {
        // Schedule the post
        await socialMediaService.schedulePost(postData);
        toast.success('Post scheduled successfully!');
      } else {
        // Publish immediately
        await socialMediaService.publishPost(postData);
        toast.success('Post published successfully!');
      }
      
      // Reset form
      reset();
      setSelectedImage(null);
      setPreviewUrl(null);
      setIsScheduled(false);
      
    } catch (error) {
      console.error('Error posting:', error);
      toast.error('Failed to publish post. Please try again.');
    } finally {
      setPosting(false);
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Post</h1>
        <p className="text-white/70">Share your content across multiple social media platforms</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Content */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Content *
            </label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              rows={6}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none"
              placeholder="What's on your mind? Share your thoughts, updates, or announcements..."
              maxLength={2200}
            />
            {errors.content && (
              <p className="text-red-400 text-sm mt-1">{errors.content.message}</p>
            )}
            <p className="text-white/50 text-xs mt-1">
              Tip: Keep it engaging and authentic. Different platforms have different character limits.
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Media (Optional)
            </label>
            {previewUrl ? (
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-w-md h-64 object-cover rounded-lg border border-white/20"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors group">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-white/60 mx-auto mb-2 group-hover:text-white/80 transition-colors" />
                  <p className="text-white/60 group-hover:text-white/80 transition-colors">
                    Click to upload image
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    Supports JPG, PNG, GIF (max 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Select Platforms *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platforms.map((platform) => (
                <label key={platform.id} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    value={platform.id}
                    {...register('platforms', { required: 'Please select at least one platform' })}
                    className="sr-only peer"
                  />
                  <div className={`w-8 h-8 rounded-full ${platform.color} flex items-center justify-center relative`}>
                    <div className="w-4 h-4 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-white font-medium group-hover:text-white/80 transition-colors">
                    {platform.name}
                  </span>
                </label>
              ))}
            </div>
            {errors.platforms && (
              <p className="text-red-400 text-sm mt-1">{errors.platforms.message}</p>
            )}
          </div>

          {/* Schedule Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="schedule"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              className="w-5 h-5 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500/50"
            />
            <label htmlFor="schedule" className="text-white/80 font-medium">
              Schedule for later
            </label>
          </div>

          {/* Schedule Date */}
          {isScheduled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-white/80 text-sm font-medium mb-2">
                Schedule Date & Time *
              </label>
              <input
                type="datetime-local"
                {...register('scheduleDate', { 
                  required: isScheduled ? 'Schedule date is required' : false,
                  validate: (value) => {
                    if (isScheduled && value) {
                      const selectedDate = new Date(value);
                      const now = new Date();
                      if (selectedDate <= now) {
                        return 'Schedule date must be in the future';
                      }
                    }
                    return true;
                  }
                })}
                min={new Date().toISOString().slice(0, 16)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
              />
              {errors.scheduleDate && (
                <p className="text-red-400 text-sm mt-1">{errors.scheduleDate.message}</p>
              )}
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              disabled={posting || uploading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {posting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{isScheduled ? 'Scheduling...' : 'Publishing...'}</span>
                </>
              ) : isScheduled ? (
                <>
                  <Calendar className="w-5 h-5" />
                  <span>Schedule Post</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Publish Now</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                setSelectedImage(null);
                setPreviewUrl(null);
                setIsScheduled(false);
              }}
              disabled={posting || uploading}
              className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </form>
      </motion.div>

      {/* Tips */}
      <div className="mt-6 bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-medium mb-2">💡 Pro Tips</h3>
        <ul className="text-white/70 text-sm space-y-1">
          <li>• Use hashtags strategically for better reach</li>
          <li>• Post when your audience is most active</li>
          <li>• Include a call-to-action to boost engagement</li>
          <li>• Keep platform-specific character limits in mind</li>
        </ul>
      </div>
    </div>
  );
};

export default CreatePost;