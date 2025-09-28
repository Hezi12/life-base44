
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Settings, ChevronLeft, ChevronRight, Plus, Upload,
    PieChart, Clock, Trash2, Edit3, ChevronDown, ChevronUp,
    RefreshCw, Calendar, Download,
    Heart, Star, Home, User, Bell, Search, Eye, EyeOff,
    Lock, Unlock, Zap, Lightbulb, Gift, Camera, Bookmark,
    Target, Map, Phone, Mail, BedDouble, Tv2, Waves, Car, ShowerHead,
    Shirt, Users, Sparkles, GraduationCap, Brain, Coffee, Dumbbell,
    Briefcase, BookOpen, Utensils, Tv, ShoppingBag, Stethoscope,
    Plane, Gamepad2, Music, Palette, Code, Scissors, Wrench,
    House, Folder, Archive, Calendar as CalendarIcon, Leaf,
    Sunrise, Moon, Baby, TreePine, Flower2, Shield
} from 'lucide-react';
import { Event } from '@/api/entities';
import { Category } from '@/api/entities';
import { DailyImage } from '@/api/entities';
import { WorkTopic } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import QuickScheduleInput from '../components/schedule/QuickScheduleInput';
import moment from 'moment';

// הגדרת moment לעברית
moment.updateLocale('he', {
    weekdays: ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'],
    weekdaysShort: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
});

