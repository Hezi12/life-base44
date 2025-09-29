import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, Settings, TrendingUp, Calendar, Target, Flame, Award,
  Check, X, ChevronLeft, ChevronRight, Edit3, Edit, Trash2, RotateCcw,
  Droplets, BookOpen, Coffee, Dumbbell, Heart, Brain, Zap, 
  Leaf, Star, Sun, Moon, Clock, Bell, Home, Users, Sparkles,
  Camera, Music, Palette, Code, Phone, Mail, Car, Plane,
  ShoppingBag, Gamepad2, Headphones, Shield, Globe, Search,
  Gift, Lightbulb, Map, Bookmark, Eye, Lock, Download, Upload
} from "lucide-react";
import { Habit, HabitRecord } from "@/api/entities";
import moment from "moment";

// הגדרת moment לעברית
moment.updateLocale('he', {
    weekdays: ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'],
    weekdaysShort: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
    weekdaysMin: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
    months: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
    monthsShort: ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יונ׳', 'יול׳', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳']
});

// הגדרת locale לעברית
moment.locale('he');

// מערכת אייקונים מקיפה להרגלים
const availableIcons = [
  // בריאות וכושר
  { name: 'Dumbbell', component: Dumbbell, color: '#ef4444', category: 'בריאות' },
  { name: 'Heart', component: Heart, color: '#ef4444', category: 'בריאות' },
  { name: 'Droplets', component: Droplets, color: '#3b82f6', category: 'בריאות' },
  { name: 'Brain', component: Brain, color: '#ec4899', category: 'בריאות' },
  { name: 'Zap', component: Zap, color: '#eab308', category: 'בריאות' },
  
  // למידה וקריאה
  { name: 'BookOpen', component: BookOpen, color: '#16a34a', category: 'למידה' },
  { name: 'Code', component: Code, color: '#22c55e', category: 'למידה' },
  { name: 'Lightbulb', component: Lightbulb, color: '#f59e0b', category: 'למידה' },
  { name: 'Target', component: Target, color: '#dc2626', category: 'למידה' },
  
  // יצירתיות ופנאי
  { name: 'Palette', component: Palette, color: '#f59e0b', category: 'יצירתיות' },
  { name: 'Music', component: Music, color: '#ec4899', category: 'יצירתיות' },
  { name: 'Camera', component: Camera, color: '#a855f7', category: 'יצירתיות' },
  { name: 'Headphones', component: Headphones, color: '#8b5cf6', category: 'יצירתיות' },
  
  // רוחניות ומדיטציה
  { name: 'Leaf', component: Leaf, color: '#16a34a', category: 'רוחניות' },
  { name: 'Star', component: Star, color: '#eab308', category: 'רוחניות' },
  { name: 'Sun', component: Sun, color: '#f97316', category: 'רוחניות' },
  { name: 'Moon', component: Moon, color: '#6366f1', category: 'רוחניות' },
  
  // זמן ופרודוקטיביות
  { name: 'Clock', component: Clock, color: '#64748b', category: 'פרודוקטיביות' },
  { name: 'Bell', component: Bell, color: '#f97316', category: 'פרודוקטיביות' },
  { name: 'Calendar', component: Calendar, color: '#059669', category: 'פרודוקטיביות' },
  
  // חברתיים ומשפחה
  { name: 'Home', component: Home, color: '#3b82f6', category: 'חברתי' },
  { name: 'Users', component: Users, color: '#8b5cf6', category: 'חברתי' },
  { name: 'Phone', component: Phone, color: '#2563eb', category: 'חברתי' },
  { name: 'Mail', component: Mail, color: '#4338ca', category: 'חברתי' },
  
  // כלליים
  { name: 'Coffee', component: Coffee, color: '#f97316', category: 'כללי' },
  { name: 'Sparkles', component: Sparkles, color: '#f59e0b', category: 'כללי' },
  { name: 'Gift', component: Gift, color: '#ec4899', category: 'כללי' },
  { name: 'Award', component: Award, color: '#eab308', category: 'כללי' }
];

// פונקציות עזר
const getIconComponent = (iconName) => {
  const iconData = availableIcons.find(icon => icon.name === iconName);
  return iconData ? iconData.component : Target;
};

  const getIconColor = (iconName) => {
    const iconData = availableIcons.find(icon => icon.name === iconName);
    return iconData ? iconData.color : '#6b7280';
  };

  // פונקציה לחילוץ נתוני קנסות מהתיאור
  const extractPenaltyData = (description) => {
    if (!description) return null;
    
    const penaltyMatch = description.match(/PENALTY:(\d+)(?:,(\d+),(\d+))?/);
    if (!penaltyMatch) return null;
    
    return {
      enabled: true,
      amount: parseInt(penaltyMatch[1]),
      secondaryEnabled: !!penaltyMatch[2],
      secondaryAmount: penaltyMatch[2] ? parseInt(penaltyMatch[2]) : 0,
      secondaryHours: penaltyMatch[3] ? parseInt(penaltyMatch[3]) : 1
    };
  };

  // פונקציה לחישוב קנס לפי סטטוס ההרגל
  const calculatePenalty = (habit, status) => {
    const penaltyData = extractPenaltyData(habit.description);
    if (!penaltyData || status === 'completed') return 0;
    
    if (status === 'failed_secondary' && penaltyData.secondaryEnabled) {
      return penaltyData.amount + penaltyData.secondaryAmount;
    } else if (status === 'failed') {
      return penaltyData.amount;
    }
    
    return 0;
  };

