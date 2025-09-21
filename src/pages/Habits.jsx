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
  Check, X, ChevronLeft, ChevronRight, Edit3, Trash2, RotateCcw,
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
    const newCompleted = !existingRecord?.completed;
    
    try {
      if (existingRecord) {
        await HabitRecord.update(existingRecord.id, { completed: newCompleted });
      } else {
        await HabitRecord.create({
          habit_id: habit.id,
          date: dateStr,
          completed: newCompleted,
          value: newCompleted ? 1 : 0
        });
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
    const start = moment(habit.start_date);
    const end = habit.end_date ? moment(habit.end_date) : moment();
    return end.diff(start, 'days') + 1;
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
              {habit.description && (
                <p className="text-sm text-gray-500">{habit.description}</p>
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
            const habitStart = moment(habit.start_date);
            const habitEnd = habit.end_date ? moment(habit.end_date) : null;
            const isInHabitRange = day.isSameOrAfter(habitStart, 'day') && 
                                  (habitEnd ? day.isSameOrBefore(habitEnd, 'day') : true);
            
            return (
              <div key={day.format('YYYY-MM-DD')} className="flex flex-col items-center space-y-2">
                <span className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                  {hebrewDays[index]}
                </span>
                <button
                  onClick={() => !isFuture && isInHabitRange && handleDayClick(day)}
                  disabled={isFuture || !isInHabitRange}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    !isInHabitRange
                      ? 'bg-gray-50 border-2 border-gray-100 opacity-30 cursor-not-allowed'
                      : isFuture 
                        ? 'bg-gray-50 border-2 border-gray-100 cursor-not-allowed' 
                        : record?.completed 
                          ? 'bg-green-100 border-2 border-green-200 hover:bg-green-200' 
                          : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {record?.completed && <Check className="w-4 h-4 text-green-600" />}
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

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingHabit(null);
  };

  // חישוב סטטיסטיקות
  const calculateStats = () => {
    const today = moment().format('YYYY-MM-DD');
    const todayRecords = habitRecords.filter(record => record.date === today);
    const completedToday = todayRecords.filter(record => record.completed).length;
    const totalHabits = habits.length;
    
    // חישוב ממוצע השבוע הנוכחי
    const currentWeekDays = Array.from({ length: 7 }, (_, i) => 
      currentWeek.clone().add(i, 'days').format('YYYY-MM-DD')
    );
    
    const weeklyCompletion = currentWeekDays.map(date => {
      const dayRecords = habitRecords.filter(record => record.date === date);
      const completed = dayRecords.filter(record => record.completed).length;
      return { date, completed, total: habits.length };
    });
    
    const weeklyAverage = weeklyCompletion.reduce((sum, day) => 
      sum + (day.total > 0 ? (day.completed / day.total) * 100 : 0), 0
    ) / 7;

    // חישוב כמה הרגלים הושלמו השבוע
    const weeklyCompleted = weeklyCompletion.reduce((sum, day) => sum + day.completed, 0);
    const weeklyTotal = weeklyCompletion.reduce((sum, day) => sum + day.total, 0);
    
    return {
      completedToday,
      totalHabits,
      todayPercentage: totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0,
      weeklyAverage: Math.round(weeklyAverage),
      weeklyCompleted,
      weeklyTotal
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
              <div className="text-2xl font-semibold text-purple-600">{stats.completedToday}</div>
              <div className="text-sm text-gray-500">הושלמו היום</div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100 shadow-none">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-orange-600">{habits.length}</div>
              <div className="text-sm text-gray-500">סה״כ הרגלים</div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly View */}
        <div className="space-y-4">
          {habits.length > 0 ? (
            habits
              .filter(habit => {
                // הצגת הרגל רק אם השבוע הנוכחי חופף עם תקופת ההרגל
                const habitStart = moment(habit.start_date);
                const habitEnd = habit.end_date ? moment(habit.end_date) : null;
                const weekStart = currentWeek.clone();
                const weekEnd = currentWeek.clone().add(6, 'days');
                
                // אם אין תאריך סיום, ההרגל פעיל לתמיד
                if (!habitEnd) {
                  return weekEnd.isSameOrAfter(habitStart, 'day');
                }
                
                // בדיקה שיש חפיפה בין השבוע לתקופת ההרגל
                return weekStart.isSameOrBefore(habitEnd, 'day') && weekEnd.isSameOrAfter(habitStart, 'day');
              })
              .map((habit) => {
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
              })
          ) : (
            <Card className="border border-gray-100 shadow-none">
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">אין הרגלים עדיין</h3>
                <p className="text-gray-500 mb-4">התחל לבנות הרגלים חיוביים עם ההרגל הראשון שלך</p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  size="icon"
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 w-10 h-10"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          )}
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
      </div>
    </div>
  );
}

// רכיב AddHabitForm
const AddHabitForm = ({ onClose, onAdd, editingHabit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'boolean',
    target_value: 1,
    icon: 'Target',
    color: '#3b82f6',
    start_date: moment().format('YYYY-MM-DD'),
    end_date: '',
    duration_days: ''
  });
  const [dateMode, setDateMode] = useState('end_date'); // 'end_date' או 'duration'

  useEffect(() => {
    if (editingHabit) {
      setFormData({
        name: editingHabit.name || '',
        description: editingHabit.description || '',
        type: editingHabit.type || 'boolean',
        target_value: editingHabit.target_value || 1,
        icon: editingHabit.icon || 'Target',
        color: editingHabit.color || '#3b82f6',
        start_date: editingHabit.start_date || moment().format('YYYY-MM-DD'),
        end_date: editingHabit.end_date || '',
        duration_days: editingHabit.duration_days || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'boolean',
        target_value: 1,
        icon: 'Target',
        color: '#3b82f6',
        start_date: moment().format('YYYY-MM-DD'),
        end_date: '',
        duration_days: ''
      });
    }
  }, [editingHabit]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    
    // חישוב תאריך סיום אם נבחר מספר ימים
    let calculatedEndDate = formData.end_date;
    if (dateMode === 'duration' && formData.duration_days) {
      calculatedEndDate = moment(formData.start_date)
        .add(parseInt(formData.duration_days) - 1, 'days')
        .format('YYYY-MM-DD');
    }
    
    const habitData = {
      ...formData,
      end_date: calculatedEndDate,
      created_at: editingHabit ? editingHabit.created_at : new Date().toISOString()
    };
    
    if (editingHabit) {
      await Habit.update(editingHabit.id, habitData);
    } else {
      await Habit.create(habitData);
    }
    
    onAdd();
    onClose();
  };

  return (
    <div className="space-y-4 py-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">שם ההרגל</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="למשל: שתיית 8 כוסות מים"
          className="text-right"
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-2 block">תיאור (אופציונלי)</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="תיאור קצר של ההרגל..."
          className="text-right h-20 resize-none"
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-2 block">תקופת ההרגל</Label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <Label className="text-xs text-gray-500">תאריך התחלה</Label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">תאריך סיום</Label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e) => {
                setFormData({ ...formData, end_date: e.target.value, duration_days: '' });
                setDateMode('end_date');
              }}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">או מספר ימים</Label>
            <Input
              type="number"
              min="1"
              value={formData.duration_days}
              onChange={(e) => {
                setFormData({ ...formData, duration_days: e.target.value, end_date: '' });
                setDateMode('duration');
              }}
              placeholder="30"
              className="text-sm"
            />
          </div>
        </div>
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
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          ביטול
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!formData.name.trim()}
          className="bg-blue-50 text-blue-600 hover:bg-blue-100"
        >
          {editingHabit ? 'שמור שינויים' : 'הוסף הרגל'}
        </Button>
      </div>
    </div>
  );
};