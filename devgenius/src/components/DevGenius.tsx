"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Activity, Book } from 'lucide-react';
import { useAppContext } from '@/lib/context';
import Dashboard from './Dashboard';
import AICompanion from './AICompanion';

const DevGenius: React.FC = () => {
  const { state } = useAppContext();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">DevGenius: Your All-in-One Developer Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="ai-companion">AI Companion</TabsTrigger>
            <TabsTrigger value="health">Developer Health</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Graph</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>
          
          <TabsContent value="ai-companion">
            <AICompanion />
          </TabsContent>
          
          <TabsContent value="health">
            <Card>
              <CardHeader>
                <CardTitle><Activity className="inline mr-2" />Developer Health Monitor</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Your health stats for today:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Posture: {state.health.posture} - Remember to stand up in 20 minutes</li>
                  <li>Break Time: {state.health.breakTime} minutes taken out of recommended 30 minutes</li>
                  <li>Focus Sessions: {state.health.focusSessions} completed (2 hours of deep work)</li>
                  <li>Stress Level: {state.health.stressLevel} - Consider a short meditation</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="knowledge">
            <Card>
              <CardHeader>
                <CardTitle><Book className="inline mr-2" />Knowledge Graph</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Recent additions to your knowledge graph:</p>
                <ul className="list-disc pl-5 mt-2">
                  {state.knowledgeGraph.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <p className="mt-2">Recommended learning path: Advanced State Management in React</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DevGenius;