// מערכת אייקונים מלאה וסדורה - עם אייקונים דתיים ומשפחתיים
const availableIcons = [
    // דתיים ורוחניים
    { name: 'Star', component: Star, color: '#eab308' }, // מגן דוד
    { name: 'BookOpen', component: BookOpen, color: '#16a34a' }, // ספר
    { name: 'Sunrise', component: Sunrise, color: '#f97316' }, // תפילת שחרית
    { name: 'Moon', component: Moon, color: '#6366f1' }, // תפילת ערבית
    { name: 'Shield', component: Shield, color: '#3b82f6' }, // הגנה/ברכה

    // משפחה וזמן איכות
    { name: 'Users', component: Users, color: '#8b5cf6' }, // זמן משפחה
    { name: 'Heart', component: Heart, color: '#ef4444' }, // אהבה ומשפחה
    { name: 'Baby', component: Baby, color: '#f472b6' }, // ילדים
    { name: 'Home', component: Home, color: '#3b82f6' }, // בית

    // ארוחות ואוכל
    { name: 'Utensils', component: Utensils, color: '#f97316' }, // ארוחות
    { name: 'Coffee', component: Coffee, color: '#f97316' }, // קפה/שתייה

    // בידור ומנוחה
    { name: 'Tv', component: Tv, color: '#64748b' }, // טלוויזיה
    { name: 'Tv2', component: Tv2, color: '#64748b' }, // בידור
    { name: 'Music', component: Music, color: '#ec4899' }, // מוזיקה
    { name: 'Gamepad2', component: Gamepad2, color: '#8b5cf6' }, // משחקים

    // כושר ובריאות
    { name: 'Dumbbell', component: Dumbbell, color: '#ef4444' }, // כושר
    { name: 'Waves', component: Waves, color: '#06b6d4' }, // שחייה
    { name: 'Stethoscope', component: Stethoscope, color: '#ef4444' }, // רפואה

    // היגיינה וטיפוח
    { name: 'ShowerHead', component: ShowerHead, color: '#3b82f6' }, // מקלחת
    { name: 'Shirt', component: Shirt, color: '#f472b6' }, // לבוש

    // ארגון וסדר
    { name: 'Folder', component: Folder, color: '#6b7280' }, // ארגון
    { name: 'Archive', component: Archive, color: '#64748b' }, // סדר
    { name: 'CalendarIcon', component: CalendarIcon, color: '#059669' }, // תכנון
    { name: 'Target', component: Target, color: '#dc2626' }, // מטרות

    // עבודה ולימודים
    { name: 'Briefcase', component: Briefcase, color: '#374151' }, // עבודה
    { name: 'GraduationCap', component: GraduationCap, color: '#2563eb' }, // לימודים
    { name: 'Code', component: Code, color: '#22c55e' }, // תכנות
    { name: 'Brain', component: Brain, color: '#ec4899' }, // חשיבה

    // נסיעות ותחבורה
    { name: 'Car', component: Car, color: '#374151' }, // נסיעה
    { name: 'Plane', component: Plane, color: '#3b82f6' }, // טיסות
    { name: 'Map', component: Map, color: '#10b981' }, // ניווט

    // טבע וסביבה
    { name: 'TreePine', component: TreePine, color: '#22c55e' }, // טבע
    { name: 'Flower2', component: Flower2, color: '#f472b6' }, // פרחים
    { name: 'Leaf', component: Leaf, color: '#16a34a' }, // צמחים

    // כלליים
    { name: 'Settings', component: Settings, color: '#6b7280' },
    { name: 'User', component: User, color: '#8b5cf6' },
    { name: 'Bell', component: Bell, color: '#f97316' },
    { name: 'Search', component: Search, color: '#22c55e' },
    { name: 'Plus', component: Plus, color: '#3b82f6' },
    { name: 'Edit3', component: Edit3, color: '#6366f1' },
    { name: 'Trash2', component: Trash2, color: '#ef4444' },
    { name: 'Download', component: Download, color: '#6b7280' },
    { name: 'Upload', component: Upload, color: '#3b82f6' },
    { name: 'Eye', component: Eye, color: '#64748b' },
    { name: 'EyeOff', component: EyeOff, color: '#9ca3af' },
    { name: 'Lock', component: Lock, color: '#dc2626' },
    { name: 'Unlock', component: Unlock, color: '#16a34a' },
    { name: 'Zap', component: Zap, color: '#eab308' },
    { name: 'Lightbulb', component: Lightbulb, color: '#fb923c' },
    { name: 'Gift', component: Gift, color: '#ec4899' },
    { name: 'Camera', component: Camera, color: '#a855f7' },
    { name: 'Bookmark', component: Bookmark, color: '#06b6d4' },
    { name: 'Phone', component: Phone, color: '#2563eb' },
    { name: 'Mail', component: Mail, color: '#4338ca' },
    { name: 'BedDouble', component: BedDouble, color: '#6366f1' },
    { name: 'ShoppingBag', component: ShoppingBag, color: '#ec4899' },
    { name: 'Palette', component: Palette, color: '#f59e0b' },
    { name: 'Scissors', component: Scissors, color: '#f97316' },
    { name: 'Wrench', component: Wrench, color: '#6b7280' },
    { name: 'RefreshCw', component: RefreshCw, color: '#6b7280' },
    { name: 'House', component: House, color: '#3b82f6' },
    { name: 'Sparkles', component: Sparkles, color: '#f59e0b' }
];

// פונקציה לקבלת קומפוננט אייקון
const getIconComponent = (iconName) => {
    const iconData = availableIcons.find(icon => icon.name === iconName);
    return iconData ? iconData.component : Briefcase;
};

