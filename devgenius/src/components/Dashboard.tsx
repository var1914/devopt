"use client";

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Code, Activity, Cloud } from 'lucide-react';
import { useAppContext } from '@/lib/context';
import { useWebSocket } from '@/hooks/useWebSocket';

const productivityData = [
  { name: 'Mon', Coding: 4, Debugging: 2, Meetings: 1, Learning: 1 },
  { name: 'Tue', Coding: 3, Debugging: 3, Meetings: 2, Learning: 0.5 },
  { name: 'Wed', Coding: 5, Debugging: 1, Meetings: 1, Learning: 1.5 },
  { name: 'Thu', Coding: 4, Debugging: 2, Meetings: 2, Learning: 0.5 },
  { name: 'Fri', Coding: 3, Debugging: 1, Meetings: 3, Learning: 1 },
];

const Dashboard: React.FC = () => {
  const { state, updateUser, updateProject } = useAppContext();
  const { lastMessage } = useWebSocket('ws://localhost:3001');

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'dashboardUpdate') {
      const { productivity, codeQuality, projectStatus } = lastMessage.data;
      updateUser({ productivity, codeQuality });
      updateProject({ syncStatus: projectStatus });
    }
  }, [lastMessage, updateUser, updateProject]);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium"><Code className="inline mr-2" />Code Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{state.user.codeQuality}%</p>
            <p className="text-xs text-muted-foreground">Updated in real-time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium"><Activity className="inline mr-2" />Productivity Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{state.user.productivity}%</p>
            <p className="text-xs text-muted-foreground">Updated in real-time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium"><Cloud className="inline mr-2" />Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{state.project.syncStatus}</p>
            <p className="text-xs text-muted-foreground">Updated in real-time</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Weekly Activity Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={productivityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Coding" fill="#8884d8" />
            <Bar dataKey="Debugging" fill="#82ca9d" />
            <Bar dataKey="Meetings" fill="#ffc658" />
            <Bar dataKey="Learning" fill="#ff8042" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;