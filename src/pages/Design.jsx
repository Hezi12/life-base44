
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check, Clock, Coffee, BookOpen, CheckCircle2, Circle,
  Heart, Star, Home, User, Bell, Search, Plus,
  Edit3, Trash2, Download, Upload, Eye, EyeOff, Lock,
  Unlock, Zap, Lightbulb, Gift, Camera, Droplets, Leaf, Settings, TrendingUp,
  Bookmark, Calendar, Target, Map, Phone, Mail, Globe, Shield,
  Code, Palette, Music, Headphones, Play, Pause, Volume2,
  Wifi, Battery, Bluetooth, Smartphone, Laptop, Monitor,
  BedDouble, Tv2, Waves, Car, ShowerHead, Shirt, Users, Sparkles, GraduationCap, Brain
} from "lucide-react";

const pieData = [
    { name: 'הושלמו', value: 72 },
    { name: 'נותרו', value: 28 },
];

const COLORS = ['#3b82f6', '#e5e7eb'];

const pieData2 = [
    { name: 'עבודה', value: 450 },
    { name: 'פנאי', value: 300 },
    { name: 'סידורים', value: 100 },
    { name: 'ספורט', value: 120 },
];
const COLORS2 = ['#8b5cf6', '#34d399', '#f97316', '#ec4899'];

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

