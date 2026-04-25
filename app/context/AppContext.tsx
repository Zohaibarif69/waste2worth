'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export type UserRole = 'kitchen' | 'ngo' | 'recycler' | 'admin';
export type AISuggestion = 'safe' | 'risky';

export interface LeftoverData {
  foodType: string;
  quantity: number;
  timeSinceCooked: string;
  aiSuggestion: AISuggestion;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  userName: string;
  setUserName: (name: string) => void;
  orgName: string;
  setOrgName: (name: string) => void;
  leftoverData: LeftoverData | null;
  setLeftoverData: (data: LeftoverData | null) => void;
  predictedMeals: number;
  setPredictedMeals: (n: number) => void;
  finalDecision: 'safe' | 'not-safe' | null;
  setFinalDecision: (d: 'safe' | 'not-safe' | null) => void;
  totalPoints: number;
  setTotalPoints: (n: number) => void;
}

const AppContext = createContext<AppContextType>(null!);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [role, setRole] = useState<UserRole>('kitchen');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Zohaib Arif');
  const [orgName, setOrgName] = useState('Green Mess Hall');
  const [leftoverData, setLeftoverData] = useState<LeftoverData | null>(null);
  const [predictedMeals, setPredictedMeals] = useState(120);
  const [finalDecision, setFinalDecision] = useState<'safe' | 'not-safe' | null>(null);
  const [totalPoints, setTotalPoints] = useState(1250);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setRole(session.user.role as UserRole);
      setIsLoggedIn(true);
      if (session.user.name) setUserName(session.user.name);
      if (session.user.organizationName) setOrgName(session.user.organizationName);
    }

    if (status === 'unauthenticated') {
      setIsLoggedIn(false);
    }
  }, [session, status]);

  return (
    <AppContext.Provider value={{
      role, setRole,
      isLoggedIn, setIsLoggedIn,
      userName, setUserName,
      orgName, setOrgName,
      leftoverData, setLeftoverData,
      predictedMeals, setPredictedMeals,
      finalDecision, setFinalDecision,
      totalPoints, setTotalPoints,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
