"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';
interface AppState {
  user: {
    name: string;
    productivity: number;
    codeQuality: number;
  };
  project: {
    name: string;
    syncStatus: string;
  };
  health: {
    posture: string;
    breakTime: number;
    focusSessions: number;
    stressLevel: string;
  };
  knowledgeGraph: string[];
}

interface AppContextProps {
  state: AppState;
  updateUser: (user: Partial<AppState['user']>) => void;
  updateProject: (project: Partial<AppState['project']>) => void;
  updateHealth: (health: Partial<AppState['health']>) => void;
  addKnowledge: (item: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    user: { name: '', productivity: 0, codeQuality: 0 },
    project: { name: '', syncStatus: '' },
    health: { posture: '', breakTime: 0, focusSessions: 0, stressLevel: '' },
    knowledgeGraph: [],
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [user, project, health, knowledgeGraph] = await Promise.all([
          api.getUser('1'),
          api.getProject('1'),
          api.getHealth('1'),
          api.getKnowledgeGraph('1'),
        ]);

        setState({
          user,
          project,
          health,
          knowledgeGraph: knowledgeGraph.map(item => item.item),
        });
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  const updateUser = async (userData: Partial<AppState['user']>) => {
    try {
      const updatedUser = await api.updateUser('1', userData);
      setState(prevState => ({
        ...prevState,
        user: { ...prevState.user, ...updatedUser },
      }));
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const updateProject = async (projectData: Partial<AppState['project']>) => {
    try {
      const updatedProject = await api.updateProject('1', projectData);
      setState(prevState => ({
        ...prevState,
        project: { ...prevState.project, ...updatedProject },
      }));
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const updateHealth = async (healthData: Partial<AppState['health']>) => {
    try {
      const updatedHealth = await api.updateHealth('1', healthData);
      setState(prevState => ({
        ...prevState,
        health: { ...prevState.health, ...updatedHealth },
      }));
    } catch (error) {
      console.error('Failed to update health:', error);
    }
  };

  const addKnowledge = async (item: string) => {
    try {
      await api.addKnowledgeItem('1', item);
      setState(prevState => ({
        ...prevState,
        knowledgeGraph: [...prevState.knowledgeGraph, item],
      }));
    } catch (error) {
      console.error('Failed to add knowledge item:', error);
    }
  };

  return (
    <AppContext.Provider value={{ state, updateUser, updateProject, updateHealth, addKnowledge }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};