// רכיב RadioToggle
const RadioToggle = ({ checked, onCheckedChange }) => {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'border-blue-600' : 'border-gray-300'}`}
    >
      {checked && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
    </button>
  );
};

// רכיב PenaltyCard
const PenaltyCard = ({ weeklyPenalties, onReset }) => {
  return (
    <Card className="border border-gray-100 shadow-none">
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="text-2xl font-semibold text-red-600">{weeklyPenalties}₪</div>
          {weeklyPenalties > 0 && (
            <button
              onClick={onReset}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="איפוס קנסות"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="text-sm text-gray-500">קנסות השבוע</div>
      </CardContent>
    </Card>
  );
};

// רכיב WeeklyView - תצוגה שבועית של הרגל
const WeeklyView = ({ habit, records, weekStart, onUpdate }) => {
  const IconComponent = getIconComponent(habit.icon);
  const iconColor = getIconColor(habit.icon);
  
  const weekDays = Array.from({ length: 7 }, (_, i) => 
    weekStart.clone().add(i, 'days')
  );

  const hebrewDays = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
  
  const getRecordForDay = (day) => {
    const dateStr = day.format('YYYY-MM-DD');
    return records.find(record => record.date === dateStr);
  };

  const handleDayClick = async (day) => {
    const dateStr = day.format('YYYY-MM-DD');
    const existingRecord = getRecordForDay(day);
    const penaltyData = extractPenaltyData(habit.description);
    
    try {
      if (!existingRecord) {
        // אין רשומה → צור רשומה עם סטטוס failed
        await HabitRecord.create({
          habit_id: habit.id,
          date: dateStr,
          completed: false,
          notes: 'failed'
        });
      } else {
        // יש רשומה - קבע את הסטטוס הבא
        const currentStatus = existingRecord.completed ? 'completed' : (existingRecord.notes || 'failed');
        
        if (currentStatus === 'completed') {
          // מעבר מהושלם למחיקת הרשומה (ללא תיעוד)
          await HabitRecord.delete(existingRecord.id);
        } else if (currentStatus === 'failed') {
          if (penaltyData?.secondaryEnabled) {
            // מעבר מקנס ראשון לקנס כפול
            await HabitRecord.update(existingRecord.id, { 
              completed: false,
              notes: 'failed_secondary'
            });
          } else {
            // אין קנס משני - מעבר ישר להושלם
            await HabitRecord.update(existingRecord.id, { 
              completed: true,
              notes: 'completed'
            });
          }
        } else if (currentStatus === 'failed_secondary') {
          // מעבר מקנס כפול להושלם
          await HabitRecord.update(existingRecord.id, { 
            completed: true,
            notes: 'completed'
          });
        } else {
          // מצב לא צפוי - מעבר לקנס ראשון
          await HabitRecord.update(existingRecord.id, { 
            completed: false,
            notes: 'failed'
          });
        }
      }
      onUpdate();
    } catch (error) {
      console.error('Error updating habit record:', error);
    }
  };
  
  const calculateStreakForHabit = (records) => {
    const sortedRecords = records
      .filter(record => record.completed)
      .sort((a, b) => moment(b.date).diff(moment(a.date)));
    
    let streak = 0;
    let currentDate = moment();
    
    for (const record of sortedRecords) {
      const recordDate = moment(record.date);
      if (recordDate.isSame(currentDate, 'day') || recordDate.isSame(currentDate.clone().subtract(1, 'day'), 'day')) {
        streak++;
        currentDate = recordDate.clone().subtract(1, 'day');
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  const streak = calculateStreakForHabit(records);
  
  // חישוב סך כל הימים בתקופת ההרגל
  const getTotalDaysInRange = (habit) => {
    let startDate = moment(habit.created_at || new Date());
    let endDate = null;
    
    // ניסיון לחלץ תאריכים מנתוני התדירות
    if (habit.target_frequency && habit.target_frequency !== 'daily') {
      try {
        const frequencyData = JSON.parse(habit.target_frequency);
        if (frequencyData && typeof frequencyData === 'object' && frequencyData.start_date) {
          startDate = moment(frequencyData.start_date);
          if (frequencyData.end_date) {
            endDate = moment(frequencyData.end_date);
          }
        }
      } catch (e) {
        // אם יש שגיאה, נשתמש בתאריך יצירת ההרגל
      }
    }
    
    const end = endDate || moment();
    const daysDiff = end.diff(startDate, 'days') + 1;
    return Math.max(1, daysDiff); // לפחות יום אחד
  };
  
  return (
    <Card className="border border-gray-100 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${iconColor}20` }}
            >
              <IconComponent 
                className="w-4 h-4" 
                style={{ color: iconColor }} 
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{habit.name}</span>
                {streak > 0 && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-semibold">{streak}</span>
                  </div>
                )}
              </div>
              {(() => {
                // נסנן את התיאור מנתוני הקנסות
                const cleanDescription = habit.description?.replace(/PENALTY:.*$/m, '').trim();
                return cleanDescription && (
                  <p className="text-sm text-gray-500">{cleanDescription}</p>
                );
              })()}
              
              {/* הצגת קנס השבוע */}
              {(() => {
                const penaltyData = extractPenaltyData(habit.description);
                if (!penaltyData) return null;
                
                // חישוב קנס השבוע - נשתמש ב-weekStart שמגיע מה-props
                const weekEnd = weekStart.clone().add(6, 'days');
                let weeklyPenalty = 0;
                
                for (let day = weekStart.clone(); day.isSameOrBefore(weekEnd); day.add(1, 'day')) {
                  const record = records.find(r => r.habit_id === habit.id && r.date === day.format('YYYY-MM-DD'));
                  if (record && !record.completed) {
                    weeklyPenalty += calculatePenalty(habit, record.notes || 'failed');
                  }
                }
                
                return weeklyPenalty > 0 && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    קנס השבוע: {weeklyPenalty}₪
                  </p>
                );
              })()}
              {/* הצגת תדירות ההרגל */}
              {habit.target_frequency && habit.target_frequency !== 'daily' && (
                <p className="text-xs text-blue-600 mt-1">
                  {(() => {
                    try {
                      const frequencyData = JSON.parse(habit.target_frequency);
                      
                      // אם זה האובייקט החדש עם נתוני תקופה
                      if (frequencyData && typeof frequencyData === 'object' && frequencyData.days !== undefined) {
                        if (Array.isArray(frequencyData.days) && frequencyData.days.length < 7) {
                          const dayNames = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
                          return frequencyData.days.map(d => dayNames[d]).join(', ');
                        }
                        return 'יומי';
                      }
                      // אם זה המערך הישן של ימים בלבד
                      else if (Array.isArray(frequencyData) && frequencyData.length < 7) {
                        const dayNames = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
                        return frequencyData.map(d => dayNames[d]).join(', ');
                      }
                    } catch (e) {
                      return 'יומי';
                    }
                    return 'יומי';
                  })()}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* אייקון סטטיסטיקה כוללת */}
            <div className="flex items-center gap-1.5 text-xs bg-gray-50 px-2.5 py-1.5 rounded-full">
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(5, getTotalDaysInRange(habit)) }, (_, i) => {
                  const completed = records.filter(r => r.completed).length;
                  const total = getTotalDaysInRange(habit);
                  const fillRatio = completed / total;
                  const shouldFill = i < (fillRatio * 5);
                  
                  return (
                    <div 
                      key={i}
                      className={`w-1 h-3 rounded-full transition-all duration-200 ${
                        shouldFill ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="font-semibold text-gray-700">
                {records.filter(r => r.completed).length}/{getTotalDaysInRange(habit)}
              </span>
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onUpdate('edit', habit)}
                className="h-6 w-6"
              >
                <Edit3 className="w-2.5 h-2.5 text-gray-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onUpdate('delete', habit.id)}
                className="h-6 w-6 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between gap-1">
          {weekDays.map((day, index) => {
            const record = getRecordForDay(day);
            const isToday = day.isSame(moment(), 'day');
            const isFuture = day.isAfter(moment(), 'day');
            
            // בדיקה אם היום בתוך תקופת ההרגל
            let isInHabitRange = true;
            
            // חילוץ תאריכי תקופת ההרגל
            if (habit.target_frequency && habit.target_frequency !== 'daily') {
              try {
                const frequencyData = JSON.parse(habit.target_frequency);
                if (frequencyData && typeof frequencyData === 'object' && frequencyData.start_date) {
                  const habitStart = moment(frequencyData.start_date);
                  const habitEnd = frequencyData.end_date ? moment(frequencyData.end_date) : null;
                  
                  isInHabitRange = day.isSameOrAfter(habitStart, 'day') && 
                                   (habitEnd ? day.isSameOrBefore(habitEnd, 'day') : true);
                }
              } catch (e) {
                // במקרה של שגיאה, ההרגל פעיל לתמיד
                isInHabitRange = true;
              }
            }
            
            // בדיקה אם היום נבחר בהגדרות ההרגל
            let isDaySelected = true;
            if (habit.target_frequency && habit.target_frequency !== 'daily') {
              try {
                const frequencyData = JSON.parse(habit.target_frequency);
                
                // אם זה האובייקט החדש עם נתוני תקופה
                if (frequencyData && typeof frequencyData === 'object' && frequencyData.days !== undefined) {
                  if (Array.isArray(frequencyData.days)) {
                    isDaySelected = frequencyData.days.includes(index);
                  } else if (frequencyData.days === 'daily') {
                    isDaySelected = true;
                  }
                } 
                // אם זה המערך הישן של ימים בלבד
                else if (Array.isArray(frequencyData)) {
                  isDaySelected = frequencyData.includes(index);
                }
              } catch (e) {
                isDaySelected = true;
              }
            }
            
            return (
              <div key={day.format('YYYY-MM-DD')} className="flex flex-col items-center space-y-2">
                <span className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                  {hebrewDays[index]}
                </span>
                <button
                  onClick={() => isInHabitRange && isDaySelected && handleDayClick(day)}
                  disabled={!isInHabitRange || !isDaySelected}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all relative ${
                    !isDaySelected
                      ? 'bg-gray-50 border-2 border-gray-100 opacity-30 cursor-not-allowed'
                      : !isInHabitRange
                        ? 'bg-gray-50 border-2 border-gray-100 opacity-30 cursor-not-allowed'
                        : record?.completed 
                          ? 'bg-green-100 border-2 border-green-200 hover:bg-green-200' 
                          : record?.notes === 'failed_secondary'
                            ? 'bg-red-200 border-2 border-red-400 hover:bg-red-300'
                            : record?.notes === 'failed'
                              ? 'bg-red-100 border-2 border-red-300 hover:bg-red-200'
                              : isFuture
                                ? 'bg-blue-50 border-2 border-blue-200 hover:bg-blue-100'
                                : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {record?.completed && <Check className="w-4 h-4 text-green-600" />}
                  {record?.notes === 'failed' && <X className="w-4 h-4 text-red-600" />}
                  {record?.notes === 'failed_secondary' && (
                    <div className="text-red-700 text-xs font-bold">××</div>
                  )}
                  {!isDaySelected && <X className="w-3 h-3 text-gray-400 absolute -top-1 -right-1" />}
                </button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [habitRecords, setHabitRecords] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [penaltyHistory, setPenaltyHistory] = useState(() => {
    // טעינת היסטוריית קנסות מ-localStorage
    const saved = localStorage.getItem('penalty_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showPenaltyHistoryDialog, setShowPenaltyHistoryDialog] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(moment().startOf('week'));

  // טעינת נתונים
  const loadData = async () => {
    try {
      const habitsData = await Habit.list();
      const recordsData = await HabitRecord.list();
      setHabits(habitsData);
      setHabitRecords(recordsData);
    } catch (error) {
      console.error('Error loading habits data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // פונקציות עזר
  const getTodayRecord = (habitId) => {
    const today = moment().format('YYYY-MM-DD');
    return habitRecords.find(record => 
      record.habit_id === habitId && record.date === today
    );
  };

  // חישוב streak (רצף ימים)
  const calculateStreak = (records) => {
    const sortedRecords = records
      .filter(record => record.completed)
      .sort((a, b) => moment(b.date).diff(moment(a.date)));
    
    let streak = 0;
    let currentDate = moment();
    
    for (const record of sortedRecords) {
      const recordDate = moment(record.date);
      if (recordDate.isSame(currentDate, 'day') || recordDate.isSame(currentDate.clone().subtract(1, 'day'), 'day')) {
        streak++;
        currentDate = recordDate.clone().subtract(1, 'day');
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setIsAddDialogOpen(true);
  };

  const handleDeleteHabit = async (habitId) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק הרגל זה?')) return;
    
    try {
      // מחיקת כל הרשומות של ההרגל
      const relatedRecords = habitRecords.filter(record => record.habit_id === habitId);
      for (const record of relatedRecords) {
        await HabitRecord.delete(record.id);
      }
      
      // מחיקת ההרגל עצמו
      await Habit.delete(habitId);
      await loadData();
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const handleResetPenalties = () => {
    const stats = calculateStats();
    if (stats.weeklyPenalties > 0) {
      // שמירת הקנסות בהיסטוריה
      const newHistoryEntry = {
        id: Date.now(),
        amount: stats.weeklyPenalties,
        date: moment().format('YYYY-MM-DD'),
        week: currentWeek.format('YYYY-MM-DD')
      };
      
      const updatedHistory = [...penaltyHistory, newHistoryEntry];
      setPenaltyHistory(updatedHistory);
      localStorage.setItem('penalty_history', JSON.stringify(updatedHistory));
      
      // איפוס הקנסות - נמחק את כל הרשומות הכושלות השבוע
      const weekStart = currentWeek.clone().startOf('week');
      const weekEnd = currentWeek.clone().endOf('week');
      
      // נמצא את הרשומות הכושלות השבוע ונמחק אותן
      habitRecords.forEach(async (record) => {
        const recordDate = moment(record.date);
        if (recordDate.isBetween(weekStart, weekEnd, 'day', '[]') && !record.completed) {
          try {
            await HabitRecord.delete(record.id);
          } catch (error) {
            console.error('Error deleting penalty record:', error);
          }
        }
      });
      
      // רענון הנתונים
      setTimeout(() => loadData(), 100);
    }
  };

  const handleDeletePenaltyHistoryItem = (itemId) => {
    const updatedHistory = penaltyHistory.filter(item => item.id !== itemId);
    setPenaltyHistory(updatedHistory);
    localStorage.setItem('penalty_history', JSON.stringify(updatedHistory));
  };

  const handleClearAllPenaltyHistory = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל היסטוריית הקנסות?')) {
      setPenaltyHistory([]);
      localStorage.removeItem('penalty_history');
    }
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingHabit(null);
  };

  // פונקציה לבדיקה אם יום מסוים רלוונטי להרגל (כולל תקופה ויום בשבוע)
  const isDayRelevantForHabit = (habit, dayIndex, specificDate = null) => {
    if (!habit.target_frequency || habit.target_frequency === 'daily') {
      return true;
    }
    
    try {
      const frequencyData = JSON.parse(habit.target_frequency);
      
      // אם זה האובייקט החדש עם נתוני תקופה
      if (frequencyData && typeof frequencyData === 'object' && frequencyData.days !== undefined) {
        // בדיקת יום בשבוע
        let isDayOfWeekValid = true;
        if (Array.isArray(frequencyData.days)) {
          isDayOfWeekValid = frequencyData.days.includes(dayIndex);
        } else if (frequencyData.days !== 'daily') {
          isDayOfWeekValid = false;
        }
        
        // בדיקת תקופה אם יש תאריך ספציפי
        if (specificDate && frequencyData.start_date) {
          const checkDate = moment(specificDate);
          const habitStart = moment(frequencyData.start_date);
          const habitEnd = frequencyData.end_date ? moment(frequencyData.end_date) : null;
          
          const isInTimeRange = checkDate.isSameOrAfter(habitStart, 'day') && 
                               (habitEnd ? checkDate.isSameOrBefore(habitEnd, 'day') : true);
          
          return isDayOfWeekValid && isInTimeRange;
        }
        
        return isDayOfWeekValid;
      }
      // אם זה המערך הישן של ימים בלבד
      else if (Array.isArray(frequencyData)) {
        return frequencyData.includes(dayIndex);
      }
    } catch (e) {
      return true;
    }
    
    return true;
  };

  // חישוב סטטיסטיקות
  const calculateStats = () => {
    const today = moment().format('YYYY-MM-DD');
    const todayDayIndex = moment().day();
    
    // חישוב הרגלים רלוונטיים להיום
    const todayRelevantHabits = habits.filter(habit => 
      isDayRelevantForHabit(habit, todayDayIndex, today)
    );
    
    const todayRecords = habitRecords.filter(record => record.date === today);
    const completedToday = todayRecords.filter(record => record.completed).length;
    
    // חישוב ממוצע השבוע הנוכחי
    const currentWeekDays = Array.from({ length: 7 }, (_, i) => ({
      date: currentWeek.clone().add(i, 'days').format('YYYY-MM-DD'),
      dayIndex: i
    }));
    
    const weeklyCompletion = currentWeekDays.map(({ date, dayIndex }) => {
      const dayRelevantHabits = habits.filter(habit => 
        isDayRelevantForHabit(habit, dayIndex, date)
      );
      const dayRecords = habitRecords.filter(record => record.date === date);
      const completed = dayRecords.filter(record => record.completed).length;
      return { date, completed, total: dayRelevantHabits.length };
    });
    
    const weeklyAverage = weeklyCompletion.reduce((sum, day) => 
      sum + (day.total > 0 ? (day.completed / day.total) * 100 : 0), 0
    ) / 7;

    // חישוב כמה הרגלים הושלמו השבוע
    const weeklyCompleted = weeklyCompletion.reduce((sum, day) => sum + day.completed, 0);
    const weeklyTotal = weeklyCompletion.reduce((sum, day) => sum + day.total, 0);
    
    // חישוב קנסות השבוע
    let weeklyPenalties = 0;
    currentWeekDays.forEach(({ date }) => {
      const dayRecords = habitRecords.filter(record => record.date === date && !record.completed);
      dayRecords.forEach(record => {
        const habit = habits.find(h => h.id === record.habit_id);
        if (habit) {
          weeklyPenalties += calculatePenalty(habit, record.notes || 'failed');
        }
      });
    });

    return {
      completedToday,
      totalHabits: todayRelevantHabits.length,
      todayPercentage: todayRelevantHabits.length > 0 ? Math.round((completedToday / todayRelevantHabits.length) * 100) : 0,
      weeklyAverage: Math.round(weeklyAverage),
      weeklyCompleted,
      weeklyTotal,
      weeklyPenalties
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-light text-black">הרגלים</h1>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              size="icon"
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 w-10 h-10"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentWeek(currentWeek.clone().subtract(1, 'week'))}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <button
            onClick={() => setCurrentWeek(moment().startOf('week'))}
            className="hover:bg-gray-50 rounded-lg px-4 py-2 transition-colors"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-gray-900">
                {currentWeek.format('D MMMM')} - {currentWeek.clone().add(6, 'days').format('D MMMM YYYY')}
              </h2>
              {!currentWeek.isSame(moment().startOf('week'), 'week') && (
                <Calendar className="w-4 h-4 text-blue-600" />
              )}
            </div>
          </button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentWeek(currentWeek.clone().add(1, 'week'))}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className="border border-gray-100 shadow-none">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-blue-600">{stats.weeklyCompleted}</div>
              <div className="text-sm text-gray-500">הושלמו השבוע</div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100 shadow-none">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-green-600">{stats.weeklyAverage}%</div>
              <div className="text-sm text-gray-500">ממוצע השבוע</div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100 shadow-none">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-purple-600">
                {stats.completedToday}/{stats.totalHabits}
              </div>
              <div className="text-sm text-gray-500">הושלמו היום</div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100 shadow-none">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-orange-600">{stats.todayPercentage}%</div>
              <div className="text-sm text-gray-500">הצלחה היום</div>
            </CardContent>
          </Card>

          <PenaltyCard 
            weeklyPenalties={stats.weeklyPenalties}
            onReset={handleResetPenalties}
          />

          <Card className="border border-gray-100 shadow-none">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="text-2xl font-semibold text-gray-600">
                  {penaltyHistory.reduce((sum, entry) => sum + entry.amount, 0)}₪
                </div>
                {penaltyHistory.length > 0 && (
                  <button
                    onClick={() => setShowPenaltyHistoryDialog(true)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="ערוך היסטוריית קנסות"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-500">קנסות ששולמו</div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly View */}
        <div className="space-y-4">
          {habits.length > 0 ? (
            (() => {
              const visibleHabits = habits.filter(habit => {
                // בדיקה אם ההרגל פעיל בשבוע הנוכחי
                const weekStart = currentWeek.clone();
                const weekEnd = currentWeek.clone().add(6, 'days');
                
                // חילוץ תאריכי תקופת ההרגל
                let habitStart = moment(habit.created_at || new Date());
                let habitEnd = null;
                
                if (habit.target_frequency && habit.target_frequency !== 'daily') {
                  try {
                    const frequencyData = JSON.parse(habit.target_frequency);
                    if (frequencyData && typeof frequencyData === 'object' && frequencyData.start_date) {
                      habitStart = moment(frequencyData.start_date);
                      if (frequencyData.end_date) {
                        habitEnd = moment(frequencyData.end_date);
                      }
                    }
                  } catch (e) {
                    // במקרה של שגיאה, נשתמש בתאריך יצירת ההרגל
                  }
                }
                
                // בדיקה שיש חפיפה בין השבוע הנוכחי לתקופת ההרגל
                const isInTimeRange = habitEnd 
                  ? weekStart.isSameOrBefore(habitEnd, 'day') && weekEnd.isSameOrAfter(habitStart, 'day')
                  : weekEnd.isSameOrAfter(habitStart, 'day');
                
                // בדיקה נוספת שיש לפחות יום אחד רלוונטי בשבוע
                if (isInTimeRange) {
                  const weekDays = Array.from({ length: 7 }, (_, i) => i);
                  return weekDays.some(dayIndex => isDayRelevantForHabit(habit, dayIndex));
                }
                
                return false;
              });

              if (visibleHabits.length === 0) {
                return null; // לא מציגים כלום אם אין הרגלים
              }

              return visibleHabits.map((habit) => {
                const habitRecordsForHabit = habitRecords.filter(r => r.habit_id === habit.id);
                
                return (
                  <WeeklyView
                    key={habit.id}
                    habit={habit}
                    records={habitRecordsForHabit}
                    weekStart={currentWeek}
                    onUpdate={(action, data) => {
                      if (action === 'edit') {
                        handleEditHabit(data);
                      } else if (action === 'delete') {
                        handleDeleteHabit(data);
                      } else {
                        loadData();
                      }
                    }}
                  />
                );
              });
            })()
          ) : null}
        </div>


        {/* Add/Edit Habit Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-[500px] [&>button]:hidden" dir="rtl">
            <DialogHeader className="text-right">
              <DialogTitle className="text-right">
                {editingHabit ? 'עריכת הרגל' : 'הרגל חדש'}
              </DialogTitle>
            </DialogHeader>
            
            <AddHabitForm 
              onClose={handleCloseDialog} 
              onAdd={loadData} 
              editingHabit={editingHabit}
            />
          </DialogContent>
        </Dialog>

        {/* דיאלוג עריכת היסטוריית קנסות */}
        <Dialog open={showPenaltyHistoryDialog} onOpenChange={setShowPenaltyHistoryDialog}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>היסטוריית קנסות</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {penaltyHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">אין היסטוריית קנסות</p>
              ) : (
                penaltyHistory
                  .sort((a, b) => moment(b.date).diff(moment(a.date)))
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-red-600">{item.amount}₪</div>
                        <div className="text-xs text-gray-500">
                          {moment(item.date).format('DD/MM/YYYY')}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePenaltyHistoryItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="מחק פריט"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
              )}
            </div>
            
            {penaltyHistory.length > 0 && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleClearAllPenaltyHistory}
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  מחק הכל
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPenaltyHistoryDialog(false)}
                  className="flex-1"
                >
                  סגור
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// רכיב AddHabitForm
const AddHabitForm = ({ onClose, onAdd, editingHabit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Target',
    color: '#3b82f6',
    target_frequency: 'daily',
    start_date: moment().format('YYYY-MM-DD'),
    end_date: '',
    duration_days: '',
    // נתוני קנסות
    penalty_enabled: false,
    penalty_amount: '',
    penalty_secondary_enabled: false,
    penalty_secondary_amount: '',
    penalty_secondary_hours: 1
  });
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5, 6]); // כל הימים כברירת מחדל
  const [dateMode, setDateMode] = useState('unlimited'); // 'unlimited', 'end_date', 'duration'

  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const dayNamesShort = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

  useEffect(() => {
    if (editingHabit) {
      // חילוץ נתוני קנסות מהתיאור
      const penaltyData = extractPenaltyData(editingHabit.description);
      const cleanDescription = editingHabit.description?.replace(/PENALTY:.*$/m, '').trim() || '';
      
      setFormData({
        name: editingHabit.name || '',
        description: cleanDescription,
        icon: editingHabit.icon || 'Target',
        color: editingHabit.color || '#3b82f6',
        target_frequency: editingHabit.target_frequency || 'daily',
        start_date: editingHabit.start_date || moment().format('YYYY-MM-DD'),
        end_date: editingHabit.end_date || '',
        duration_days: editingHabit.duration_days || '',
        // נתוני קנסות מהתיאור
        penalty_enabled: penaltyData?.enabled || false,
        penalty_amount: penaltyData?.amount?.toString() || '',
        penalty_secondary_enabled: penaltyData?.secondaryEnabled || false,
        penalty_secondary_amount: penaltyData?.secondaryAmount?.toString() || '',
        penalty_secondary_hours: penaltyData?.secondaryHours || 1
      });
      
      // קביעת מצב התאריכים
      if (editingHabit.end_date) {
        setDateMode('end_date');
      } else if (editingHabit.duration_days) {
        setDateMode('duration');
      } else {
        setDateMode('unlimited');
      }
      
      // פרסור נתוני התדירות והתקופה
      if (editingHabit.target_frequency && editingHabit.target_frequency !== 'daily') {
        try {
          const frequencyData = JSON.parse(editingHabit.target_frequency);
          
          // אם זה האובייקט החדש עם נתוני תקופה
          if (frequencyData && typeof frequencyData === 'object' && frequencyData.days !== undefined) {
            // עדכון ימים
            if (Array.isArray(frequencyData.days)) {
              setSelectedDays(frequencyData.days);
            } else if (frequencyData.days === 'daily') {
              setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
            }
            
            // עדכון נתוני תקופה
            if (frequencyData.start_date) {
              setFormData(prev => ({
                ...prev,
                start_date: frequencyData.start_date,
                end_date: frequencyData.end_date || '',
              }));
            }
            
            if (frequencyData.mode) {
              setDateMode(frequencyData.mode);
            }
          } 
          // אם זה המערך הישן של ימים בלבד
          else if (Array.isArray(frequencyData)) {
            setSelectedDays(frequencyData);
          }
        } catch (e) {
          setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
        }
      }
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'Target',
        color: '#3b82f6',
        target_frequency: 'daily',
        start_date: moment().format('YYYY-MM-DD'),
        end_date: '',
        duration_days: '',
        // נתוני קנסות
        penalty_enabled: false,
        penalty_amount: '',
        penalty_secondary_enabled: false,
        penalty_secondary_amount: '',
        penalty_secondary_hours: 1
      });
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
      setDateMode('unlimited');
    }
  }, [editingHabit]);

  const toggleDay = (dayIndex) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(d => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex]);
    }
  };


  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    
    // קביעת תדירות בהתאם לימים נבחרים
    let targetFrequency = 'daily';
    if (selectedDays.length < 7) {
      targetFrequency = JSON.stringify(selectedDays);
    }
    
    // חישוב תאריך סיום אם נבחר מספר ימים
    let calculatedEndDate = formData.end_date;
    if (dateMode === 'duration' && formData.duration_days) {
      calculatedEndDate = moment(formData.start_date)
        .add(parseInt(formData.duration_days) - 1, 'days')
        .format('YYYY-MM-DD');
    } else if (dateMode === 'unlimited') {
      calculatedEndDate = '';
    }
    
    // נשמור את נתוני התקופה בתדירות בצורה מיוחדת
    let finalTargetFrequency = targetFrequency;
    if (dateMode !== 'unlimited') {
      const dateInfo = {
        days: selectedDays.length < 7 ? selectedDays : 'daily',
        start_date: formData.start_date,
        end_date: calculatedEndDate,
        mode: dateMode
      };
      finalTargetFrequency = JSON.stringify(dateInfo);
    }

    const habitData = {
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      color: formData.color,
      target_frequency: finalTargetFrequency,
      is_active: true,
      // נתוני קנסות - נשמור בתיאור בפורמט מובנה
      ...(formData.penalty_enabled && {
        description: `${formData.description}${formData.description ? '\n' : ''}PENALTY:${formData.penalty_amount}${formData.penalty_secondary_enabled ? `,${formData.penalty_secondary_amount},${formData.penalty_secondary_hours}` : ''}`
      })
    };
    
    try {
      if (editingHabit) {
        await Habit.update(editingHabit.id, habitData);
      } else {
        await Habit.create(habitData);
      }
      
      onAdd();
      onClose();
    } catch (error) {
      console.error('Error saving habit:', error);
      alert('שגיאה בשמירת ההרגל. אנא נסה שוב.');
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">שם ההרגל</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder=""
          className="text-right"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-form-type="other"
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-2 block">תיאור (אופציונלי)</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder=""
          className="text-right h-20 resize-none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-form-type="other"
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-3 block">תקופת ההרגל</Label>
        
        {/* בחירת סוג תקופה */}
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={dateMode === 'unlimited' ? "default" : "outline"}
            size="sm"
            onClick={() => setDateMode('unlimited')}
            className="text-xs h-8 px-3"
          >
            ללא הגבלה
          </Button>
          <Button
            type="button"
            variant={dateMode === 'end_date' ? "default" : "outline"}
            size="sm"
            onClick={() => setDateMode('end_date')}
            className="text-xs h-8 px-3"
          >
            עד תאריך
          </Button>
          <Button
            type="button"
            variant={dateMode === 'duration' ? "default" : "outline"}
            size="sm"
            onClick={() => setDateMode('duration')}
            className="text-xs h-8 px-3"
          >
            מספר ימים
          </Button>
        </div>

        {/* שדות תאריכים */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">התחלה</Label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="text-sm h-8"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-form-type="other"
            />
          </div>
          
          {dateMode === 'end_date' && (
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">סיום</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="text-sm h-8"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
              />
            </div>
          )}
          
          {dateMode === 'duration' && (
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">ימים</Label>
              <Input
                type="number"
                min="1"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                placeholder="30"
                className="text-sm h-8"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">ימים בשבוע</Label>

        {/* בחירת ימים */}
        <div className="flex gap-2 justify-center">
          {dayNamesShort.map((day, index) => (
            <Button
              key={index}
              type="button"
              variant={selectedDays.includes(index) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleDay(index)}
              title={dayNames[index]}
              className={`h-8 w-10 text-xs transition-all ${
                selectedDays.includes(index) 
                  ? 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {day}
            </Button>
          ))}
        </div>
        
        {selectedDays.length === 0 && (
          <p className="text-xs text-red-500 mt-2 text-center">
            יש לבחור לפחות יום אחד
          </p>
        )}
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">אייקון</Label>
        <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
          {availableIcons.slice(0, 16).map((iconData) => {
            const IconComponent = iconData.component;
            return (
              <button
                key={iconData.name}
                onClick={() => setFormData({ ...formData, icon: iconData.name, color: iconData.color })}
                className={`p-2 rounded-lg border transition-all hover:bg-gray-50 ${
                  formData.icon === iconData.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <IconComponent
                  className="w-4 h-4"
                  style={{ color: iconData.color }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* הגדרות קנסות */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <RadioToggle 
            checked={formData.penalty_enabled} 
            onCheckedChange={(checked) => setFormData({...formData, penalty_enabled: checked})}
          />
          <Label className="text-sm font-medium">הוסף קנס כספי</Label>
        </div>
        
        {formData.penalty_enabled && (
          <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">קנס בסיסי</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="1"
                    value={formData.penalty_amount}
                    onChange={(e) => setFormData({...formData, penalty_amount: e.target.value})}
                    placeholder="40"
                    className="text-sm h-8 flex-1"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                  />
                  <span className="text-xs text-gray-500">₪</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-5">
                <RadioToggle 
                  checked={formData.penalty_secondary_enabled} 
                  onCheckedChange={(checked) => setFormData({...formData, penalty_secondary_enabled: checked})}
                />
                <Label className="text-xs text-gray-600">קנס נוסף</Label>
              </div>
            </div>
            
            {formData.penalty_secondary_enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">קנס נוסף</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="1"
                      value={formData.penalty_secondary_amount}
                      onChange={(e) => setFormData({...formData, penalty_secondary_amount: e.target.value})}
                      placeholder="60"
                      className="text-sm h-8 flex-1"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                    />
                    <span className="text-xs text-gray-500">₪</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">אחרי (שעות)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    value={formData.penalty_secondary_hours}
                    onChange={(e) => setFormData({...formData, penalty_secondary_hours: parseInt(e.target.value) || 1})}
                    className="text-sm h-8 w-16"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          ביטול
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            !formData.name.trim() || 
            selectedDays.length === 0 || 
            (formData.penalty_enabled && !formData.penalty_amount) ||
            (formData.penalty_secondary_enabled && !formData.penalty_secondary_amount)
          }
          className="bg-blue-50 text-blue-600 hover:bg-blue-100"
        >
          {editingHabit ? 'שמור שינויים' : 'הוסף הרגל'}
        </Button>
      </div>
    </div>
  );
};