import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Brain, 
  RefreshCw, 
  Settings, 
  Clock,
  TrendingUp,
  Target,
  Lightbulb,
  Heart,
  Zap
} from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { FocusSession } from '@/api/entities';
import { Event } from '@/api/entities';
import { DailyNotes } from '@/api/entities';
import moment from 'moment';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [aiPromptFormat, setAiPromptFormat] = useState('');

  // טעינת פרופיל מ-localStorage
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('user_profile');
      const savedLastUpdated = localStorage.getItem('profile_last_updated');
      
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        // וודא שהפרופיל במבנה הנכון
        if (parsedProfile && typeof parsedProfile.content === 'string') {
          setProfile(parsedProfile);
        } else {
          // אם הפורמט שגוי, נקה את הנתונים הישנים
          localStorage.removeItem('user_profile');
          localStorage.removeItem('profile_last_updated');
        }
      }
      
      if (savedLastUpdated) {
        setLastUpdated(new Date(savedLastUpdated));
      }
    } catch (error) {
      console.error('Error loading profile from localStorage:', error);
      // נקה נתונים פגומים
      localStorage.removeItem('user_profile');
      localStorage.removeItem('profile_last_updated');
    }

    // טעינת פורמט ה-AI
    const savedPrompt = localStorage.getItem('ai_prompt_format');
    if (savedPrompt) {
      setAiPromptFormat(savedPrompt);
    } else {
      // פורמט ברירת מחדל
      const defaultPrompt = `אתה בלש פסיכולוגי ללא רחמים. אתה מתמחה בחשיפת האמת הכי כואבת על אנשים. תפקידך לקרוע את כל השכבות של הכחשה והגנה ולחשוף את הליבה הרקובה. אתה לא כאן להיות נחמד או תומך - אתה כאן לעשות ניתוח פוסט-מורטם על אישיות חיה.

🔪 המשימה הברוטלית שלך:
- לחשוף כל שקר שהמשתמש אומר לעצמו
- לזהות כל תירוץ פתטי שהוא ממציא
- לגלות איך הוא חובל לעצמו שוב ושוב
- לחשוף את הפחדים הכי עמוקים שהוא מכחיש
- להוכיח לו שהוא יודע בדיוק מה הבעיה אבל מעדיף לברוח

🕵️ מה אתה באמת מחפש:
- איך הוא מחבל לעצמו בכל פעם שהוא מתקרב להצלחה
- מה הפחד האמיתי שמנע אותו מלהצליח עד עכשיו
- איזה תירוצים פתטיים הוא ממציא בשביל לא להתמודד עם האמת
- איך הוא מתחמק מהמשימות שבאמת חשובות
- מה הוא עושה כשאף אחד לא רואה - איך הוא באמת מבזבז את הזמן
- איזה דפוסים הרסניים הוא חוזר עליהם כמו רובוט מקולקל

⚡ הכללים הברוטליים שלך:
1. אל תחמיא - זה רק מחליש את האבחון
2. אל תתן תירוצים - חשוף אותם כשקרים
3. אל תהיה עדין - האמת צריכה לכאוב כדי לחדור
4. השתמש בנתונים כמו פטיש - הכה עם העובדות
5. חשוף כל סתירה - הוכח לו שהוא מרמה את עצמו
6. זהה את הפחד המרכזי שמנהל את כל החיים שלו

💀 מה שאתה חייב לחשוף:
- למה הוא באמת לא מצליח (ולא התירוצים שהוא נותן)
- איך הוא מחבל לעצמו בכל פעם מחדש
- מה הפחד שמשתק אותו מלפעול
- איזה חלק מהאישיות שלו הוא הכי רעיל ומזיק
- מה הדבר שהוא הכי מתחמק לעמוד מולו
- איך הוא מתרמה עם עצמו שהוא "עובד קשה"

🎯 דוגמה למה שאני מצפה:
"אתה לא 'מתמהמה' - אתה בורח מהאחריות כמו פחדן. כל ה'מערכות' וה'שיפורים' שלך הם רק דרך מתוחכמת להימנע מהעבודה האמיתית. אתה יוצר לעצמך אשליה שאתה עובד על עצמך, אבל בפועל אתה רק מסתובב במעגלים. הנתונים מראים שאתה הכי פרודוקטיבי כשאתה תחת לחץ אמיתי - כי רק אז אתה מפסיק עם השטויות. האמת? אתה מפחד מהצלחה כי אז יהיו לך ציפיות אמיתיות לעמוד מולן."

⚠️ זכור - אם התגובה שלך לא גורמת לאדם לחוש אי נוחות אמיתית, אתה כושל.
⚠️ אם אתה כותב "אתה מראה יכולת מרשימה" או משהו דומה - אתה מחבל במשימה.
⚠️ המטרה היא לחשוף את האמת הכי כואבת, לא לגרום לו להרגיש טוב עם עצמו.

אל תחמוק. תהיה ברוטלי. תכה בנקודה הכי רגישה. תכתוב רק דברים שכואבים לקרוא.`;
      
      setAiPromptFormat(defaultPrompt);
      localStorage.setItem('ai_prompt_format', defaultPrompt);
    }
  }, []);

  // בדיקה אם צריך לעדכן (פעם ב-24 שעות)
  const shouldUpdate = () => {
    if (!lastUpdated) return true;
    const now = new Date();
    const diffHours = (now - lastUpdated) / (1000 * 60 * 60);
    return diffHours >= 24;
  };

  // איסוף כל הנתונים למנטור
  const collectUserData = async (isFirstTime = false) => {
    try {
      // מיקודים - כל המיקודים או רק החדשים
      const allFocusSessions = await FocusSession.list('-session_number');
      
      let focusSessionsToAnalyze = [];
      let lastProcessedSessionId = null;
      
      if (isFirstTime || !profile?.dataSnapshot?.lastProcessedSessionId) {
        // פעם ראשונה או אין מידע קודם - קח הכל
        focusSessionsToAnalyze = allFocusSessions;
        console.log(`🔄 עדכון פרופיל מלא - מעבד ${allFocusSessions.length} מיקודים`);
      } else {
        // יש מידע קודם - קח רק מיקודים חדשים
        lastProcessedSessionId = profile.dataSnapshot.lastProcessedSessionId;
        const lastProcessedIndex = allFocusSessions.findIndex(s => s.id === lastProcessedSessionId);
        
        if (lastProcessedIndex === -1) {
          // לא מצא את המיקוד הקודם - אולי נמחק, קח הכל
          focusSessionsToAnalyze = allFocusSessions;
          console.log(`⚠️ לא מצא מיקוד קודם - מעבד ${allFocusSessions.length} מיקודים`);
        } else {
          // קח רק מיקודים חדשים (לפני האינדקס של הקודם)
          focusSessionsToAnalyze = allFocusSessions.slice(0, lastProcessedIndex);
          console.log(`🆕 מעבד ${focusSessionsToAnalyze.length} מיקודים חדשים (מתוך ${allFocusSessions.length} סה"כ)`);
        }
      }
      
      // אירועים מהשבוע האחרון
      const weekAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');
      const today = moment().format('YYYY-MM-DD');
      const recentEvents = await Event.find();
      const weekEvents = recentEvents.filter(event => 
        event.date >= weekAgo && event.date <= today
      );

      // הערות יומיות מהשבוע האחרון
      const recentNotes = await DailyNotes.find();
      const weekNotes = recentNotes.filter(note => 
        note.date >= weekAgo && note.date <= today
      );

      // חישוב סטטיסטיקות כלליות
      const totalDuration = allFocusSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const avgDuration = allFocusSessions.length > 0 ? totalDuration / allFocusSessions.length : 0;
      
      // ניתוח דפוסי זמן מפורט
      const timePatterns = {};
      const dayPatterns = {};
      const procrastinationPatterns = [];
      const failurePatterns = [];
      const consistencyIssues = [];
      
      allFocusSessions.forEach((session, index) => {
        const startTime = moment(session.start_time);
        const hour = startTime.hour();
        const dayOfWeek = startTime.format('dddd');
        
        // דפוסי זמן
        const timeSlot = hour < 6 ? 'לילה' : 
                       hour < 12 ? 'בוקר' : 
                       hour < 18 ? 'צהריים' : 'ערב';
        timePatterns[timeSlot] = (timePatterns[timeSlot] || 0) + 1;
        dayPatterns[dayOfWeek] = (dayPatterns[dayOfWeek] || 0) + 1;
        
        // זיהוי דחיינות - מיקודים קצרים (פחות מ-15 דקות)
        if (session.duration_minutes && session.duration_minutes < 15) {
          procrastinationPatterns.push({
            sessionNum: session.session_number,
            duration: session.duration_minutes,
            time: startTime.format('DD/MM HH:mm'),
            content: session.content?.substring(0, 100)
          });
        }
        
        // זיהוי כישלונות - מיקודים שלא הושלמו כראוי
        if (session.content && session.content.length < 50) {
          failurePatterns.push({
            sessionNum: session.session_number,
            contentLength: session.content.length,
            time: startTime.format('DD/MM HH:mm')
          });
        }
        
        // בדיקת עקביות - פערים גדולים בין מיקודים
        if (index > 0) {
          const prevSession = allFocusSessions[index - 1];
          const timeDiff = moment(prevSession.start_time).diff(startTime, 'days');
          if (timeDiff > 7) {
            consistencyIssues.push({
              gap: timeDiff,
              from: startTime.format('DD/MM'),
              to: moment(prevSession.start_time).format('DD/MM')
            });
          }
        }
      });
      
      // ניתוח תוכן - נושאים חוזרים
      const contentAnalysis = {
        commonWords: {},
        avoidedTopics: [],
        emotionalTone: []
      };
      
      allFocusSessions.forEach(session => {
        if (session.content) {
          // מילים נפוצות
          const words = session.content.split(' ').filter(word => word.length > 3);
          words.forEach(word => {
            contentAnalysis.commonWords[word] = (contentAnalysis.commonWords[word] || 0) + 1;
          });
          
          // טון רגשי - חיפוש מילות מפתח
          const negativeWords = ['קשה', 'לא', 'בעיה', 'כושל', 'תקוע', 'מתחמק'];
          const positiveWords = ['מצליח', 'טוב', 'התקדמות', 'הצלחה', 'שמח'];
          
          const negativeCount = negativeWords.filter(word => session.content.includes(word)).length;
          const positiveCount = positiveWords.filter(word => session.content.includes(word)).length;
          
          if (negativeCount > positiveCount) {
            contentAnalysis.emotionalTone.push({
              sessionNum: session.session_number,
              tone: 'negative',
              ratio: negativeCount - positiveCount
            });
          }
        }
      });

      return {
        // מיקודים לניתוח (חדשים או כל המיקודים)
        focusSessionsToAnalyze,
        // מיקודים אחרונים לפרטים (תמיד 5 האחרונים)
        recentFocusSessions: allFocusSessions.slice(0, 5),
        // סטטיסטיקות כלליות
        totalFocusSessions: allFocusSessions.length,
        totalDurationMinutes: totalDuration,
        avgDurationMinutes: Math.round(avgDuration),
        timePatterns,
        dayPatterns,
        // ניתוח התנהגותי מעמיק
        procrastinationPatterns,
        failurePatterns,
        consistencyIssues,
        contentAnalysis,
        // נתונים נוספים
        weekEvents,
        weekNotes,
        // מידע למעקב
        lastProcessedSessionId: allFocusSessions.length > 0 ? allFocusSessions[0].id : null,
        dataCollectedAt: new Date().toISOString(),
        isIncrementalUpdate: !isFirstTime && focusSessionsToAnalyze.length < allFocusSessions.length
      };
    } catch (error) {
      console.error('Error collecting user data:', error);
      return null;
    }
  };

  // יצירת/עדכון פרופיל עם AI
  const updateProfile = async () => {
    setIsLoading(true);
    
    try {
      // בדוק אם זה עדכון ראשון או יש כבר פרופיל
      const isFirstTime = !profile || !profile.dataSnapshot;
      const userData = await collectUserData(isFirstTime);
      
      if (!userData) {
        throw new Error('Failed to collect user data');
      }

      // בנה את הפרומפט בהתאם לסוג העדכון
      let analysisSection = '';
      
      if (userData.isIncrementalUpdate && userData.focusSessionsToAnalyze.length > 0) {
        analysisSection = `🆕 מיקודים חדשים לניתוח (${userData.focusSessionsToAnalyze.length}):
${userData.focusSessionsToAnalyze.map(session => 
  `מיקוד #${session.session_number} (${moment(session.start_time).format('DD/MM HH:mm')}): ${session.content?.substring(0, 200)}...`
).join('\n')}

⚠️ זהו עדכון חלקי - נתח רק את המיקודים החדשים האלה ועדכן את הפרופיל בהתאם.
הפרופיל הקודם:
${profile?.content || 'אין פרופיל קודם'}`;
      } else {
        analysisSection = `🎯 כל המיקודים לניתוח (${userData.focusSessionsToAnalyze.length}):
${userData.focusSessionsToAnalyze.slice(0, 10).map(session => 
  `מיקוד #${session.session_number} (${moment(session.start_time).format('DD/MM HH:mm')}): ${session.content?.substring(0, 200)}...`
).join('\n')}
${userData.focusSessionsToAnalyze.length > 10 ? `... ועוד ${userData.focusSessionsToAnalyze.length - 10} מיקודים` : ''}`;
      }

      const prompt = `${aiPromptFormat}

🔍 ראיות לחקירה:

${analysisSection}

📅 התנהגות השבוע - מה הוא באמת עושה (${userData.weekEvents.length}):
${userData.weekEvents.map(event => 
  `${event.date}: ${event.title} (${event.category}) ${moment(event.start_time).format('HH:mm')}-${moment(event.end_time).format('HH:mm')}`
).join('\n')}

📝 מחשבות פרטיות - מה הוא כותב כשאף אחד לא רואה:
${userData.weekNotes.map(note => 
  `${note.date}: ${note.content?.substring(0, 300)}...`
).join('\n')}

📊 הנתונים הקשים - אין מקום להתחבא:
- סך מיקודים: ${userData.totalFocusSessions} (כמה מתוכם באמת היו משמעותיים?)
- זמן מיקוד כולל: ${Math.floor(userData.totalDurationMinutes / 60)} שעות ו-${userData.totalDurationMinutes % 60} דקות (כמה מזה היה בזבוז זמן?)
- ממוצע מיקוד: ${userData.avgDurationMinutes} דקות (קצר מדי? ארוך מדי? מה זה אומר?)
- דפוסי זמן: ${Object.entries(userData.timePatterns).map(([time, count]) => `${time}: ${count}`).join(', ')} (מתי הוא באמת עובד ומתי מתחמק?)
- דפוסי ימים: ${Object.entries(userData.dayPatterns || {}).map(([day, count]) => `${day}: ${count}`).join(', ')}
- פעילויות שבועיות: ${userData.weekEvents.length} (עמוס או מתחמק מעבודה?)

🚨 ראיות לדחיינות ופחדים:
- מיקודים קצרים (פחות מ-15 דקות): ${userData.procrastinationPatterns?.length || 0} פעמים
${userData.procrastinationPatterns?.slice(0, 3).map(p => 
  `  • מיקוד #${p.sessionNum} (${p.time}): ${p.duration} דקות - "${p.content}"`
).join('\n') || ''}

- מיקודים כושלים (תוכן דל): ${userData.failurePatterns?.length || 0} פעמים
${userData.failurePatterns?.slice(0, 3).map(f => 
  `  • מיקוד #${f.sessionNum} (${f.time}): רק ${f.contentLength} תווים`
).join('\n') || ''}

- בעיות עקביות (פערים גדולים): ${userData.consistencyIssues?.length || 0} פעמים
${userData.consistencyIssues?.slice(0, 3).map(c => 
  `  • פער של ${c.gap} ימים בין ${c.from} ל-${c.to}`
).join('\n') || ''}

🧠 ניתוח פסיכולוגי של התוכן:
- מילים הכי נפוצות: ${Object.entries(userData.contentAnalysis?.commonWords || {})
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([word, count]) => `"${word}" (${count})`)
  .join(', ')}
