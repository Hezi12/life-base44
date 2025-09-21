import './App.css'
import React, { useState, useEffect } from 'react'
import Pages from "@/pages/index.jsx"
import Login from "@/pages/Login.jsx"
import { Toaster } from "@/components/ui/toaster"
import { User } from '@/api/entities'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // בדיקה אם יש משתני Supabase
  const useSupabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (!useSupabase) {
      // אם לא משתמשים ב-Supabase, פשוט מראים את האפליקציה
      setUser({ id: 'local-user', email: 'local@user.com' });
      setLoading(false);
      return;
    }

    // בדיקת משתמש נוכחי
    const checkUser = async () => {
      try {
        const currentUser = await User.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // האזנה לשינויים בסטטוס ההתחברות
    const { data: { subscription } } = User.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [useSupabase]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">טוען...</div>
      </div>
    );
  }

  // אם משתמשים ב-Supabase ואין משתמש מחובר - הראה דף התחברות
  if (useSupabase && !user) {
    return <Login onLogin={handleLogin} />;
  }

  // אחרת - הראה את האפליקציה הרגילה
  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App 