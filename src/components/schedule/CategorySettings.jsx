
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Edit3, Upload, Download } from 'lucide-react';
import { Category } from '@/api/entities';
import { Event } from '@/api/entities'; // Added Event entity import
import moment from 'moment'; // Added moment for timestamping export files

import {
  Coffee, Dumbbell, Briefcase, BookOpen, Heart, Home,
  Car, Utensils, Tv, Users, ShoppingBag, Stethoscope,
  Plane, Gamepad2, Music, Camera, Palette, Code,
  GraduationCap, Scissors, Wrench, Shirt, Phone, Mail
} from 'lucide-react';

const availableIcons = [
  { name: 'Coffee', icon: Coffee },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Heart', icon: Heart },
  { name: 'Home', icon: Home },
  { name: 'Car', icon: Car },
  { name: 'Utensils', icon: Utensils },
  { name: 'Tv', icon: Tv },
  { name: 'Users', icon: Users },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Stethoscope', icon: Stethoscope },
  { name: 'Plane', icon: Plane },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Music', icon: Music },
  { name: 'Camera', icon: Camera },
  { name: 'Palette', icon: Palette },
  { name: 'Code', icon: Code },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Scissors', icon: Scissors },
  { name: 'Wrench', icon: Wrench },
  { name: 'Shirt', icon: Shirt },
  { name: 'Phone', icon: Phone },
  { name: 'Mail', icon: Mail }
];

const availableColors = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#6366f1', '#84cc16', '#f59e0b',
  '#ef4444', '#10b981', '#64748b', '#6b7280', '#374151',
  '#1f2937', '#fbbf24', '#f472b6', '#a78bfa', '#34d399'
];