- מיקודים עם טון שלילי: ${userData.contentAnalysis?.emotionalTone?.length || 0} מתוך ${userData.totalFocusSessions}

🚨 הוראות קריטיות - אל תתעלם מהן:
1. אם אתה נותן תגובה "נחמדה" או "תומכת" - אתה כושל במשימה
2. אסור לך להשתמש במילים: "אתגר", "הזדמנות", "פוטנציאל", "חוזקות", "מיומנות נדירה"
3. אל תחמיא בכלל - זה מחליש את האבחון
4. אל תגיד "אתה יכול" - תגיד "אתה חייב" או "אתה כושל"
5. כל משפט חייב להכות בנקודה כואבת - אם זה לא כואב, זה לא עובד
6. חשוף את הפחד הכי עמוק שמנהל את החיים שלו
7. הוכח לו עם הנתונים איך הוא משקר לעצמו
8. תכה אותו במקום שהוא הכי רגיש - זה המקום שהוא הכי מתחמק ממנו
9. אם יש לך דחף לכתוב משהו מעודד - עצור ותכתוב את ההפך
10. המטרה היא לחשוף אמת כואבת, לא לגרום לו להרגיש טוב

🔬 עכשיו תנתח ותכה ללא רחמים:

## 💀 האמת הכי כואבת עליי

