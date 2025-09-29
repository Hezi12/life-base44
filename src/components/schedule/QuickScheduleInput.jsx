
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, Trash2, ChevronLeft, ChevronRight, AlertTriangle, RefreshCw } from "lucide-react";
import { Event } from "@/api/entities";
import { WorkTopic } from "@/api/entities";
import CategorySettings from "./CategorySettings";
import moment from "moment";

// הגדרת moment לעברית
moment.updateLocale('he', {
    weekdays: ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'],
    weekdaysShort: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
});

// פונקציה ליצירת מזהה מקוצר
const generateShortId = (fullId) => {
    return fullId.slice(-6).toLowerCase();
};

// פונקציה לחילוץ מזהה מקוצר משורת טקסט
const extractShortId = (line) => {
    const match = line.match(/^\[([a-f0-9]{6})\]\s*/);
    return match ? match[1] : null;
};

// פונקציה להסרת מזהה מקוצר משורת טקסט
const removeShortId = (line) => {
    return line.replace(/^\[([a-f0-9]{6})\]\s*/, '');
};

export default function QuickScheduleInput({ isOpen, onClose, onAddEvents, categories, selectedDate, onDateChange, onDeleteAll }) {
    const [textInput, setTextInput] = useState('');
    const [parsedEvents, setParsedEvents] = useState([]);
    const [existingEvents, setExistingEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('text');
    const [isCategorySettingsOpen, setIsCategorySettingsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // טעינת אירועים קיימים כאשר נפתח הדיאלוג
    useEffect(() => {
        if (isOpen) {
            const loadExistingEvents = async () => {
                try {
                    const dateStr = selectedDate.format('YYYY-MM-DD');
                    const events = await Event.filter({ date: dateStr });
                    setExistingEvents(events);
                    
                    if (events.length > 0) {
                        // המרת האירועים הקיימים לפורמט טקסט עם מזהים מקוצרים
                        const textLines = events
                            .sort((a, b) => moment(a.start_time).diff(moment(b.start_time)))
                            .map(event => {
                                const shortId = generateShortId(event.id);
                                const time = moment(event.start_time).format('HHmm');
                                return `[${shortId}] ${time} ${event.title}`;
                            });
                        
                        setTextInput(textLines.join('\n'));
                        setParsedEvents(events);
                        setActiveTab('edit');
                    } else {
                        setParsedEvents([]);
                        setTextInput('');
                        setActiveTab('text');
                    }
                } catch (error) {
                    console.error('Error loading existing events:', error);
                }
            };
            
            loadExistingEvents();
        }
    }, [isOpen, selectedDate]);

    const detectCategory = (text) => {
        for (const category of categories) {
            if (category.keywords) {
                for (const keyword of category.keywords) {
                    if (text.toLowerCase().includes(keyword.toLowerCase())) {
                        return category;
                    }
                }
            }
        }
        return null;
    };

    const parseScheduleText = (text) => {
        const lines = text.split('\n').filter(line => line.trim());
        const events = [];
        const dayEnd = moment(selectedDate).add(1, 'day').startOf('day');
        
        const eventRegex = /^(?:\[([a-f0-9]{6})\]\s*)?(\d{4})\s+(.+)/;

        lines.forEach(line => {
            const eventMatch = line.match(eventRegex);

            if (eventMatch) {
                const [, shortId, timeStr, title] = eventMatch;
                const hours = parseInt(timeStr.substring(0, 2));
                const minutes = parseInt(timeStr.substring(2, 4));
                
                // מציאת אירוע קיים לפי מזהה מקוצר
                let existingEvent = null;
                if (shortId) {
                    existingEvent = existingEvents.find(e => generateShortId(e.id) === shortId);
                }
                
                const startTime = moment(selectedDate).hours(hours).minutes(minutes).seconds(0);
                
                let category, categoryColor, categoryIcon;
                
                if (existingEvent) {
                    // שמירת קטגוריה מהאירוע הקיים
                    category = existingEvent.category;
                    categoryColor = existingEvent.category_color;
                    categoryIcon = existingEvent.category_icon;
                } else {
                    // זיהוי קטגוריה חדשה לאירוע חדש
                    const detectedCategory = detectCategory(title);
                    category = detectedCategory?.name || '';
                    categoryColor = detectedCategory?.color || '#6b7280';
                    categoryIcon = detectedCategory?.icon || '';
                }
                
                const eventData = {
                    title: title.trim(),
                    start_time: startTime.toISOString(),
                    category,
                    category_color: categoryColor,
                    category_icon: categoryIcon,
                };

                // אם זה אירוע קיים, שמור את ה-ID שלו
                if (existingEvent) {
                    eventData.id = existingEvent.id;
                }

                events.push(eventData);
            }
        });

        // חישוב זמני סיום
        events.forEach((event, index) => {
            if (index < events.length - 1) {
                event.end_time = events[index + 1].start_time;
            } else {
                const endTime = moment(event.start_time).add(3, 'hours');
                event.end_time = moment.min(endTime, dayEnd).toISOString();
            }
        });

        return events;
    };

    const handleParseText = () => {
        const newlyParsedEvents = parseScheduleText(textInput);
        setParsedEvents(newlyParsedEvents);
        setActiveTab('edit');
    };

    const adjustEventTime = (eventIndex, minutes) => {
        const updatedEvents = [...parsedEvents];
        const newStartTime = moment(updatedEvents[eventIndex].start_time).add(minutes, 'minutes');
        updatedEvents[eventIndex].start_time = newStartTime.toISOString();
        
        const dayEnd = moment(selectedDate).add(1, 'day').startOf('day');
        
        if (eventIndex > 0) {
            updatedEvents[eventIndex - 1].end_time = newStartTime.toISOString();
        }
        
        // עדכון זמני סיום
        updatedEvents.forEach((event, idx) => {
            if (idx < updatedEvents.length - 1) {
                event.end_time = updatedEvents[idx + 1].start_time;
            } else {
                const endTime = moment(event.start_time).add(3, 'hours');
                event.end_time = moment.min(endTime, dayEnd).toISOString();
            }
        });
        
        setParsedEvents(updatedEvents);
    };

    const removeEvent = (eventIndex) => {
        const updatedEvents = parsedEvents.filter((_, index) => index !== eventIndex);
        const dayEnd = moment(selectedDate).add(1, 'day').startOf('day');
        
        // עדכון זמני סיום
        updatedEvents.forEach((event, index) => {
            if (index < updatedEvents.length - 1) {
                event.end_time = updatedEvents[index + 1].start_time;
            } else {
                const endTime = moment(event.start_time).add(3, 'hours');
                event.end_time = moment.min(endTime, dayEnd).toISOString();
            }
        });
        
        setParsedEvents(updatedEvents);
    };

    const removeAllEvents = () => {
        onDeleteAll();
        setParsedEvents([]);
    };
    
    const handleCategoryChange = (eventIndex, newCategoryName) => {
        const updatedEvents = [...parsedEvents];
        const eventToUpdate = updatedEvents[eventIndex];

        const selectedCategory = categories.find(cat => cat.name === newCategoryName);

        if (selectedCategory) {
            eventToUpdate.category = selectedCategory.name;
            eventToUpdate.category_color = selectedCategory.color;
            eventToUpdate.category_icon = selectedCategory.icon;
        } else {
            eventToUpdate.category = '';
            eventToUpdate.category_color = '#6b7280';
            eventToUpdate.category_icon = '';
        }

        setParsedEvents(updatedEvents);
    };

    const handleSubmit = () => {
        setIsUpdating(true);
        
        const finalEvents = parsedEvents.map(event => ({
            ...event,
            date: moment(event.start_time).format('YYYY-MM-DD')
        }));

        onAddEvents(finalEvents);
        setTextInput('');
        setParsedEvents([]);
        onClose();
        
        setTimeout(() => setIsUpdating(false), 2000);
    };

    const handleClose = () => {
        setTextInput('');
        setParsedEvents([]);
        setActiveTab('text');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] w-[95vw] max-h-[90vh] overflow-y-auto [&>button]:hidden" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle className="text-right text-lg sm:text-xl">
                        {parsedEvents.length > 0 && activeTab === 'edit' ? 'עריכת לוח זמנים' : 'הוסף לוח זמנים'}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex justify-center items-center gap-2 sm:gap-4 mb-4">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDateChange(moment(selectedDate).subtract(1, 'day'))}
                        className="h-8 w-8 sm:h-10 sm:w-10"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                    
                    <Card className="px-2 sm:px-3 py-1 sm:py-1.5 border-gray-100 shadow-none">
                        <CardContent className="p-0 text-center">
                            <p className="text-sm sm:text-base font-medium">{moment(selectedDate).format('dddd DD/MM/YYYY')}</p>
                        </CardContent>
                    </Card>
                    
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDateChange(moment(selectedDate).add(1, 'day'))}
                        className="h-8 w-8 sm:h-10 sm:w-10"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
                    <TabsList className="bg-transparent p-0 h-auto mb-4 w-full grid grid-cols-2">
                        <TabsTrigger 
                            value="text" 
                            className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent text-sm sm:text-base"
                        >
                            תכנון
                        </TabsTrigger>
                        <TabsTrigger 
                            value="edit"
                            className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent text-sm sm:text-base"
                        >
                            עריכה ({parsedEvents.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="space-y-4">
                        <Textarea 
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder=""
                            className="h-48 sm:h-64 text-sm sm:text-base font-mono resize-none border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-300 text-right"
                            dir="rtl"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            data-form-type="other"
                        />
                        <div className="flex justify-start">
                            <Button onClick={handleParseText} disabled={!textInput.trim()} size="sm">
                                פרסור ועריכה
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="edit" className="space-y-4">
                        {parsedEvents.length > 0 && (
                            <div className="flex justify-between items-center mb-4">
                                <Button 
                                    variant="outline" 
                                    onClick={removeAllEvents}
                                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 text-xs sm:text-sm"
                                    size="sm"
                                >
                                    מחק את כל הלוז
                                </Button>
                                
                                {isUpdating && (
                                    <div className="flex items-center gap-2 text-blue-600 text-sm">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>מעדכן...</span>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-2">
                            {parsedEvents.map((event, index) => (
                                <Card key={index} className="border-gray-100 shadow-none hover:shadow-md transition-shadow">
                                    <CardContent className="p-3 sm:p-4">
                                        {/* Mobile Layout */}
                                        <div className="sm:hidden">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-blue-100" onClick={() => adjustEventTime(index, 5)}>
                                                        <Plus className="w-3 h-3 text-blue-600" />
                                                    </Button>
                                                    <div className="text-sm font-mono font-semibold text-gray-700 w-12 text-center">
                                                        {moment(event.start_time).format('HH:mm')}
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-blue-100" onClick={() => adjustEventTime(index, -5)}>
                                                        <Minus className="w-3 h-3 text-blue-600" />
                                                    </Button>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeEvent(index)}>
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="text-sm font-medium flex-1 flex items-center gap-2">
                                                    {event.id && <span className="text-xs text-blue-600 bg-blue-50 px-1 rounded">קיים</span>}
                                                    {event.title}
                                                </div>
                                                {(!event.category || event.category === '') && (
                                                    <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" title="ללא קטגוריה" />
                                                )}
                                            </div>
                                            <Select value={event.category || "none"} onValueChange={(value) => handleCategoryChange(index, value === "none" ? "" : value)}>
                                                <SelectTrigger className="w-full text-xs">
                                                    <SelectValue placeholder="בחר קטגוריה" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[200px] overflow-y-auto">
                                                    <SelectItem value="none">ללא קטגוריה</SelectItem>
                                                    {categories.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden sm:flex items-center gap-4">
                                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-blue-100" onClick={() => adjustEventTime(index, 5)}>
                                                    <Plus className="w-3 h-3 text-blue-600" />
                                                </Button>
                                                <div className="text-sm font-mono font-semibold text-gray-700 w-12 text-center">
                                                    {moment(event.start_time).format('HH:mm')}
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-blue-100" onClick={() => adjustEventTime(index, -5)}>
                                                    <Minus className="w-3 h-3 text-blue-600" />
                                                </Button>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="font-medium text-right flex items-center gap-2">
                                                    {event.id && <span className="text-xs text-blue-600 bg-blue-50 px-1 rounded">קיים</span>}
                                                    {event.title}
                                                </span>
                                                {(!event.category || event.category === '') && (
                                                    <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" title="ללא קטגוריה" />
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Select value={event.category || "none"} onValueChange={(value) => handleCategoryChange(index, value === "none" ? "" : value)}>
                                                    <SelectTrigger className="w-[120px] text-xs">
                                                        <SelectValue placeholder="קטגוריה" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-[200px] overflow-y-auto">
                                                        <SelectItem value="none">ללא קטגוריה</SelectItem>
                                                        {categories.map(cat => (
                                                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeEvent(index)}>
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="flex justify-start">
                    <Button 
                        onClick={handleSubmit} 
                        disabled={parsedEvents.length === 0}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                        size="sm"
                    >
                        {parsedEvents.some(e => e.id) ? 'עדכן לוח זמנים' : 'הוסף לוח זמנים'}
                    </Button>
                </DialogFooter>
            </DialogContent>

            <CategorySettings
                isOpen={isCategorySettingsOpen}
                onClose={() => setIsCategorySettingsOpen(false)}
                onCategoriesChange={() => {
                    setIsCategorySettingsOpen(false);
                }}
            />
        </Dialog>
    );
}
