
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Messages = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-black/80 border-green-500/30 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-green-400">Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Direct messaging coming soon!</p>
            <p className="text-sm text-gray-500">Connect with other users through private messages.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