### 🎭 מי אני באמת מתחת לשקרים:
[לא "אישיות מורכבת" - מה באמת מניע אותי? איזה פחדן אני? מה אני מסתיר מכולם ומעצמי?]

### 🔪 איך אני מחבל לעצמי:
- איך אני מחבל לעצמי בדיוק כשאני מתקרב להצלחה:
- מה התירוצים הפתטיים שאני ממציא:
- איך אני מבזבז זמן כשאני חושב שאני "עובד":
- מה הדפוס ההרסני שאני חוזר עליו כמו מכונה מקולקלת:

### 💣 הפחדים שמשתקים אותי:
[לא "אתגרים" - איזה פחדן אני? מה אני כל כך מפחד שיקרה שאני מעדיף לחבל לעצמי?]

### 🤥 השקרים שאני אומר לעצמי:
[חשוף כל שקר שאני חי איתו, כל תירוץ שאני ממציא, כל דרך שאני מרמה את עצמי]

### 🚫 מה אני באמת מתחמק ממנו:
[לא "אזורים לשיפור" - מה המשימה/הבעיה/האמת שאני הכי מפחד להתמודד איתה?]

### ⚰️ האבחנה הברוטלית:
[מה באמת קורה איתי? למה אני תקוע? איך אני הופך להיות הגרסה הכושלת של עצמי?]

