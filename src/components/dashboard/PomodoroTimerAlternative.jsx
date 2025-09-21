
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PomodoroSettings } from '@/api/entities';
import { Plus, ChevronDown, ChevronUp, AlertTriangle, Edit3, Trash2 } from 'lucide-react';
import moment from 'moment';

// פונקציה ליצירת צלצולי פומודורו
const playPomodoroSound = (soundId) => {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const createSound = (freq, duration, waveType = 'sine', fadeOut = true) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.type = waveType;
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.02);
            
            if (fadeOut) {
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            } else {
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + duration - 0.1);
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
                const freq2 = 256;
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
                createSound(523.25, 2.0);
                createSound(659.25, 1.8);
                createSound(783.99, 1.5);
        }
        
    } catch (error) {
        console.error('Cannot play pomodoro sound:', error);
    }
};

// חישוב מחזורים חכם עם הגדרות מותאמות אישית
const calculateCycles = (totalMinutes, workDuration = 60, breakDuration = 5) => {
  const cycles = [];
  let remainingMinutes = totalMinutes;
  
  while (remainingMinutes > 0) {
    const cycleWithBreak = workDuration + breakDuration;
    
    if (remainingMinutes >= cycleWithBreak) {
      const afterRegularCycle = remainingMinutes - cycleWithBreak;
      
      if (afterRegularCycle > 0 && afterRegularCycle < (workDuration * 0.6)) {
        cycles.push({
          type: 'work',
          duration: remainingMinutes,
          hasBreak: false
        });
        remainingMinutes = 0;
      } else {
        cycles.push({
          type: 'work',
          duration: workDuration,
          hasBreak: true
        });
        cycles.push({
          type: 'break',
          duration: breakDuration,
          hasBreak: false
        });
        remainingMinutes -= cycleWithBreak;
      }
    } else {
      if (remainingMinutes >= (workDuration * 0.6)) {
        cycles.push({
          type: 'work',
          duration: remainingMinutes,
          hasBreak: false
        });
        remainingMinutes = 0;
      } else {
        cycles.push({
          type: 'work',
          duration: remainingMinutes,
          hasBreak: false
        });
        remainingMinutes = 0;
      }
    }
  }
  
  return cycles;
};