export default function CategorySettings({ isOpen, onClose, onCategoriesChange }) {
    const [localCategories, setLocalCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
    const [newCategoryIcon, setNewCategoryIcon] = useState('Briefcase');
    const [newCategoryKeywords, setNewCategoryKeywords] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [isImporting, setIsImporting] = useState(false); // New state for import loading indicator

    const loadLocalCategories = useCallback(async () => {
        const cats = await Category.list();
        setLocalCategories(cats);
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadLocalCategories();
            setNewCategoryName('');
            setNewCategoryColor('#3b82f6');
            setNewCategoryIcon('Briefcase');
            setNewCategoryKeywords('');
            setEditingCategory(null);
        }
    }, [isOpen, loadLocalCategories]);

    const handleAddOrUpdateCategory = async () => {
        if (!newCategoryName.trim() || !newCategoryKeywords.trim()) return;

        const categoryData = {
            name: newCategoryName,
            color: newCategoryColor,
            icon: newCategoryIcon,
            keywords: newCategoryKeywords.split(',').map(k => k.trim()).filter(k => k)
        };

        if (editingCategory) {
            await Category.update(editingCategory.id, categoryData);
            setEditingCategory(null);
        } else {
            await Category.create(categoryData);
        }
        
        setNewCategoryName('');
        setNewCategoryColor('#3b82f6');
        setNewCategoryIcon('Briefcase');
        setNewCategoryKeywords('');
        loadLocalCategories();
        onCategoriesChange();
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק קטגוריה זו?')) {
            await Category.delete(id);
            loadLocalCategories();
            onCategoriesChange();
        }
    };

    const handleEditClick = (category) => {
        setEditingCategory(category);
        setNewCategoryName(category.name);
        setNewCategoryColor(category.color);
        setNewCategoryIcon(category.icon || 'Briefcase');
        setNewCategoryKeywords(category.keywords?.join(', ') || '');
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setNewCategoryName('');
        setNewCategoryColor('#3b82f6');
        setNewCategoryIcon('Briefcase');
        setNewCategoryKeywords('');
    };

    const getIconComponent = (iconName) => {
        const iconData = availableIcons.find(icon => icon.name === iconName);
        return iconData ? iconData.icon : Briefcase;
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
            alert('הנתונים יוצאו בהצלחה!');
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
                let importedCategories = 0;
                let skippedCategories = 0;
                let importedEvents = 0;

                // ייבוא קטגוריות עם בדיקת כפילויות
                if (importData.categories && Array.isArray(importData.categories)) {
                    const existingCategories = await Category.list();
                    const existingNames = new Set(existingCategories.map(cat => cat.name.toLowerCase()));
                    
                    for (const category of importData.categories) {
                        const { id, created_date, updated_date, created_by, ...categoryData } = category;
                        
                        // בדיקה אם קיימת קטגוריה עם אותו שם
                        if (existingNames.has(categoryData.name.toLowerCase())) {
                            skippedCategories++;
                            continue;
                        }
                        
                        const fullCategoryData = {
                            name: categoryData.name,
                            color: categoryData.color || '#6b7280',
                            icon: categoryData.icon || 'Briefcase',
                            keywords: categoryData.keywords || []
                        };
                        await Category.create(fullCategoryData);
                        importedCategories++;
                    }
                }

                // ייבוא אירועים
                if (importData.events && Array.isArray(importData.events)) {
                    for (const event of importData.events) {
                        const { id, created_date, updated_date, created_by, ...eventData } = event;
                        const fullEventData = {
                            title: eventData.title,
                            start_time: eventData.start_time,
                            end_time: eventData.end_time,
                            date: eventData.date,
                            category: eventData.category || '',
                            category_color: eventData.category_color || '#6b7280',
                            category_icon: eventData.category_icon || 'Briefcase'
                        };
                        await Event.create(fullEventData);
                        importedEvents++;
                    }
                }

                await loadLocalCategories();
                onCategoriesChange();
                
                let message = `ייבוא הושלם!\n${importedCategories} קטגוריות חדשות\n${importedEvents} אירועים`;
                if (skippedCategories > 0) {
                    message += `\n${skippedCategories} קטגוריות דולגו (כבר קיימות)`;
                }
                alert(message);
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
        if (!window.confirm('האם אתה בטוח שברצונך למחוק את כל הקטגוריות? פעולה זו לא ניתנת לביטול!')) {
            return;
        }

        try {
            for (const category of localCategories) {
                await Category.delete(category.id);
            }
            await loadLocalCategories();
            onCategoriesChange();
            alert('כל הקטגוריות נמחקו בהצלחה');
        } catch (error) {
            console.error('Error deleting all categories:', error);
            alert('שגיאה במחיקת הקטגוריות: ' + error.message);
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] [&>button]:hidden" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle className="text-right">הגדרות קטגוריות</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-6">

                    <h3 className="text-lg font-semibold text-right">קטגוריות קיימות</h3>
                    {localCategories.length === 0 ? (
                        <p className="text-gray-500 text-center">אין קטגוריות</p>
                    ) : (
                        <div className="space-y-2">
                            {localCategories.map((category) => {
                                const IconComponent = getIconComponent(category.icon);
                                return (
                                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-4 h-4 rounded-full" 
                                                style={{ backgroundColor: category.color }}
                                            ></div>
                                            <IconComponent className="w-4 h-4" style={{ color: category.color }} />
                                            <span className="font-medium">{category.name}</span>
                                            {category.keywords && category.keywords.length > 0 && (
                                                <span className="text-xs text-gray-500 mr-2">
                                                    ({category.keywords.join(', ')})
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleEditClick(category)}
                                                className="h-8 w-8"
                                            >
                                                <Edit3 className="w-4 h-4 text-gray-500" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="h-8 w-8"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {/* Category Add/Edit Form - Moved below existing categories */}
                    <h3 className="text-lg font-semibold text-right mt-6">
                        {editingCategory ? 'ערוך קטגוריה' : 'הוסף קטגוריה חדשה'}
                    </h3>
                    <div className="space-y-6">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category-name" className="text-right">
                                שם קטגוריה
                            </Label>
                            <Input
                                id="category-name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="col-span-3"
                                placeholder="למשל: כושר"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right mt-2">
                                צבע
                            </Label>
                            <div className="col-span-3 grid grid-cols-10 gap-2">
                                {availableColors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setNewCategoryColor(color)}
                                        className={`w-6 h-6 rounded-lg border-2 transition-all ${
                                            newCategoryColor === color ? 'border-gray-400 ring-2 ring-gray-300' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right mt-2">
                                אייקון
                            </Label>
                            <div className="col-span-3 grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
                                {availableIcons.map(iconData => {
                                    const IconComponent = iconData.icon;
                                    return (
                                        <button
                                            key={iconData.name}
                                            onClick={() => setNewCategoryIcon(iconData.name)}
                                            className={`p-2 rounded-lg border-2 flex items-center justify-center hover:bg-gray-50 transition-all ${
                                                newCategoryIcon === iconData.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                            }`}
                                        >
                                            <IconComponent className="w-5 h-5 text-gray-600" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="category-keywords" className="text-right mt-2">
                                מילות מפתח
                            </Label>
                            <Textarea 
                                id="category-keywords"
                                value={newCategoryKeywords}
                                onChange={(e) => setNewCategoryKeywords(e.target.value)}
                                placeholder="חדר כושר, ריצה, הליכה, אימון"
                                className="col-span-3 h-20 text-right resize-none"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            {editingCategory && (
                                <Button 
                                    variant="outline" 
                                    onClick={handleCancelEdit}
                                    className="px-5 py-2.5"
                                >
                                    ביטול עריכה
                                </Button>
                            )}
                            <Button 
                                onClick={handleAddOrUpdateCategory}
                                disabled={!newCategoryName.trim() || !newCategoryKeywords.trim()}
                                className="px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-base"
                            >
                                {editingCategory ? 'שמור שינויים' : 'הוסף קטגוריה'}
                            </Button>
                        </div>
                    </div>

                    {/* Export/Import Section */}
                    <div className="border-t pt-6 mt-6 border-gray-200">
                        <h3 className="text-lg font-semibold text-right">ייבוא וייצוא נתונים</h3>
                        <p className="text-sm text-gray-500 text-right mb-4">
                            שמור את הקטגוריות והאירועים שלך או טען אותם מקובץ.
                        </p>
                        {/* כפתורי ייצוא, ייבוא ומחיקה */}
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
                            <Button 
                                onClick={handleDeleteAllCategories} 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                                <Trash2 className="w-3 h-3 ml-1" />
                                מחק הכל
                            </Button>
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