// רכיב Timeline Item מושלם
const TimelineItem = ({ event, isLast }) => {
    const IconComponent = getIconComponent(event.category_icon);
    const iconColor = event.category_color || '#6b7280';
    const bgColor = event.category_color ? `${event.category_color}15` : '#f8fafc';

    return (
        <div className="flex items-start gap-3 sm:gap-4 relative">
            {/* אייקון עם רקע צבעוני */}
            <div className="relative flex-shrink-0">
                <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ring-2 sm:ring-4 ring-white relative z-10 shadow-sm border border-gray-100"
                    style={{ backgroundColor: bgColor }}
                >
                    <IconComponent
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        style={{ color: iconColor }}
                    />
                </div>
            </div>

            {/* תוכן האירוע */}
            <div className="flex-1 pt-1 sm:pt-2">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{event.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-mono">
                            {moment(event.start_time).format('HH:mm')} - {moment(event.end_time).format('HH:mm')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// רכיב הגדרות קטגוריות מחודש
const CategorySettings = ({ isOpen, onClose, onCategoriesChange }) => {
    const [localCategories, setLocalCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
    const [newCategoryIcon, setNewCategoryIcon] = useState('Briefcase');
    const [newCategoryKeywords, setNewCategoryKeywords] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategoryId, setDeletingCategoryId] = useState(null);
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isExistingCategoriesOpen, setIsExistingCategoriesOpen] = useState(false);

    const availableColors = [
        '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308',
        '#22c55e', '#06b6d4', '#6366f1', '#84cc16', '#f59e0b',
        '#ef4444', '#10b981', '#64748b', '#6b7280', '#374151',
        '#1f2937', '#fbbf24', '#f472b6', '#a78bfa', '#34d399',
        '#0ea5e9', '#e11d48', '#7c2d12', '#365314', '#1e3a8a',
        '#581c87', '#9f1239', '#92400e', '#166534', '#1d4ed8',
        '#7c3aed', '#db2777', '#d97706', '#059669', '#2563eb'
    ];

    useEffect(() => {
        if (isOpen) {
            loadLocalCategories();
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setNewCategoryName('');
        setNewCategoryColor('#3b82f6');
        setNewCategoryIcon('Briefcase');
        setNewCategoryKeywords('');
        setEditingCategory(null);
    };

    const loadLocalCategories = async () => {
        try {
            const cats = await Category.list();
            setLocalCategories(cats);
        } catch (error) {
            console.error('Error loading categories:', error);
            alert('שגיאה בטעינת הקטגוריות. אנא נסה שוב מאוחר יותר.');
        }
    };

    const handleSubmitCategory = async () => {
        if (!newCategoryName.trim() || !newCategoryKeywords.trim()) return;

        try {
            const categoryData = {
                name: newCategoryName.trim(),
                color: newCategoryColor,
                icon: newCategoryIcon,
                keywords: newCategoryKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
            };

            if (editingCategory) {
                await Category.update(editingCategory.id, categoryData);
            } else {
                await Category.create(categoryData);
            }

            resetForm();
            await loadLocalCategories();
            onCategoriesChange();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('שגיאה בשמירת הקטגוריה. אנא נסה שוב מאוחר יותר.');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (deletingCategoryId === id) return;
        setDeletingCategoryId(id);

        try {
            await Category.delete(id);
            await loadLocalCategories();
            onCategoriesChange();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('שגיאה במחיקת הקטגוריה. אנא נסה שוב מאוחר יותר.');
        } finally {
            setDeletingCategoryId(null);
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setNewCategoryName(category.name);
        setNewCategoryColor(category.color || '#3b82f6');
        setNewCategoryIcon(category.icon || 'Briefcase');
        setNewCategoryKeywords(category.keywords?.join(', ') || '');
    };

    const handleExportData = async () => {
        try {
            const categories = await Category.list();
            const events = await Event.list();

            const exportData = {
                categories,
                events,
                exported_at: new Date().toISOString(),
                version: "1.0"
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});

            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `schedule_backup_${moment().format('YYYY-MM-DD_HH-mm')}.json`;
            link.click();

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('שגיאה בייצוא הנתונים: ' + error.message);
        }
    };

    const handleImportData = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const importData = JSON.parse(e.target.result);

                if (importData.categories && Array.isArray(importData.categories)) {
                    for (const category of importData.categories) {
                        const { id, created_date, updated_date, created_by, ...categoryData } = category;
                        await Category.create(categoryData);
                    }
                }

                if (importData.events && Array.isArray(importData.events)) {
                    for (const event of importData.events) {
                        const { id, created_date, updated_date, created_by, ...eventData } = event;
                        await Event.create(eventData);
                    }
                }

                await loadLocalCategories();
                onCategoriesChange();
                alert('הנתונים יובאו בהצלחה!');
            } catch (error) {
                console.error('Error importing data:', error);
                alert('שגיאה בייבוא הנתונים: ' + error.message);
            } finally {
                setIsImporting(false);
                event.target.value = '';
            }
        };

        reader.readAsText(file);
    };

    const handleDeleteAllCategories = async () => {
        if (!confirm('האם אתה בטוח שברצונך למחוק את כל הקטגוריות? פעולה זו לא ניתנת לביטול.')) {
            return;
        }

        setIsDeletingAll(true);
        try {
            for (const category of localCategories) {
                await Category.delete(category.id);
            }
            await loadLocalCategories();
            onCategoriesChange();
            alert('כל הקטגוריות נמחקו בהצלחה!');
        } catch (error) {
            console.error('Error deleting all categories:', error);
            alert('שגיאה במחיקת הקטגוריות. אנא נסה שוב מאוחר יותר.');
        } finally {
            setIsDeletingAll(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] [&>button]:hidden" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle className="text-right">
                        {editingCategory ? 'ערוך קטגוריה' : 'הגדרות קטגוריות'}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* כפתורי ייצוא וייבוא - קטנים */}
                    <div className="flex gap-2 justify-end">
                        <Button onClick={handleExportData} variant="outline" size="sm">
                            <Download className="w-3 h-3 ml-1" />
                            ייצוא
                        </Button>
                        <div>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImportData}
                                style={{ display: 'none' }}
                                id="import-data"
                                disabled={isImporting}
                            />
                            <Button
                                onClick={() => document.getElementById('import-data').click()}
                                variant="outline"
                                size="sm"
                                disabled={isImporting}
                            >
                                <Upload className="w-3 h-3 ml-1" />
                                {isImporting ? 'מייבא...' : 'ייבוא'}
                            </Button>
                        </div>
                    </div>

                    {/* טופס יצירת/עריכת קטגוריה */}
                    <div className="space-y-3">
                        <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="שם קטגוריה"
                            className="text-right"
                        />

                        <div className="flex items-center gap-3">
                            <Label className="text-sm">צבע:</Label>
                            <div className="flex gap-1 flex-wrap">
                                {availableColors.slice(0, 18).map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setNewCategoryColor(color)}
                                        className={`w-5 h-5 rounded border-2 transition-all hover:scale-110 ${
                                            newCategoryColor === color ? 'border-gray-800 ring-1 ring-gray-400' : 'border-gray-300'
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Label className="text-sm mt-2">אייקון:</Label>
                            <div className="grid grid-cols-12 gap-1 max-h-32 overflow-y-auto flex-1">
                                {availableIcons.map(iconData => {
                                    const IconComponent = iconData.component;
                                    return (
                                        <button
                                            key={iconData.name}
                                            onClick={() => setNewCategoryIcon(iconData.name)}
                                            className={`p-1.5 rounded border transition-all hover:bg-gray-50 ${
                                                newCategoryIcon === iconData.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                            }`}
                                        >
                                            <IconComponent
                                                className="w-3 h-3"
                                                style={{ color: newCategoryColor }}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <Input // Changed from Textarea to Input
                            value={newCategoryKeywords}
                            onChange={(e) => setNewCategoryKeywords(e.target.value)}
                            placeholder="מילות מפתח (מופרדות בפסיקים)"
                            className="text-right" // Removed h-16 resize-none text-sm
                        />

                        <div className="flex justify-end gap-2">
                            {editingCategory && (
                                <Button variant="outline" size="sm" onClick={resetForm}>
                                    ביטול
                                </Button>
                            )}
                            <Button
                                onClick={handleSubmitCategory}
                                disabled={!newCategoryName.trim() || !newCategoryKeywords.trim()}
                                className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                                size="sm"
                            >
                                {editingCategory ? 'שמור' : 'הוסף'}
                            </Button>
                        </div>
                    </div>

                    {/* קטגוריות קיימות */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-2">
                            <Button
                                variant="ghost"
                                onClick={() => setIsExistingCategoriesOpen(!isExistingCategoriesOpen)}
                                className="flex-1 justify-between text-sm"
                            >
                                <span>קטגוריות קיימות ({localCategories.length})</span>
                                {isExistingCategoriesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                            
                            {localCategories.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleDeleteAllCategories}
                                    disabled={isDeletingAll}
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    title="מחק את כל הקטגוריות"
                                >
                                    {isDeletingAll ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </Button>
                            )}
                        </div>

                        {isExistingCategoriesOpen && (
                            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                {localCategories.map((category) => {
                                    const IconComponent = getIconComponent(category.icon);
                                    return (
                                        <div key={category.id} className="flex items-center justify-between p-2 border rounded bg-gray-50 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-sm flex items-center justify-center"
                                                    style={{ backgroundColor: `${category.color}20` }}
                                                >
                                                    <IconComponent
                                                        className="w-3 h-3"
                                                        style={{ color: category.color }}
                                                    />
                                                </div>
                                                <span className="font-medium">{category.name}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditCategory(category)}
                                                    className="h-6 w-6"
                                                >
                                                    <Edit3 className="w-3 h-3 text-gray-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                    className="h-6 w-6"
                                                    disabled={deletingCategoryId === category.id}
                                                >
                                                    {deletingCategoryId === category.id ? (
                                                        <RefreshCw className="w-3 h-3 text-gray-500 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-3 h-3 text-red-500" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function Schedule() {
    const [currentDate, setCurrentDate] = useState(moment());
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [dailyImage, setDailyImage] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isQuickInputOpen, setIsQuickInputOpen] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isImageViewOpen, setIsImageViewOpen] = useState(false);

    const loadInitialData = useCallback(async () => {
        try {
            const dateStr = currentDate.format('YYYY-MM-DD');

            // טען אירועים של היום
            const dayEvents = await Event.filter({ date: dateStr });
            setEvents(dayEvents);

            // טען קטגוריות
            const cats = await Category.list();
            setCategories(cats);

            // טען תמונה יומית
            const dailyImages = await DailyImage.filter({ date: dateStr });
            setDailyImage(dailyImages[0] || null);

        } catch (error) {
            console.error('Error loading initial data:', error);
            alert('שגיאה בטעינת הנתונים. אנא רענן את העמוד ונסה שוב.');
        }
    }, [currentDate]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleAddEvents = async (eventsData) => {
        setIsQuickInputOpen(false);

        try {
            const dateStr = currentDate.format('YYYY-MM-DD');
            const allExistingEvents = await Event.filter({ date: dateStr });
            
            const eventsToUpdate = [];
            const eventsToCreate = [];
            const existingEventIds = new Set();

            eventsData.forEach(eventData => {
                if (eventData.id) {
                    eventsToUpdate.push(eventData);
                    existingEventIds.add(eventData.id);
                } else {
                    eventsToCreate.push(eventData);
                }
            });

            const eventsToDelete = allExistingEvents.filter(
                existingEvent => !existingEventIds.has(existingEvent.id)
            );

            // 1. מחיקת אירועים שנמחקו + נושאי עבודה קשורים
            for (const eventToDelete of eventsToDelete) {
                // מחיקת נושאי עבודה קשורים
                const relatedTopics = await WorkTopic.filter({ event_id: eventToDelete.id });
                for (const topic of relatedTopics) {
                    await WorkTopic.delete(topic.id);
                }
                // מחיקת האירוע עצמו
                await Event.delete(eventToDelete.id);
            }

            // 2. עדכון אירועים קיימים + התאמת נושאי עבודה
            for (const eventToUpdate of eventsToUpdate) {
                const originalEvent = allExistingEvents.find(e => e.id === eventToUpdate.id);
                
                if (!originalEvent) continue; // Added check here

                // עדכון האירוע
                const { id, ...updateData } = eventToUpdate;
                await Event.update(id, updateData);

                // אם זה אירוע "במחשב", התאמת נושאי העבודה
                if (eventToUpdate.title?.toLowerCase().includes('מחשב') || 
                    eventToUpdate.title?.toLowerCase().includes('עבודה') ||
                    eventToUpdate.category === 'עבודה') {
                    
                    const relatedTopics = await WorkTopic.filter({ event_id: eventToUpdate.id });
                    
                    if (relatedTopics.length > 0) {
                        const newStartTime = moment(eventToUpdate.start_time).startOf('minute'); // Changed
                        const newEndTime = moment(eventToUpdate.end_time).startOf('minute');     // Changed
                        const originalStartTime = moment(originalEvent.start_time).startOf('minute'); // Changed
                        
                        // Original code had originalDuration and newDuration which were unused, removed them.
                        
                        for (const topic of relatedTopics) {
                            const topicStart = moment(topic.start_time).startOf('minute'); // Changed
                            const topicEnd = moment(topic.end_time).startOf('minute');     // Changed
                            
                            // חישוב המיקום היחסי של הנושא באירוע המקורי
                            const relativeStartMinutes = topicStart.diff(originalStartTime, 'minutes');
                            const relativeEndMinutes = topicEnd.diff(originalStartTime, 'minutes');
                            
                            // חישוב הזמנים החדשים
                            const adjustedStart = newStartTime.clone().add(relativeStartMinutes, 'minutes');
                            const adjustedEnd = newStartTime.clone().add(relativeEndMinutes, 'minutes');
                            
                            // בדיקה שהנושא עדיין בתוך גבולות האירוע החדש
                            if (adjustedStart.isSameOrAfter(newStartTime) && adjustedEnd.isSameOrBefore(newEndTime)) {
                                await WorkTopic.update(topic.id, {
                                    start_time: adjustedStart.toISOString(),
                                    end_time: adjustedEnd.toISOString(),
                                    duration_minutes: adjustedEnd.diff(adjustedStart, 'minutes')
                                });
                            } else {
                                // אם הנושא יוצא מגבולות האירוע החדש, מחק אותו
                                await WorkTopic.delete(topic.id);
                            }
                        }
                    }
                }
            }

            // 3. יצירת אירועים חדשים
            if (eventsToCreate.length > 0) {
                await Event.bulkCreate(eventsToCreate);
            }

            // רענון הנתונים
            await loadInitialData();

        } catch (error) {
            console.error('Error handling events:', error);
            alert('שגיאה בשמירת לוח הזמנים. אנא נסה שוב מאוחר יותר.');
        }
    };

    const handleDeleteAllForDay = async () => {
        try {
            const dateStr = currentDate.format('YYYY-MM-DD');
            const existingEvents = await Event.filter({ date: dateStr });
            
            for (const event of existingEvents) {
                // Delete related WorkTopics first
                const relatedTopics = await WorkTopic.filter({ event_id: event.id });
                for (const topic of relatedTopics) {
                    await WorkTopic.delete(topic.id);
                }
                // Then delete the event
                await Event.delete(event.id);
            }
            setEvents([]);
            setIsQuickInputOpen(false);
        } catch (error) {
            console.error('Error deleting all events:', error);
            alert('שגיאה במחיקת כל האירועים. אנא נסה שוב מאוחר יותר.');
        }
    };

    const handleImageUpload = async (file) => {
        setIsUploadingImage(true);

        try {
            const { file_url } = await UploadFile(file);
            const dateStr = currentDate.format('YYYY-MM-DD');

            const existing = await DailyImage.filter({ date: dateStr });

            if (existing.length > 0) {
                await DailyImage.update(existing[0].id, { image_url: file_url });
            } else {
                await DailyImage.create({ date: dateStr, image_url: file_url });
            }

            const dailyImages = await DailyImage.filter({ date: dateStr });
            setDailyImage(dailyImages[0] || null);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('שגיאה בהעלאת התמונה. אנא נסה שוב מאוחר יותר.');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleDeleteImage = async () => {
        try {
            const dateStr = currentDate.format('YYYY-MM-DD');
            const existing = await DailyImage.filter({ date: dateStr });
            
            if (existing.length > 0) {
                await DailyImage.delete(existing[0].id);
                setDailyImage(null);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('שגיאה במחיקת התמונה. אנא נסה שוב מאוחר יותר.');
        }
    };

    // חישוב סטטיסטיקות
    const calculateStats = () => {
        const categoryStats = {};
        let totalPlanned = 0;
        let uncategorizedMinutes = 0;

        events.forEach(event => {
            const startTime = moment(event.start_time);
            const endTime = moment(event.end_time);

            // חישוב מדויק יותר של הפרש הזמן
            const duration = Math.ceil(endTime.diff(startTime, 'minutes', true));

            if (duration <= 0) return;

            totalPlanned += duration;

            if (event.category && event.category !== '') {
                if (!categoryStats[event.category]) {
                    categoryStats[event.category] = {
                        minutes: 0,
                        color: event.category_color || '#6b7280',
                        icon: event.category_icon || 'Briefcase'
                    };
                }
                categoryStats[event.category].minutes += duration;
            } else {
                uncategorizedMinutes += duration;
            }
        });

        if (uncategorizedMinutes > 0) {
            categoryStats['ללא קטגוריה'] = {
                minutes: uncategorizedMinutes,
                color: '#9ca3af',
                icon: 'Sparkles'
            };
        }

        const totalDay = 24 * 60;
        return { categoryStats, totalPlanned, totalDay };
    };

    const stats = calculateStats();

    return (
        <div className="min-h-screen bg-white p-4 sm:p-8" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        <h1 className="text-xl sm:text-2xl font-light text-black">לוח זמנים</h1>

                        {/* Date Navigation */}
                        <div className="flex items-center justify-center sm:justify-start gap-2">
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

                            <button
                                onClick={() => setIsQuickInputOpen(true)}
                                className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                                title="הוסף לוח זמנים"
                            >
                                <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center sm:justify-end gap-2">
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                            title="הגדרות"
                        >
                            <Settings className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Main Content - שינוי חלוקת הגריד */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
                    {/* Timeline - צמצום לשלושה חמישיות */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="border-gray-100 shadow-none">
                            <CardContent className="pt-6">
                                {events.length > 0 ? (
                                    <div className="space-y-4 sm:space-y-6">
                                        {events
                                            .sort((a, b) => moment(a.start_time).diff(moment(b.start_time)))
                                            .map((event, index) => (
                                                <TimelineItem
                                                    key={event.id}
                                                    event={event}
                                                    isLast={index === events.length - 1}
                                                />
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 sm:py-12">
                                        <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 text-sm sm:text-base">אין אירועים מתוכננים היום</p>
                                        <Button
                                            onClick={() => setIsQuickInputOpen(true)}
                                            variant="outline"
                                            className="mt-4"
                                            size="sm"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            הוסף לוח זמנים
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Side Panel - הרחבה לשתי חמישיות */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Daily Image */}
                        <Card className="border-gray-100 shadow-none">
                            <CardContent className="p-4">
                                {dailyImage ? (
                                    <div className="space-y-3 text-right">
                                        <div className="relative group">
                                            <img
                                                src={dailyImage.image_url}
                                                alt="תמונה יומית"
                                                className="w-full h-auto max-h-80 object-contain rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                                                style={{ 
                                                    maxWidth: '100%',
                                                    height: 'auto',
                                                    display: 'block',
                                                    margin: '0 auto'
                                                }}
                                                onClick={() => setIsImageViewOpen(true)}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleDeleteImage}
                                                className="absolute top-2 left-2 h-7 w-7 bg-black/60 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setIsImageViewOpen(true)}
                                                className="absolute top-2 right-2 h-7 w-7 bg-black/60 hover:bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        {dailyImage.caption && (
                                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{dailyImage.caption}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                                            style={{ display: 'none' }}
                                            id="image-upload"
                                            disabled={isUploadingImage}
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className={`cursor-pointer flex flex-col items-center p-6 sm:p-8 border-2 border-dashed rounded-lg transition-colors duration-200 ${
                                                isUploadingImage 
                                                    ? 'border-gray-300 text-gray-400 bg-gray-50' 
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {isUploadingImage ? (
                                                <>
                                                    <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 animate-spin mb-2" />
                                                    <span className="text-sm text-gray-500">מעלה תמונה...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mb-2" />
                                                    <span className="text-sm text-gray-500">לחץ להעלאת תמונה</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Stats */}
                        <Card className="border-gray-100 shadow-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-right text-lg sm:text-xl">
                                    <PieChart className="w-5 h-5" />
                                    סיכום יומי
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-right">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span>{Math.floor(stats.totalPlanned / 60)}:{(stats.totalPlanned % 60).toString().padStart(2, '0')}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{width: `${(stats.totalPlanned / stats.totalDay) * 100}%`}}
                                        ></div>
                                    </div>
                                </div>

                                {Object.keys(stats.categoryStats).length > 0 && (
                                    <div className="space-y-3">
                                        {Object.entries(stats.categoryStats).map(([category, data]) => {
                                            const percentage = Math.round((data.minutes / stats.totalPlanned) * 100);
                                            const IconComponent = getIconComponent(data.icon);
                                            
                                            return (
                                                <div key={category} className="flex items-center justify-between text-xs sm:text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span>{Math.floor(data.minutes / 60)}:{(data.minutes % 60).toString().padStart(2, '0')}</span>
                                                        <span className="text-gray-500">({percentage}%)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span>{category}</span>
                                                        <div
                                                            className="w-4 h-4 rounded-sm flex items-center justify-center"
                                                            style={{ backgroundColor: `${data.color}20` }}
                                                        >
                                                            <IconComponent
                                                                className="w-3 h-3"
                                                                style={{ color: data.color }}
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
                    </div>
                </div>
            </div>

            {/* Quick Schedule Input */}
            <QuickScheduleInput
                isOpen={isQuickInputOpen}
                onClose={() => setIsQuickInputOpen(false)}
                onAddEvents={handleAddEvents}
                categories={categories}
                selectedDate={currentDate}
                onDateChange={setCurrentDate}
                onDeleteAll={handleDeleteAllForDay}
            />

            {/* Category Settings */}
            <CategorySettings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onCategoriesChange={loadInitialData}
            />

            {/* Image View Modal */}
            <Dialog open={isImageViewOpen} onOpenChange={setIsImageViewOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-right">תמונה יומית - {currentDate.format('DD/MM/YYYY')}</DialogTitle>
                    </DialogHeader>
                    <div className="p-6 pt-0">
                        {dailyImage && (
                            <div className="text-center">
                                <img
                                    src={dailyImage.image_url}
                                    alt="תמונה יומית"
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg mx-auto"
                                    style={{ 
                                        maxWidth: '100%',
                                        height: 'auto',
                                        display: 'block'
                                    }}
                                />
                                {dailyImage.caption && (
                                    <p className="text-sm text-gray-600 mt-4 text-right leading-relaxed">{dailyImage.caption}</p>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter className="p-6 pt-0">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsImageViewOpen(false)}
                            className="mr-auto"
                        >
                            סגור
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={() => {
                                handleDeleteImage();
                                setIsImageViewOpen(false);
                            }}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            מחק תמונה
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
