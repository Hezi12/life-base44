import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
    Plus, Trash2, Edit3, RefreshCw, Download, Upload, ChevronDown, ChevronUp, Play,
    Briefcase, Code, Brain, Lightbulb, Target, Settings, BookOpen, Zap, Star,
    Monitor, Smartphone, Database, Palette, Music, Camera, Shield, Globe,
    Mail, Phone, Calendar, Map, Clock, Bell, Heart, Home, User, Search,
    Coffee, Dumbbell, Car, Plane, ShoppingBag, Gamepad2, Headphones
} from "lucide-react";
import { WorkSubject } from "@/api/entities";
import { PomodoroSettings } from "@/api/entities";

// מערכת אייקונים עבור נושאי עבודה
const availableIcons = [
    // נושאי עבודה טכניים
    { name: 'Code', component: Code, color: '#22c55e' },
    { name: 'Database', component: Database, color: '#3b82f6' },
    { name: 'Monitor', component: Monitor, color: '#6366f1' },
    { name: 'Smartphone', component: Smartphone, color: '#8b5cf6' },
    { name: 'Globe', component: Globe, color: '#06b6d4' },
    
    // נושאי עבודה כלליים
    { name: 'Briefcase', component: Briefcase, color: '#374151' },
    { name: 'Target', component: Target, color: '#dc2626' },
    { name: 'Brain', component: Brain, color: '#ec4899' },
    { name: 'Lightbulb', component: Lightbulb, color: '#f59e0b' },
    { name: 'BookOpen', component: BookOpen, color: '#16a34a' },
    { name: 'Settings', component: Settings, color: '#6b7280' },
    { name: 'Zap', component: Zap, color: '#eab308' },
    { name: 'Star', component: Star, color: '#f97316' },
    
    // תקשורת ופגישות
    { name: 'Mail', component: Mail, color: '#4338ca' },
    { name: 'Phone', component: Phone, color: '#2563eb' },
    { name: 'Calendar', component: Calendar, color: '#059669' },
    { name: 'Map', component: Map, color: '#10b981' },
    { name: 'Clock', component: Clock, color: '#64748b' },
    { name: 'Bell', component: Bell, color: '#f97316' },
    
    // יצירתיים
    { name: 'Palette', component: Palette, color: '#f59e0b' },
    { name: 'Music', component: Music, color: '#ec4899' },
    { name: 'Camera', component: Camera, color: '#a855f7' },
    { name: 'Headphones', component: Headphones, color: '#8b5cf6' },
    
    // כלליים
    { name: 'Shield', component: Shield, color: '#3b82f6' },
    { name: 'Heart', component: Heart, color: '#ef4444' },
    { name: 'Home', component: Home, color: '#3b82f6' },
    { name: 'User', component: User, color: '#8b5cf6' },
    { name: 'Search', component: Search, color: '#22c55e' },
    { name: 'Coffee', component: Coffee, color: '#f97316' },
    { name: 'Dumbbell', component: Dumbbell, color: '#ef4444' },
    { name: 'Car', component: Car, color: '#374151' },
    { name: 'Plane', component: Plane, color: '#3b82f6' },
    { name: 'ShoppingBag', component: ShoppingBag, color: '#ec4899' },
    { name: 'Gamepad2', component: Gamepad2, color: '#8b5cf6' }
];

// פונקציה לקבלת קומפוננט אייקון
const getIconComponent = (iconName) => {
    const iconData = availableIcons.find(icon => icon.name === iconName);
    return iconData ? iconData.component : Briefcase;
};

// מערכת צלצולים
const SOUND_OPTIONS = [
    { id: 'gentle_bell', name: 'פעמון עדין' },
    { id: 'deep_gong', name: 'גונג עמוק' },
    { id: 'crystal_tone', name: 'טון קריסטל' },
    { id: 'soft_chime', name: 'פעמון רך' },
    { id: 'nature_bird', name: 'צפור טבעית' },
    { id: 'meditation_bowl', name: 'קערת מדיטציה' },
    { id: 'wind_harmony', name: 'הרמוניית רוח' },
    { id: 'water_drop', name: 'טיפת מים' },
    { id: 'bamboo_knock', name: 'דפיקת במבוק' },
    { id: 'temple_peace', name: 'שלווה במקדש' }
];

