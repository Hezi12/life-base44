import './App.css'
import { useState, useEffect } from 'react'
import Pages from "@/pages/index.jsx"
import Login from "@/pages/Login.jsx"
import { Toaster } from "@/components/ui/toaster"
import { User } from '@/api/entities'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // בדיקה אם יש משתני Supabase - trigger Vercel deployment
  const useSupabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (!useSupabase) {
      // אם לא משתמשים ב-Supabase, פשוט מראים את האפליקציה
      console.log('💾 No Supabase config - using localStorage');
      setUser({ id: 'local-user', email: 'local@user.com' });
      setLoading(false);
      return;
    }

    console.log('🔥 Supabase config found - checking authentication');

    // בדיקת משתמש נוכחי
    const checkUser = async () => {
      try {
        const currentUser = await User.getCurrentUser();
        console.log('Current user:', currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // האזנה לשינויים בסטטוס ההתחברות
    if (User.onAuthStateChange) {
      const { data: { subscription } } = User.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user);
        setUser(session?.user || null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, [useSupabase]);

  const handleLogin = (userData) => {
    console.log('Login successful:', userData);
    setUser(userData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">טוען את האפליקציה...</div>
      </div>
    );
  }

  // אם משתמשים ב-Supabase ואין משתמש מחובר - הראה דף התחברות
  if (useSupabase && !user) {
    console.log('🔐 Showing login page');
    return <Login onLogin={handleLogin} />;
  }

  // אחרת - הראה את האפליקציה הרגילה
  console.log('✅ Showing main app');
  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App 