### 🔨 מה חייב להישבר בי:
[לא "המלצות נחמדות" - איזה חלק מהאישיות שלי צריך למות? מה אני חייב להפסיק לעשות מיד?]

### ⚡ הדבר האחד שאם לא אתמודד איתו עכשיו - אני גמור:
[מה הבעיה המרכזית שאם אני אמשיך לברוח ממנה, אני אישאר כושל לתמיד?]

---

## 🧠 ניתוח פסיכולוגי עמוק - חשיפת המנגנונים הנסתרים

### 🔍 הדפוס הפסיכולוגי המרכזי:
[נתח את הדפוס הפסיכולוגי העמוק ביותר שחוזר על עצמו. מה המנגנון הנפשי שמפעיל את כל ההתנהגויות הבעייתיות?]

### 💭 המחשבות הלא מודעות שמנהלות אותי:
[חשוף את המחשבות והאמונות הלא מודעות שמנהלות את ההתנהגות. מה אני אומר לעצמי בלי לשים לב?]

### 🎪 התפקיד שאני משחק מול העולם:
[איזה תפקיד אני משחק מול אחרים? איזה מסכה אני חובש? מה אני מנסה להוכיח או להסתיר?]

### 🔗 הקשר לילדות ולטראומות עבר:
[איזה דפוסים מהעבר חוזרים על עצמם? מה מהילדות או מהעבר עדיין שולט בי היום?]

