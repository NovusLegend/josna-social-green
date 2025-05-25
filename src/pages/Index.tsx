
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Auth from '@/components/Auth';
import Navigation from '@/components/Navigation';
import PostFeed from '@/components/PostFeed';
import Profile from '@/components/Profile';
import Messages from '@/components/Messages';
import Discovery from '@/components/Discovery';
import CreatePost from '@/components/CreatePost';

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showCreatePost, setShowCreatePost] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-black to-blue-900">
        <div className="text-green-400 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'discovery':
        return <Discovery />;
      case 'profile':
        return <Profile />;
      case 'messages':
        return <Messages />;
      default:
        return <PostFeed />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-blue-900">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        setShowCreatePost={setShowCreatePost}
      />
      
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <CreatePost 
        isOpen={showCreatePost} 
        onClose={() => setShowCreatePost(false)} 
      />
    </div>
  );
};

export default Index;
