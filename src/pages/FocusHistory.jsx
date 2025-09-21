
import React, { useState, useEffect } from 'react';
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
        setSessions(data);
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
        // Format for datetime-local input
        setEditStartTime(moment(session.start_time).format('YYYY-MM-DDTHH:mm'));
        setEditNextSessionTime(session.next_session_suggestion ? moment(session.next_session_suggestion).format('YYYY-MM-DDTHH:mm') : '');
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingSession) return;

        try {
            const updatedData = {
                content: editContent,
                // Convert back to ISO string for database
                start_time: new Date(editStartTime).toISOString(), 
                next_session_suggestion: editNextSessionTime ? new Date(editNextSessionTime).toISOString() : null
            };

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

            const aiResponse = await InvokeLLM({
                prompt: promptWithFormat
            });

            // נסה לפרס את התגובה כ-JSON
            let parsedResult;
            try {
                parsedResult = JSON.parse(aiResponse);
            } catch (error) {
                console.error('Failed to parse AI response as JSON:', error);
                throw new Error('AI לא החזיר פורמט JSON תקין');
            }

            if (parsedResult && parsedResult.sessions && Array.isArray(parsedResult.sessions)) {
                // עיבוד הנתונים והמרה לפורמט מקומי
                const processedSessions = parsedResult.sessions.map(session => {
                    // המרת תאריך מ DD/MM/YYYY ל YYYY-MM-DD
                    const [day, month, year] = session.date.split('/');
                    const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    
                    // יצירת זמן התחלה מקומי
                    const startDateTime = `${dateStr}T${session.time}:00`;
                    
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
                    }

                    return {
                        session_number: session.session_number,
                        start_time: startDateTime,
                        end_time: startDateTime, // נעדכן מאוחר יותר אם צריך
                        content: session.content.trim(),
                        next_session_suggestion: nextSessionDateTime,
                    };
                });

                await FocusSession.bulkCreate(processedSessions);
                loadSessions();
                setImportText('');
                setIsImportDialogOpen(false);
                alert('המיקודים יובאו בהצלחה!');
            } else {
                alert('לא ניתן לפרסר את הטקסט. אנא ודא שהפורמט תקין.');
            }
        } catch (error) {
            console.error('Error importing sessions:', error);
            alert('שגיאה בייבוא המיקודים. אנא נסה שוב מאוחר יותר.');
        } finally {
            setIsImporting(false);
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
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            
            if (file.name.endsWith('.json')) {
                // טיפול בקובץ JSON
                const data = JSON.parse(text);
                
                if (data.focus_sessions && Array.isArray(data.focus_sessions)) {
                    let imported = 0;
                    
                    for (const session of data.focus_sessions) {
                        // המרת הנתונים לפורמט המקומי
                        const sessionData = {
                            session_number: session.session_number,
                            start_time: session.start_time,
                            end_time: session.end_time,
                            duration_minutes: session.duration_minutes,
                            content: session.content,
                            ai_summary: session.ai_summary,
                            ai_affirmation: session.ai_affirmation,
                            next_session_suggestion: session.next_session_suggestion,
                            template_format: session.template_format || `מיקוד ${session.session_number} – ${moment(session.start_time).format('DD/MM/YYYY')} | ${moment(session.start_time).format('HH:mm')}

${session.content}

${session.next_session_suggestion ? `→ המיקוד הבא ${moment(session.next_session_suggestion).format('HH:mm DD/MM/YYYY')}` : ''}`
                        };
                        
                        await FocusSession.create(sessionData);
                        imported++;
                    }
                    
                    alert(`יובאו בהצלחה ${imported} מיקודים מקובץ JSON!`);
                    loadSessions(); // רענן את הרשימה
                    
                } else {
                    throw new Error('קובץ JSON לא מכיל focus_sessions');
                }
                
            } else {
                // טיפול בקובץ טקסט - פתח את הדיאלוג עם הטקסט
                setImportText(text);
                setIsImportDialogOpen(true);
            }
            
        } catch (error) {
            console.error('Error importing file:', error);
            alert(`שגיאה בייבוא הקובץ: ${error.message}`);
        }
        
        // נקה את הקלט
        event.target.value = '';
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
                                        {moment(session.start_time).format('DD/MM/YYYY, HH:mm')}
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
                                                {moment(session.next_session_suggestion).format('HH:mm DD/MM/YYYY')}
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
                    <DialogContent className="max-w-2xl" dir="rtl">
                        <DialogHeader>
                            <DialogTitle>ייבוא מיקודים</DialogTitle>
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
                    <DialogContent className="max-w-xl" dir="rtl">
                        <DialogHeader>
                            <DialogTitle>עריכת מיקוד</DialogTitle>
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