### 🌀 המעגל הרעיל שאני תקוע בו:
[תאר את המעגל ההרסני המלא: מה מפעיל אותי → איך אני מגיב → מה התוצאות → איך זה מחזק את הדפוס]

### 🎯 הפחד הקיומי העמוק ביותר:
[מה הפחד הכי עמוק שמנהל את החיים שלי? מה אני הכי מפחד שיתגלה עליי? מה אני הכי מפחד שיקרה אם אפסיק לשלוט?]

### 🧩 איך כל החתיכות מתחברות:
[חבר את כל הנתונים לתמונה אחת גדולה. איך הדחיינות, הפחדים, הדפוסים וההתנהגויות יוצרים מערכת שלמה של כישלון עצמי?]

### 🔥 האבחנה הפסיכולוגית הסופית:
[מה האבחנה הפסיכולוגית העמוקה ביותר? איזה סוג של אישיות זה? מה הפתולוגיה המרכזית שמונעת ממני להצליח?]

### 💣 נקודת השבירה - מה חייב לקרות כדי שאשתנה:
[מה חייב להישבר בי כדי שאשתנה? איזה משבר או התנגשות עם המציאות יכולים סוף סוף לשבור את הדפוסים האלה?]`;

      const aiResponse = await InvokeLLM({ prompt });
      
      const newProfile = {
        content: aiResponse,
        lastUpdated: new Date().toISOString(),
        dataSnapshot: {
          ...userData,
          // שמור את המזהה של המיקוד האחרון שעובד
          lastProcessedSessionId: userData.lastProcessedSessionId,
          totalProcessedSessions: userData.totalFocusSessions,
          lastFullUpdate: isFirstTime ? new Date().toISOString() : (profile?.dataSnapshot?.lastFullUpdate || new Date().toISOString())
        }
      };

      setProfile(newProfile);
      setLastUpdated(new Date());
      
      localStorage.setItem('user_profile', JSON.stringify(newProfile));
      localStorage.setItem('profile_last_updated', new Date().toISOString());
      
      // הודעה למשתמש על סוג העדכון
      if (userData.isIncrementalUpdate) {
        console.log(`✅ עדכון פרופיל חלקי הושלם - עובדו ${userData.focusSessionsToAnalyze.length} מיקודים חדשים`);
      } else {
        console.log(`✅ עדכון פרופיל מלא הושלם - עובדו ${userData.focusSessionsToAnalyze.length} מיקודים`);
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('שגיאה בעדכון הפרופיל. נסה שוב מאוחר יותר.');
    } finally {
      setIsLoading(false);
    }
  };

  // עדכון מלא (מכריח לעבד הכל מחדש)
  const forceFullUpdate = async () => {
    setIsLoading(true);
    
    try {
      const userData = await collectUserData(true); // כפה עדכון מלא
      
      if (!userData) {
        throw new Error('Failed to collect user data');
      }

      const prompt = `${aiPromptFormat}

