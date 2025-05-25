
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Profile = () => {
  const { userProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!userProfile) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), {
        bio: bio.trim(),
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setLoading(false);
  };

  if (!userProfile) {
    return <div className="text-center text-gray-400">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-black/80 border-green-500/30 backdrop-blur">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {userProfile.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <CardTitle className="text-green-400 text-xl">{userProfile.username}</CardTitle>
              <p className="text-gray-400">{userProfile.email}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-white font-semibold text-lg">{userProfile.postsCount || 0}</div>
              <div className="text-gray-400 text-sm">Posts</div>
            </div>
            <div>
              <div className="text-white font-semibold text-lg">{userProfile.followers?.length || 0}</div>
              <div className="text-gray-400 text-sm">Followers</div>
            </div>
            <div>
              <div className="text-white font-semibold text-lg">{userProfile.following?.length || 0}</div>
              <div className="text-gray-400 text-sm">Following</div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2">Bio</h3>
            {editing ? (
              <div className="space-y-3">
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="bg-gray-800 border-gray-600 text-white"
                  maxLength={150}
                />
                <div className="text-right text-sm text-gray-400">
                  {bio.length}/150
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setBio(userProfile.bio || '');
                    }}
                    className="border-gray-600 text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-300 mb-3">
                  {userProfile.bio || 'No bio yet. Click edit to add one!'}
                </p>
                <Button
                  onClick={() => setEditing(true)}
                  variant="outline"
                  className="border-green-500/30 text-green-400"
                >
                  Edit Bio
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
