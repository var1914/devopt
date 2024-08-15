'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AICompanion from './AICompanion';
import { useWebSocket } from '@/hooks/useWebSocket';

const MockIDE: React.FC = () => {
  const [code, setCode] = useState(`function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price, 0);
}

const shoppingCart = [
  { name: 'Book', price: 10 },
  { name: 'Pen', price: 1 },
  { name: 'Notebook', price: 5 }
];

console.log(calculateTotal(shoppingCart));`);

  const [showAICompanion, setShowAICompanion] = useState(false);
  const { sendMessage, lastMessage } = useWebSocket('ws://localhost:3001');

  useEffect(() => {
    // Send initial code to the server
    sendMessage({ type: 'codeUpdate', code });
  }, []);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'analysisResult') {
      console.log('Received analysis:', lastMessage.data);
      // You can update the UI here to show the analysis results
    }
  }, [lastMessage]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    sendMessage({ type: 'codeUpdate', code: newCode });
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Card className="w-full md:w-2/3 mb-4 md:mb-0 md:mr-4">
        <CardHeader>
          <CardTitle>Mock IDE</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full h-64 p-2 font-mono text-sm border rounded"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
          />
          <Button onClick={() => setShowAICompanion(!showAICompanion)} className="mt-4">
            {showAICompanion ? 'Hide AI Companion' : 'Show AI Companion'}
          </Button>
        </CardContent>
      </Card>
      {showAICompanion && (
        <div className="w-full md:w-1/3">
          <AICompanion codeInput={code} />
        </div>
      )}
    </div>
  );
};

export default MockIDE;