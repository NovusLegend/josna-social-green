
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePost = ({ isOpen, onClose }: CreatePostProps) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !userProfile) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        content: content.trim(),
        authorId: userProfile.uid,
        authorUsername: userProfile.username,
        timestamp: serverTimestamp(),
        likes: [],
        comments: [],
      });

      await updateDoc(doc(db, 'users', userProfile.uid), {
        postsCount: increment(1),
      });

      setContent('');
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-green-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-green-400">Create New Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white min-h-32"
            maxLength={500}
          />
          <div className="text-right text-sm text-gray-400">
            {content.length}/500
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!content.trim() || loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