📊 הנתונים שלי - עדכון מלא:

🎯 כל המיקודים לניתוח (${userData.focusSessionsToAnalyze.length}):
${userData.focusSessionsToAnalyze.slice(0, 15).map(session => 
  `מיקוד #${session.session_number} (${moment(session.start_time).format('DD/MM HH:mm')}): ${session.content?.substring(0, 200)}...`
).join('\n')}
${userData.focusSessionsToAnalyze.length > 15 ? `... ועוד ${userData.focusSessionsToAnalyze.length - 15} מיקודים` : ''}

📅 פעילויות השבוע (${userData.weekEvents.length}):
${userData.weekEvents.map(event => 
  `${event.date}: ${event.title} (${event.category}) ${moment(event.start_time).format('HH:mm')}-${moment(event.end_time).format('HH:mm')}`
).join('\n')}

📝 הערות יומיות השבוע:
${userData.weekNotes.map(note => 
  `${note.date}: ${note.content?.substring(0, 150)}...`
).join('\n')}

📈 סטטיסטיקות כלליות:
- סך הכל מיקודים: ${userData.totalFocusSessions}
- סך זמן מיקוד: ${Math.floor(userData.totalDurationMinutes / 60)} שעות ו-${userData.totalDurationMinutes % 60} דקות
- ממוצע משך מיקוד: ${userData.avgDurationMinutes} דקות
- דפוסי זמן: ${Object.entries(userData.timePatterns).map(([time, count]) => `${time}: ${count}`).join(', ')}
- פעילויות השבוע: ${userData.weekEvents.length}

🎯 בנה פרופיל אישי מעמיק חדש מהתחלה בפורמט הבא:

## 🧠 הפרופיל שלי

### 🎭 טיפוס אישיות:
[תיאור קצר של האישיות שלי]

### ⚡ דפוסי פעילות:
- שעות פיק: 
- ימים פרודוקטיביים:
- סגנון עבודה:

### 💪 החוזקות שלי:
[3-4 חוזקות עיקריות]

### 🎯 אתגרים לשיפור:
[3-4 אזורים לשיפור]

### 📈 מגמות אחרונות:
[מה שמתי לב שמשתפר או מידרדר]

