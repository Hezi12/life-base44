# 🕐 מדריך הגדרת מערכת התראות אוטומטית

## מה זה עושה?
המערכת החדשה שולחת התראות מיקוד מתוזמן גם כשהדף סגור! זה עובד דרך Vercel Cron Job שרץ כל דקה ברקע.

## 🚀 שלבי ההגדרה

### 1. הוספת הטבלה למסד הנתונים
הרץ את הקובץ `database_notifications_log.sql` ב-Supabase:

```sql
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
```

### 2. עדכון הגדרות EmailJS (אופציונלי)
אם אתה רוצה להשתמש ב-EmailJS במקום Gmail, עדכן את הקובץ `api/check-focus-notifications.js`:

```javascript
// עדכן את הערכים האלה:
const serviceId = 'YOUR_SERVICE_ID'; // מה-EmailJS
const templateId = 'YOUR_TEMPLATE_ID'; // מה-EmailJS  
const publicKey = 'YOUR_PUBLIC_KEY'; // מה-EmailJS
```

### 3. עדכון משתני סביבה
וודא שיש לך את המשתנים האלה ב-Vercel:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. פריסה ל-Vercel
```bash
# פרוס את הפרויקט
vercel --prod

# או אם אתה משתמש ב-GitHub
git push origin main
```

## 🔧 איך זה עובד?

### 1. **Vercel Cron Job**
- רץ כל דקה (`*/1 * * * *`)
- קורא ל-`/api/check-focus-notifications`
- לא תלוי בדף פתוח

### 2. **בדיקת התראות**
- טוען הגדרות מיקוד מ-Supabase
- בודק אם יש מיקוד מתוזמן היום
- מחפש זמן התראה בטווח של דקה

### 3. **שליחת מייל**
- שולח מייל דרך Gmail או EmailJS
- שומר לוג במסד הנתונים
- מונע כפילויות

### 4. **מניעת כפילויות**
- כל התראה נשלחת רק פעם אחת ביום
- נשמר ב-`focus_notifications_log`
- מפתח ייחודי לכל התראה

## 🧪 בדיקה

### 1. בדיקה ידנית
```bash
# קרא ל-API ישירות
curl https://your-app.vercel.app/api/check-focus-notifications
```

### 2. בדיקה אוטומטית
1. הגדר מיקוד מתוזמן לדקה הקרובה
2. הגדר התראה ל-1 דקה לפני
3. המתן - המייל אמור להגיע אוטומטית
4. בדוק את הטבלה `focus_notifications_log` ב-Supabase

### 3. מעקב אחר לוגים
- בדוק את ה-Logs ב-Vercel Dashboard
- חפש הודעות כמו "✅ Focus notification sent"
- בדוק את הטבלה `focus_notifications_log`

## 🎯 יתרונות

✅ **עובד גם כשהדף סגור** - Cron Job רץ ברקע  
✅ **דיוק גבוה** - בדיקה כל דקה  
✅ **מניעת כפילויות** - כל התראה נשלחת פעם אחת  
✅ **לוגים מלאים** - מעקב אחר כל התראה  
✅ **אבטחה** - RLS מונע גישה לנתונים של אחרים  

## 🔍 פתרון בעיות

### המיילים לא מגיעים?
1. בדוק את ה-Logs ב-Vercel
2. וודא שהטבלה `focus_notifications_log` נוצרה
3. בדוק הגדרות Gmail/EmailJS
4. וודא שהגדרות מיקוד נכונות

### Cron Job לא רץ?
1. בדוק את `vercel.json` - וודא שיש `crons`
2. וודא שהפרויקט פרוס ל-Vercel
3. בדוק את ה-Logs ב-Vercel Dashboard

### שגיאות במסד הנתונים?
1. וודא שהטבלה נוצרה נכון
2. בדוק RLS policies
3. וודא שיש גישה ל-`focus_settings`

## 📞 תמיכה

אם יש בעיות, בדוק:
1. Vercel Logs
2. Supabase Logs  
3. הטבלה `focus_notifications_log`
4. הגדרות `focus_settings`

המערכת אמורה לעבוד מושלם עכשיו! 🎉
