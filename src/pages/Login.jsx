import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/api/entities';
import { Eye, EyeOff } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    try {
      let user;
      if (isLogin) {
        user = await User.signIn(email, password);
      } else {
        user = await User.signUp(email, password);
        if (!user) {
          setError('נשלח אימייל אימות. אנא בדוק את התיבת דואר שלך.');
          setLoading(false);
          return;
        }
      }
      
      if (user) {
        onLogin(user);
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (error.message.includes('Invalid login credentials')) {
        setError('אימייל או סיסמה שגויים');
      } else if (error.message.includes('User already registered')) {
        setError('המשתמש כבר קיים במערכת');
      } else {
        setError(error.message || 'שגיאה בהתחברות');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md border-gray-100 shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-light text-gray-800">
            ✨ Life Base44
          </CardTitle>
          <p className="text-gray-500 text-sm mt-2">
            {isLogin ? 'התחבר לחשבון שלך' : 'צור חשבון חדש'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-right"
                dir="ltr"
              />
            </div>
            
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-right pr-10"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !email || !password}
            >
              {loading ? 'טוען...' : (isLogin ? 'התחבר' : 'הירשם')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {isLogin ? 'אין לך חשבון? הירשם כאן' : 'יש לך כבר חשבון? התחבר כאן'}
            </button>
          </div>

          {!isLogin && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>על ידי יצירת חשבון אתה מסכים לתנאי השימוש</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