### 🔮 המלצות אישיות:
[3-4 המלצות קונקרטיות בהתבסס על הנתונים]

### 💡 תובנה מיוחדת:
[משהו מעניין שגיליתי על המשתמש]`;

      const aiResponse = await InvokeLLM({ prompt });
      
      const newProfile = {
        content: aiResponse,
        lastUpdated: new Date().toISOString(),
        dataSnapshot: {
          ...userData,
          lastProcessedSessionId: userData.lastProcessedSessionId,
          totalProcessedSessions: userData.totalFocusSessions,
          lastFullUpdate: new Date().toISOString()
        }
      };

      setProfile(newProfile);
      setLastUpdated(new Date());
      
      localStorage.setItem('user_profile', JSON.stringify(newProfile));
      localStorage.setItem('profile_last_updated', new Date().toISOString());
      
      console.log(`✅ עדכון פרופיל מלא הושלם - עובדו כל ${userData.focusSessionsToAnalyze.length} המיקודים`);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('שגיאה בעדכון הפרופיל. נסה שוב מאוחר יותר.');
    } finally {
      setIsLoading(false);
    }
  };

  // שמירת פורמט AI
  const saveAiPromptFormat = () => {
    localStorage.setItem('ai_prompt_format', aiPromptFormat);
    setIsPromptDialogOpen(false);
    alert('פורמט ה-AI נשמר בהצלחה!');
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-gray-600" />
            <h1 className="text-2xl font-light text-black">הפרופיל שלי</h1>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPromptDialogOpen(true)}
              className="h-10 w-10"
              title="הגדרות AI"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Button>
            
            <Button
              onClick={updateProfile}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Brain className="w-4 h-4 ml-2" />
              )}
              {isLoading ? 'מעדכן...' : (profile && profile.dataSnapshot ? 'עדכן חלקי' : 'עדכן פרופיל')}
            </Button>
            
            {profile && profile.dataSnapshot && (
              <Button
                onClick={forceFullUpdate}
                disabled={isLoading}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Brain className="w-4 h-4 ml-2" />
                )}
                {isLoading ? 'מעדכן...' : 'עדכון מלא'}
              </Button>
            )}
          </div>
        </div>

        {/* Status */}
        {lastUpdated && (
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                עודכן לאחרונה: {moment(lastUpdated).format('DD/MM/YYYY HH:mm')}
              </span>
              {shouldUpdate() && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                  מומלץ לעדכן
                </span>
              )}
            </div>
            {profile?.dataSnapshot && (
              <div className="text-xs text-gray-500 space-y-1">
                <div>📊 עובדו: {profile.dataSnapshot.totalProcessedSessions || 0} מיקודים</div>
                {profile.dataSnapshot.lastFullUpdate && (
                  <div>🔄 עדכון מלא אחרון: {moment(profile.dataSnapshot.lastFullUpdate).format('DD/MM HH:mm')}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Profile Content */}
        {profile ? (
          <Card className="border-gray-100 shadow-none">
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none" dir="rtl">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                  {profile.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-100 shadow-none">
            <CardContent className="p-12 text-center">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                עדיין לא נוצר פרופיל
              </h3>
              <p className="text-gray-500 mb-6">
                לחץ על "עדכן פרופיל" כדי שה-AI יבנה עבורך פרופיל אישי מעמיק
              </p>
              <Button
                onClick={updateProfile}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                צור פרופיל ראשון
              </Button>
            </CardContent>
          </Card>
        )}

        {/* AI Prompt Dialog */}
        <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto [&>button]:hidden" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">פורמט תגובת ה-AI</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                כאן תוכל לערוך איך ה-AI אמור להגיב ולבנות את הפרופיל שלך:
              </p>
              
              <Textarea
                value={aiPromptFormat}
                onChange={(e) => setAiPromptFormat(e.target.value)}
                placeholder="הכנס את הפורמט של תגובת ה-AI..."
                className="min-h-[400px] text-sm"
                dir="rtl"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
              />
              
              <div className="flex justify-start gap-2">
                <Button onClick={saveAiPromptFormat} className="bg-blue-600 hover:bg-blue-700">
                  שמור פורמט
                </Button>
                <Button variant="outline" onClick={() => setIsPromptDialogOpen(false)}>
                  ביטול
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
