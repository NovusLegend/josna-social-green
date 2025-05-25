
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, MessageCircle, User, Plus } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setShowCreatePost: (show: boolean) => void;
}

const Navigation = ({ activeTab, setActiveTab, setShowCreatePost }: NavigationProps) => {
  const { logout, userProfile } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur border-b border-green-500/30 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-400">Josna LGZ</h1>
        
        <div className="flex items-center space-x-6">
          <Button
            variant={activeTab === 'home' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('home')}
            className={activeTab === 'home' ? 'bg-green-600 hover:bg-green-700' : 'text-white hover:text-green-400'}
          >
            <Home className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setShowCreatePost(true)}
            className="text-white hover:text-green-400"
          >
            <Plus className="w-5 h-5" />
          </Button>
          
          <Button
            variant={activeTab === 'messages' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('messages')}
            className={activeTab === 'messages' ? 'bg-green-600 hover:bg-green-700' : 'text-white hover:text-green-400'}
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
          
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('profile')}
            className={activeTab === 'profile' ? 'bg-green-600 hover:bg-green-700' : 'text-white hover:text-green-400'}
          >
            <User className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-green-400 text-sm">{userProfile?.username}</span>
            <Button
              variant="outline"
              onClick={logout}
              className="border-green-500/30 text-green-400 hover:bg-green-600 hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
