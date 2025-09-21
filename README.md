# Life Base44 - מערכת ניהול חיים אישית
<!-- Trigger new deploy -->

אפליקציית ניהול חיים מתקדמת הכוללת מיקוד, תכנון לוח זמנים, ניהול משימות במחשב, הרגלים ועוד.

## תכונות עיקריות

### 🎯 מיקוד (Focus)
- סשני מיקוד עם טיימר פומודורו
- תכנון מיקודים קבועים
- מעקב אחרי היסטוריית מיקודים

### 📅 לוח זמנים (Schedule)
- תכנון יומי מתקדם
- קטגוריות עם אייקונים וצבעים
- העלאת תמונות יומיות
- סטטיסטיקות יומיות

### 💻 במחשב (Computer)
- ניהול נושאי עבודה
- מעקב אחרי זמן עבודה בפועל
- הערות יומיות וקבועות
- ייעוץ AI מובנה

### 🔄 הרגלים (Habits)
- מעקב אחרי הרגלים יומיים
- סטטיסטיקות התקדמות

### 💬 צ'אט AI
- שיחות עם Claude AI
- ייעוץ אישי ומקצועי

## טכנולוגיות

- **Frontend**: React 18, Vite
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Storage**: localStorage (מקומי)
- **AI**: Anthropic Claude API
- **Deployment**: Vercel

## התקנה מקומית

```bash
# שכפול הפרויקט
git clone [repository-url]
cd life-base44

# התקנת תלויות
npm install

# העתקת משתני סביבה
cp .env.example .env
# ערוך את .env והוסף את מפתח ה-API של Claude

# הפעלה במצב פיתוח
npm run dev

# בנייה לפרודקשן
npm run build
```

## משתני סביבה נדרשים

```env
VITE_ANTHROPIC_API_KEY=your_claude_api_key_here
```

## מבנה הפרויקט

```
src/
├── api/           # ניהול נתונים ואינטגרציות
├── components/    # קומפוננטים לשימוש חוזר
│   ├── ui/       # קומפוננטי UI בסיסיים
│   ├── dashboard/
│   ├── computer/
│   └── schedule/
├── pages/        # דפי האפליקציה
├── hooks/        # React hooks מותאמים
├── lib/          # כלים ועזרים
└── utils/        # פונקציות עזר
```

## פריסה ל-Vercel

1. העלה את הקוד ל-GitHub
2. התחבר ל-Vercel ובחר את הפרויקט
3. הוסף משתני סביבה בהגדרות Vercel
4. פרס אוטומטית

## רישיון

פרויקט פרטי - כל הזכויות שמורות

## 🚀 Status
- ✅ Deployed on Vercel
- ✅ Connected to Supabase Database
- ✅ Ready for production use