// פונקציה ליצירת צלצולים
const playTestSound = (soundId) => {
    try {
        // בדיקה אם AudioContext זמין
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            console.log('AudioContext not supported');
            return;
        }
        
        const audioContext = new AudioContext();
        
        // אם AudioContext מושעה, נסה להפעיל אותו
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('AudioContext resumed');
            }).catch(err => {
                console.log('Failed to resume AudioContext:', err);
            });
        }
        
        const createSound = (freq, duration, waveType = 'sine', fadeOut = true) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.type = waveType;
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.02);
            
            if (fadeOut) {
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            } else {
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + duration - 0.1);
                gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + duration);
            }
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };

        switch(soundId) {
            case 'gentle_bell':
                createSound(523.25, 2.0);
                createSound(659.25, 1.8);
                createSound(783.99, 1.5);
                break;
            case 'deep_gong':
                createSound(98, 3.0, 'sine');
                setTimeout(() => createSound(196, 2.5, 'sine'), 200);
                setTimeout(() => createSound(294, 2.0, 'sine'), 400);
                break;
            case 'crystal_tone':
                createSound(1047, 1.0, 'triangle');
                setTimeout(() => createSound(1397, 0.8, 'triangle'), 300);
                setTimeout(() => createSound(1865, 0.6, 'triangle'), 600);
                break;
            case 'soft_chime':
                createSound(440, 1.5, 'triangle');
                setTimeout(() => createSound(554, 1.2, 'triangle'), 400);
                break;
            case 'nature_bird':
                const freq1 = 800;
                const oscillator1 = audioContext.createOscillator();
                const gain1 = audioContext.createGain();
                oscillator1.connect(gain1);
                gain1.connect(audioContext.destination);
                oscillator1.frequency.setValueAtTime(freq1, audioContext.currentTime);
                oscillator1.frequency.exponentialRampToValueAtTime(freq1 * 1.5, audioContext.currentTime + 0.3);
                oscillator1.frequency.exponentialRampToValueAtTime(freq1 * 0.8, audioContext.currentTime + 0.6);
                oscillator1.type = 'sine';
                gain1.gain.setValueAtTime(0.15, audioContext.currentTime);
                gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.2);
                oscillator1.start(audioContext.currentTime);
                oscillator1.stop(audioContext.currentTime + 1.2);
                break;
            case 'meditation_bowl':
                const freq2 = 174;
                const oscillator2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();
                const lfo = audioContext.createOscillator();
                const lfoGain = audioContext.createGain();
                
                lfo.frequency.setValueAtTime(4, audioContext.currentTime);
                lfoGain.gain.setValueAtTime(10, audioContext.currentTime);
                lfo.connect(lfoGain);
                lfoGain.connect(oscillator2.frequency);
                
                oscillator2.frequency.setValueAtTime(freq2, audioContext.currentTime);
                oscillator2.connect(gain2);
                gain2.connect(audioContext.destination);
                oscillator2.type = 'sine';
                
                gain2.gain.setValueAtTime(0.15, audioContext.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2.5);
                
                lfo.start(audioContext.currentTime);
                oscillator2.start(audioContext.currentTime);
                lfo.stop(audioContext.currentTime + 2.5);
                oscillator2.stop(audioContext.currentTime + 2.5);
                break;
            case 'wind_harmony':
                createSound(330, 2.0, 'sine');
                setTimeout(() => createSound(415, 1.8, 'sine'), 200);
                setTimeout(() => createSound(495, 1.6, 'sine'), 400);
                setTimeout(() => createSound(660, 1.4, 'sine'), 600);
                break;
            case 'water_drop':
                createSound(1200, 0.1, 'sine', false);
                setTimeout(() => createSound(800, 0.15, 'sine', false), 150);
                setTimeout(() => createSound(600, 0.2, 'sine'), 350);
                break;
            case 'bamboo_knock':
                createSound(180, 0.2, 'square', false);
                setTimeout(() => createSound(160, 0.2, 'square', false), 250);
                setTimeout(() => createSound(140, 0.3, 'square'), 500);
                break;
            case 'temple_peace':
                createSound(174, 3.0);
                setTimeout(() => createSound(220, 2.8), 300);
                setTimeout(() => createSound(261, 2.5), 600);
                setTimeout(() => createSound(174 * 2, 2.0), 900);
                break;
            default:
                createSound(440, 1.0);
        }
        
    } catch (error) {
        console.log('Cannot play test sound:', error);
    }
};

