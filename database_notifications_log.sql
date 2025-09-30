-- טבלה ללוג התראות מיקוד
CREATE TABLE IF NOT EXISTS focus_notifications_log (
    id SERIAL PRIMARY KEY,
    notification_key VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    schedule_time VARCHAR(10) NOT NULL,
    notification_minutes_before INTEGER NOT NULL,
    email_sent BOOLEAN DEFAULT FALSE,
    message_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- אינדקסים לביצועים
CREATE INDEX IF NOT EXISTS idx_focus_notifications_log_key_date ON focus_notifications_log(notification_key, date);
CREATE INDEX IF NOT EXISTS idx_focus_notifications_log_user_id ON focus_notifications_log(user_id);

-- RLS (Row Level Security)
ALTER TABLE focus_notifications_log ENABLE ROW LEVEL SECURITY;

-- מדיניות: משתמשים יכולים לראות רק את ההתראות שלהם
CREATE POLICY "Users can only access their own notifications" ON focus_notifications_log
    FOR ALL USING (auth.uid() = user_id);

-- הערה: הטבלה הזו תשמש למניעת כפילויות בהתראות
-- כל התראה נשלחת רק פעם אחת ביום לכל זמן מתוזמן
