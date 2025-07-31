'use client';

import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/components/Dashboard";
import Login from "@/components/Login";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
}
