-- הרצה של הסקריפט הזה ב-Supabase SQL Editor
-- זה יצור את כל הטבלאות שהאפליקציה צריכה

-- טבלת מיקודים
CREATE TABLE focus_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_number INTEGER,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    status TEXT DEFAULT 'completed',
    notes TEXT,
    next_session_suggestion TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- הגדרות מיקוד
CREATE TABLE focus_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    default_duration INTEGER DEFAULT 25,
    break_duration INTEGER DEFAULT 5,
    long_break_duration INTEGER DEFAULT 15,
    sessions_until_long_break INTEGER DEFAULT 4,
    schedule JSONB DEFAULT '[]',
    notify_on_time BOOLEAN DEFAULT true,
    notification_minutes_before INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- אירועים בלוח הזמנים
CREATE TABLE events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    category TEXT,
    category_color TEXT,
    category_icon TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- קטגוריות
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    icon TEXT DEFAULT 'Briefcase',
    keywords JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- תמונות יומיות
CREATE TABLE daily_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- נושאי עבודה
CREATE TABLE work_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    topic TEXT NOT NULL,
    subject_id UUID,
    subject_color TEXT,
    subject_icon TEXT,
    duration_minutes INTEGER,
    event_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- נושאי עבודה (הגדרות)
CREATE TABLE work_subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    icon TEXT DEFAULT 'Code',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- הערות יומיות
CREATE TABLE daily_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- הערות קבועות
CREATE TABLE sticky_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- הרגלים
CREATE TABLE habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    icon TEXT DEFAULT 'Target',
    target_frequency TEXT DEFAULT 'daily',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- רשומות הרגלים
CREATE TABLE habit_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- הגדרות פומודורו
CREATE TABLE pomodoro_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_duration INTEGER DEFAULT 25,
    short_break_duration INTEGER DEFAULT 5,
    long_break_duration INTEGER DEFAULT 15,
    sessions_until_long_break INTEGER DEFAULT 4,
    sound_enabled BOOLEAN DEFAULT true,
    auto_start_breaks BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- אינדקסים לביצועים טובים יותר
CREATE INDEX idx_events_user_date ON events(user_id, date);
CREATE INDEX idx_work_topics_user_date ON work_topics(user_id, date);
CREATE INDEX idx_daily_notes_user_date ON daily_notes(user_id, date);
CREATE INDEX idx_habit_records_user_date ON habit_records(user_id, date);

-- הגדרת Row Level Security (RLS) - כל משתמש רואה רק את הנתונים שלו
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticky_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_settings ENABLE ROW LEVEL SECURITY;

-- יצירת מדיניות אבטחה - כל משתמש גישה רק לנתונים שלו
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN VALUES 
        ('focus_sessions'), ('focus_settings'), ('events'), ('categories'),
        ('daily_images'), ('work_topics'), ('work_subjects'), ('daily_notes'),
        ('sticky_notes'), ('habits'), ('habit_records'), ('pomodoro_settings')
    LOOP
        EXECUTE format('
            CREATE POLICY "Users can only access their own data" ON %I
            FOR ALL USING (auth.uid() = user_id)
        ', table_name);
    END LOOP;
END $$;
