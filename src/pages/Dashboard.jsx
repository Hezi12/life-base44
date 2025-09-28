
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Pin } from "lucide-react";
import { Event } from "@/api/entities";
import { WorkTopic } from "@/api/entities";
import { WorkSubject } from "@/api/entities";
import { DailyNotes } from "@/api/entities";
import { StickyNotes } from "@/api/entities";
import { InvokeLLM, SendEmail } from '@/api/integrations';
import { FocusSetting } from '@/api/entities';
import PomodoroTimerAlternative from '../components/dashboard/PomodoroTimerAlternative';
import { useIsMobile } from '@/hooks/use-mobile';
import moment from "moment";

// הגדרת moment לעברית
moment.updateLocale('he', {
    weekdays: ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'],
    weekdaysShort: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
});

export default function Dashboard() {
    const isMobile = useIsMobile();
    const [isLoading, setIsLoading] = useState(true);
    
    // Computer session states (for special mode)
    const [currentComputerSession, setCurrentComputerSession] = useState(null);
    const [workTopics, setWorkTopics] = useState([]);
    const [workSubjects, setWorkSubjects] = useState([]);
    const [dailyNotes, setDailyNotes] = useState('');
    const [stickyNotes, setStickyNotes] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    
    // Add loading states to prevent multiple simultaneous calls for data fetching
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Save functions - optimized to prevent excessive calls
    const saveDailyNotes = useCallback(async (content) => {
        // Prevent saving if content is only whitespace, but allow an empty string to update existing notes
        if (!content.trim() && content !== '') return;
        
        try {
            const dateStr = moment().format('YYYY-MM-DD');
            const existingNotes = await DailyNotes.filter({ date: dateStr });

            if (existingNotes.length > 0) {
                await DailyNotes.update(existingNotes[0].id, { content });
            } else if (content.trim()) { // Only create new notes if there's actual content
                await DailyNotes.create({ date: dateStr, content });
            }
        } catch (error) {
            console.error('Error saving daily notes:', error);
        }
    }, []);

    const saveStickyNotes = useCallback(async (content) => {
        // Prevent saving if content is only whitespace, but allow an empty string to update existing notes
        if (!content.trim() && content !== '') return;
        
        try {
            const existingNotes = await StickyNotes.list();

            if (existingNotes.length > 0) {
                await StickyNotes.update(existingNotes[0].id, { content });
            } else if (content.trim()) { // Only create new notes if there's actual content
                await StickyNotes.create({ content });
            }
        } catch (error) {
            console.error('Error saving sticky notes:', error);
        }
    }, []);

    // Optimized data loading - with rate limiting
    const loadTodayEvents = useCallback(async () => {
        if (isLoadingData) return; // Prevent multiple simultaneous calls
        setIsLoadingData(true);
        
        try {
            const dateStr = moment().format('YYYY-MM-DD');
            
            // Add small delay to prevent server overload between critical API calls
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // טען אירועים של היום והיום הבא (למקרה של סשנים שחוצים חצות)
            const tomorrowStr = moment().add(1, 'day').format('YYYY-MM-DD');
            const todayEvents = await Event.filter({ date: dateStr });
            const tomorrowEvents = await Event.filter({ date: tomorrowStr });
            const events = [...todayEvents, ...tomorrowEvents];
            

            const now = moment();

            // מצא את האירוע הנוכחי
            const current = events.find(event => {
                const eventStart = moment(event.start_time);
                const eventEnd = moment(event.end_time);
                return now.isBetween(eventStart, eventEnd);
            });

            // Check if current event is a "computer session" and find connected sessions
            let computerSession = null;
            if (current) {
                const isComputerSession = current.title?.toLowerCase().includes('מחשב') ||
                                        current.title?.toLowerCase().includes('עבודה') ||
                                        current.category === 'עבודה';
                
                if (isComputerSession) {
                    // מצא אירועי מחשב רצופים
                    const computerEvents = events.filter(event => {
                        const isComputerEvent = event.title?.toLowerCase().includes('מחשב') ||
                                              event.title?.toLowerCase().includes('עבודה') ||
                                              event.category === 'עבודה';
                        return isComputerEvent;
                    }).sort((a, b) => moment(a.start_time).diff(moment(b.start_time)));

                    // מצא רצף של אירועים שמתחיל מהאירוע הנוכחי
                    const connectedSessions = [];
                    let currentEventIndex = computerEvents.findIndex(e => e.id === current.id);
                    
                    if (currentEventIndex !== -1) {
                        // התחל מהאירוע הנוכחי
                        connectedSessions.push(computerEvents[currentEventIndex]);
                        
                        // חפש אירועים רצופים קדימה
                        for (let i = currentEventIndex + 1; i < computerEvents.length; i++) {
                            const prevEvent = computerEvents[i - 1];
                            const currentEvent = computerEvents[i];
                            
                            const prevEnd = moment(prevEvent.end_time);
                            const currentStart = moment(currentEvent.start_time);
                            
                            // אם האירועים מחוברים (הפרש של עד 5 דקות)
                            if (currentStart.diff(prevEnd, 'minutes') <= 5) {
                                connectedSessions.push(currentEvent);
                            } else {
                                break; // הפסק אם יש פער גדול
                            }
                        }
                        
                        // חפש אירועים רצופים אחורה
                        for (let i = currentEventIndex - 1; i >= 0; i--) {
                            const nextEvent = computerEvents[i + 1];
                            const currentEvent = computerEvents[i];
                            
                            const currentEnd = moment(currentEvent.end_time);
                            const nextStart = moment(nextEvent.start_time);
                            
                            // אם האירועים מחוברים (הפרש של עד 5 דקות)
                            if (nextStart.diff(currentEnd, 'minutes') <= 5) {
                                connectedSessions.unshift(currentEvent);
                            } else {
                                break; // הפסק אם יש פער גדול
                            }
                        }
                    }
                    
                    // צור אירוע מחובר אחד
                    if (connectedSessions.length > 0) {
                        const firstSession = connectedSessions[0];
                        const lastSession = connectedSessions[connectedSessions.length - 1];
                        
                        
                        computerSession = {
                            ...firstSession,
                            start_time: firstSession.start_time,
                            end_time: lastSession.end_time,
                            title: `במחשב (${connectedSessions.length} סשנים מחוברים)`,
                            connected_sessions: connectedSessions
                        };
                    } else {
                        computerSession = current;
                    }
                    
                    // Small delay before next API calls
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // Load computer session data only if we have a session
                    const subjects = await WorkSubject.list();
                    setWorkSubjects(subjects);
                    
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    const allTopics = await WorkTopic.filter({ date: dateStr });
                    
                    // אם יש סשנים מחוברים, טען נושאים מכל הסשנים
                    let sessionTopics = [];
                    if (computerSession.connected_sessions) {
                        const connectedSessionIds = computerSession.connected_sessions.map(s => s.id);
                        sessionTopics = allTopics.filter(topic =>
                            connectedSessionIds.includes(topic.event_id)
                        );
                    } else {
                        sessionTopics = allTopics.filter(topic =>
                            topic.event_id === current.id
                        );
                    }
                    
                    // תיקון נושאים עם duration שלילי (בעיית חצות)
                    const correctedTopics = await Promise.all(sessionTopics.map(async (topic) => {
                        if (topic.duration_minutes < 0) {
                            const startUTC = moment.utc(topic.start_time);
                            const endUTC = moment.utc(topic.end_time);
                            
                            // אם זמן הסיום קטן מזמן ההתחלה, הוסף יום
                            if (endUTC.isBefore(startUTC)) {
                                const correctedEndUTC = endUTC.add(1, 'day');
                                const correctedDurationSeconds = correctedEndUTC.diff(startUTC, 'seconds');
                                const correctedDurationMinutes = Math.round(correctedDurationSeconds / 60);
                                
                                // עדכן את הנושא במסד הנתונים
                                const updatedData = {
                                    end_time: correctedEndUTC.toISOString(),
                                    duration_minutes: correctedDurationMinutes
                                };
                                
                                try {
                                    await WorkTopic.update(topic.id, updatedData);
                                    
                                    return {
                                        ...topic,
                                        end_time: correctedEndUTC.toISOString(),
                                        duration_minutes: correctedDurationMinutes
                                    };
                                } catch (error) {
                                    console.error(`Failed to update topic "${topic.topic}":`, error);
                                    return topic;
                                }
                            }
                        }
                        return topic;
                    }));
                    
                    setWorkTopics(correctedTopics);
                    
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // Load daily notes only if current state is empty to avoid overwriting user input
                    if (dailyNotes === '') {
                        const dailyNotesData = await DailyNotes.filter({ date: dateStr });
                        setDailyNotes(dailyNotesData[0]?.content || '');
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // Load sticky notes only if current state is empty to avoid overwriting user input
                    if (stickyNotes === '') {
                        const stickyNotesData = await StickyNotes.list();
                        setStickyNotes(stickyNotesData[0]?.content || '');
                    }
                }
            }

            setCurrentComputerSession(computerSession);
            setIsLoading(false);
        } catch (error) {
            console.error('Error loading today events:', error);
            setIsLoading(false);
        } finally {
            setIsLoadingData(false);
        }
    }, [isLoadingData, dailyNotes, stickyNotes]); // Include notes in dependencies for conditional loading logic

    // Load data on component mount
    useEffect(() => {
        loadTodayEvents();
    }, [loadTodayEvents]); // Depend on loadTodayEvents useCallback to get latest version

    // Listen for work topics changes from Computer page
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'work_topics_updated' && currentComputerSession) {
                loadTodayEvents();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for custom events (same tab)
        const handleCustomEvent = () => {
            if (currentComputerSession) {
                loadTodayEvents();
            }
        };

        window.addEventListener('workTopicsUpdated', handleCustomEvent);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('workTopicsUpdated', handleCustomEvent);
        };
    }, [loadTodayEvents, currentComputerSession]);

    // Reduced interval frequency and added conditions
    useEffect(() => {
        // Much longer interval to reduce server load
        const interval = setInterval(() => {
            // Only reload if we're not already loading to prevent race conditions
            if (!isLoadingData) {
                loadTodayEvents();
            }
        }, 120000); // Changed from 30 seconds to 2 minutes

        return () => clearInterval(interval);
    }, [loadTodayEvents, isLoadingData]); // Depend on loadTodayEvents and isLoadingData

    // מערכת התראות למיקוד מתוזמן
    useEffect(() => {
        const checkFocusNotifications = async () => {
            try {
                // טען הגדרות מיקוד
                const focusSettings = await FocusSetting.list();
                if (focusSettings.length === 0 || !focusSettings[0].notify_on_time) {
                    return; // אין הגדרות או התראות כבויות
                }

                const settings = focusSettings[0];
                const now = moment();
                const today = now.format('dddd'); // יום בשבוע באנגלית
                
                // בדוק אם יש מיקוד מתוזמן היום
                const todaySchedules = settings.schedule.filter(schedule => schedule.day === today);
                
                for (const schedule of todaySchedules) {
                    const scheduledTime = moment(schedule.time, 'HH:mm');
                    const notificationTime = scheduledTime.clone().subtract(settings.notification_minutes_before, 'minutes');
                    
                    // בדוק אם הגיע זמן ההתראה
                    if (now.isSame(notificationTime, 'minute') && now.isSame(notificationTime, 'hour')) {
                        // שלח התראה במייל
                        await SendEmail({
                            to: 'schwartzhezi@gmail.com',
                            subject: `התראה: מיקוד מתוזמן בעוד ${settings.notification_minutes_before} דקות`,
                            body: `שלום!

המיקוד המתוזמן שלך יתחיל בעוד ${settings.notification_minutes_before} דקות (${scheduledTime.format('HH:mm')}).

זמן להתכונן למיקוד!

המערכת שלך`
                        });
                        
                        console.log(`📧 Focus notification sent for ${scheduledTime.format('HH:mm')}`);
                    }
                }
            } catch (error) {
                console.error('Error checking focus notifications:', error);
            }
        };

        // בדוק התראות כל דקה
        const notificationInterval = setInterval(checkFocusNotifications, 60000);
        
        return () => clearInterval(notificationInterval);
    }, []);

    // Save notes when leaving the page - only if there's a computer session
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (currentComputerSession) { // Only save if we're in computer session mode
                saveDailyNotes(dailyNotes);
                saveStickyNotes(stickyNotes);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (currentComputerSession) {
                saveDailyNotes(dailyNotes);
                saveStickyNotes(stickyNotes);
            }
        };
    }, [dailyNotes, stickyNotes, currentComputerSession, saveDailyNotes, saveStickyNotes]);

    const addWorkTopic = async (topicData) => {
        try {
            const newTopic = await WorkTopic.create({
                ...topicData,
                date: moment().format('YYYY-MM-DD'),
                event_id: currentComputerSession?.id
            });
            setWorkTopics([...workTopics, newTopic]);
        } catch (error) {
            console.error('Error adding work topic:', error);
        }
    };

    const updateWorkTopic = async (topicId, updatedData) => {
        try {
            await WorkTopic.update(topicId, updatedData);
            loadTodayEvents(); // Reload to get updated data
        } catch (error) {
            console.error('Error updating work topic:', error);
        }
    };

    const deleteWorkTopic = async (topicId) => {
        try {
            await WorkTopic.delete(topicId);
            setWorkTopics(workTopics.filter(topic => topic.id !== topicId));
        } catch (error) {
            console.error('Error deleting work topic:', error);
        }
    };

    const handleGetMentorFeedback = async () => {
        if (!dailyNotes || dailyNotes.trim().length === 0) {
            alert('נא לכתוב משהו בהערות היומיות כדי לקבל ייעוץ מהמנטור AI');
            return;
        }

        setIsLoadingAI(true);
        try {
            const response = await InvokeLLM({
                prompt: `אתה מנטור AI עבור אדם שעובד על פיתוח אישי ופרודוקטיביות. הנה ההערות היומיות שלו:

"${dailyNotes}"

אנא תן לו ייעוץ קצר וממוקד (2-3 משפטים) על בסיס מה שהוא כתב. התמקד בעידוד, הצעות לשיפור והכוונה. כתב בעברית בטון חם ומעודד.`,
            });

            alert(`🤖 ייעוץ מהמנטור AI:\n\n${response}`);
        } catch (error) {
            console.error('Error getting AI feedback:', error);
            alert('אופס, משהו השתבש בקבלת ייעוץ מהמנטור. נסה שוב מאוחר יותר.');
        } finally {
            setIsLoadingAI(false);
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-white p-4 flex items-center justify-center" dir="rtl">
                <div className="text-gray-500">טוען...</div>
            </div>
        );
    }

    // If there's NO computer session, show completely empty page
    if (!currentComputerSession) {
        return (
            <div className="min-h-screen bg-white" dir="rtl">
            </div>
        );
    }

    // If there IS a computer session, show computer session mode
    return (
        <div className="min-h-screen bg-white p-4" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {isMobile ? (
                    /* Mobile Mode - Only Pomodoro Timer */
                    <div className="flex flex-col items-center justify-center h-[calc(100vh-50px)]">
                        <PomodoroTimerAlternative
                            sessionStart={currentComputerSession.start_time}
                            sessionEnd={currentComputerSession.end_time}
                            workTopics={workTopics}
                            workSubjects={workSubjects}
                            onAddTopic={addWorkTopic}
                            onUpdateTopic={updateWorkTopic}
                            onDeleteTopic={deleteWorkTopic}
                            connectedSessions={currentComputerSession.connected_sessions}
                        />
                    </div>
                ) : (
                    /* Desktop Mode - Full Layout */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-50px)]">
                        {/* Daily Notes Column */}
                        <div className="flex flex-col h-full min-h-0">
                            <Card className="border-gray-100 shadow-none flex-1 min-h-0 flex flex-col">
                                <CardHeader className="pb-2 px-4 pt-3 flex-shrink-0">
                                    <div className="flex justify-between items-center">
                                        <Edit3 className="w-4 h-4 text-gray-600" />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleGetMentorFeedback}
                                            disabled={isLoadingAI}
                                            className="text-xs h-6 px-2"
                                        >
                                            {isLoadingAI ? "טוען..." : "שאל מנטור AI"}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-4 pb-4 pt-0 flex-1 min-h-0 flex flex-col">
                                    <Textarea
                                        value={dailyNotes}
                                        onChange={(e) => setDailyNotes(e.target.value)}
                                        onBlur={() => saveDailyNotes(dailyNotes)}
                                        placeholder="הערות יומיות..."
                                        className="flex-1 resize-none border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-300 text-sm min-h-0"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Pomodoro & Sticky Notes Column */}
                        <div className="flex flex-col gap-4 h-full">
                            {/* Pomodoro Timer */}
                            <div className="flex justify-center py-2">
                                <PomodoroTimerAlternative
                                    sessionStart={currentComputerSession.start_time}
                                    sessionEnd={currentComputerSession.end_time}
                                    workTopics={workTopics}
                                    workSubjects={workSubjects}
                                    onAddTopic={addWorkTopic}
                                    onUpdateTopic={updateWorkTopic}
                                    onDeleteTopic={deleteWorkTopic}
                                    connectedSessions={currentComputerSession.connected_sessions}
                                />
                            </div>

                            {/* Sticky Notes */}
                            <Card className="border-gray-100 shadow-none flex-1 min-h-0">
                                <CardHeader className="pb-1 px-4 pt-2 flex-shrink-0">
                                    <div className="flex justify-center">
                                        <Pin className="w-4 h-4 text-gray-600" />
                                    </div>
                                </CardHeader>
                                <CardContent className="px-4 pb-4 pt-1 flex-1 min-h-0 flex flex-col">
                                    <Textarea
                                        value={stickyNotes}
                                        onChange={(e) => setStickyNotes(e.target.value)}
                                        onBlur={() => saveStickyNotes(stickyNotes)}
                                        placeholder="הערות קבועות..."
                                        className="flex-1 resize-none border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-300 text-sm"
                                        style={{ minHeight: '300px' }}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
