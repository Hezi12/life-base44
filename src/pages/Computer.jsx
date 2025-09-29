
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

    // Load work subjects only once when component mounts
    useEffect(() => {
        const loadWorkSubjects = async () => {
            if (workSubjects.length === 0) {
                try {
                    const subjects = await WorkSubject.list();
                    setWorkSubjects(subjects);
                } catch (error) {
                    console.error('Error loading work subjects:', error);
                }
            }
        };

        loadWorkSubjects();
    }, []); // Load only once

    // Load date-specific data when date changes
    useEffect(() => {
        const loadDateSpecificData = async () => {
            const dateStr = currentDate.format('YYYY-MM-DD');
            
            try {
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
                console.log('🟡 Loading daily notes for date:', dateStr);
                console.log('🟡 Current date object:', currentDate.format());
                const dailyNotesData = await DailyNotes.filter({ date: dateStr });
                console.log('🟡 Found daily notes:', dailyNotesData.length, 'entries');
                if (dailyNotesData.length > 0) {
                    console.log('🟡 Daily notes content:', `"${dailyNotesData[0].content}"`);
                    console.log('🟡 Daily notes date from DB:', dailyNotesData[0].date);
                }
                setDailyNotes(dailyNotesData[0]?.content || '');
                console.log('🟡 Set daily notes to:', `"${dailyNotesData[0]?.content || ''}"`);

            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadDateSpecificData();
    }, [currentDate]); // Only depend on currentDate

    // Listen for daily notes changes from Dashboard
    useEffect(() => {
        let timeoutId;
        
        const handleDailyNotesChange = (event) => {
            // Only update if not from this page
            if (event.detail && event.detail.source !== 'computer') {
                // Debounce to prevent rapid updates
                clearTimeout(timeoutId);
                timeoutId = setTimeout(async () => {
                    try {
                        const dateStr = currentDate.format('YYYY-MM-DD');
                        const dailyNotesData = await DailyNotes.filter({ date: dateStr });
                        setDailyNotes(dailyNotesData[0]?.content || '');
                    } catch (error) {
                        console.error('Error reloading daily notes:', error);
                    }
                }, 100);
            }
        };

        window.addEventListener('dailyNotesUpdated', handleDailyNotesChange);
        return () => {
            window.removeEventListener('dailyNotesUpdated', handleDailyNotesChange);
            clearTimeout(timeoutId);
        };
    }, [currentDate]);

    // Listen for sticky notes changes from Dashboard
    useEffect(() => {
        let timeoutId;
        
        const handleStickyNotesChange = (event) => {
            // Only update if not from this page
            if (event.detail && event.detail.source !== 'computer') {
                // Debounce to prevent rapid updates
                clearTimeout(timeoutId);
                timeoutId = setTimeout(async () => {
                    try {
                        const stickyNotesData = await StickyNotes.list();
                        setStickyNotes(stickyNotesData[0]?.content || '');
                    } catch (error) {
                        console.error('Error reloading sticky notes:', error);
                    }
                }, 100);
            }
        };

        window.addEventListener('stickyNotesUpdated', handleStickyNotesChange);
        return () => {
            window.removeEventListener('stickyNotesUpdated', handleStickyNotesChange);
            clearTimeout(timeoutId);
        };
    }, []);

    // Save notes when leaving the page
    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log('🔵 handleBeforeUnload triggered');
            const dateStr = currentDate.format('YYYY-MM-DD');
            console.log('🔵 Current date being used for save:', dateStr);
            console.log('🔵 Current date object:', currentDate.format());
            
            console.log('🔵 Saving on page unload - Daily notes:', `"${dailyNotes}"`, 'Sticky notes:', `"${stickyNotes}"`);
            
            // שמירת הערות יומיות - כולל מחיקה (מחרוזת ריקה)
            console.log('🔵 About to save daily notes on unload. Content:', `"${dailyNotes}"`);
            console.log('🔵 Content length:', dailyNotes.length);
            console.log('🔵 Is empty?', dailyNotes === '');
            
            DailyNotes.filter({ date: dateStr }).then(existingNotes => {
                console.log('🔵 Found existing daily notes:', existingNotes.length);
                if (existingNotes.length > 0) {
                    console.log('🔵 Updating daily notes on unload. Old:', `"${existingNotes[0].content}"`, 'New:', `"${dailyNotes}"`);
                    DailyNotes.update(existingNotes[0].id, { content: dailyNotes }).then(() => {
                        console.log('🔵 Daily notes updated on unload successfully');
                        // Verify the update
                        return DailyNotes.filter({ date: dateStr });
                    }).then(verifyNotes => {
                        console.log('🔍 Verification after unload update:', `"${verifyNotes[0]?.content}"`);
                    });
                } else if (dailyNotes.trim()) {
                    console.log('🔵 Creating daily notes on unload:', `"${dailyNotes}"`);
                    DailyNotes.create({ date: dateStr, content: dailyNotes });
                } else {
                    console.log('🔵 No existing notes and no content to create');
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
        console.log('🟡 Content length:', dailyNotes.length);
        console.log('🟡 Content trimmed:', `"${dailyNotes.trim()}"`);
        console.log('🟡 Is empty string?', dailyNotes === '');
        
        try {
            const dateStr = currentDate.format('YYYY-MM-DD');
            console.log('🟡 saveDailyNotes - Current date being used:', dateStr);
            console.log('🟡 saveDailyNotes - Current date object:', currentDate.format());
            const existingNotes = await DailyNotes.filter({ date: dateStr });
            console.log('🟡 Existing daily notes found:', existingNotes.length);

            if (existingNotes.length > 0) {
                console.log('🟢 Updating daily notes. Old content:', `"${existingNotes[0].content}"`, 'New content:', `"${dailyNotes}"`);
                await DailyNotes.update(existingNotes[0].id, { content: dailyNotes });
                console.log('✅ Daily notes updated successfully');
                
                // Verify the update
                const verifyNotes = await DailyNotes.filter({ date: dateStr });
                console.log('🔍 Verification - notes after update:', `"${verifyNotes[0]?.content}"`);
            } else {
                if (dailyNotes.trim()) { // יצירה חדשה רק אם יש תוכן
                    console.log('🟢 Creating new daily notes with content:', `"${dailyNotes}"`);
                    await DailyNotes.create({ date: dateStr, content: dailyNotes });
                    console.log('✅ Daily notes created successfully');
                } else {
                    console.log('🟠 No content to create new daily notes with');
                }
            }
            
            // Notify Dashboard about the change (with source identifier)
            // Only send event if not in the same tab to prevent self-triggering
            if (document.visibilityState === 'visible') {
                window.dispatchEvent(new CustomEvent('dailyNotesUpdated', { 
                    detail: { date: dateStr, content: dailyNotes, source: 'computer' } 
                }));
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
            
            // Notify Dashboard about the change (with source identifier)
            // Only send event if not in the same tab to prevent self-triggering
            if (document.visibilityState === 'visible') {
                window.dispatchEvent(new CustomEvent('stickyNotesUpdated', { 
                    detail: { content: stickyNotes, source: 'computer' } 
                }));
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
        
        // יצירת moment objects מקומיים
        const startMoment = moment(`${dateStr} ${newTopicStart}`, 'YYYY-MM-DD HH:mm');
        const endMoment = moment(`${dateStr} ${newTopicEnd}`, 'YYYY-MM-DD HH:mm');
        
        // המרה לISO string שישמור את הזמן המקומי כ-UTC (כדי לעקוף בעיות timezone)
        // זה אומר שאם הקלט הוא 12:25, נשמור 12:25 כ-UTC
        const startDateTime = moment.utc(`${dateStr} ${newTopicStart}`, 'YYYY-MM-DD HH:mm').toISOString();
        const endDateTime = moment.utc(`${dateStr} ${newTopicEnd}`, 'YYYY-MM-DD HH:mm').toISOString();

        // לוגים מפורטים לדיבוג timezone
        console.log('🔍 === TOPIC CREATION DEBUG (FINAL) ===');
        console.log('📅 Current Date:', currentDate.format('YYYY-MM-DD HH:mm:ss'));
        console.log('⏰ Input Start Time:', newTopicStart);
        console.log('⏰ Input End Time:', newTopicEnd);
        console.log('🕐 Start DateTime to save:', startDateTime);
        console.log('🕐 End DateTime to save:', endDateTime);
        console.log('🌍 Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
        // חישוב duration נכון ב-UTC עם טיפול בחצות
        const startUTC = moment.utc(`${dateStr} ${newTopicStart}`, 'YYYY-MM-DD HH:mm');
        let endUTC = moment.utc(`${dateStr} ${newTopicEnd}`, 'YYYY-MM-DD HH:mm');
        
        // אם זמן הסיום קטן מזמן ההתחלה, זה אומר שעברנו חצות
        if (endUTC.isBefore(startUTC)) {
            endUTC = endUTC.add(1, 'day');
            console.log('🌙 Midnight crossing detected in topic creation!');
            console.log('   Original end time:', moment.utc(`${dateStr} ${newTopicEnd}`, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm'));
            console.log('   Adjusted end time:', endUTC.format('YYYY-MM-DD HH:mm'));
        }
        
        const durationSeconds = endUTC.diff(startUTC, 'seconds');
        const durationMinutes = Math.round(durationSeconds / 60);
        
        console.log('⏱️ Duration calculation (FIXED):');
        console.log('   Start UTC:', startUTC.format('YYYY-MM-DD HH:mm:ss'));
        console.log('   End UTC:', endUTC.format('YYYY-MM-DD HH:mm:ss'));
        console.log('   Duration (seconds):', durationSeconds);
        console.log('   Duration (minutes):', durationMinutes);
        console.log('💡 Strategy: Saving local time AS UTC to avoid timezone issues');

        try {
            const topicData = {
                date: dateStr,
                start_time: startDateTime,
                end_time: endDateTime,
                topic: subject.name,
                subject_id: newTopicSubject,
                subject_color: subject.color,
                subject_icon: subject.icon,
                duration_minutes: durationMinutes,
                event_id: selectedSessionId
            };

            console.log('💾 Topic Data to Save:', topicData);
            await WorkTopic.create(topicData);
            
            // Refresh topics
            const allTopics = await WorkTopic.filter({ date: dateStr });
            setWorkTopics(allTopics);
            
            // הודעה לדף הבית על עדכון נושאי עבודה
            localStorage.setItem('work_topics_updated', Date.now().toString());
            window.dispatchEvent(new CustomEvent('workTopicsUpdated'));
            
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
        // לוגים מפורטים לדיבוג timezone - טעינה לעריכה
        console.log('🔍 === TOPIC EDIT LOADING DEBUG ===');
        console.log('📋 Original Topic Object:', topic);
        console.log('🕐 Original start_time:', topic.start_time);
        console.log('🕐 Original end_time:', topic.end_time);
        console.log('🌍 Moment parsing start_time:', moment(topic.start_time).format('YYYY-MM-DD HH:mm:ss'));
        console.log('🌍 Moment parsing end_time:', moment(topic.end_time).format('YYYY-MM-DD HH:mm:ss'));
        console.log('⏰ OLD Formatted for input start:', moment(topic.start_time).format('HH:mm'));
        console.log('⏰ OLD Formatted for input end:', moment(topic.end_time).format('HH:mm'));
        console.log('⏰ FIXED Formatted for input start:', moment.utc(topic.start_time).format('HH:mm'));
        console.log('⏰ FIXED Formatted for input end:', moment.utc(topic.end_time).format('HH:mm'));
        console.log('🌐 UTC offset:', moment().utcOffset());
        console.log('🌐 Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

        setEditingTopic(topic);
        setNewTopicSubject(topic.subject_id);
        // תיקון: פרסור הזמן כ-UTC (זה בעצם הזמן המקומי שנשמר כUTC)
        setNewTopicStart(moment.utc(topic.start_time).format('HH:mm'));
        setNewTopicEnd(moment.utc(topic.end_time).format('HH:mm'));
        setSelectedSessionId(topic.event_id);
        setIsEditingTopic(true);
    };

    const handleUpdateTopic = async () => {
        if (!editingTopic || !newTopicSubject || !newTopicStart || !newTopicEnd) return;

        const subject = workSubjects.find(s => s.id === newTopicSubject);
        if (!subject) return;

        const dateStr = currentDate.format('YYYY-MM-DD');
        
        // יצירת moment objects מקומיים - עדכון
        const startMoment = moment(`${dateStr} ${newTopicStart}`, 'YYYY-MM-DD HH:mm');
        const endMoment = moment(`${dateStr} ${newTopicEnd}`, 'YYYY-MM-DD HH:mm');
        
        // המרה לISO string שישמור את הזמן המקומי כ-UTC (כדי לעקוף בעיות timezone)
        const startDateTime = moment.utc(`${dateStr} ${newTopicStart}`, 'YYYY-MM-DD HH:mm').toISOString();
        const endDateTime = moment.utc(`${dateStr} ${newTopicEnd}`, 'YYYY-MM-DD HH:mm').toISOString();

        // לוגים מפורטים לדיבוג timezone - עדכון
        console.log('🔍 === TOPIC UPDATE DEBUG (FIXED) ===');
        console.log('📅 Current Date:', currentDate.format('YYYY-MM-DD HH:mm:ss'));
        console.log('⏰ Input Start Time:', newTopicStart);
        console.log('⏰ Input End Time:', newTopicEnd);
        console.log('🕐 Start Moment Object:', startMoment.format('YYYY-MM-DD HH:mm:ss'));
        console.log('🕐 End Moment Object:', endMoment.format('YYYY-MM-DD HH:mm:ss'));
        console.log('🕐 Constructed Start DateTime:', startDateTime);
        console.log('🕐 Constructed End DateTime:', endDateTime);
        console.log('🔄 Original Topic Times:', {
            start: editingTopic.start_time,
            end: editingTopic.end_time,
            startFormatted: moment(editingTopic.start_time).format('YYYY-MM-DD HH:mm:ss'),
            endFormatted: moment(editingTopic.end_time).format('YYYY-MM-DD HH:mm:ss')
        });
        
        // חישוב duration נכון ב-UTC לעדכון עם טיפול בחצות
        const startUTC = moment.utc(`${dateStr} ${newTopicStart}`, 'YYYY-MM-DD HH:mm');
        let endUTC = moment.utc(`${dateStr} ${newTopicEnd}`, 'YYYY-MM-DD HH:mm');
        
        // אם זמן הסיום קטן מזמן ההתחלה, זה אומר שעברנו חצות
        if (endUTC.isBefore(startUTC)) {
            endUTC = endUTC.add(1, 'day');
            console.log('🌙 Midnight crossing detected in topic update!');
            console.log('   Original end time:', moment.utc(`${dateStr} ${newTopicEnd}`, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm'));
            console.log('   Adjusted end time:', endUTC.format('YYYY-MM-DD HH:mm'));
        }
        
        const durationSeconds = endUTC.diff(startUTC, 'seconds');
        const durationMinutes = Math.round(durationSeconds / 60);
        
        console.log('⏱️ Update Duration calculation (FIXED):');
        console.log('   Duration (seconds):', durationSeconds);
        console.log('   Duration (minutes):', durationMinutes);

        try {
            const updatedData = {
                start_time: startDateTime,
                end_time: endDateTime,
                topic: subject.name,
                subject_id: newTopicSubject,
                subject_color: subject.color,
                subject_icon: subject.icon,
                duration_minutes: durationMinutes,
            };

            console.log('💾 Updated Topic Data to Save:', updatedData);
            await WorkTopic.update(editingTopic.id, updatedData);
            
            // Refresh topics
            const allTopics = await WorkTopic.filter({ date: dateStr });
            setWorkTopics(allTopics);
            
            // הודעה לדף הבית על עדכון נושאי עבודה
            localStorage.setItem('work_topics_updated', Date.now().toString());
            window.dispatchEvent(new CustomEvent('workTopicsUpdated'));
            
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
            
            // הודעה לדף הבית על עדכון נושאי עבודה
            localStorage.setItem('work_topics_updated', Date.now().toString());
            window.dispatchEvent(new CustomEvent('workTopicsUpdated'));
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


    return (
        <div className="min-h-screen bg-white p-4 pb-20" dir="rtl" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                    <h1 className="text-xl sm:text-2xl font-light text-black">במחשב</h1>

                    <div className="flex items-center gap-4">
                        {/* Date Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentDate(moment(currentDate).subtract(1, 'day'))}
                                className="p-3 rounded-xl transition-colors hover:bg-gray-100 touch-manipulation"
                                style={{ minWidth: '44px', minHeight: '44px' }}
                            >
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                            </button>

                            <div className="px-4 py-2 bg-gray-50 rounded-xl">
                                <p className="text-sm font-medium text-gray-800">
                                    {currentDate.format('dddd DD/MM')}
                                </p>
                            </div>

                            <button
                                onClick={() => setCurrentDate(moment().startOf('day'))}
                                className="p-3 rounded-xl transition-colors hover:bg-gray-100 touch-manipulation"
                                title="היום"
                                style={{ minWidth: '44px', minHeight: '44px' }}
                            >
                                <Calendar className="w-5 h-5 text-gray-500" />
                            </button>

                            <button
                                onClick={() => setCurrentDate(moment(currentDate).add(1, 'day'))}
                                className="p-3 rounded-xl transition-colors hover:bg-gray-100 touch-manipulation"
                                style={{ minWidth: '44px', minHeight: '44px' }}
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSettingsOpen(true)}
                            className="touch-manipulation"
                            style={{ minWidth: '44px', minHeight: '44px' }}
                        >
                            <Settings className="w-6 h-6 text-gray-600" />
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Right Side - סיכום יומי + Work Sessions */}
                    <div className="space-y-6">
                        {/* Stats */}
                            <Card className="border-gray-100 shadow-none">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-right text-lg">
                                        <PieChart className="w-5 h-5" />
                                    סיכום יומי
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-right">
                                {(() => {
                                    console.log('🔍 === DETAILED SUMMARY DEBUG ===');
                                    
                                    // חישוב סטטיסטיקות עם לוגים מפורטים
                                    console.log('📊 Work Sessions:', workSessions.length);
                                    workSessions.forEach((session, index) => {
                                        console.log(`   Session ${index + 1}:`, session.title);
                                        console.log(`   Start: ${session.start_time}`);
                                        console.log(`   End: ${session.end_time}`);
                                    });
                                    
                                    const totalWorkMinutes = workSessions.reduce((sum, session) => {
                                        const startTimeUTC = moment.utc(session.start_time);
                                        const endTimeUTC = moment.utc(session.end_time);
                                        const durationSeconds = endTimeUTC.diff(startTimeUTC, 'seconds');
                                        const duration = Math.round(durationSeconds / 60);
                                        console.log(`   Duration calculation: ${durationSeconds}s = ${duration} minutes`);
                                        return sum + duration;
                                    }, 0);
                                    
                                    console.log('📊 Total Work Minutes:', totalWorkMinutes);
                                    console.log('📊 Total Work Hours:', Math.floor(totalWorkMinutes / 60), ':', (totalWorkMinutes % 60).toString().padStart(2, '0'));

                                    console.log('📊 Work Topics:', workTopics.length);
                                    workTopics.forEach((topic, index) => {
                                        console.log(`   Topic ${index + 1}:`, topic.topic);
                                        console.log(`   Duration: ${topic.duration_minutes} minutes`);
                                        console.log(`   Start: ${topic.start_time}`);
                                        console.log(`   End: ${topic.end_time}`);
                                    });

                                    const totalTopicsMinutes = workTopics.reduce((sum, topic) => {
                                        let duration = topic.duration_minutes || 0;
                                        
                                        // תיקון נושאים עם duration שלילי (בעיית חצות)
                                        if (duration < 0) {
                                            console.log(`🔧 Fixing negative duration for "${topic.topic}": ${duration} minutes`);
                                            const startUTC = moment.utc(topic.start_time);
                                            const endUTC = moment.utc(topic.end_time);
                                            
                                            // אם זמן הסיום קטן מזמן ההתחלה, הוסף יום
                                            if (endUTC.isBefore(startUTC)) {
                                                const correctedEndUTC = endUTC.add(1, 'day');
                                                const correctedDurationSeconds = correctedEndUTC.diff(startUTC, 'seconds');
                                                duration = Math.round(correctedDurationSeconds / 60);
                                                console.log(`   Corrected duration: ${duration} minutes`);
                                            }
                                        }
                                        
                                        console.log(`   Adding topic "${topic.topic}": ${duration} minutes`);
                                        return sum + duration;
                                    }, 0);
                                    
                                    console.log('📊 Total Topics Minutes:', totalTopicsMinutes);
                                    console.log('📊 Total Topics Hours:', Math.floor(totalTopicsMinutes / 60), ':', (totalTopicsMinutes % 60).toString().padStart(2, '0'));

                                    const topicsSummary = {};
                                    workTopics.forEach(topic => {
                                        const topicName = topic.topic;
                                        let duration = topic.duration_minutes || 0;
                                        
                                        // תיקון נושאים עם duration שלילי (בעיית חצות)
                                        if (duration < 0) {
                                            console.log(`🔧 Fixing negative duration in summary for "${topicName}": ${duration} minutes`);
                                            const startUTC = moment.utc(topic.start_time);
                                            const endUTC = moment.utc(topic.end_time);
                                            
                                            // אם זמן הסיום קטן מזמן ההתחלה, הוסף יום
                                            if (endUTC.isBefore(startUTC)) {
                                                const correctedEndUTC = endUTC.add(1, 'day');
                                                const correctedDurationSeconds = correctedEndUTC.diff(startUTC, 'seconds');
                                                duration = Math.round(correctedDurationSeconds / 60);
                                                console.log(`   Corrected duration in summary: ${duration} minutes`);
                                            }
                                        }
                                        
                                        console.log(`   Processing topic "${topicName}": ${duration} minutes`);
                                        
                                        if (!topicsSummary[topicName]) {
                                            topicsSummary[topicName] = 0;
                                            console.log(`   Initializing "${topicName}" to 0`);
                                        }
                                        topicsSummary[topicName] += duration;
                                        console.log(`   Updated "${topicName}" to: ${topicsSummary[topicName]} minutes`);
                                    });
                                    
                                    console.log('📊 Final Topics Summary:', topicsSummary);
                                    
                                    // חישוב אחוזים עם לוגים
                                    Object.entries(topicsSummary).forEach(([topicName, minutes]) => {
                                        const percentage = totalTopicsMinutes > 0 ? Math.round((minutes / totalTopicsMinutes) * 100) : 0;
                                        const hours = Math.floor(minutes / 60);
                                        const mins = minutes % 60;
                                        const timeString = `${hours}:${mins.toString().padStart(2, '0')}`;
                                        
                                        console.log(`📊 Topic "${topicName}":`);
                                        console.log(`   Minutes: ${minutes}`);
                                        console.log(`   Time String: ${timeString}`);
                                        console.log(`   Percentage: ${percentage}% (${minutes}/${totalTopicsMinutes})`);
                                    });
                                    
                                    console.log('🔚 === END SUMMARY DEBUG ===');

                                    return (
                                        <>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                                    <span>{Math.floor(totalWorkMinutes / 60)}:{(totalWorkMinutes % 60).toString().padStart(2, '0')}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                        style={{width: `${totalWorkMinutes > 0 ? (totalTopicsMinutes / totalWorkMinutes) * 100 : 0}%`}}
                                            ></div>
                                        </div>
                                    </div>

                                            {Object.keys(topicsSummary).length > 0 && (
                                        <div className="space-y-3">
                                                    {Object.entries(topicsSummary).map(([topicName, minutes]) => {
                                                        console.log(`🎨 === RENDERING TOPIC "${topicName}" ===`);
                                                        console.log(`   Raw minutes: ${minutes}`);
                                                        console.log(`   Total topics minutes: ${totalTopicsMinutes}`);
                                                        
                                                        const percentage = totalTopicsMinutes > 0 ? Math.round((minutes / totalTopicsMinutes) * 100) : 0;
                                                        console.log(`   Calculated percentage: ${percentage}%`);
                                                        
                                                        const hours = Math.floor(minutes / 60);
                                                        const mins = minutes % 60;
                                                        const timeString = `${hours}:${mins.toString().padStart(2, '0')}`;
                                                        console.log(`   Time string: ${timeString} (${hours}h ${mins}m)`);
                                                        
                                                const subjectData = workSubjects.find(s => s.name === topicName) || {};
                                                        console.log(`   Subject data:`, subjectData);
                                                        
                                                const IconComponent = getIconComponent(subjectData.icon);
                                                const subjectColor = subjectData.color || '#6b7280';
                                                        console.log(`   Icon: ${subjectData.icon}, Color: ${subjectColor}`);
                                                        
                                                        console.log(`🎨 === END RENDERING TOPIC "${topicName}" ===`);
                                                
                                                return (
                                                    <div key={topicName} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                                    <span>{timeString}</span>
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
                                        </>
                                    );
                                })()}
                                </CardContent>
                            </Card>

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
                                                                {(() => {
                                                                    const displayStart = moment(session.start_time).format('HH:mm');
                                                                    const displayEnd = moment(session.end_time).format('HH:mm');
                                                                    console.log('🔍 === TIME DISPLAY DEBUG ===');
                                                                    console.log('📅 Session:', session.title);
                                                                    console.log('⏰ Displaying as:', `${displayStart} - ${displayEnd}`);
                                                                    return `${displayStart} - ${displayEnd}`;
                                                                })()}
                                                                <span className="mr-2">
                                                                    ({(() => {
                                                                        console.log('🔍 === INDIVIDUAL SESSION DISPLAY DEBUG (FIXED) ===');
                                                                        console.log('📅 Session:', session.title);
                                                                        console.log('🕐 RAW start_time:', session.start_time);
                                                                        console.log('🕐 RAW end_time:', session.end_time);
                                                                        
                                                                        // חישוב נכון על בסיס UTC עם עיגול
                                                                        const startTimeUTC = moment.utc(session.start_time);
                                                                        const endTimeUTC = moment.utc(session.end_time);
                                                                        
                                                                        const durationSeconds = endTimeUTC.diff(startTimeUTC, 'seconds');
                                                                        const duration = Math.round(durationSeconds / 60);
                                                                        
                                                                        console.log('🌍 UTC start:', startTimeUTC.format('YYYY-MM-DD HH:mm:ss'));
                                                                        console.log('🌍 UTC end:', endTimeUTC.format('YYYY-MM-DD HH:mm:ss'));
                                                                        console.log('📊 CORRECT UTC diff (seconds):', durationSeconds);
                                                                        console.log('📊 CORRECT UTC diff (minutes, raw):', durationSeconds / 60);
                                                                        console.log('📊 CORRECT UTC diff (minutes, rounded):', duration);
                                                                        
                                                                        return duration;
                                                                    })()} דקות)
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setSelectedSessionId(session.id);
                                                                
                                                                // ברירות מחדל חכמות - זמני הסשן (טיפול ב-timezone)
                                                                const sessionStart = moment.utc(session.start_time).local().format('HH:mm');
                                                                const sessionEnd = moment.utc(session.end_time).local().format('HH:mm');
                                                                setNewTopicStart(sessionStart);
                                                                setNewTopicEnd(sessionEnd);
                                                                
                                                                console.log('🔍 === SMART DEFAULTS ===');
                                                                console.log('📅 Session:', session.title);
                                                                console.log('⏰ Session Start:', sessionStart);
                                                                console.log('⏰ Session End:', sessionEnd);
                                                                console.log('🎯 Setting as defaults for new topic');
                                                                
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
                                                                                    {(() => {
                                                                                        // תיקון: פרסור הזמן כ-UTC (זה בעצם הזמן המקומי שנשמר כUTC)
                                                                                        const startFormatted = moment.utc(topic.start_time).format('HH:mm');
                                                                                        const endFormatted = moment.utc(topic.end_time).format('HH:mm');
                                                                                        console.log('🔍 === DISPLAY TIME DEBUG (FINAL FIX) ===');
                                                                                        console.log('📋 Topic:', topic.topic);
                                                                                        console.log('🕐 Raw start_time:', topic.start_time);
                                                                                        console.log('🕐 Raw end_time:', topic.end_time);
                                                                                        console.log('🌍 UTC start parsed:', moment.utc(topic.start_time).format('YYYY-MM-DD HH:mm:ss'));
                                                                                        console.log('🌍 UTC end parsed:', moment.utc(topic.end_time).format('YYYY-MM-DD HH:mm:ss'));
                                                                                        console.log('⏰ Final formatted start:', startFormatted);
                                                                                        console.log('⏰ Final formatted end:', endFormatted);
                                                                                        return `${startFormatted} - ${endFormatted}`;
                                                                                    })()}
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

                    {/* Left Side - הערות יומיות + הערות קבועות */}
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
                                        setDailyNotes(e.target.value);
                                    }}
                                    onBlur={() => {
                                        console.log('🟨 Daily notes onBlur triggered');
                                        saveDailyNotes();
                                    }}
                                    placeholder="הערות יומיות..."
                                    className="resize-none border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-300 text-sm h-48"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                    data-form-type="other"
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
                                        setStickyNotes(e.target.value);
                                    }}
                                    onBlur={() => {
                                        console.log('🟨 Sticky notes onBlur triggered');
                                        saveStickyNotes();
                                    }}
                                    placeholder="הערות קבועות..."
                                    className="resize-none border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-300 text-sm h-32"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                    data-form-type="other"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Add/Edit Topic Dialog - Minimalist */}
            <Dialog open={isAddingTopic || isEditingTopic} onOpenChange={() => {
                setIsAddingTopic(false);
                setIsEditingTopic(false);
                setEditingTopic(null);
                setNewTopicSubject('');
                setNewTopicStart('');
                setNewTopicEnd('');
                setSelectedSessionId(null);
            }}>
                <DialogContent className="sm:max-w-lg w-[95vw]" dir="rtl" style={{ marginTop: 'env(safe-area-inset-top)' }}>
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl">{isEditingTopic ? 'ערוך נושא עבודה' : 'הוסף נושא עבודה'}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {/* Single row with all controls */}
                        <div className="flex items-center gap-3">
                            {/* Subject Select */}
                        <select 
                            value={newTopicSubject}
                            onChange={(e) => setNewTopicSubject(e.target.value)}
                                className="flex-1 p-3 border rounded-xl text-right bg-white text-base touch-manipulation"
                        >
                            <option value="">בחר נושא</option>
                            {workSubjects.map(subject => (
                                <option key={subject.id} value={subject.id}>{subject.name}</option>
                            ))}
                        </select>
                            
                            {/* Start Time */}
                            <Input
                                type="time"
                                value={newTopicStart}
                                onChange={(e) => setNewTopicStart(e.target.value)}
                                className="w-28 text-center text-base touch-manipulation"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                data-form-type="other"
                            />
                            
                            {/* Separator */}
                            <span className="text-gray-400 text-lg">—</span>
                            
                            {/* End Time */}
                            <Input
                                type="time"
                                value={newTopicEnd}
                                onChange={(e) => setNewTopicEnd(e.target.value)}
                                className="w-28 text-center text-base touch-manipulation"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                data-form-type="other"
                            />
                            
                            {/* Action Button */}
                            <Button 
                                onClick={isEditingTopic ? handleUpdateTopic : handleAddTopic}
                                disabled={!newTopicSubject || !newTopicStart || !newTopicEnd}
                                size="sm"
                                className="px-6 py-3 text-base touch-manipulation"
                                style={{ minHeight: '44px' }}
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
