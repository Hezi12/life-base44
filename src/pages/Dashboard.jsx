
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
import { InvokeLLM } from '@/api/integrations';
import PomodoroTimerAlternative from '../components/dashboard/PomodoroTimerAlternative';
import moment from "moment";

// הגדרת moment לעברית
moment.updateLocale('he', {
    weekdays: ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'],
    weekdaysShort: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
});

export default function Dashboard() {
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
            
            const events = await Event.filter({ date: dateStr });

            const now = moment();

            const current = events.find(event => {
                const eventStart = moment(event.start_time);
                const eventEnd = moment(event.end_time);
                return now.isBetween(eventStart, eventEnd);
            });

            // Check if current event is a "computer session"
            let computerSession = null;
            if (current) {
                const isComputerSession = current.title?.toLowerCase().includes('מחשב') ||
                                        current.title?.toLowerCase().includes('עבודה') ||
                                        current.category === 'עבודה';
                
                if (isComputerSession) {
                    computerSession = current;
                    
                    // Small delay before next API calls
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // Load computer session data only if we have a session
                    const subjects = await WorkSubject.list();
                    setWorkSubjects(subjects);
                    
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    const allTopics = await WorkTopic.filter({ date: dateStr });
                    const sessionTopics = allTopics.filter(topic =>
                        topic.event_id === current.id
                    );
                    setWorkTopics(sessionTopics);
                    
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
                {/* Computer Session Mode */}
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
            </div>
        </div>
    );
}
