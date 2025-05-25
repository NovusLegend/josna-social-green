import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, MessageCircle, Heart, Calendar } from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow, format } from 'date-fns';
import Comments from './Comments';

interface User {
  uid: string;
  username: string;
  email: string;
  bio: string;
  followers: string[];
  following: string[];
  postsCount: number;
}

interface Post {
  id: string;
  content: string;
  authorId: string;
  authorUsername: string;
  timestamp: any;
  likes: string[];
  comments: any[];
  reminder?: {
    date: any;
    title: string;
  };
}

const Discovery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [showComments, setShowComments] = useState<string | null>(null);
  const { userProfile } = useAuth();

  useEffect(() => {
    // Listen to users
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        ...doc.data(),
      })) as User[];
      setUsers(usersData.filter(user => user.uid !== userProfile?.uid));
    });

    // Listen to posts
    const postsQuery = query(collection(db, 'posts'));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsData);
    });

    return () => {
      unsubscribeUsers();
      unsubscribePosts();
    };
  }, [userProfile]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);

      const filteredPostsData = posts.filter(post =>
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.authorUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.reminder?.title && post.reminder.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPosts(filteredPostsData);
    } else {
      setFilteredUsers(users);
      setFilteredPosts(posts);
    }
  }, [searchTerm, users, posts]);

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    if (!userProfile) return;

    const userRef = doc(db, 'users', userId);
    const currentUserRef = doc(db, 'users', userProfile.uid);

    if (isFollowing) {
      await updateDoc(userRef, {
        followers: arrayRemove(userProfile.uid),
      });
      await updateDoc(currentUserRef, {
        following: arrayRemove(userId),
      });
    } else {
      await updateDoc(userRef, {
        followers: arrayUnion(userProfile.uid),
      });
      await updateDoc(currentUserRef, {
        following: arrayUnion(userId),
      });
    }
  };

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

  const startChat = async (userId: string) => {
    if (!userProfile) return;

    await addDoc(collection(db, 'messages'), {
      content: `Hi! I'd like to connect with you.`,
      senderId: userProfile.uid,
      receiverId: userId,
      senderUsername: userProfile.username,
      timestamp: serverTimestamp(),
      participants: [userProfile.uid, userId]
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-black/80 border-green-500/30 backdrop-blur mb-6">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Discovery</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users, posts, or reminders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-600">
          <TabsTrigger value="users" className="text-gray-300 data-[state=active]:text-green-400">
            Users ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="posts" className="text-gray-300 data-[state=active]:text-green-400">
            Posts ({filteredPosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {filteredUsers.map((user) => {
            const isFollowing = Array.isArray(user.followers) && user.followers.includes(userProfile?.uid || '');
            
            return (
              <Card key={user.uid} className="bg-black/80 border-green-500/30 backdrop-blur">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{user.username}</h3>
                        <p className="text-gray-400 text-sm">{user.bio || 'No bio yet'}</p>
                        <p className="text-gray-500 text-xs">
                          {Array.isArray(user.followers) ? user.followers.length : 0} followers • {user.postsCount || 0} posts
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleFollow(user.uid, isFollowing)}
                        variant={isFollowing ? "outline" : "default"}
                        className={isFollowing 
                          ? "border-green-500/30 text-green-400" 
                          : "bg-green-600 hover:bg-green-700"
                        }
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => startChat(user.uid)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No users found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {filteredPosts.map((post) => {
            const isLiked = Array.isArray(post.likes) && post.likes.includes(userProfile?.uid || '');
            const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;
            const commentsCount = Array.isArray(post.comments) ? post.comments.length : 0;

            return (
              <Card key={post.id} className="bg-black/80 border-green-500/30 backdrop-blur">
                <CardHeader className="pb-3">
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
                      onClick={() => setShowComments(post.id)}
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
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No posts found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showComments && (
        <Comments
          postId={showComments}
          onClose={() => setShowComments(null)}
        />
      )}
    </div>
  );
};

export default Discovery;
