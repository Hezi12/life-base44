
import { useState, useEffect } from 'react';
import { UploadCloud, Trash2, Pencil, Download, Upload } from 'lucide-react'; // Added Pencil for edit icon
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input'; // Added Input for date/time fields
import { Label } from '@/components/ui/label'; // Added Label for form fields
import { FocusSession } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import moment from 'moment';

export default function FocusHistory() {
    const [sessions, setSessions] = useState([]);
    const [importText, setImportText] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    // New states for editing sessions
    const [editingSession, setEditingSession] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editStartTime, setEditStartTime] = useState('');
    const [editNextSessionTime, setEditNextSessionTime] = useState('');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        const data = await FocusSession.list('-session_number');
        console.log('🔍 נתונים שנטענו מהמסד:', data.length, 'מיקודים');
        if (data.length > 0) {
            console.log('📋 דוגמה של מיקוד ראשון:', {
                id: data[0].id,
                session_number: data[0].session_number,
                notes: data[0].notes?.substring(0, 50) + '...',
                content: data[0].content?.substring(0, 50) + '...',
                hasNotes: !!data[0].notes,
                hasContent: !!data[0].content
            });
        }
        
        // מיפוי חזרה מ-notes ל-content כדי שהתצוגה תעבוד
        const mappedData = data.map(session => ({
            ...session,
            content: session.notes || session.content // תמיכה בשני השדות
        }));
        console.log('✅ מיפוי הושלם, מיקודים עם תוכן:', mappedData.filter(s => s.content).length);
        setSessions(mappedData);
    };

    // פונקציה לבדיקה אם המיקוד התחיל בזמן
    const getTimingStatus = (currentSession) => {
        // מצא את המיקוד הקודם
        // Note: sessions array is sorted by -session_number, so find will correctly locate the previous session.
        const previousSession = sessions.find(s => s.session_number === currentSession.session_number - 1);
        
        if (!previousSession || !previousSession.next_session_suggestion) {
            return null; // אין מיקוד קודם או לא היה זמן מתוכנן
        }

        const plannedTime = moment(previousSession.next_session_suggestion);
        const actualTime = moment(currentSession.start_time);
        const diffMinutes = actualTime.diff(plannedTime, 'minutes');

        // עד 10 דקות אחרי = וי, יותר מ-10 דקות = איקס
        if (diffMinutes <= 10) {
            return { status: 'success', icon: '✓', color: 'text-green-600' };
        } else {
            return { status: 'late', icon: '✗', color: 'text-red-600' };
        }
    };

    const handleEditSession = (session) => {
        setEditingSession(session);
        setEditContent(session.content);
        // Format for datetime-local input - התאמה לזמן מקומי
        setEditStartTime(moment(session.start_time).utcOffset('+03:00').format('YYYY-MM-DDTHH:mm'));
        setEditNextSessionTime(session.next_session_suggestion ? moment(session.next_session_suggestion).utcOffset('+03:00').format('YYYY-MM-DDTHH:mm') : '');
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingSession) return;

        try {
            const updatedData = {
                notes: editContent, // תיקון: content -> notes כדי להתאים לסכמת המסד
                // המרת זמן מקומי ל-UTC לשמירה במסד
                start_time: moment(editStartTime).utcOffset('+03:00').utc().toISOString(), 
                next_session_suggestion: editNextSessionTime ? moment(editNextSessionTime).utcOffset('+03:00').utc().toISOString() : null
            };

            console.log('🔧 מעדכן מיקוד:', updatedData);
            await FocusSession.update(editingSession.id, updatedData);
            await loadSessions(); // Reload sessions to reflect changes
            setIsEditDialogOpen(false);
            setEditingSession(null);
            alert('המיקוד עודכן בהצלחה!');
        } catch (error) {
            console.error('Error updating session:', error);
            alert('שגיאה בעדכון המיקוד. אנא נסה שוב מאוחר יותר.');
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('האם אתה בטוח שברצונך למחוק את כל היסטוריית המיקודים? פעולה זו לא ניתנת לביטול.')) {
            return;
        }

        setIsDeletingAll(true);
        
        try {
            for (const session of sessions) {
                await FocusSession.delete(session.id);
            }
            setSessions([]);
            alert('כל היסטוריית המיקודים נמחקה בהצלחה!');
        } catch (error) {
            console.error('Error deleting all sessions:', error);
            alert('שגיאה במחיקת ההיסטוריה. אנא נסה שוב מאוחר יותר.');
        } finally {
            setIsDeletingAll(false);
        }
    };

    const handleDeleteSession = async (sessionId) => {
        if (!confirm('האם אתה בטוח שברצונך למחוק את המיקוד הזה? פעולה זו לא ניתנת לביטול.')) {
            return;
        }

        try {
            await FocusSession.delete(sessionId);
            setSessions(sessions.filter(s => s.id !== sessionId));
        } catch (error) {
            console.error('Error deleting session:', error);
            alert('שגיאה במחיקת המיקוד. אנא נסה שוב מאוחר יותר.');
        }
    };

    const handleImport = async () => {
        console.log('🔄 התחלת תהליך ייבוא טקסט');
        console.log('📝 טקסט לייבוא (אורך:', importText.length, 'תווים):');
        console.log('📄 תחילת הטקסט:', importText.substring(0, 200));
        
        setIsImporting(true);
        
        try {
            const prompt = `Parse the following Hebrew text which contains multiple focus sessions. Each session follows this format:
"מיקוד [number] – [date] | [time]
[content]
→ המיקוד הבא [next_time]"

IMPORTANT PARSING RULES:
1. Extract session_number as integer from "מיקוד [number]"
2. Extract date in DD/MM/YYYY format and time in HH:mm format separately
3. For next_session_suggestion time: extract only the HH:mm format
4. The content is everything between the header line and the "המיקוד הבא" line, without extra spaces
5. Return dates and times as separate fields, NOT as ISO strings

Text to parse:

${importText}`;

            const promptWithFormat = `${prompt}

אנא החזר את התגובה בפורמט JSON בלבד, ללא טקסט נוסף:
{
  "sessions": [
    {
      "session_number": 1,
      "date": "DD/MM/YYYY",
      "time": "HH:mm",
      "content": "תוכן המיקוד...",
      "next_session_time": "HH:mm"
    }
  ]
}`;

            console.log('🤖 שולח בקשה ל-Claude AI...');
            const aiResponse = await InvokeLLM({
                prompt: promptWithFormat
            });
            
            console.log('✅ התקבלה תגובה מ-Claude AI');
            console.log('📋 תגובת AI (200 תווים ראשונים):', aiResponse.substring(0, 200));

            // נסה לפרס את התגובה כ-JSON
            let parsedResult;
            try {
                console.log('🔍 מנסה לפרסר את התגובה כ-JSON...');
                parsedResult = JSON.parse(aiResponse);
                console.log('✅ JSON פורסר בהצלחה');
                console.log('📊 מבנה התגובה:', Object.keys(parsedResult));
            } catch (error) {
                console.error('❌ שגיאה בפירסור JSON:', error);
                console.error('📋 התגובה שגרמה לשגיאה:', aiResponse);
                throw new Error(`AI לא החזיר פורמט JSON תקין: ${error.message}`);
            }

            if (parsedResult && parsedResult.sessions && Array.isArray(parsedResult.sessions)) {
                console.log(`📈 נמצאו ${parsedResult.sessions.length} מיקודים לעיבוד`);
                
                // עיבוד הנתונים והמרה לפורמט מקומי
                const processedSessions = parsedResult.sessions.map((session, index) => {
                    console.log(`🔄 מעבד מיקוד ${index + 1}:`, session);
                    
                    // המרת תאריך מ DD/MM/YYYY ל YYYY-MM-DD
                    const [day, month, year] = session.date.split('/');
                    const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    
                    // יצירת זמן התחלה מקומי
                    const startDateTime = `${dateStr}T${session.time}:00`;
                    console.log(`⏰ זמן התחלה: ${startDateTime}`);
                    
                    // יצירת זמן מיקוד הבא אם קיים
                    let nextSessionDateTime = null;
                    if (session.next_session_time) {
                        const nextTime = session.next_session_time;
                        const sessionTimeMinutes = parseInt(session.time.split(':')[0]) * 60 + parseInt(session.time.split(':')[1]);
                        const nextTimeMinutes = parseInt(nextTime.split(':')[0]) * 60 + parseInt(nextTime.split(':')[1]);
                        
                        // אם הזמן הבא קטן מהזמן הנוכחי, זה כנראה ביום הבא
                        if (nextTimeMinutes <= sessionTimeMinutes) {
                            const nextDay = new Date(dateStr);
                            nextDay.setDate(nextDay.getDate() + 1);
                            const nextDateStr = nextDay.toISOString().split('T')[0];
                            nextSessionDateTime = `${nextDateStr}T${nextTime}:00`;
                        } else {
                            nextSessionDateTime = `${dateStr}T${nextTime}:00`;
                        }
                        console.log(`⏭️ זמן המיקוד הבא: ${nextSessionDateTime}`);
                    }

                    const processedSession = {
                        session_number: session.session_number,
                        start_time: startDateTime,
                        end_time: startDateTime, // נעדכן מאוחר יותר אם צריך
                        notes: session.content.trim(), // תיקון: content -> notes כדי להתאים לסכמת המסד
                        next_session_suggestion: nextSessionDateTime,
                        status: 'completed' // ברירת מחדל
                    };
                    
                    console.log(`✅ מיקוד ${index + 1} עובד בהצלחה:`, processedSession);
                    return processedSession;
                });

                console.log('💾 שומר את כל המיקודים במסד הנתונים...');
                await FocusSession.bulkCreate(processedSessions);
                
                console.log('🔄 מרענן את רשימת המיקודים...');
                loadSessions();
                setImportText('');
                setIsImportDialogOpen(false);
                
                console.log('🎉 ייבוא הושלם בהצלחה!');
                alert('המיקודים יובאו בהצלחה!');
            } else {
                console.error('❌ מבנה התגובה לא תקין:', parsedResult);
                alert('לא ניתן לפרסר את הטקסט. אנא ודא שהפורמט תקין.');
            }
        } catch (error) {
            console.error('💥 שגיאה כללית בייבוא טקסט:', error);
            console.error('📋 פרטי השגיאה המלאים:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            alert(`שגיאה בייבוא המיקודים: ${error.message}`);
        } finally {
            setIsImporting(false);
            console.log('🏁 סיום תהליך ייבוא טקסט');
        }
    };

    // פונקציות ייצוא חדשות
    const exportFocusSessions = async (format = 'text') => {
        try {
            const sessions = await FocusSession.list('-session_number');
            
            if (format === 'json') {
                // ייצוא כ-JSON
                const exportData = {
                    focus_sessions: sessions,
                    exported_at: new Date().toISOString(),
                    total_sessions: sessions.length
                };
                
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                    type: 'application/json;charset=utf-8' 
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `focus_history_backup_${moment().format('YYYY-MM-DD')}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
            } else {
                // ייצוא כטקסט
                const exportText = sessions.map(session => {
                    if (session.template_format) {
                        return session.template_format;
                    } else {
                        // אם אין template_format, ניצור אחד
                        const startTime = moment(session.start_time);
                        const nextTime = session.next_session_suggestion ? 
                            moment(session.next_session_suggestion) : null;
                        
                        return `מיקוד ${session.session_number} – ${startTime.format('DD/MM/YYYY')} | ${startTime.format('HH:mm')}

${session.content}

${nextTime ? `→ המיקוד הבא ${nextTime.format('HH:mm DD/MM/YYYY')}` : ''}`;
                    }
                }).join('\n\n---\n\n');
                
                const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `מיקודים-${moment().format('YYYY-MM-DD')}.txt`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
            
        } catch (error) {
            console.error('Error exporting focus sessions:', error);
            alert('שגיאה בייצוא המיקודים');
        }
    };

    // פונקציה לטיפול בייבוא קבצים
    const handleFileImport = async (event) => {
        console.log('🔄 התחלת תהליך ייבוא קובץ');
        
        const file = event.target.files[0];
        if (!file) {
            console.log('❌ לא נבחר קובץ');
            return;
        }

        console.log('📁 פרטי הקובץ:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: new Date(file.lastModified)
        });

        try {
            console.log('📖 מתחיל לקרוא את תוכן הקובץ...');
            const text = await file.text();
            console.log('✅ תוכן הקובץ נקרא בהצלחה. אורך:', text.length, 'תווים');
            console.log('📝 תחילת התוכן (100 תווים ראשונים):', text.substring(0, 100));
            
            if (file.name.endsWith('.json')) {
                console.log('🔧 מזהה קובץ JSON - מתחיל לפרסר...');
                
                let data;
                try {
                    data = JSON.parse(text);
                    console.log('✅ JSON פורסר בהצלחה');
                    console.log('📊 מבנה הנתונים:', Object.keys(data));
                } catch (parseError) {
                    console.error('❌ שגיאה בפירסור JSON:', parseError);
                    throw new Error(`שגיאה בפירסור JSON: ${parseError.message}`);
                }
                
                console.log('🔍 בודק אם יש focus_sessions בנתונים...');
                if (data.focus_sessions && Array.isArray(data.focus_sessions)) {
                    console.log(`✅ נמצאו ${data.focus_sessions.length} מיקודים בקובץ`);
                    console.log('ℹ️ מתאים נתונים לסכמת המסד הנתונים הנוכחית (content->notes, מסיר עמודות שלא קיימות)');
                    
                    let imported = 0;
                    let fixedTimestamps = 0;
                    
                    for (let i = 0; i < data.focus_sessions.length; i++) {
                        const session = data.focus_sessions[i];
                        console.log(`📥 מייבא מיקוד ${i + 1}/${data.focus_sessions.length}:`, {
                            session_number: session.session_number,
                            start_time: session.start_time,
                            content_length: session.content?.length || 0
                        });
                        
                        try {
                            // פונקציה לבדיקת ותיקון ערכי זמן
                            const validateAndFixTimestamp = (timestamp, fieldName) => {
                                if (!timestamp) return null;
                                
                                // בדיקה אם יש טקסט בעברית בזמן
                                if (timestamp.includes('בבוקר') || timestamp.includes('בערב') || timestamp.includes('אחר הצהריים')) {
                                    console.log(`⚠️ זמן לא תקין ב-${fieldName}: ${timestamp} - מוחק ערך`);
                                    fixedTimestamps++;
                                    return null;
                                }
                                
                                // בדיקה אם הזמן תקין
                                try {
                                    // אם הזמן כבר ב-UTC (מסתיים ב-Z), החזר כמו שהוא
                                    if (timestamp.endsWith('Z')) {
                                        new Date(timestamp); // רק בדיקת תקינות
                                        return timestamp;
                                    }
                                    
                                    // אחרת, נניח שזה זמן ישראלי וצריך להמיר ל-UTC
                                    const israeliTime = moment(timestamp).utcOffset('+03:00');
                                    const utcTime = israeliTime.utc().toISOString();
                                    console.log(`🔄 המרת זמן ישראלי ל-UTC: ${timestamp} -> ${utcTime}`);
                                    return utcTime;
                                } catch {
                                    console.log(`⚠️ זמן לא תקין ב-${fieldName}: ${timestamp} - מוחק ערך`);
                                    fixedTimestamps++;
                                    return null;
                                }
                            };

                            // המרת הנתונים לפורמט המקומי - התאמה לסכמת המסד נתונים
                            const sessionData = {
                                session_number: session.session_number,
                                start_time: validateAndFixTimestamp(session.start_time, 'start_time'),
                                end_time: validateAndFixTimestamp(session.end_time, 'end_time'),
                                duration_minutes: session.duration_minutes,
                                notes: session.content || session.notes, // התאמה: content -> notes
                                next_session_suggestion: validateAndFixTimestamp(session.next_session_suggestion, 'next_session_suggestion'),
                                status: session.status || 'completed' // ברירת מחדל
                                // הסרנו: ai_summary, ai_affirmation, template_format - לא קיימים בסכמה
                            };
                            
                            console.log('🔧 נתונים מותאמים לסכמה:', sessionData);
                            console.log('💾 שומר מיקוד במסד הנתונים...');
                            await FocusSession.create(sessionData);
                            imported++;
                            console.log(`✅ מיקוד ${i + 1} נשמר בהצלחה`);
                            
                        } catch (sessionError) {
                            console.error(`❌ שגיאה בשמירת מיקוד ${i + 1}:`, sessionError);
                            console.error('📋 נתוני המיקוד שגרמו לשגיאה:', session);
                            throw new Error(`שגיאה בשמירת מיקוד ${i + 1}: ${sessionError.message}`);
                        }
                    }
                    
                    console.log(`🎉 ייבוא הושלם בהצלחה! יובאו ${imported} מיקודים`);
                    if (fixedTimestamps > 0) {
                        console.log(`🔧 תוקנו ${fixedTimestamps} ערכי זמן לא תקינים`);
                        alert(`יובאו בהצלחה ${imported} מיקודים מקובץ JSON!\n(תוקנו ${fixedTimestamps} ערכי זמן לא תקינים)`);
                    } else {
                        alert(`יובאו בהצלחה ${imported} מיקודים מקובץ JSON!`);
                    }
                    loadSessions(); // רענן את הרשימה
                    
                } else {
                    console.error('❌ מבנה הקובץ לא תקין. נתונים שנמצאו:', data);
                    throw new Error('קובץ JSON לא מכיל focus_sessions או שהוא לא מערך');
                }
                
            } else {
                console.log('📄 מזהה קובץ טקסט - פותח דיאלוג ייבוא');
                // טיפול בקובץ טקסט - פתח את הדיאלוג עם הטקסט
                setImportText(text);
                setIsImportDialogOpen(true);
            }
            
        } catch (error) {
            console.error('💥 שגיאה כללית בייבוא הקובץ:', error);
            console.error('📋 פרטי השגיאה המלאים:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            alert(`שגיאה בייבוא הקובץ: ${error.message}`);
        }
        
        // נקה את הקלט
        event.target.value = '';
        console.log('🧹 קלט הקובץ נוקה');
    };

    return (
        <div className="min-h-screen bg-white p-8" dir="rtl">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                     <h1 className="text-2xl font-light text-black">היסטוריית מיקודים</h1>
                     <div className="flex gap-3">
                        {/* כפתורי ייצוא */}
                        <div className="flex flex-col items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => exportFocusSessions('text')} className="h-8 w-8 sm:h-10 sm:w-10" title="ייצא כטקסט">
                                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            </Button>
                            <span className="text-xs text-gray-500">טקסט</span>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => exportFocusSessions('json')} className="h-8 w-8 sm:h-10 sm:w-10" title="ייצא כ-JSON">
                                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </Button>
                            <span className="text-xs text-blue-600">JSON</span>
                        </div>
                        
                        {/* כפתורי ייבוא */}
                        <div className="flex flex-col items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setIsImportDialogOpen(true)} className="h-8 w-8 sm:h-10 sm:w-10" title="ייבא טקסט">
                                <UploadCloud className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            </Button>
                            <span className="text-xs text-gray-500">טקסט</span>
                        </div>
                        
                        <input
                            type="file"
                            accept=".json,.txt"
                            onChange={handleFileImport}
                            style={{ display: 'none' }}
                            id="file-import-history"
                        />
                        <div className="flex flex-col items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => document.getElementById('file-import-history').click()} className="h-8 w-8 sm:h-10 sm:w-10" title="ייבא קובץ">
                                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </Button>
                            <span className="text-xs text-blue-600">קובץ</span>
                        </div>
                        
                        {/* כפתור מחיקת הכל */}
                        <div className="flex flex-col items-center gap-1">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleDeleteAll}
                                disabled={isDeletingAll || sessions.length === 0}
                                className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 hover:text-red-700 hover:bg-red-50"
                                title="מחק את כל ההיסטוריה"
                            >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                            <span className="text-xs text-red-500">מחק</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {sessions.map(session => (
                        <Card key={session.id} className="border-gray-100 shadow-none">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-medium">מיקוד #{session.session_number}</CardTitle>
                                    <p className="text-sm text-gray-500">
                                        {moment(session.start_time).utcOffset('+03:00').format('DD/MM/YYYY, HH:mm')}
                                        {session.session_number > 1 && (() => {
                                            const timingStatus = getTimingStatus(session);
                                            return timingStatus ? (
                                                <span className={`mr-2 ${timingStatus.color} font-semibold`} title={timingStatus.status === 'success' ? 'התחיל בזמן' : 'התחיל באיחור'}>
                                                    {timingStatus.icon}
                                                </span>
                                            ) : null;
                                        })()}
                                        {session.duration_minutes && ` (${session.duration_minutes} דקות)`}
                                    </p>
                                </div>
                                <div className="flex gap-2"> {/* Group edit and delete buttons */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditSession(session)}
                                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        title="ערוך מיקוד זה"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteSession(session.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        title="מחק מיקוד זה"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* תצוגת התבנית המשופרת */}
                                <div className="bg-gray-50 p-4 rounded-lg border text-sm">
                                    <div className="whitespace-pre-wrap text-gray-800 mb-3 leading-relaxed">
                                        {session.content}
                                    </div>
                                    
                                    {session.next_session_suggestion && (
                                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                                            <span className="text-sm text-gray-700">המיקוד הבא:</span>
                                            <div className="bg-white px-2 py-1 rounded border text-sm">
                                                {moment(session.next_session_suggestion).utcOffset('+03:00').format('HH:mm DD/MM/YYYY')}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* משוב AI */}
                                {session.ai_summary && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <h4 className="font-medium mb-2">משוב</h4>
                                        <p className="text-gray-600">{session.ai_summary}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Import Dialog */}
                <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                    <DialogContent className="max-w-2xl" dir="rtl" aria-describedby="import-dialog-description">
                        <DialogHeader>
                            <DialogTitle>ייבוא מיקודים</DialogTitle>
                            <div id="import-dialog-description" className="sr-only">
                                דיאלוג לייבוא מיקודים מטקסט
                            </div>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Textarea
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                                placeholder="הדבק כאן את הטקסט של המיקודים..."
                                className="min-h-[300px] text-right"
                            />
                        </div>
                        <DialogFooter className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsImportDialogOpen(false)}
                                disabled={isImporting}
                            >
                                ביטול
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={isImporting || !importText.trim()}
                            >
                                {isImporting ? 'מייבא...' : 'ייבא'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-xl" dir="rtl" aria-describedby="edit-dialog-description">
                        <DialogHeader>
                            <DialogTitle>עריכת מיקוד</DialogTitle>
                            <div id="edit-dialog-description" className="sr-only">
                                דיאלוג לעריכת פרטי המיקוד כולל תוכן וזמנים
                            </div>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="editContent" className="text-right">
                                    תוכן המיקוד
                                </Label>
                                <Textarea
                                    id="editContent"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="col-span-3 text-right min-h-[150px]"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="editStartTime" className="text-right">
                                    שעת התחלה
                                </Label>
                                <Input
                                    id="editStartTime"
                                    type="datetime-local"
                                    value={editStartTime}
                                    onChange={(e) => setEditStartTime(e.target.value)}
                                    className="col-span-3 text-right"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="editNextSessionTime" className="text-right">
                                    שעת מיקוד הבא
                                </Label>
                                <Input
                                    id="editNextSessionTime"
                                    type="datetime-local"
                                    value={editNextSessionTime}
                                    onChange={(e) => setEditNextSessionTime(e.target.value)}
                                    className="col-span-3 text-right"
                                />
                            </div>
                        </div>
                        <DialogFooter className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                ביטול
                            </Button>
                            <Button onClick={handleSaveEdit}>
                                שמור שינויים
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
