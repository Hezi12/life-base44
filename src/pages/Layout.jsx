

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Target, Calendar, Monitor, RotateCcw, MessageCircle, Palette, Menu, X, Home, Plus, Focus, Clock } from "lucide-react";
import QuickScheduleInput from '../components/schedule/QuickScheduleInput';
import { Category } from "@/api/entities";
import { Event } from "@/api/entities";
import { WorkTopic } from "@/api/entities";
import { User } from "@/api/entities"; // Import User entity
import { FocusSession, FocusSetting } from "@/api/entities";
import moment from "moment";

const navigationItems = [
  {
    title: "מיקוד",
    url: createPageUrl("Focus"),
    icon: Target,
    color: "text-blue-500",
  },
  {
    title: "לו״ז",
    url: createPageUrl("Schedule"),
    icon: Calendar,
    color: "text-green-500",
  },
  {
    title: "במחשב",
    url: createPageUrl("Computer"),
    icon: Monitor,
    color: "text-purple-500",
  },
  {
    title: "הרגלים",
    url: createPageUrl("Habits"),
    icon: RotateCcw,
    color: "text-orange-500",
  },
  {
    title: "צ׳אט",
    url: createPageUrl("Chat"),
    icon: MessageCircle,
    color: "text-pink-500",
  },
  {
    title: "עיצוב",
    url: createPageUrl("Design"),
    icon: Palette,
    color: "text-indigo-500",
  },
];

function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Link 
      to={createPageUrl("Dashboard")}
      className="flex flex-col items-center text-center hover:opacity-70 transition-opacity"
    >
      <div className="text-sm font-mono font-bold text-gray-800">
        {time.getHours().toString().padStart(2, '0')}
      </div>
      <div className="text-xs font-mono font-medium text-gray-600">
        {time.getMinutes().toString().padStart(2, '0')}
      </div>
      <div className="text-xs font-mono text-gray-400">
        {time.getSeconds().toString().padStart(2, '0')}
      </div>
    </Link>
  );
}

