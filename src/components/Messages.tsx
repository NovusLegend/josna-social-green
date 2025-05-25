import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, ArrowLeft } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: any;
  senderUsername: string;
}

interface Chat {
  userId: string;
  username: string;
  lastMessage?: string;
  lastMessageTime?: any;
}

const Messages = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { userProfile } = useAuth();

  // Get all chats for current user
  useEffect(() => {
    if (!userProfile) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', userProfile.uid)
    );

    const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
      const chatMap = new Map<string, Chat>();
      
      for (const docSnapshot of snapshot.docs) {
        const message = { id: docSnapshot.id, ...docSnapshot.data() } as Message;
        const otherUserId = message.senderId === userProfile.uid ? message.receiverId : message.senderId;
        
        if (!chatMap.has(otherUserId)) {
          // Get other user's info
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          if (userDoc.exists()) {
            const userData = userDoc.data() as { username: string };
            chatMap.set(otherUserId, {
              userId: otherUserId,
              username: userData.username,
              lastMessage: message.content,
              lastMessageTime: message.timestamp
            });
          }
        } else {
          const existingChat = chatMap.get(otherUserId)!;
          if (!existingChat.lastMessageTime || 
              (message.timestamp && message.timestamp.toMillis() > existingChat.lastMessageTime.toMillis())) {
            existingChat.lastMessage = message.content;
            existingChat.lastMessageTime = message.timestamp;
          }
        }
      }
      
      setChats(Array.from(chatMap.values()));
    });

    return unsubscribe;
  }, [userProfile]);

  // Get messages for selected chat
  useEffect(() => {
    if (!selectedChat || !userProfile) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', userProfile.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Message))
        .filter(message => 
          (message.senderId === userProfile.uid && message.receiverId === selectedChat) ||
          (message.senderId === selectedChat && message.receiverId === userProfile.uid)
        );
      
      setMessages(messagesData);
    });

    return unsubscribe;
  }, [selectedChat, userProfile]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !userProfile) return;

    await addDoc(collection(db, 'messages'), {
      content: newMessage,
      senderId: userProfile.uid,
      receiverId: selectedChat,
      senderUsername: userProfile.username,
      timestamp: serverTimestamp(),
      participants: [userProfile.uid, selectedChat]
    });

    setNewMessage('');
  };

  if (selectedChat) {
    const chatUser = chats.find(chat => chat.userId === selectedChat);
    
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-black/80 border-green-500/30 backdrop-blur h-[600px] flex flex-col">
          <CardHeader className="border-b border-green-500/30">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => setSelectedChat(null)}
                className="text-green-400 hover:text-green-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="text-green-400">{chatUser?.username}</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === userProfile?.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.senderId === userProfile?.uid
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp && formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
          
          <div className="border-t border-green-500/30 p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="bg-gray-800 border-gray-600 text-white"
              />
              <Button
                onClick={sendMessage}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-black/80 border-green-500/30 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-green-400">Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {chats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No conversations yet</p>
              <p className="text-sm text-gray-500">Start a conversation by messaging someone from the Discovery page.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chats.map((chat) => (
                <Card
                  key={chat.userId}
                  className="bg-gray-800/50 border-gray-600 cursor-pointer hover:border-green-500/50 transition-colors"
                  onClick={() => setSelectedChat(chat.userId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{chat.username}</h3>
                        <p className="text-gray-400 text-sm truncate">
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {chat.lastMessageTime && formatDistanceToNow(chat.lastMessageTime.toDate(), { addSuffix: true })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
