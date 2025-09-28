# 📧 מדריך יצירת Gmail App Password

## מה זה App Password?
זה סיסמה מיוחדת ש-Gmail יוצר עבור אפליקציות חיצוניות. זה בטוח יותר מהסיסמה הרגילה שלך.

## איך ליצור App Password:

### שלב 1: הפעל 2-Step Verification
1. לך ל-https://myaccount.google.com/
2. לחץ "Security" (אבטחה)
3. תחת "Signing in to Google" לחץ "2-Step Verification"
4. אם לא מופעל, הפעל אותו

### שלב 2: צור App Password
1. באותה דף "Security"
2. תחת "Signing in to Google" לחץ "App passwords"
3. בחר "Mail" ו-"Other (Custom name)"
4. כתוב "Focus App" כשם האפליקציה
5. לחץ "Generate"
6. **העתק את הסיסמה שנוצרה** (16 תווים)

### שלב 3: עדכן את הקוד
עדכן את הקובץ `src/api/localClient.js`:

```javascript
gmail: {
  user: 'schwartzhezi@gmail.com',
  appPassword: 'YOUR_16_CHAR_PASSWORD', // הדבק כאן את הסיסמה
  enabled: true // שנה ל-true
}
```

## דוגמה:
```javascript
gmail: {
  user: 'schwartzhezi@gmail.com',
  appPassword: 'abcd efgh ijkl mnop', // הסיסמה ש-Gmail יצר
  enabled: true
}
```

## בדיקה:
1. עדכן את הקוד
2. לחץ "בדיקת מייל" בדף ההגדרות
3. בדוק את תיבת המייל שלך

## הערות חשובות:
- App Password נראית כמו: `abcd efgh ijkl mnop`
- זה רק עבור Gmail
- אם תשנה את הסיסמה של Gmail, תצטרך ליצור App Password חדש
- App Password בטוח יותר מהסיסמה הרגילה

## אם לא עובד:
1. ודא ש-2-Step Verification מופעל
2. ודא שהעתקת את הסיסמה נכון
3. בדוק שאין רווחים מיותרים
4. נסה ליצור App Password חדש
