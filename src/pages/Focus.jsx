import React, { useState, useEffect } from 'react';
import { Play, Settings, User, History, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FocusSession } from '@/api/entities';
import { FocusSetting } from '@/api/entities';
import { SendEmail } from '@/api/integrations';
import moment from 'moment';

const RadioToggle = ({ id, checked, onCheckedChange }) => {
    return (
        <button
            id={id}
            role="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange(!checked)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'border-blue-600' : 'border-gray-300'}`}
        >
            {checked && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
        </button>
    );
};

export default function NewFocus() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isScheduleManagementOpen, setIsScheduleManagementOpen] = useState(false);
    const [settings, setSettings] = useState({
        schedule: [],
        notification_minutes_before: 15,
        notify_on_time: true
    });
    const [selectedDays, setSelectedDays] = useState([]);
    const [newScheduleTime, setNewScheduleTime] = useState('');
    const [nextFocusInfo, setNextFocusInfo] = useState({ number: 1, time: 'היום, 15:30' });
    const [isTestingEmail, setIsTestingEmail] = useState(false);

    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };


    const dayNames = {
        Sunday: 'א׳',
        Monday: 'ב׳', 
        Tuesday: 'ג׳',
        Wednesday: 'ד׳',
        Thursday: 'ה׳',
        Friday: 'ו׳',
        Saturday: 'ש׳'
    };

    // קיבוץ זמנים לפי שעה
    const groupedSchedules = settings.schedule.reduce((groups, schedule) => {
        const time = schedule.time;
        if (!groups[time]) {
            groups[time] = [];
        }
        if (!groups[time].includes(schedule.day)) {
            groups[time].push(schedule.day);
        }
        return groups;
    }, {});

    // טעינת מידע על המיקוד הבא והגדרות
    useEffect(() => {
        const loadData = async () => {
            try {
                // טען מיקוד הבא
                const lastSession = await FocusSession.list('-session_number', 1);
                const nextNumber = lastSession.length > 0 ? lastSession[0].session_number + 1 : 1;
                
                let nextTime = 'היום, 15:30';
                
                if (lastSession.length > 0 && lastSession[0].next_session_suggestion) {
                    nextTime = moment(lastSession[0].next_session_suggestion).format('DD/MM/YYYY HH:mm');
                } else {
                    // ברירת מחדל - 3 שעות קדימה
                    const defaultTime = moment().add(3, 'hours');
                    const minutes = defaultTime.minutes();
                    const roundedMinutes = Math.ceil(minutes / 5) * 5;
                    nextTime = defaultTime.minutes(roundedMinutes).format('DD/MM/YYYY HH:mm');
                }
                
                setNextFocusInfo({ number: nextNumber, time: nextTime });

                // טען הגדרות
                const existingSettings = await FocusSetting.list();
                let currentSettings;
                if (existingSettings.length > 0) {
                    currentSettings = existingSettings[0];
                } else {
                    const defaultSettings = {
                        schedule: [],
                        notification_minutes_before: 5,
                        notify_on_time: true
                    };
                    currentSettings = await FocusSetting.create(defaultSettings);
                }
                setSettings(currentSettings);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();
    }, []);

    // מערכת התראות למיקוד מתוזמן
    useEffect(() => {
        const checkFocusNotifications = async () => {
            try {
                if (!settings.notify_on_time) {
                    return; // התראות כבויות
                }

                const now = moment();
                const today = now.format('dddd'); // יום בשבוע באנגלית
                
                // בדוק אם יש מיקוד מתוזמן היום
                const todaySchedules = settings.schedule.filter(schedule => schedule.day === today);
                
                for (const schedule of todaySchedules) {
                    const scheduledTime = moment(schedule.time, 'HH:mm');
                    const notificationTime = scheduledTime.clone().subtract(settings.notification_minutes_before, 'minutes');
                    
                    // בדוק אם הגיע זמן ההתראה (בטווח של דקה)
                    const timeDiff = Math.abs(now.diff(notificationTime, 'minutes'));
                    if (timeDiff <= 1) {
                        // בדוק אם כבר שלחנו התראה לזמן הזה היום
                        const notificationKey = `focus_notification_${today}_${schedule.time}_${settings.notification_minutes_before}`;
                        const lastNotification = localStorage.getItem(notificationKey);
                        const todayDate = moment().format('YYYY-MM-DD');
                        
                        if (!lastNotification || lastNotification !== todayDate) {
                            // שלח התראה במייל
                            await SendEmail({
                                to: 'schwartzhezi@gmail.com',
                                subject: `התראה: מיקוד מתוזמן בעוד ${settings.notification_minutes_before} דקות`,
                                body: `שלום!

המיקוד המתוזמן שלך יתחיל בעוד ${settings.notification_minutes_before} דקות (${scheduledTime.format('HH:mm')}).

זמן להתכונן למיקוד!

המערכת שלך`
                            });
                            
                            // שמור שהתראה נשלחה היום
                            localStorage.setItem(notificationKey, todayDate);
                            console.log('✅ Focus notification sent for', schedule.time);
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking focus notifications:', error);
            }
        };

        // בדוק התראות מיד כשהדף נטען
        checkFocusNotifications();
        
        // בדוק התראות כל 30 שניות (יותר מדויק)
        const notificationInterval = setInterval(checkFocusNotifications, 30000);
        
        return () => clearInterval(notificationInterval);
    }, [settings]);

    // פונקציות לניהול הגדרות
    const addScheduleTime = async () => {
        if (selectedDays.length === 0 || !newScheduleTime) return;
        
        const newSchedules = selectedDays.map(day => ({
            day,
            time: newScheduleTime
        }));
        
        const updatedSchedule = [...settings.schedule, ...newSchedules];
        const newSettings = { ...settings, schedule: updatedSchedule };
        setSettings(newSettings);
        
        // שמור מיד לבסיס הנתונים
        const existingSettings = await FocusSetting.list();
        if (existingSettings.length > 0) {
            await FocusSetting.update(existingSettings[0].id, newSettings);
        } else {
            await FocusSetting.create(newSettings);
        }
        
        setSelectedDays([]);
        setNewScheduleTime('');
        setIsScheduleManagementOpen(false);
    };

    const removeSchedule = async (index) => {
        const updatedSchedule = settings.schedule.filter((_, i) => i !== index);
        const newSettings = { ...settings, schedule: updatedSchedule };
        setSettings(newSettings);
        
        // שמור מיד לבסיס הנתונים
        const existingSettings = await FocusSetting.list();
        if (existingSettings.length > 0) {
            await FocusSetting.update(existingSettings[0].id, newSettings);
        }
    };

    const saveSettings = async () => {
        const existingSettings = await FocusSetting.list();
        if (existingSettings.length > 0) {
            await FocusSetting.update(existingSettings[0].id, settings);
        } else {
            await FocusSetting.create(settings);
        }
        setIsSettingsOpen(false);
        setIsScheduleManagementOpen(false);
    };

    const testEmailNotification = async () => {
        setIsTestingEmail(true);
        try {
            await SendEmail({
                to: 'schwartzhezi@gmail.com',
                subject: 'בדיקת התראות מיקוד - המערכת עובדת!',
                body: `שלום!

זוהי בדיקת התראות מיקוד מתוזמן.

המערכת שלך עובדת מושלם! 🎯

זמן הבדיקה: ${moment().format('DD/MM/YYYY HH:mm')}

המערכת שלך`
            });
            alert('✅ מייל בדיקה נשלח בהצלחה! בדוק את הקונסול לפרטים.');
        } catch (error) {
            console.error('Error testing email:', error);
            alert('❌ שגיאה בשליחת מייל הבדיקה. בדוק את הקונסול לפרטים.');
        } finally {
            setIsTestingEmail(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col pb-20" dir="rtl" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
            {/* Top Icons - Left Side */}
            <div className="absolute top-6 left-6 flex gap-3">
                <Link 
                    to={createPageUrl("Profile")}
                    className="p-3 hover:bg-gray-100 rounded-xl transition-colors touch-manipulation"
                    title="פרופיל"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                >
                    <User className="w-6 h-6 text-gray-600" />
                </Link>
                
                <button 
                    className="p-3 hover:bg-gray-100 rounded-xl transition-colors touch-manipulation"
                    title="הגדרות"
                    onClick={() => setIsSettingsOpen(true)}
                    style={{ minWidth: '44px', minHeight: '44px' }}
                >
                    <Settings className="w-6 h-6 text-gray-600" />
                </button>
                
                <Link 
                    to={createPageUrl("FocusHistory")}
                    className="p-3 hover:bg-gray-100 rounded-xl transition-colors touch-manipulation"
                    title="היסטוריה"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                >
                    <History className="w-6 h-6 text-gray-600" />
                </Link>
            </div>

            {/* Main Content - Center */}
            <div className="flex-1 flex flex-col items-center justify-center px-4">
                {/* Play Button */}
                <div>
                    <Link to={createPageUrl("ActiveFocusSession")}>
                        <Button 
                            variant="outline" 
                            className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-2 border-gray-300 hover:border-blue-500 bg-white hover:bg-blue-50 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 touch-manipulation"
                        >
                            <Play className="w-12 h-12 sm:w-14 sm:h-14 text-gray-700 hover:text-blue-600 transition-colors transform translate-x-0.5" />
                        </Button>
                    </Link>
                </div>
                
                {/* Next Focus Info */}
                <div className="mt-8 text-center">
                    <div className="text-3xl font-semibold text-gray-800">
                        מיקוד #{nextFocusInfo.number}
                    </div>
                    <div className="text-gray-500 mt-3 text-lg">
                        {nextFocusInfo.time}
                    </div>
                </div>
            </div>

            {/* Settings Dialog */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto [&>button]:hidden" dir="rtl" style={{ marginTop: 'env(safe-area-inset-top)' }}>
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-right text-xl">הגדרות מיקוד</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        {/* Schedule Management */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <Label className="text-base font-medium">זמנים קבועים למיקוד</Label>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                        setIsScheduleManagementOpen(true);
                                        setSelectedDays([]); 
                                        setNewScheduleTime('');
                                    }}
                                    className="h-10 w-10 touch-manipulation"
                                >
                                    <Plus className="w-5 h-5 text-gray-600" />
                                </Button>
                            </div>

                            {/* Display current schedules */}
                            {Object.keys(groupedSchedules).length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {Object.entries(groupedSchedules).map(([time, days]) => (
                                        <div key={time} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{time}</span>
                                                <span className="text-gray-500 text-xs">
                                                    {days.map(day => dayNames[day]).join(', ')}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    const newSchedule = settings.schedule.filter(s => s.time !== time);
                                                    const newSettings = {...settings, schedule: newSchedule};
                                                    setSettings(newSettings);
                                                    // שמור מיד
                                                    (async () => {
                                                        const existingSettings = await FocusSetting.list();
                                                        if (existingSettings.length > 0) {
                                                            await FocusSetting.update(existingSettings[0].id, newSettings);
                                                        }
                                                    })();
                                                }}
                                                className="h-6 w-6 text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notification settings */}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="notify_on_time" className="text-sm sm:text-base">התראה בזמן המיקוד</Label>
                            <RadioToggle 
                                id="notify_on_time" 
                                checked={settings.notify_on_time} 
                                onCheckedChange={(checked) => setSettings({...settings, notify_on_time: checked})}
                            />
                        </div>

                        <div className="grid grid-cols-3 items-center gap-2 sm:gap-4">
                            <Label htmlFor="notification_minutes" className="text-right text-sm sm:text-base">התראה לפני (דקות)</Label>
                            <Input 
                                id="notification_minutes" 
                                type="number" 
                                value={settings.notification_minutes_before}
                                onChange={(e) => setSettings({...settings, notification_minutes_before: parseInt(e.target.value)})}
                                className="col-span-1 w-12 sm:w-16 text-sm"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                data-form-type="other"
                            />
                        </div>

                        {/* כפתור בדיקת מייל */}
                        <div className="flex flex-col items-center pt-2 space-y-2">
                            <Button 
                                onClick={testEmailNotification}
                                disabled={isTestingEmail}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                            >
                                {isTestingEmail ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                                        שולח...
                                    </>
                                ) : (
                                    'בדיקת מייל'
                                )}
                            </Button>
                            
                        </div>
                    </div>
                    <DialogFooter className="flex justify-start">
                        <Button 
                            onClick={() => setIsSettingsOpen(false)}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                            size="sm"
                        >
                            שמור הגדרות
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Schedule Management Dialog */}
            <Dialog open={isScheduleManagementOpen} onOpenChange={setIsScheduleManagementOpen}>
                <DialogContent className="sm:max-w-[500px] w-[95vw] [&>button]:hidden" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-right">הוספת זמן מיקוד</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Days Selection - All in one row */}
                        <div className="flex gap-2 justify-center">
                            {Object.entries(dayNames).map(([day, shortName]) => (
                                <Button
                                    key={day}
                                    variant={selectedDays.includes(day) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleDay(day)}
                                    className="h-8 w-10 text-xs"
                                >
                                    {shortName}
                                </Button>
                            ))}
                        </div>
                        
                        {/* Time Input */}
                        <div className="flex items-center justify-center gap-3">
                            <Input
                                type="time"
                                value={newScheduleTime}
                                onChange={(e) => setNewScheduleTime(e.target.value)}
                                className="w-24 text-center"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                data-form-type="other"
                            />
                        </div>
                        
                        {/* Add Button */}
                        <div className="flex justify-center pt-2">
                            <Button 
                                onClick={addScheduleTime}
                                disabled={selectedDays.length === 0 || !newScheduleTime}
                                className="bg-blue-600 hover:bg-blue-700 w-10 h-10 rounded-full p-0"
                                title="הוסף זמן"
                            >
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
