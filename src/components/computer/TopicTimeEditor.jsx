import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit3 } from "lucide-react";
import moment from "moment";

export default function TopicTimeEditor({ topic, onUpdate, sessionStart, sessionEnd }) {
    const [isEditing, setIsEditing] = useState(false);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const handleStartEdit = () => {
        setIsEditing(true);
        setStartTime(moment(topic.start_time).format('HH:mm'));
        setEndTime(moment(topic.end_time).format('HH:mm'));
    };

    const handleSave = async () => {
        if (!startTime || !endTime) return;

        const dateStr = moment(topic.start_time).format('YYYY-MM-DD');
        const startDateTime = `${dateStr}T${startTime}:00`;
        const endDateTime = `${dateStr}T${endTime}:00`;

        const topicStart = moment(startDateTime);
        const topicEnd = moment(endDateTime);
        const sessionStartMoment = moment(sessionStart).startOf('minute');
        const sessionEndMoment = moment(sessionEnd).startOf('minute');

        if (topicEnd.isSameOrBefore(topicStart)) {
            alert('זמן סיום חייב להיות אחרי זמן התחלה');
            return;
        }

        if (topicStart.isBefore(sessionStartMoment) || topicEnd.isAfter(sessionEndMoment)) {
            alert(`הזמנים חייבים להיות בתוך הסשן (בין ${sessionStartMoment.format('HH:mm')} ל-${sessionEndMoment.format('HH:mm')})`);
            return;
        }

        const updatedData = {
            start_time: topicStart.toISOString(),
            end_time: topicEnd.toISOString(),
            duration_minutes: topicEnd.diff(topicStart, 'minutes')
        };

        await onUpdate(topic.id, updatedData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setStartTime('');
        setEndTime('');
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-16 p-1 text-xs h-6"
                />
                <span className="text-gray-400 text-xs">-</span>
                <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-16 p-1 text-xs h-6"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSave}
                    className="h-6 w-6 text-green-600"
                >
                    ✓
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    className="h-6 w-6 text-gray-500"
                >
                    ✕
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between">
            <span className="text-gray-500 font-mono text-xs">
                {moment(topic.start_time).format('HH:mm')} - {moment(topic.end_time).format('HH:mm')}
            </span>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleStartEdit}
                className="h-6 w-6"
            >
                <Edit3 className="w-3 h-3" />
            </Button>
        </div>
    );
}