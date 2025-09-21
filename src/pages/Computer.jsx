
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
    Settings, Edit3, Pin, Plus, Calendar,
    ChevronLeft, ChevronRight, Trash2, Clock, PieChart,
    Code, Database, Monitor, Smartphone, Globe, Briefcase,
    Target, Brain, Lightbulb, BookOpen, Zap, Star,
    Mail, Phone, Map, Bell, Palette, Music, Camera,
    Headphones, Shield, Heart, Home, User, Search,
    Coffee, Dumbbell, Car, Plane, ShoppingBag, Gamepad2
} from "lucide-react";
import { Event } from "@/api/entities";
import { WorkTopic } from "@/api/entities";
import { WorkSubject } from "@/api/entities";
import { DailyNotes } from "@/api/entities";
import { StickyNotes } from "@/api/entities";
import { InvokeLLM } from '@/api/integrations';
import SubjectSettings from '../components/computer/SubjectSettings';
import moment from 'moment';

// הגדרת moment לעברית
moment.updateLocale('he', {
    weekdays: ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'],
    weekdaysShort: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
});

export default function Computer() {
    // State management
    const [currentDate, setCurrentDate] = useState(moment());
    const [workSessions, setWorkSessions] = useState([]);
    const [workTopics, setWorkTopics] = useState([]);
    const [workSubjects, setWorkSubjects] = useState([]);
    const [dailyNotes, setDailyNotes] = useState('');
    const [stickyNotes, setStickyNotes] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [hasLoadedStickyNotes, setHasLoadedStickyNotes] = useState(false);
    
    // Topic management states
    const [isAddingTopic, setIsAddingTopic] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [newTopicSubject, setNewTopicSubject] = useState('');
    const [newTopicStart, setNewTopicStart] = useState('');
    const [newTopicEnd, setNewTopicEnd] = useState('');
    const [editingTopic, setEditingTopic] = useState(null);
    const [isEditingTopic, setIsEditingTopic] = useState(false);

    // Load sticky notes only once when component mounts
    useEffect(() => {
        const loadStickyNotes = async () => {
            if (hasLoadedStickyNotes) return;
            
            try {
                const stickyNotesData = await StickyNotes.list();
                setStickyNotes(stickyNotesData[0]?.content || '');
                setHasLoadedStickyNotes(true);
            } catch (error) {
                console.error('Error loading sticky notes:', error);
            }
        };

        loadStickyNotes();
    }, [hasLoadedStickyNotes]);

    // Load date-specific data when date changes
    useEffect(() => {
        const loadDateSpecificData = async () => {
            const dateStr = currentDate.format('YYYY-MM-DD');
            
            try {
                // Load work subjects only if not already loaded
                if (workSubjects.length === 0) {
                    const subjects = await WorkSubject.list();
                    setWorkSubjects(subjects);
                }

                // Small delay to prevent server overload
                await new Promise(resolve => setTimeout(resolve, 100));

                // Load work events for the day
                const dayEvents = await Event.filter({ date: dateStr });
                const workEvents = dayEvents.filter(event => 
                    event.title?.toLowerCase().includes('מחשב') ||
                    event.title?.toLowerCase().includes('עבודה') ||
                    event.category === 'עבודה'
                );
                setWorkSessions(workEvents);

                await new Promise(resolve => setTimeout(resolve, 100));

                // Load work topics for the day
                const allTopics = await WorkTopic.filter({ date: dateStr });
                setWorkTopics(allTopics);

                await new Promise(resolve => setTimeout(resolve, 100));

                // Load daily notes
                const dailyNotesData = await DailyNotes.filter({ date: dateStr });
                setDailyNotes(dailyNotesData[0]?.content || '');

            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadDateSpecificData();
    }, [currentDate, workSubjects.length]);

    // Save notes when leaving the page
    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log('🔵 handleBeforeUnload triggered');
            const dateStr = currentDate.format('YYYY-MM-DD');
            
            console.log('🔵 Saving on page unload - Daily notes:', `"${dailyNotes}"`, 'Sticky notes:', `"${stickyNotes}"`);
            
            // שמירת הערות יומיות - כולל מחיקה (מחרוזת ריקה)
            DailyNotes.filter({ date: dateStr }).then(existingNotes => {
                if (existingNotes.length > 0) {
                    console.log('🔵 Updating daily notes on unload. Old:', `"${existingNotes[0].content}"`, 'New:', `"${dailyNotes}"`);
                    DailyNotes.update(existingNotes[0].id, { content: dailyNotes });
                } else if (dailyNotes.trim()) {
                    console.log('🔵 Creating daily notes on unload:', `"${dailyNotes}"`);
                    DailyNotes.create({ date: dateStr, content: dailyNotes });
                }
            }).catch(error => {
                console.error('❌ Error saving daily notes on unload:', error);
            });
            
            // שמירת הערות קבועות - כולל מחיקה (מחרוזת ריקה)
            StickyNotes.list().then(existingNotes => {
                if (existingNotes.length > 0) {
                    console.log('🔵 Updating sticky notes on unload. Old:', `"${existingNotes[0].content}"`, 'New:', `"${stickyNotes}"`);
                    StickyNotes.update(existingNotes[0].id, { content: stickyNotes });
                } else if (stickyNotes.trim()) {
                    console.log('🔵 Creating sticky notes on unload:', `"${stickyNotes}"`);
                    StickyNotes.create({ content: stickyNotes });
                }
            }).catch(error => {
                console.error('❌ Error saving sticky notes on unload:', error);
            });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            console.log('🔵 Component unmounting, saving notes...');
            handleBeforeUnload();
        };
    }, [currentDate, dailyNotes, stickyNotes]);

    // Save functions for manual saves (onBlur)
    const saveDailyNotes = async () => {
        console.log('🟡 saveDailyNotes called with content:', `"${dailyNotes}"`);
        
        try {
            const dateStr = currentDate.format('YYYY-MM-DD');
            const existingNotes = await DailyNotes.filter({ date: dateStr });
            console.log('🟡 Existing daily notes found:', existingNotes.length);

            if (existingNotes.length > 0) {
                console.log('🟢 Updating daily notes. Old content:', `"${existingNotes[0].content}"`, 'New content:', `"${dailyNotes}"`);
                await DailyNotes.update(existingNotes[0].id, { content: dailyNotes });
                console.log('✅ Daily notes updated successfully');
            } else {
                if (dailyNotes.trim()) { // יצירה חדשה רק אם יש תוכן
                    console.log('🟢 Creating new daily notes with content:', `"${dailyNotes}"`);
                    await DailyNotes.create({ date: dateStr, content: dailyNotes });
                    console.log('✅ Daily notes created successfully');
                } else {
                    console.log('🟠 No content to create new daily notes with');
                }
            }
        } catch (error) {
            console.error('❌ Error saving daily notes:', error);
        }
    };

    const saveStickyNotes = async () => {
        console.log('🟡 saveStickyNotes called with content:', `"${stickyNotes}"`);
        
        try {
            const existingNotes = await StickyNotes.list();
            console.log('🟡 Existing sticky notes found:', existingNotes.length);

            if (existingNotes.length > 0) {
                console.log('🟢 Updating sticky notes. Old content:', `"${existingNotes[0].content}"`, 'New content:', `"${stickyNotes}"`);
                await StickyNotes.update(existingNotes[0].id, { content: stickyNotes });
                console.log('✅ Sticky notes updated successfully');
            } else {
                if (stickyNotes.trim()) { // יצירה חדשה רק אם יש תוכן
                    console.log('🟢 Creating new sticky notes with content:', `"${stickyNotes}"`);
                    await StickyNotes.create({ content: stickyNotes });
                    console.log('✅ Sticky notes created successfully');
                } else {
                    console.log('🟠 No content to create new sticky notes with');
                }
            }
        } catch (error) {
            console.error('❌ Error saving sticky notes:', error);
        }
    };

    // Topic management functions
    const handleAddTopic = async () => {
        if (!newTopicSubject || !newTopicStart || !newTopicEnd || !selectedSessionId) return;

        const subject = workSubjects.find(s => s.id === newTopicSubject);
        if (!subject) return;

        const dateStr = currentDate.format('YYYY-MM-DD');
        const startDateTime = `${dateStr}T${newTopicStart}:00`;
        const endDateTime = `${dateStr}T${newTopicEnd}:00`;

        try {
            const topicData = {
                date: dateStr,
                start_time: startDateTime,
                end_time: endDateTime,
                topic: subject.name,
                subject_id: newTopicSubject,
                subject_color: subject.color,
                subject_icon: subject.icon,
                duration_minutes: moment(endDateTime).diff(moment(startDateTime), 'minutes'),
                event_id: selectedSessionId
            };

            await WorkTopic.create(topicData);
            
            // Refresh topics
            const allTopics = await WorkTopic.filter({ date: dateStr });
            setWorkTopics(allTopics);
            
            // Reset form
            setNewTopicSubject('');
            setNewTopicStart('');
            setNewTopicEnd('');
            setSelectedSessionId(null);
            setIsAddingTopic(false);
        } catch (error) {
            console.error('Error adding work topic:', error);
        }
    };

    const handleEditTopic = (topic) => {
        setEditingTopic(topic);
        setNewTopicSubject(topic.subject_id);
        setNewTopicStart(moment(topic.start_time).format('HH:mm'));
        setNewTopicEnd(moment(topic.end_time).format('HH:mm'));
        setSelectedSessionId(topic.event_id);
        setIsEditingTopic(true);
    };

    const handleUpdateTopic = async () => {
        if (!editingTopic || !newTopicSubject || !newTopicStart || !newTopicEnd) return;

        const subject = workSubjects.find(s => s.id === newTopicSubject);
        if (!subject) return;

        const dateStr = currentDate.format('YYYY-MM-DD');
        const startDateTime = `${dateStr}T${newTopicStart}:00`;
        const endDateTime = `${dateStr}T${newTopicEnd}:00`;

        try {
            const updatedData = {
                start_time: startDateTime,
                end_time: endDateTime,
                topic: subject.name,
                subject_id: newTopicSubject,
                subject_color: subject.color,
                subject_icon: subject.icon,
                duration_minutes: moment(endDateTime).diff(moment(startDateTime), 'minutes'),
            };

            await WorkTopic.update(editingTopic.id, updatedData);
            
            // Refresh topics
            const allTopics = await WorkTopic.filter({ date: dateStr });
            setWorkTopics(allTopics);
            
            // Reset form
            setEditingTopic(null);
            setNewTopicSubject('');
            setNewTopicStart('');
            setNewTopicEnd('');
            setSelectedSessionId(null);
            setIsEditingTopic(false);
        } catch (error) {
            console.error('Error updating work topic:', error);
        }
    };

    const handleDeleteTopic = async (topicId) => {
        try {
            await WorkTopic.delete(topicId);
            
            // Refresh topics
            const dateStr = currentDate.format('YYYY-MM-DD');
            const allTopics = await WorkTopic.filter({ date: dateStr });
            setWorkTopics(allTopics);
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

    // Utility functions
    const getTopicsForSession = (sessionId) => {
        return workTopics.filter(topic => topic.event_id === sessionId);
    };

    // פונקציה לקבלת קומפוננט אייקון
    const getIconComponent = (iconName) => {
        // אם אין אייקון, החזר ברירת מחדל
        if (!iconName) return Settings;
        
        // מפה של שמות אייקונים לקומפוננטים
        const iconMap = {
            'Code': Code,
            'Database': Database,
            'Monitor': Monitor,
            'Smartphone': Smartphone,
            'Globe': Globe,
            'Briefcase': Briefcase,
            'Target': Target,
            'Brain': Brain,
            'Lightbulb': Lightbulb,
            'BookOpen': BookOpen,
            'Settings': Settings,
            'Zap': Zap,
            'Star': Star,
            'Mail': Mail,
            'Phone': Phone,
            'Calendar': Calendar,
            'Map': Map,
            'Clock': Clock,
            'Bell': Bell,
            'Palette': Palette,
            'Music': Music,
            'Camera': Camera,
            'Headphones': Headphones,
            'Shield': Shield,
            'Heart': Heart,
            'Home': Home,
            'User': User,
            'Search': Search,
            'Coffee': Coffee,
            'Dumbbell': Dumbbell,
            'Car': Car,
            'Plane': Plane,
            'ShoppingBag': ShoppingBag,
            'Gamepad2': Gamepad2
        };
        
        return iconMap[iconName] || Settings;
    };

    const getDailySummary = () => {
        const totalWorkMinutes = workSessions.reduce((sum, session) => {
            return sum + moment(session.end_time).diff(moment(session.start_time), 'minutes');
        }, 0);

        const totalTopicsMinutes = workTopics.reduce((sum, topic) => {
            return sum + (topic.duration_minutes || 0);
        }, 0);

        const undefinedMinutes = Math.max(0, totalWorkMinutes - totalTopicsMinutes);

        const topicsSummary = {};
        workTopics.forEach(topic => {
            const topicName = topic.topic;
            if (!topicsSummary[topicName]) {
                topicsSummary[topicName] = 0;
            }
            topicsSummary[topicName] += topic.duration_minutes || 0;
        });

        return {
            totalWorkMinutes,
            totalTopicsMinutes,
            undefinedMinutes,
            topicsSummary
        };
    };

    const formatMinutes = (minutes) => {
        if (minutes < 0) return '0ד';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}ש${mins > 0 ? ` ${mins}ד` : ''}`;
        }
        return `${mins}ד`;
    };

    const summary = getDailySummary();

    return (
        <div className="min-h-screen bg-white p-4" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                    <h1 className="text-xl sm:text-2xl font-light text-black">במחשב</h1>

                    <div className="flex items-center gap-4">
                        {/* Date Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentDate(moment(currentDate).subtract(1, 'day'))}
                                className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                            </button>

                            <div className="px-3 py-1.5 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-800">
                                    {currentDate.format('dddd DD/MM')}
                                </p>
                            </div>

                            <button
                                onClick={() => setCurrentDate(moment().startOf('day'))}
                                className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                                title="היום"
                            >
                                <Calendar className="w-4 h-4 text-gray-500" />
                            </button>

                            <button
                                onClick={() => setCurrentDate(moment(currentDate).add(1, 'day'))}
                                className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSettingsOpen(true)}
                        >
                            <Settings className="w-5 h-5 text-gray-600" />
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Work Sessions */}
                    <div className="space-y-6">
                        {/* Daily Summary */}
                        {(workSessions.length > 0 || workTopics.length > 0) && (
                            <Card className="border-gray-100 shadow-none">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-right text-lg">
                                        <PieChart className="w-5 h-5" />
                                        סיכום יומי - נושאי עבודה
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-right">
                                    {/* סך הזמן */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>{formatMinutes(summary.totalWorkMinutes)}</span>
                                            <span>סך זמן עבודה מתוכנן</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{width: `${summary.totalWorkMinutes > 0 ? (summary.totalTopicsMinutes / summary.totalWorkMinutes) * 100 : 0}%`}}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>{formatMinutes(summary.totalTopicsMinutes)} מוגדר</span>
                                            {summary.undefinedMinutes > 0 && (
                                                <span className="text-orange-600">{formatMinutes(summary.undefinedMinutes)} לא מוגדר</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* פילוח נושאים */}
                                    {Object.keys(summary.topicsSummary).length > 0 && (
                                        <div className="space-y-3">
                                            {Object.entries(summary.topicsSummary).map(([topicName, minutes]) => {
                                                const percentage = summary.totalTopicsMinutes > 0 ? Math.round((minutes / summary.totalTopicsMinutes) * 100) : 0;
                                                // מצא את הנושא במערך workSubjects כדי לקבל צבע ואייקון
                                                const subjectData = workSubjects.find(s => s.name === topicName) || {};
                                                const IconComponent = getIconComponent(subjectData.icon);
                                                const subjectColor = subjectData.color || '#6b7280';
                                                
                                                return (
                                                    <div key={topicName} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span>{formatMinutes(minutes)}</span>
                                                            <span className="text-gray-500">({percentage}%)</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span>{topicName}</span>
                                                            <div
                                                                className="w-4 h-4 rounded-sm flex items-center justify-center"
                                                                style={{ backgroundColor: `${subjectColor}20` }}
                                                            >
                                                                <IconComponent
                                                                    className="w-3 h-3"
                                                                    style={{ color: subjectColor }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Work Sessions */}
                        {workSessions.length > 0 ? (
                            <div className="space-y-4">
                                {workSessions
                                    .sort((a, b) => moment(a.start_time).diff(moment(b.start_time)))
                                    .map((session) => {
                                        const sessionTopics = getTopicsForSession(session.id);
                                        return (
                                            <Card key={session.id} className="border-gray-100 shadow-none">
                                                <CardHeader className="pb-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <CardTitle className="text-lg">{session.title}</CardTitle>
                                                            <p className="text-sm text-gray-500 font-mono mt-1">
                                                                {moment(session.start_time).format('HH:mm')} - {moment(session.end_time).format('HH:mm')}
                                                                <span className="mr-2">
                                                                    ({moment(session.end_time).diff(moment(session.start_time), 'minutes')} דקות)
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setSelectedSessionId(session.id);
                                                                setIsAddingTopic(true);
                                                            }}
                                                            className="h-8 w-8"
                                                        >
                                                            <Plus className="w-4 h-4 text-gray-500" />
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    {sessionTopics.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {sessionTopics
                                                                .sort((a, b) => moment(a.start_time).diff(moment(b.start_time)))
                                                                .map((topic) => (
                                                                    <div key={topic.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="font-medium">{topic.topic}</span>
                                                                                <span className="text-sm text-gray-500 font-mono">
                                                                                    {moment(topic.start_time).format('HH:mm')} - {moment(topic.end_time).format('HH:mm')}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-1">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => handleEditTopic(topic)}
                                                                                className="h-6 w-6 text-blue-500 hover:text-blue-700"
                                                                            >
                                                                                <Edit3 className="w-3 h-3" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => handleDeleteTopic(topic.id)}
                                                                                className="h-6 w-6 text-red-500 hover:text-red-700"
                                                                            >
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-4 text-gray-500 text-sm">
                                                            אין נושאי עבודה מתועדים לסשן זה
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                            </div>
                        ) : (
                            <Card className="border-gray-100 shadow-none">
                                <CardContent className="pt-6">
                                    <div className="text-center py-8">
                                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 text-base">אין סשני עבודה מתוכננים היום</p>
                                        <p className="text-gray-400 text-sm mt-2">הוסף אירוע עבודה או מחשב ללוח הזמנים</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Notes */}
                    <div className="space-y-6">
                        {/* Daily Notes */}
                        <Card className="border-gray-100 shadow-none">
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
                            <CardContent className="px-4 pb-4 pt-0">
                                <Textarea
                                    value={dailyNotes}
                                    onChange={(e) => {
                                        console.log('🟨 Daily notes changed to:', `"${e.target.value}"`);
                                        setDailyNotes(e.target.value);
                                    }}
                                    onBlur={() => {
                                        console.log('🟨 Daily notes onBlur triggered');
                                        saveDailyNotes();
                                    }}
                                    placeholder="הערות יומיות..."
                                    className="resize-none border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-300 text-sm h-32"
                                />
                            </CardContent>
                        </Card>

                        {/* Sticky Notes */}
                        <Card className="border-gray-100 shadow-none">
                            <CardHeader className="pb-1 px-4 pt-2 flex-shrink-0">
                                <div className="flex justify-center">
                                    <Pin className="w-4 h-4 text-gray-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-1">
                                <Textarea
                                    value={stickyNotes}
                                    onChange={(e) => {
                                        console.log('🟨 Sticky notes changed to:', `"${e.target.value}"`);
                                        setStickyNotes(e.target.value);
                                    }}
                                    onBlur={() => {
                                        console.log('🟨 Sticky notes onBlur triggered');
                                        saveStickyNotes();
                                    }}
                                    placeholder="הערות קבועות..."
                                    className="resize-none border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-300 text-sm h-32"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Add/Edit Topic Dialog */}
            <Dialog open={isAddingTopic || isEditingTopic} onOpenChange={() => {
                setIsAddingTopic(false);
                setIsEditingTopic(false);
                setEditingTopic(null);
                setNewTopicSubject('');
                setNewTopicStart('');
                setNewTopicEnd('');
                setSelectedSessionId(null);
            }}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>{isEditingTopic ? 'ערוך נושא עבודה' : 'הוסף נושא עבודה'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <select 
                            value={newTopicSubject}
                            onChange={(e) => setNewTopicSubject(e.target.value)}
                            className="w-full p-2 border rounded text-right"
                        >
                            <option value="">בחר נושא</option>
                            {workSubjects.map(subject => (
                                <option key={subject.id} value={subject.id}>{subject.name}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <Input
                                type="time"
                                value={newTopicStart}
                                onChange={(e) => setNewTopicStart(e.target.value)}
                                placeholder="התחלה"
                            />
                            <Input
                                type="time"
                                value={newTopicEnd}
                                onChange={(e) => setNewTopicEnd(e.target.value)}
                                placeholder="סיום"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => {
                                setIsAddingTopic(false);
                                setIsEditingTopic(false);
                                setEditingTopic(null);
                                setNewTopicSubject('');
                                setNewTopicStart('');
                                setNewTopicEnd('');
                                setSelectedSessionId(null);
                            }}>ביטול</Button>
                            <Button 
                                onClick={isEditingTopic ? handleUpdateTopic : handleAddTopic}
                                disabled={!newTopicSubject || !newTopicStart || !newTopicEnd}
                            >
                                {isEditingTopic ? 'עדכן' : 'הוסף'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Subject Settings */}
            <SubjectSettings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onSubjectsChange={() => {
                    WorkSubject.list().then(subjects => {
                        setWorkSubjects(subjects);
                    });
                }}
            />
        </div>
    );
}
