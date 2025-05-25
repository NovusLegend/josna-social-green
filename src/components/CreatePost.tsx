
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePost = ({ isOpen, onClose }: CreatePostProps) => {
  const [content, setContent] = useState('');
  const [reminderDate, setReminderDate] = useState<Date>();
  const [reminderTitle, setReminderTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !userProfile) return;

    setLoading(true);
    try {
      const postData: any = {
        content: content.trim(),
        authorId: userProfile.uid,
        authorUsername: userProfile.username,
        timestamp: serverTimestamp(),
        likes: [],
        comments: [],
      };

      if (reminderDate && reminderTitle.trim()) {
        postData.reminder = {
          date: reminderDate,
          title: reminderTitle.trim(),
        };
      }

      await addDoc(collection(db, 'posts'), postData);

      await updateDoc(doc(db, 'users', userProfile.uid), {
        postsCount: increment(1),
      });

      setContent('');
      setReminderDate(undefined);
      setReminderTitle('');
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

          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Add Date Reminder (Optional)</span>
            </div>
            
            <Input
              placeholder="Reminder title (e.g., John's Birthday)"
              value={reminderTitle}
              onChange={(e) => setReminderTitle(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white mb-2"
              maxLength={50}
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-gray-800 border-gray-600 text-white",
                    !reminderDate && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {reminderDate ? format(reminderDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-black border-green-500/30" align="start">
                <Calendar
                  mode="single"
                  selected={reminderDate}
                  onSelect={setReminderDate}
                  initialFocus
                  className="p-3 pointer-events-auto text-white"
                />
              </PopoverContent>
            </Popover>
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