export default function Design() {
  const [isSettingsOpen1, setIsSettingsOpen1] = useState(false);
  const [waterCount, setWaterCount] = useState(6);
  const [isNotificationsOn, setIsNotificationsOn] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-white p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-light text-black mb-10">ספריית עיצוב</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Typography */}
          <Card className="border border-gray-100 shadow-none">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-black">טיפוגרפיה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-light text-black">כותרת ראשית - 3xl font-light</p>
                <p className="text-2xl font-medium text-black">כותרת דף - 2xl font-medium</p>
                <p className="text-xl font-medium text-black">כותרת קארד - xl font-medium</p>
                <p className="text-base text-gray-800">טקסט רגיל - base</p>
                <p className="text-sm text-gray-600">טקסט משני - sm</p>
              </div>
            </CardContent>
          </Card>

          {/* Colors - Much more colors */}
          <Card className="border border-gray-100 shadow-none">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-black">צבעים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 gap-2">
                <div className="w-5 h-5 rounded-lg bg-blue-500"></div>
                <div className="w-5 h-5 rounded-lg bg-blue-600"></div>
                <div className="w-5 h-5 rounded-lg bg-blue-700"></div>
                <div className="w-5 h-5 rounded-lg bg-sky-500"></div>
                <div className="w-5 h-5 rounded-lg bg-cyan-500"></div>
                <div className="w-5 h-5 rounded-lg bg-teal-500"></div>
                <div className="w-5 h-5 rounded-lg bg-emerald-500"></div>
                <div className="w-5 h-5 rounded-lg bg-green-500"></div>
                <div className="w-5 h-5 rounded-lg bg-green-600"></div>
                <div className="w-5 h-5 rounded-lg bg-lime-500"></div>
                <div className="w-5 h-5 rounded-lg bg-yellow-500"></div>
                <div className="w-5 h-5 rounded-lg bg-amber-500"></div>
                <div className="w-5 h-5 rounded-lg bg-orange-500"></div>
                <div className="w-5 h-5 rounded-lg bg-red-500"></div>
                <div className="w-5 h-5 rounded-lg bg-rose-500"></div>
                <div className="w-5 h-5 rounded-lg bg-pink-500"></div>
                <div className="w-5 h-5 rounded-lg bg-fuchsia-500"></div>
                <div className="w-5 h-5 rounded-lg bg-purple-500"></div>
                <div className="w-5 h-5 rounded-lg bg-violet-500"></div>
                <div className="w-5 h-5 rounded-lg bg-indigo-500"></div>
                <div className="w-5 h-5 rounded-lg bg-slate-500"></div>
                <div className="w-5 h-5 rounded-lg bg-gray-500"></div>
                <div className="w-5 h-5 rounded-lg bg-zinc-500"></div>
                <div className="w-5 h-5 rounded-lg bg-neutral-500"></div>
                <div className="w-5 h-5 rounded-lg bg-stone-500"></div>
                <div className="w-5 h-5 rounded-lg bg-blue-400"></div>
                <div className="w-5 h-5 rounded-lg bg-green-400"></div>
                <div className="w-5 h-5 rounded-lg bg-purple-400"></div>
                <div className="w-5 h-5 rounded-lg bg-pink-400"></div>
                <div className="w-5 h-5 rounded-lg bg-orange-400"></div>
                <div className="w-5 h-5 rounded-lg bg-red-400"></div>
                <div className="w-5 h-5 rounded-lg bg-yellow-400"></div>
              </div>
            </CardContent>
          </Card>

          {/* Icons - Updated with more modern icons and smaller sizes */}
          <Card className="border border-gray-100 shadow-none col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-black">אייקונים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-4">
                {[
                  { icon: Heart, color: "text-red-500" },
                  { icon: Star, color: "text-yellow-500" },
                  { icon: Home, color: "text-blue-500" },
                  { icon: Settings, color: "text-gray-600" },
                  { icon: User, color: "text-purple-500" },
                  { icon: Bell, color: "text-orange-500" },
                  { icon: Search, color: "text-green-500" },
                  { icon: Plus, color: "text-blue-600" },
                  { icon: Edit3, color: "text-indigo-500" },
                  { icon: Trash2, color: "text-red-500" },
                  { icon: Download, color: "text-gray-600" },
                  { icon: Upload, color: "text-blue-500" },
                  { icon: Eye, color: "text-gray-500" },
                  { icon: EyeOff, color: "text-gray-400" },
                  { icon: Lock, color: "text-red-600" },
                  { icon: Unlock, color: "text-green-600" },
                  { icon: Zap, color: "text-yellow-500" },
                  { icon: Lightbulb, color: "text-orange-400" },
                  { icon: Gift, color: "text-pink-500" },
                  { icon: Camera, color: "text-purple-400" },
                  { icon: Bookmark, color: "text-cyan-500" },
                  { icon: Calendar, color: "text-green-600" },
                  { icon: Target, color: "text-red-600" },
                  { icon: Map, color: "text-emerald-500" },
                  { icon: Phone, color: "text-blue-600" },
                  { icon: Mail, color: "text-indigo-600" },
                  { icon: BedDouble, color: "text-indigo-400" },
                  { icon: Tv2, color: "text-slate-500" },
                  { icon: Waves, color: "text-cyan-500" },
                  { icon: Car, color: "text-gray-700" },
                  { icon: ShowerHead, color: "text-blue-400" },
                  { icon: Shirt, color: "text-pink-400" },
                  { icon: Users, color: "text-purple-500" },
                  { icon: Sparkles, color: "text-amber-500" },
                  { icon: GraduationCap, color: "text-blue-600" },
                  { icon: Brain, color: "text-pink-500" }
                ].map(({ icon: Icon, color }, index) => (
                  <div key={index} className="flex flex-col items-center space-y-1">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Buttons */}
          <Card className="border border-gray-100 shadow-none col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-black">כפתורים</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">ראשי</p>
                <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-base">שמירה</button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">משני</p>
                <button className="px-5 py-2.5 border border-gray-200 text-gray-900 rounded-xl font-medium hover:bg-gray-50 transition-colors text-base">ביטול</button>
              </div>
              <div className="space-y-2">
                 <p className="text-sm text-gray-600">צבעוני</p>
                <button className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors text-base">הוספת משימה</button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">צבעוני</p>
                <button className="px-5 py-2.5 bg-green-50 text-green-600 rounded-xl font-semibold hover:bg-green-100 transition-colors text-base">אירוע חדש</button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">מחיקה</p>
                <button className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors text-base">מחיקה</button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border border-gray-100 shadow-none col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-black">ציר זמן</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:inset-y-0 before:w-0.5 before:bg-gray-200 before:right-3.5">
                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center ring-4 ring-white z-10"><Zap size={16} className="text-purple-600"/></div>
                  <div>
                    <p className="font-medium">פגישת בוקר</p>
                    <p className="text-sm text-gray-500">9:00 - 9:30</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center ring-4 ring-white z-10"><Leaf size={16} className="text-green-600 animate-pulse"/></div>
                  <div>
                    <p className="font-medium">זמן עבודה ממוקד</p>
                    <p className="text-sm font-semibold text-green-600">9:30 - 12:00</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ring-4 ring-white z-10"><Droplets size={16} className="text-blue-600"/></div>
                  <div>
                    <p className="font-medium">הפסקת צהריים</p>
                    <p className="text-sm text-gray-500">12:00 - 13:00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

           {/* Charts - Fixed */}
          <Card className="border border-gray-100 shadow-none col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-black">מדדים וגרפים</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col items-center">
                <div className="h-48 w-48 relative mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} fill="#8884d8" paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-semibold">{pieData[0].value}%</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-sm">הושלמו</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-300"></div><span className="text-sm">נותרו</span></div>
                </div>
              </div>

              <div className="flex gap-6 items-center">
                <div className="h-36 w-36 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData2} cx="50%" cy="50%" innerRadius={40} outerRadius={60} fill="#8884d8" dataKey="value" stroke="none">
                        {pieData2.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS2[index % COLORS2.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 text-sm flex-1">
                  {pieData2.map((entry, index) => {
                    const total = pieData2.reduce((sum, item) => sum + item.value, 0);
                    const percentage = Math.round((entry.value / total) * 100);
                    const hours = Math.floor(entry.value / 60);
                    const minutes = entry.value % 60;

                    return (
                      <div key={entry.name} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor: COLORS2[index]}}></div>
                          <span className="font-medium">{entry.name}</span>
                        </div>
                        <span className="font-semibold text-gray-700 flex-shrink-0">{percentage}% <span className="text-xs text-gray-500">({hours}h {minutes}m)</span></span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card className="border border-gray-100 shadow-none col-span-1 lg:col-span-2">
            <CardHeader><CardTitle className="text-xl font-medium text-black">טאבים</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-600 mb-2">סגנון 1: קו תחתון</p>
                <Tabs defaultValue="account">
                  <TabsList className="bg-transparent p-0 h-auto">
                    <TabsTrigger value="account" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent">פרופיל</TabsTrigger>
                    <TabsTrigger value="password" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent">התראות</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">סגנון 2: אייקונים מינימלי</p>
                <Tabs defaultValue="account">
                  <TabsList className="bg-transparent p-0 flex gap-1">
                    <TabsTrigger value="account" className="p-2 data-[state=active]:bg-transparent rounded-lg border-2 data-[state=active]:border-gray-300 border-transparent"><User className="w-4 h-4 text-gray-700"/></TabsTrigger>
                    <TabsTrigger value="password" className="p-2 data-[state=active]:bg-transparent rounded-lg border-2 data-[state=active]:border-gray-300 border-transparent"><Bell className="w-4 h-4 text-gray-700"/></TabsTrigger>
                    <TabsTrigger value="settings" className="p-2 data-[state=active]:bg-transparent rounded-lg border-2 data-[state=active]:border-gray-300 border-transparent"><Settings className="w-4 h-4 text-gray-700"/></TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

           {/* Example Tiles */}
          <div className="space-y-8 col-span-1 lg:col-span-2">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medium text-black">אריחים וחלונות קופצים</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen1(true)}>
                  <Settings className="w-5 h-5 text-gray-600"/>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="border border-gray-100 shadow-none col-span-1 flex flex-col justify-center items-center p-4">
                  <p className="text-sm text-gray-500">זמן מיקוד</p>
                  <p className="text-3xl font-semibold mt-1">2.5<span className="text-lg font-medium text-gray-400 mr-2">ש'</span></p>
                </Card>

                <Card className="border border-gray-100 shadow-none w-fit flex items-center p-3 rounded-xl gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-purple-600"/>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600">התקדמות</p>
                    <p className="text-lg font-bold text-purple-900">75%</p>
                  </div>
                </Card>

                <div className="w-fit flex items-end gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time-input">בחירת שעה</Label>
                    <Input id="time-input" type="time" defaultValue="09:00" className="w-28"/>
                  </div>
                </div>

                <Card className="border border-gray-100 shadow-none">
                <CardHeader><CardTitle className="text-lg font-medium">משימות להיום</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 space-x-reverse"><Checkbox id="t1" defaultChecked/><label htmlFor="t1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 line-through text-gray-500">לסיים מצגת</label></div>
                  <div className="flex items-center space-x-2 space-x-reverse"><Checkbox id="t2"/><label htmlFor="t2" className="text-sm font-medium">לקבוע פגישה עם יוסי</label></div>
                  <div className="flex items-center space-x-2 space-x-reverse"><Checkbox id="t3"/><label htmlFor="t3" className="text-sm font-medium">לעדכן דוחות</label></div>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 shadow-none col-span-2">
                <CardHeader><CardTitle className="text-lg font-medium">כתיבה חופשית</CardTitle></CardHeader>
                <CardContent>
                  <Textarea
                    placeholder=""
                    className="h-32 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-200 resize-none"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

           {/* Habit Tracking - Expanded with Apple Style */}
          <Card className="border border-gray-100 shadow-none col-span-1 lg:col-span-2">
            <CardHeader><CardTitle className="text-xl font-medium text-black">מעקב הרגלים</CardTitle></CardHeader>
            <CardContent className="space-y-10">
                {/* Weekly Habit */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3"><BookOpen className="w-5 h-5 text-green-600"/><span className="text-base font-medium">קריאת 10 עמודים</span></div>
                        <span className="text-sm font-semibold text-green-600">5/7</span>
                    </div>
                    <div className="flex justify-between gap-2">
                        {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day, i) => (
                            <div key={day} className="flex flex-col items-center space-y-2">
                                <span className="text-xs text-gray-500 font-medium">{day}</span>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${i < 5 ? 'bg-green-100 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
                                    {i < 5 && <Check className="w-4 h-4 text-green-600"/>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Water Tracking with Counter */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3"><Droplets className="w-5 h-5 text-blue-600"/><span className="text-base font-medium">שתיית מים</span></div>
                        <span className="text-sm font-semibold text-blue-600">{waterCount}/8 כוסות</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {Array.from({length: 8}, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setWaterCount(i + 1)}
                                    className={`w-6 h-6 rounded-full transition-all ${i < waterCount ? 'bg-blue-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                                />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setWaterCount(Math.max(0, waterCount - 1))}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                            >
                                <span className="text-lg">−</span>
                            </button>
                            <button
                                onClick={() => setWaterCount(Math.min(8, waterCount + 1))}
                                className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600"
                            >
                                <span className="text-lg">+</span>
                            </button>
                        </div>
                    </div>
                </div>

                 {/* Progress Bar Habit */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-600" /><span className="font-medium">אנרגיה</span></div>
                        <span className="font-semibold text-yellow-700">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: "60%"}}></div>
                    </div>
                </div>

                {/* Modern Dot Counter Tile - Moved from Example Tiles */}
                <Card className="border border-gray-100 shadow-none p-4 flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><Coffee className="w-4 h-4 text-orange-600"/><span className="text-sm font-medium">מדיטציה</span></div>
                        <span className="text-xs text-gray-500">2/3</span>
                    </div>
                    <div className="flex justify-start gap-2 mt-2">
                        {[1,2,3].map(i => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i <= 2 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                        ))}
                    </div>
                </Card>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* Settings Dialog - Without X button */}
      <Dialog open={isSettingsOpen1} onOpenChange={setIsSettingsOpen1}>
        <DialogContent className="sm:max-w-[425px] [&>button]:hidden" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">הגדרות כלליות</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">קבלת התראות</Label>
              <RadioToggle id="notifications" checked={isNotificationsOn} onCheckedChange={setIsNotificationsOn}/>
            </div>
             <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="time-reminder" className="text-right">תזכורת יומית</Label>
              <Input id="time-reminder" type="time" defaultValue="09:00" className="col-span-2 w-fit" />
            </div>
             <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="date-reminder" className="text-right">תאריך התחלה</Label>
              <Input id="date-reminder" type="date" defaultValue={today} className="col-span-2 w-fit" />
            </div>
          </div>
          <DialogFooter className="flex justify-start">
            <Button
              type="submit"
              onClick={() => setIsSettingsOpen1(false)}
              className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors text-base"
            >
              שמור שינויים
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