export default function PomodoroTimerAlternative({ 
  sessionStart, 
  sessionEnd, 
  workTopics, 
  workSubjects, 
  onAddTopic, 
  onUpdateTopic, 
  onDeleteTopic 
}) {
  const [currentCycleIndex, setCurrentCycleIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycles, setCycles] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [settings, setSettings] = useState({
    work_duration_minutes: 60,
    break_duration_minutes: 5,
    work_end_sound: 'gentle_bell',
    break_end_sound: 'deep_gong',
    sound_enabled: true
  });

  // States for work topics management
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [newTopicSubject, setNewTopicSubject] = useState('');
  const [newTopicStart, setNewTopicStart] = useState('');
  const [newTopicEnd, setNewTopicEnd] = useState('');

  // טעינת הגדרות פומודורו
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const pomodoroSettings = await PomodoroSettings.list();
        if (pomodoroSettings.length > 0) {
          setSettings(pomodoroSettings[0]);
        }
      } catch (error) {
        console.error('Error loading pomodoro settings:', error);
      }
    };
    loadSettings();
  }, []);

  // חישוב מחזורים וטיימר
  useEffect(() => {
    if (sessionStart && sessionEnd && settings) {
      const totalMinutes = moment(sessionEnd).diff(moment(sessionStart), 'minutes');
      const calculatedCycles = calculateCycles(
        totalMinutes, 
        settings.work_duration_minutes, 
        settings.break_duration_minutes
      );
      setCycles(calculatedCycles);
      
      const now = moment();
      const sessionStartMoment = moment(sessionStart);
      const adjustedSecondsFromStart = now.diff(sessionStartMoment, 'seconds');
      
      let accumulatedSeconds = 0;
      let currentIndex = 0;
      let timeLeftInCurrentCycle = 0;
      
      for (let i = 0; i < calculatedCycles.length; i++) {
        const cycleEndTimeSeconds = accumulatedSeconds + (calculatedCycles[i].duration * 60);
        
        if (adjustedSecondsFromStart < cycleEndTimeSeconds) {
          currentIndex = i;
          const secondsIntoCurrentCycle = adjustedSecondsFromStart - accumulatedSeconds;
          timeLeftInCurrentCycle = (calculatedCycles[i].duration * 60) - secondsIntoCurrentCycle;
          break;
        }
        
        accumulatedSeconds = cycleEndTimeSeconds;
        
        if (i === calculatedCycles.length - 1) {
          currentIndex = i;
          timeLeftInCurrentCycle = 0;
        }
      }
      
      setCurrentCycleIndex(currentIndex);
      setTimeLeft(Math.max(0, Math.floor(timeLeftInCurrentCycle)));
      setIsActive(timeLeftInCurrentCycle > 0);
    }
  }, [sessionStart, sessionEnd, settings]);

  // טיימר אקטיבי
  useEffect(() => {
    if (!isActive || cycles.length === 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          const currentCycle = cycles[currentCycleIndex];
          if (currentCycle && settings.sound_enabled) {
            if (currentCycle.type === 'work') {
              playPomodoroSound(settings.work_end_sound);
            } else {
              playPomodoroSound(settings.break_end_sound);
            }
          }

          if (currentCycleIndex < cycles.length - 1) {
            const nextIndex = currentCycleIndex + 1;
            setCurrentCycleIndex(nextIndex);
            return cycles[nextIndex].duration * 60;
          } else {
            setIsActive(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, cycles, currentCycleIndex, settings]);

  // Get current work topic based on current time
  const getCurrentWorkTopic = () => {
    const now = moment();
    return workTopics.find(topic => {
      const topicStart = moment(topic.start_time);
      const topicEnd = moment(topic.end_time);
      return now.isBetween(topicStart, topicEnd, null, '[]');
    });
  };

  const currentTopic = getCurrentWorkTopic();

  const handleAddTopic = async () => {
    if (!newTopicSubject || !newTopicStart || !newTopicEnd) return;

    const subject = workSubjects.find(s => s.id === newTopicSubject);
    if (!subject) return;

    const dateStr = moment(sessionStart).format('YYYY-MM-DD');
    const startDateTime = `${dateStr}T${newTopicStart}:00`;
    const endDateTime = `${dateStr}T${newTopicEnd}:00`;

    const topicData = {
      start_time: startDateTime,
      end_time: endDateTime,
      topic: subject.name,
      subject_id: newTopicSubject,
      subject_color: subject.color,
      subject_icon: subject.icon,
      duration_minutes: moment(endDateTime).diff(moment(startDateTime), 'minutes')
    };

    await onAddTopic(topicData);
    
    setNewTopicSubject('');
    setNewTopicStart('');
    setNewTopicEnd('');
    setIsAddingTopic(false);
  };

  const handleUpdateTopic = async () => {
    if (!editingTopic || !newTopicStart || !newTopicEnd) return;

    const dateStr = moment(sessionStart).format('YYYY-MM-DD');
    const startDateTime = `${dateStr}T${newTopicStart}:00`;
    const endDateTime = `${dateStr}T${newTopicEnd}:00`;

    const updatedData = {
      start_time: startDateTime,
      end_time: endDateTime,
      duration_minutes: moment(endDateTime).diff(moment(startDateTime), 'minutes')
    };

    await onUpdateTopic(editingTopic.id, updatedData);
    
    setEditingTopic(null);
    setNewTopicStart('');
    setNewTopicEnd('');
  };

  const startEditTopic = (topic) => {
    setEditingTopic(topic);
    setNewTopicStart(moment(topic.start_time).format('HH:mm'));
    setNewTopicEnd(moment(topic.end_time).format('HH:mm'));
  };

  const cancelEdit = () => {
    setEditingTopic(null);
    setNewTopicStart('');
    setNewTopicEnd('');
  };

  if (!isActive || cycles.length === 0) return null;

  const currentCycle = cycles[currentCycleIndex];
  if (!currentCycle) return null;

  const totalSeconds = currentCycle.duration * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isWorkTime = currentCycle.type === 'work';

  return (
    <div className="w-full mx-auto">
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          {/* Header with session times, current topic, and controls - all in one row */}
          <div className="flex items-center justify-between mb-6">
            {/* Session times - right side */}
            <div className="font-mono text-xs text-gray-500 w-20 whitespace-nowrap">
              {moment(sessionStart).format('HH:mm')} - {moment(sessionEnd).format('HH:mm')}
            </div>

            {/* Current topic - absolutely centered */}
            <div className="flex-1 flex items-center justify-center">
              {currentTopic ? (
                <div className="px-3 py-1 border-2 border-gray-800 rounded-lg bg-white shadow-sm">
                  <div className="text-base font-semibold text-gray-800 text-center">
                    {currentTopic.topic}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 border-2 border-red-400 rounded-lg bg-white shadow-sm">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600 font-medium">אין נושא נוכחי</span>
                </div>
              )}
            </div>

            {/* Controls - left side */}
            <div className="flex items-center gap-2 w-20 justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddingTopic(true)}
                className="h-6 w-6 text-gray-500 hover:text-gray-700"
              >
                <Plus className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsTopicsOpen(!isTopicsOpen)}
                className="h-6 w-6 text-gray-500 hover:text-gray-700"
              >
                {isTopicsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* תצוגת זמן גדולה */}
          <div className="text-center mb-6">
            <div className="text-4xl font-light font-mono text-gray-800 tracking-wider">
              {minutes.toString().padStart(2, '0')}
              <span className="text-gray-400 mx-1">:</span>
              {seconds.toString().padStart(2, '0')}
            </div>
          </div>

          {/* פס התקדמות מודרני */}
          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div 
              className={`absolute top-0 right-0 h-full rounded-full transition-all duration-1000 ease-out ${
                isWorkTime 
                  ? 'bg-gradient-to-l from-blue-500 to-blue-400' 
                  : 'bg-gradient-to-l from-green-500 to-green-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* נקודות אינדיקטור למחזורים */}
          <div className="flex justify-center items-center gap-1">
            {cycles.map((cycle, index) => (
              <div
                key={index}
                className={`transition-all duration-300 ${
                  cycle.type === 'work' 
                    ? 'w-3 h-1 rounded-sm' 
                    : 'w-1 h-1 rounded-full'
                } ${
                  index < currentCycleIndex
                    ? 'bg-gray-300'
                    : index === currentCycleIndex
                    ? cycle.type === 'work'
                      ? 'bg-blue-500 shadow-sm animate-pulse'
                      : 'bg-green-500 shadow-sm animate-pulse'
                    : 'bg-gray-400 shadow-sm'
                }`}
              />
            ))}
          </div>

          {/* Topics management dropdown */}
          {isTopicsOpen && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {workTopics
                  .sort((a, b) => moment(a.start_time).diff(moment(b.start_time)))
                  .map((topic) => (
                    <div key={topic.id} className="flex items-center justify-between text-xs p-2 bg-white rounded border">
                      <div className="flex-1">
                        <span className="font-medium">{topic.topic}</span>
                      </div>
                      
                      {editingTopic?.id === topic.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={newTopicStart}
                            onChange={(e) => setNewTopicStart(e.target.value)}
                            className="text-xs border rounded px-1 py-0.5 w-16"
                          />
                          <span className="text-gray-400">-</span>
                          <input
                            type="time"
                            value={newTopicEnd}
                            onChange={(e) => setNewTopicEnd(e.target.value)}
                            className="text-xs border rounded px-1 py-0.5 w-16"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleUpdateTopic}
                            className="h-5 w-5 text-green-600"
                            title="שמור"
                          >
                            ✓
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEdit}
                            className="h-5 w-5 text-gray-500"
                            title="ביטול"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-mono ml-4">
                            {moment(topic.start_time).format('HH:mm')} - {moment(topic.end_time).format('HH:mm')}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditTopic(topic)}
                              className="h-5 w-5"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteTopic(topic.id)}
                              className="h-5 w-5 text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Topic Dialog */}
      <Dialog open={isAddingTopic} onOpenChange={setIsAddingTopic}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוסף נושא עבודה</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <select 
              value={newTopicSubject}
              onChange={(e) => setNewTopicSubject(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">בחר נושא</option>
              {workSubjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Input
                type="time"
                value={newTopicStart}
                onChange={(e) => setNewTopicStart(e.target.value)}
                placeholder="התחלה"
              />
              <Input
                type="time"
                value={newTopicEnd}
                onChange={(e) => setNewTopicEnd(e.target.value)}
                placeholder="סיום"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingTopic(false)}>ביטול</Button>
              <Button onClick={handleAddTopic}>הוסף</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
