
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Calendar } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow, format } from 'date-fns';

interface Post {
  id: string;
  content: string;
  authorId: string;
  authorUsername: string;
  timestamp: any;
  likes: string[];
  comments: Comment[];
  reminder?: {
    date: any;
    title: string;
  };
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorUsername: string;
  timestamp: any;
}

const PostFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!userProfile) return;

    const postRef = doc(db, 'posts', postId);
    if (isLiked) {
      await updateDoc(postRef, {
        likes: arrayRemove(userProfile.uid),
      });
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(userProfile.uid),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-green-400">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const isLiked = post.likes?.includes(userProfile?.uid || '');
        const likesCount = post.likes?.length || 0;
        const commentsCount = post.comments?.length || 0;

        return (
          <Card key={post.id} className="bg-black/80 border-green-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {post.authorUsername?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-green-400 font-semibold">{post.authorUsername}</h3>
                    <p className="text-gray-400 text-sm">
                      {post.timestamp && formatDistanceToNow(post.timestamp.toDate(), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white mb-4 whitespace-pre-wrap">{post.content}</p>
              
              {post.reminder && (
                <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-semibold text-sm">Reminder</span>
                  </div>
                  <p className="text-white font-medium">{post.reminder.title}</p>
                  <p className="text-gray-300 text-sm">
                    {format(post.reminder.date.toDate(), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
              
              <div className="flex items-center space-x-4 border-t border-gray-700 pt-3">
                <Button
                  variant="ghost"
                  onClick={() => handleLike(post.id, isLiked)}
                  className={`flex items-center space-x-2 ${
                    isLiked ? 'text-red-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likesCount}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-gray-400 hover:text-blue-400"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{commentsCount}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No posts yet. Be the first to post something!</p>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
