import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { InvokeLLM } from '@/api/integrations';
import { FocusSession } from '@/api/entities';
import moment from 'moment';

export default function NewActiveFocusSession() {
    const [content, setContent] = useState('');
    const [sessionNumber, setSessionNumber] = useState(1);
    const [sessionStart, setSessionStart] = useState(null);
    const [nextSessionTime, setNextSessionTime] = useState('');
    const [isFinishing, setIsFinishing] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showAISummary, setShowAISummary] = useState(false);
    const [aiSummary, setAiSummary] = useState('');
    const [aiAffirmation, setAiAffirmation] = useState('');
    const navigate = useNavigate();

    // פונקציה ליצירת זמן ברירת מחדל - 3 שעות קדימה מעוגל ל-5 דקות
    const getDefaultNextTime = () => {
        const now = moment();
        const threeHoursLater = now.add(3, 'hours');
        
        // עיגול ל-5 דקות הקרובות
        const minutes = threeHoursLater.minutes();
        const roundedMinutes = Math.ceil(minutes / 5) * 5;
        
        return threeHoursLater.minutes(roundedMinutes).seconds(0).toDate();
    };

    // אתחול הסשן
    useEffect(() => {
        const initializeSession = async () => {
            const now = new Date();
            setSessionStart(now);
        
        // טען מספר מיקוד אמיתי
        const lastSession = await FocusSession.list('-session_number', 1);
        const nextNumber = lastSession.length > 0 ? lastSession[0].session_number + 1 : 1;
        setSessionNumber(nextNumber);
        
        // קביעת זמן ברירת מחדל למיקוד הבא
        const defaultTime = getDefaultNextTime();
        setNextSessionTime(moment(defaultTime).format('YYYY-MM-DDTHH:mm'));
        };

        initializeSession();
    }, []);

    // טיימר למעקב אחר זמן המיקוד
    useEffect(() => {
        if (!sessionStart) return;

        const timer = setInterval(() => {
            const now = new Date();
            const elapsed = Math.floor((now - sessionStart) / 1000); // בשניות
            setElapsedTime(elapsed);
        }, 1000);

        return () => clearInterval(timer);
    }, [sessionStart]);

    // פורמט זמן לתצוגה
    const formatElapsedTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFinishSession = async () => {
        if (!content.trim()) {
            alert('נא לכתוב משהו במיקוד לפני הסיום');
            return;
        }

        setIsFinishing(true);

        try {
            // קריאה ל-AI מיד
            const summary = await InvokeLLM({
                prompt: `אנא קרא את המיקוד הזה וכתוב ממנו סיכום של 2-3 שורות שיעזור לאדם להבין מה הוא עבר במיקוד הזה. כתוב בעברית:

"${content}"`,
            });

            const affirmation = await InvokeLLM({
                prompt: `על בסיס המיקוד הזה, כתוב משפט אחד מחזק ומעודד בגוף ראשון שמתחיל ב"אני" שיעזור לאדם להחדיר לעצמו מוטיבציה. חשוב שיהיה בגוף ראשון! כתוב בעברית:

"${content}"`,
            });

            setAiSummary(summary);
            setAiAffirmation(affirmation);
            setShowAISummary(true);
        } catch (error) {
            console.error('Error getting AI feedback:', error);
            alert('שגיאה בקבלת משוב מה-AI. נסה שוב.');
        } finally {
            setIsFinishing(false);
        }
    };

    const handleCloseDialog = async () => {
        try {
            // שמירת המיקוד בבסיס הנתונים
            const now = new Date();
            const durationMinutes = Math.floor((now - sessionStart) / (1000 * 60));

            const sessionData = {
                session_number: sessionNumber,
                start_time: sessionStart.toISOString(),
                end_time: now.toISOString(),
                duration_minutes: durationMinutes,
                notes: content,
                next_session_suggestion: nextSessionTime ? new Date(nextSessionTime).toISOString() : null,
                status: 'completed'
            };

            await FocusSession.create(sessionData);
            console.log('Focus session saved:', sessionData);
        } catch (error) {
            console.error('Error saving session:', error);
        }

        setShowAISummary(false);
        navigate(createPageUrl("Focus"));
    };

    return (
        <div className="min-h-screen bg-white flex flex-col" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <Link 
                    to={createPageUrl("Focus")}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="חזרה"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-gray-800">
                        מיקוד #{sessionNumber}
                    </h1>
                    <div className="text-sm text-gray-500">
                        {sessionStart && moment(sessionStart).format('DD/MM/YYYY HH:mm')}
                    </div>
                </div>
                
                {/* Timer */}
                <div className="text-right">
                    <div className="text-lg font-mono text-gray-700">
                        {formatElapsedTime(elapsedTime)}
                    </div>
                </div>
            </div>

            {/* Main Writing Area */}
            <div className="flex-1 p-6">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="כתוב כאן את המחשבות שלך, התכניות, והרפלקציות..."
                    className="w-full h-full min-h-[400px] resize-none border-0 focus:ring-0 text-base leading-relaxed p-4 bg-transparent"
                    style={{ outline: 'none', boxShadow: 'none' }}
                />
            </div>

            {/* Bottom Section - Next Time & Finish Button */}
            <div className="p-6 border-t border-gray-100">
                <div className="flex items-center justify-center gap-4">
                    {/* Next Focus Label & Time */}
                    <div className="flex items-center gap-3">
                        <span className="text-gray-600 font-medium">המיקוד הבא</span>
                        <Input
                            type="datetime-local"
                            value={nextSessionTime}
                            onChange={(e) => setNextSessionTime(e.target.value)}
                            className="w-auto bg-gray-50 border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-sm"
                        />
                    </div>
                    
                    {/* Finish Button - Minimal */}
                    <Button 
                        onClick={handleFinishSession}
                        disabled={!content.trim() || isFinishing}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 w-10 h-10 rounded-full p-0 shadow-sm hover:shadow-md transition-all"
                        title="סיים מיקוד"
                    >
                        {isFinishing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        ) : (
                            <Check className="w-5 h-5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* AI Mentor Summary Dialog */}
            <Dialog open={showAISummary} onOpenChange={handleCloseDialog}>
                <DialogContent className="max-w-lg [&>button]:hidden" dir="rtl">
                    <div className="space-y-6 py-6">
                        {/* AI Summary */}
                        <div className="text-center">
                            <p className="text-gray-700 leading-relaxed text-base">{aiSummary}</p>
                        </div>
                        
                        {/* AI Affirmation */}
                        <div className="text-center border-t border-gray-100 pt-6">
                            <p className="text-gray-800 font-medium text-lg leading-relaxed">“{aiAffirmation}”</p>
                        </div>
                        
                        {/* Next Session Time */}
                        <div className="text-center border-t border-gray-100 pt-6">
                            <div className="text-sm text-gray-500 mb-2">המיקוד הבא</div>
                            <div className="text-lg font-medium text-gray-800">
                                {moment(nextSessionTime).format('DD/MM/YYYY HH:mm')}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