export default function Layout({ children, currentPageName }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickScheduleOpen, setIsQuickScheduleOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentDate, setCurrentDate] = useState(moment());
  const [nextFocusTime, setNextFocusTime] = useState('');
  const location = useLocation();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await Category.list();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // טעינת זמן המיקוד הבא
  useEffect(() => {
    const loadNextFocusTime = async () => {
      try {
        // טען את המיקוד האחרון
        const lastSession = await FocusSession.list('-session_number', 1);
        
        if (lastSession.length > 0 && lastSession[0].next_session_suggestion) {
          const nextTime = moment(lastSession[0].next_session_suggestion);
          const now = moment();
          
          // אם הזמן הבא הוא היום, הצג רק שעה
          if (nextTime.isSame(now, 'day')) {
            setNextFocusTime(nextTime.format('HH:mm'));
          } else {
            // אם זה יום אחר, הצג תאריך ושעה
            setNextFocusTime(nextTime.format('DD/MM HH:mm'));
          }
        } else {
          // ברירת מחדל - 3 שעות קדימה מעוגל ל-5 דקות
          const defaultTime = moment().add(3, 'hours');
          const minutes = defaultTime.minutes();
          const roundedMinutes = Math.ceil(minutes / 5) * 5;
          const roundedTime = defaultTime.minutes(roundedMinutes);
          
          if (roundedTime.isSame(moment(), 'day')) {
            setNextFocusTime(roundedTime.format('HH:mm'));
          } else {
            setNextFocusTime(roundedTime.format('DD/MM HH:mm'));
          }
        }
      } catch (error) {
        console.error('Error loading next focus time:', error);
        // ברירת מחדל פשוטה
        setNextFocusTime('15:30');
      }
    };

    loadNextFocusTime();
  }, []);

  const handleAddEvents = async (eventsData) => {
    setIsQuickScheduleOpen(false);
    
    try {
      const dateStr = currentDate.format('YYYY-MM-DD');
      const allExistingEvents = await Event.filter({ date: dateStr });
      
      const eventsToUpdate = [];
      const eventsToCreate = [];
      const incomingEventIds = new Set();

      eventsData.forEach(eventData => {
        if (eventData.id) {
          eventsToUpdate.push(eventData);
          incomingEventIds.add(eventData.id);
        } else {
          eventsToCreate.push(eventData);
        }
      });

      const eventsToDelete = allExistingEvents.filter(
        existingEvent => !incomingEventIds.has(existingEvent.id)
      );

      // מחיקת אירועים + נושאי עבודה קשורים
      for (const eventToDelete of eventsToDelete) {
        const relatedTopics = await WorkTopic.filter({ event_id: eventToDelete.id });
        for (const topic of relatedTopics) {
          await WorkTopic.delete(topic.id);
        }
        await Event.delete(eventToDelete.id);
      }

      // עדכון אירועים קיימים + התאמת נושאי עבודה
      for (const eventToUpdate of eventsToUpdate) {
        const originalEvent = allExistingEvents.find(e => e.id === eventToUpdate.id);
        
        if (!originalEvent) continue;

        const { id, ...updateData } = eventToUpdate;
        await Event.update(id, updateData);

        if (eventToUpdate.title?.toLowerCase().includes('מחשב') || 
            eventToUpdate.title?.toLowerCase().includes('עבודה') ||
            eventToUpdate.category === 'עבודה') {
          
          const relatedTopics = await WorkTopic.filter({ event_id: eventToUpdate.id });
          
          if (relatedTopics.length > 0) {
            const newStartTime = moment(eventToUpdate.start_time).startOf('minute');
            const newEndTime = moment(eventToUpdate.end_time).startOf('minute');
            const originalStartTime = moment(originalEvent.start_time).startOf('minute');
            
            for (const topic of relatedTopics) {
              const topicStart = moment(topic.start_time).startOf('minute');
              const topicEnd = moment(topic.end_time).startOf('minute');
              
              const relativeStartMinutes = topicStart.diff(originalStartTime, 'minutes');
              const relativeEndMinutes = topicEnd.diff(originalStartTime, 'minutes');
              
              const adjustedStart = newStartTime.clone().add(relativeStartMinutes, 'minutes');
              const adjustedEnd = newStartTime.clone().add(relativeEndMinutes, 'minutes');
              
              if (adjustedStart.isSameOrAfter(newStartTime) && adjustedEnd.isSameOrBefore(newEndTime)) {
                await WorkTopic.update(topic.id, {
                  start_time: adjustedStart.toISOString(),
                  end_time: adjustedEnd.toISOString(),
                  duration_minutes: adjustedEnd.diff(adjustedStart, 'minutes')
                });
              } else {
                await WorkTopic.delete(topic.id);
              }
            }
          }
        }
      }

      // יצירת אירועים חדשים
      if (eventsToCreate.length > 0) {
        await Event.bulkCreate(eventsToCreate);
      }
      
      window.location.reload();
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
        const relatedTopics = await WorkTopic.filter({ event_id: event.id });
        for (const topic of relatedTopics) {
          await WorkTopic.delete(topic.id);
        }
        await Event.delete(event.id);
      }
      setIsQuickScheduleOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error deleting all events:', error);
      alert('שגיאה במחיקת כל האירועים. אנא נסה שוב מאוחר יותר.');
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isHomePage = location.pathname === createPageUrl("Dashboard");

  return (
    <div className="min-h-screen flex bg-white font-sans" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700&display=swap');
        body, h1, h2, h3, h4, h5, h6, p, span, div, button, input, textarea {
          font-family: 'Assistant', sans-serif;
        }
      `}</style>
      
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-20 bg-gray-50 border-l border-gray-100 flex-col items-center py-6 fixed right-0 top-0 bottom-0 z-20">
        <div className="mb-8">
          <DigitalClock />
        </div>
        
        <div className="flex flex-col items-center space-y-2 mb-8">
          {navigationItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-200 hover:bg-gray-200/50 ${
                location.pathname === item.url ? 'bg-gray-200/60' : ''
              }`}
              title={item.title}
            >
              <item.icon 
                className={`w-6 h-6 transition-colors duration-200 ${
                  location.pathname === item.url ? 'text-black' : item.color
                }`} 
              />
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={createPageUrl("ActiveFocusSession")}
              className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all duration-200 group"
              title="מיקוד"
            >
              <Target className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
            </Link>

            <button
              onClick={() => setIsQuickScheduleOpen(true)}
              className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center transition-all duration-200 group"
              title="תכנון מהיר"
            >
              <Calendar className="w-4 h-4 text-green-600 group-hover:text-green-700" />
            </button>

            <button
              disabled
              className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center opacity-40"
              title="בקרוב..."
            >
              <Plus className="w-3 h-3 text-gray-400" />
            </button>

            <button
              disabled
              className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center opacity-40"
              title="בקרוב..."
            >
              <Plus className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Logout button - בתחתית הסרגל */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
            title="יציאה מהחשבון"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="md:hidden">
        {/* Mobile Toolbar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left side - Navigation */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-3 rounded-xl hover:bg-gray-100 transition-colors touch-manipulation"
                title="תפריט"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>

              {!isHomePage && (
                <Link 
                  to={createPageUrl("Dashboard")}
                  className="p-3 rounded-xl hover:bg-gray-100 transition-colors touch-manipulation"
                  title="דף הבית"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <Home className="w-6 h-6 text-gray-700" />
                </Link>
              )}
            </div>

            {/* Right side - Quick actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsQuickScheduleOpen(true)}
                className="p-3 rounded-xl hover:bg-green-50 transition-colors touch-manipulation"
                title="תכנון מהיר"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <Calendar className="w-6 h-6 text-green-600" />
              </button>

              {/* Focus button with time */}
              <div className="flex items-center gap-3">
                <Link
                  to={createPageUrl("ActiveFocusSession")}
                  className="p-3 rounded-xl hover:bg-blue-50 transition-colors touch-manipulation"
                  title="מיקוד"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <Target className="w-6 h-6 text-blue-600" />
                </Link>
                
                {/* Next focus time - minimal design */}
                <div className="text-sm text-gray-500 font-mono px-2 py-1 bg-gray-50 rounded-lg">
                  {nextFocusTime}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`fixed inset-0 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div 
            className={`absolute top-0 right-0 h-full w-72 bg-gray-50 shadow-xl p-6 flex flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            onClick={(e) => e.stopPropagation()}
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            <div className="flex justify-end items-center mb-8">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <X className="w-6 h-6 text-gray-600"/>
              </button>
            </div>
            
            <div className="flex flex-col space-y-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-xl text-lg font-medium transition-colors touch-manipulation ${
                    location.pathname === item.url ? 'bg-gray-200 text-black' : 'text-gray-700 hover:bg-gray-200/60'
                  }`}
                  style={{ minHeight: '56px' }}
                >
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>

            {/* Mobile logout button */}
            <div className="mt-auto pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center p-4 rounded-xl text-lg font-medium text-gray-700 hover:bg-gray-200/60 transition-colors w-full touch-manipulation"
                style={{ minHeight: '56px' }}
              >
                <svg 
                  width="28" 
                  height="28" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="w-7 h-7 text-gray-500"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto md:pr-20 pb-16 md:pb-0">
        {children}
      </main>

      {/* Quick Schedule Input */}
      <QuickScheduleInput
        isOpen={isQuickScheduleOpen}
        onClose={() => setIsQuickScheduleOpen(false)}
        onAddEvents={handleAddEvents}
        categories={categories}
        selectedDate={currentDate}
        onDateChange={setCurrentDate}
        onDeleteAll={handleDeleteAllForDay}
      />
    </div>
  );
}