// רכיב בחירת צלצול
const SoundSelector = ({ value, onChange, label }) => {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-right">{label}</Label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {SOUND_OPTIONS.map(sound => (
                    <div key={sound.id} className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex items-center gap-2">
                            <input
                                type="radio"
                                id={`${label}-${sound.id}`}
                                name={`${label}-sound-selector`}
                                checked={value === sound.id}
                                onChange={() => onChange(sound.id)}
                                className="w-4 h-4"
                            />
                            <label htmlFor={`${label}-${sound.id}`} className="text-sm cursor-pointer text-right">
                                {sound.name}
                            </label>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                playTestSound(sound.id);
                            }}
                            className="h-7 w-7"
                            type="button"
                        >
                            <Play className="w-3 h-3" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// RadioToggle component
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

export default function SubjectSettings({ isOpen, onClose, onSubjectsChange }) {
    const [localSubjects, setLocalSubjects] = useState([]);
    const [pomodoroSettings, setPomodoroSettings] = useState({
        work_duration_minutes: 25,
        break_duration_minutes: 5,
        work_end_sound: 'gentle_bell',
        break_end_sound: 'deep_gong',
        sound_enabled: true
    });
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectColor, setNewSubjectColor] = useState('#3b82f6');
    const [newSubjectIcon, setNewSubjectIcon] = useState('Briefcase');
    const [editingSubject, setEditingSubject] = useState(null);
    const [deletingSubjectId, setDeletingSubjectId] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isExistingSubjectsOpen, setIsExistingSubjectsOpen] = useState(false);

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
            loadLocalSubjects();
            loadPomodoroSettings();
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setNewSubjectName('');
        setNewSubjectColor('#3b82f6');
        setNewSubjectIcon('Briefcase');
        setEditingSubject(null);
    };

    const loadLocalSubjects = async () => {
        try {
            const subjects = await WorkSubject.list();
            setLocalSubjects(subjects);
        } catch (error) {
            console.error('Error loading subjects:', error);
        }
    };

    const loadPomodoroSettings = async () => {
        try {
            const settings = await PomodoroSettings.list();
            if (settings.length > 0) {
                const loadedSettings = settings[0];
                const workEndSound = SOUND_OPTIONS.find(s => s.id === loadedSettings.work_end_sound) ? loadedSettings.work_end_sound : 'gentle_bell';
                const breakEndSound = SOUND_OPTIONS.find(s => s.id === loadedSettings.break_end_sound) ? loadedSettings.break_end_sound : 'deep_gong';

                setPomodoroSettings({
                    ...loadedSettings,
                    work_end_sound: workEndSound,
                    break_end_sound: breakEndSound
                });
            }
        } catch (error) {
            console.error('Error loading pomodoro settings:', error);
        }
    };

    const savePomodoroSettings = async () => {
        try {
            const existing = await PomodoroSettings.list();
            if (existing.length > 0) {
                await PomodoroSettings.update(existing[0].id, pomodoroSettings);
            } else {
                await PomodoroSettings.create(pomodoroSettings);
            }
        } catch (error) {
            console.error('Error saving pomodoro settings:', error);
        }
    };

    const handleSubmitSubject = async () => {
        if (!newSubjectName.trim()) return;

        try {
            const subjectData = {
                name: newSubjectName.trim(),
                color: newSubjectColor,
                icon: newSubjectIcon
            };

            if (editingSubject) {
                await WorkSubject.update(editingSubject.id, subjectData);
            } else {
                await WorkSubject.create(subjectData);
            }

            resetForm();
            await loadLocalSubjects();
            onSubjectsChange();
        } catch (error) {
            console.error('Error saving subject:', error);
        }
    };

    const handleDeleteSubject = async (id) => {
        if (deletingSubjectId === id) return;
        setDeletingSubjectId(id);

        try {
            await WorkSubject.delete(id);
            await loadLocalSubjects();
            onSubjectsChange();
        } catch (error) {
            console.error('Error deleting subject:', error);
        } finally {
            setDeletingSubjectId(null);
        }
    };

    const handleEditSubject = (subject) => {
        setEditingSubject(subject);
        setNewSubjectName(subject.name);
        setNewSubjectColor(subject.color || '#3b82f6');
        setNewSubjectIcon(subject.icon || 'Briefcase');
    };

    const handleExportData = async () => {
        try {
            const subjects = await WorkSubject.list();

            const exportData = {
                subjects,
                exported_at: new Date().toISOString(),
                version: "1.0"
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});

            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `work_subjects_backup_${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
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

                if (importData.subjects && Array.isArray(importData.subjects)) {
                    for (const subject of importData.subjects) {
                        const { id, created_date, updated_date, created_by, ...subjectData } = subject;
                        await WorkSubject.create(subjectData);
                    }
                }

                await loadLocalSubjects();
                onSubjectsChange();
            } catch (error) {
                console.error('Error importing data:', error);
            } finally {
                setIsImporting(false);
                event.target.value = '';
            }
        };

        reader.readAsText(file);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] [&>button]:hidden" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle className="text-right">הגדרות מחשב</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="subjects" className="w-full">
                    <TabsList className="bg-transparent p-0 h-auto grid w-full grid-cols-2">
                        <TabsTrigger 
                            value="subjects" 
                            className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent text-sm font-medium"
                        >
                            נושאי עבודה
                        </TabsTrigger>
                        <TabsTrigger 
                            value="pomodoro" 
                            className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent text-sm font-medium"
                        >
                            פומודורו
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="subjects" className="space-y-4">
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
                                id="import-subjects"
                                disabled={isImporting}
                            />
                            <Button
                                onClick={() => document.getElementById('import-subjects').click()}
                                variant="outline"
                                size="sm"
                                disabled={isImporting}
                            >
                                <Upload className="w-3 h-3 ml-1" />
                                {isImporting ? 'מייבא...' : 'ייבוא'}
                            </Button>
                        </div>
                    </div>

                    {/* טופס יצירת/עריכת נושא */}
                    <div className="space-y-3">
                        <Input
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            placeholder="שם נושא"
                            className="text-right"
                        />

                        <div className="flex items-center gap-3">
                            <Label className="text-sm">צבע:</Label>
                            <div className="flex gap-1 flex-wrap">
                                {availableColors.slice(0, 18).map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setNewSubjectColor(color)}
                                        className={`w-5 h-5 rounded border-2 transition-all hover:scale-110 ${
                                            newSubjectColor === color ? 'border-gray-800 ring-1 ring-gray-400' : 'border-gray-300'
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
                                            onClick={() => setNewSubjectIcon(iconData.name)}
                                            className={`p-1.5 rounded border transition-all hover:bg-gray-50 ${
                                                newSubjectIcon === iconData.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                            }`}
                                        >
                                            <IconComponent
                                                className="w-3 h-3"
                                                style={{ color: newSubjectColor }}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            {editingSubject && (
                                <Button variant="outline" size="sm" onClick={resetForm}>
                                    ביטול
                                </Button>
                            )}
                            <Button
                                onClick={handleSubmitSubject}
                                disabled={!newSubjectName.trim()}
                                className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                                size="sm"
                            >
                                {editingSubject ? 'שמור' : 'הוסף'}
                            </Button>
                        </div>
                    </div>

                    {/* נושאים קיימים */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-2">
                            <Button
                                variant="ghost"
                                onClick={() => setIsExistingSubjectsOpen(!isExistingSubjectsOpen)}
                                className="flex-1 justify-between text-sm"
                            >
                                <span>נושאים קיימים ({localSubjects.length})</span>
                                {isExistingSubjectsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                        </div>

                        {isExistingSubjectsOpen && (
                            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                {localSubjects.map((subject) => {
                                    const IconComponent = getIconComponent(subject.icon);
                                    return (
                                        <div key={subject.id} className="flex items-center justify-between p-2 border rounded bg-gray-50 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-sm flex items-center justify-center"
                                                    style={{ backgroundColor: `${subject.color}20` }}
                                                >
                                                    <IconComponent
                                                        className="w-3 h-3"
                                                        style={{ color: subject.color }}
                                                    />
                                                </div>
                                                <span className="font-medium">{subject.name}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditSubject(subject)}
                                                    className="h-6 w-6"
                                                >
                                                    <Edit3 className="w-3 h-3 text-gray-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteSubject(subject.id)}
                                                    className="h-6 w-6"
                                                    disabled={deletingSubjectId === subject.id}
                                                >
                                                    {deletingSubjectId === subject.id ? (
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
                    </TabsContent>

                    <TabsContent value="pomodoro" className="space-y-6">
                        <div className="py-4 space-y-6">
                            {/* הגדרות זמנים */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-right">זמני פומודורו</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-right">
                                        <Label className="text-sm font-medium mb-2 block text-right">זמן עבודה (דקות)</Label>
                                        <Input
                                            type="number"
                                            min="5"
                                            max="180"
                                            value={pomodoroSettings.work_duration_minutes}
                                            onChange={(e) => setPomodoroSettings({
                                                ...pomodoroSettings,
                                                work_duration_minutes: parseInt(e.target.value) || 0
                                            })}
                                            className="w-20 text-right"
                                        />
                                    </div>
                                    <div className="text-right">
                                        <Label className="text-sm font-medium mb-2 block text-right">זמן הפסקה (דקות)</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="30"
                                            value={pomodoroSettings.break_duration_minutes}
                                            onChange={(e) => setPomodoroSettings({
                                                ...pomodoroSettings,
                                                break_duration_minutes: parseInt(e.target.value) || 0
                                            })}
                                            className="w-20 text-right"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* הגדרות צלצולים */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <RadioToggle
                                            checked={pomodoroSettings.sound_enabled}
                                            onCheckedChange={(checked) => setPomodoroSettings({
                                                ...pomodoroSettings,
                                                sound_enabled: checked
                                            })}
                                        />
                                        <Label className="text-sm">הפעל צלצולים</Label>
                                    </div>
                                    <h3 className="text-lg font-medium">צלצולים</h3>
                                </div>

                                {pomodoroSettings.sound_enabled && (
                                    <div className="space-y-4">
                                        <div className="flex justify-center">
                                            <Button
                                                onClick={() => {
                                                    playTestSound(pomodoroSettings.work_end_sound);
                                                }}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                            >
                                                🔔 בדיקת צליל עבודה
                                            </Button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <SoundSelector
                                                label="צלצול לסיום עבודה"
                                                value={pomodoroSettings.work_end_sound}
                                                onChange={(sound) => setPomodoroSettings({
                                                    ...pomodoroSettings,
                                                    work_end_sound: sound
                                                })}
                                            />
                                            <SoundSelector
                                                label="צלצול לסיום הפסקה"
                                                value={pomodoroSettings.break_end_sound}
                                                onChange={(sound) => setPomodoroSettings({
                                                    ...pomodoroSettings,
                                                    break_end_sound: sound
                                                })}
                                            />
                                        </div>
                                        
                                        <div className="flex justify-center">
                                            <Button
                                                onClick={() => {
                                                    playTestSound(pomodoroSettings.break_end_sound);
                                                }}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                            >
                                                🔔 בדיקת צליל הפסקה
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="flex justify-start">
                    <Button 
                        onClick={async () => {
                            await savePomodoroSettings();
                            onClose();
                        }}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                        size="sm"
                    >
                        שמור הגדרות
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}