
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorUsername: string;
  postId: string;
  timestamp: any;
}

interface CommentsProps {
  postId: string;
  onClose: () => void;
}

const Comments = ({ postId, onClose }: CommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const { userProfile } = useAuth();

  useEffect(() => {
    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(commentsData);
    });

    return unsubscribe;
  }, [postId]);

  const addComment = async () => {
    if (!newComment.trim() || !userProfile) return;

    await addDoc(collection(db, 'comments'), {
      content: newComment,
      authorId: userProfile.uid,
      authorUsername: userProfile.username,
      postId,
      timestamp: serverTimestamp(),
    });

    setNewComment('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="bg-black/90 border-green-500/30 backdrop-blur w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-green-400 text-xl font-semibold">Comments</h2>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 max-h-96 mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {comment.authorUsername?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-green-400 font-semibold text-sm">
                      {comment.authorUsername}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {comment.timestamp && formatDistanceToNow(comment.timestamp.toDate(), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-white text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
            
            {comments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addComment()}
              className="bg-gray-800 border-gray-600 text-white"
            />
            <Button
              onClick={addComment}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Comments;
