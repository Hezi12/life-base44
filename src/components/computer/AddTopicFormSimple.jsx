import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import moment from "moment";

export default function AddTopicFormSimple({ sessionStart, sessionEnd, subjects, onAddTopic, onClose }) {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const handleSubmit = async () => {
        if (selectedSubject && startTime && endTime) {
            const dateStr = moment(sessionStart).format('YYYY-MM-DD');
            const startDateTime = `${dateStr}T${startTime}:00`;
            const endDateTime = `${dateStr}T${endTime}:00`;

            // בדיקת תקינות פשוטה
            const topicStart = moment(startDateTime);
            const topicEnd = moment(endDateTime);
            const sessionStartMoment = moment(sessionStart).startOf('minute');
            const sessionEndMoment = moment(sessionEnd).startOf('minute');

            // בדיקות בסיסיות
            if (!topicStart.isValid() || !topicEnd.isValid()) {
                alert('זמנים לא תקינים');
                return;
            }

            if (topicEnd.isSameOrBefore(topicStart)) {
                alert('זמן סיום חייב להיות אחרי זמן התחלה');
                return;
            }

            const topicStartMinute = topicStart.startOf('minute');
            const topicEndMinute = topicEnd.startOf('minute');
            
            if (topicStartMinute.isBefore(sessionStartMoment) || topicEndMinute.isAfter(sessionEndMoment)) {
                alert(`הזמנים חייבים להיות בתוך הסשן (בין ${sessionStartMoment.format('HH:mm')} ל-${sessionEndMoment.format('HH:mm')})`);
                return;
            }

            const subject = subjects.find(s => s.id === selectedSubject);
            const topicData = {
                start_time: startDateTime,
                end_time: endDateTime,
                topic: subject.name,
                subject_id: selectedSubject,
                subject_color: subject.color,
                subject_icon: subject.icon,
                duration_minutes: moment(endDateTime).diff(moment(startDateTime), 'minutes')
            };

            await onAddTopic(topicData);
            
            setSelectedSubject('');
            setStartTime('');
            setEndTime('');
        } else {
            alert('אנא מלא את כל השדות');
        }
    };

    // מילוי זמנים ברירת מחדל כשפותחים את הטופס
    React.useEffect(() => {
        if (sessionStart && !startTime) {
            setStartTime(moment(sessionStart).format('HH:mm'));
        }
        if (sessionStart && sessionEnd && !endTime) {
            const defaultEnd = moment(sessionStart).add(30, 'minutes');
            const sessionEndMoment = moment(sessionEnd);
            setEndTime(defaultEnd.isBefore(sessionEndMoment) ? defaultEnd.format('HH:mm') : sessionEndMoment.format('HH:mm'));
        }
    }, [sessionStart, sessionEnd, startTime, endTime]);

    return (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            {/* בחירת נושא */}
            <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="flex-1 p-1.5 border border-gray-200 rounded text-sm bg-white min-w-0"
            >
                <option value="">בחר נושא</option>
                {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                        {subject.name}
                    </option>
                ))}
            </select>

            {/* זמן התחלה */}
            <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-20 p-1.5 text-xs"
                placeholder="התחלה"
            />

            {/* זמן סיום */}
            <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-20 p-1.5 text-xs"
                placeholder="סיום"
            />

            {/* כפתורי פעולה */}
            <div className="flex gap-1">
                <Button 
                    size="sm" 
                    onClick={handleSubmit} 
                    disabled={!selectedSubject || !startTime || !endTime}
                    className="h-7 px-2 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                    ✓
                </Button>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClose}
                    className="h-7 px-2 text-xs"
                >
                    ✕
                </Button>
            </div>
        </div>
    );
}