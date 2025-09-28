# 📧 מדריך הגדרת שליחת מיילים אמיתית

## הבעיה הנוכחית
המערכת כרגע רק מדפיסה לוגים בקונסול ולא שולחת מיילים אמיתיים.

## פתרונות אפשריים

### 1. EmailJS (הכי פשוט) ⭐
1. לך ל-https://www.emailjs.com/
2. צור חשבון חינמי
3. הוסף שירות Gmail
4. צור תבנית מייל
5. קבל את המפתח הציבורי
6. עדכן את הקוד עם הפרטים

### 2. Webhook.site (לבדיקות)
1. לך ל-https://webhook.site/
2. קבל URL ייחודי
3. עדכן את הקוד עם ה-URL
4. תראה את המיילים ב-Webhook.site

### 3. שירותי מייל מקצועיים
- **SendGrid** (100 מיילים/יום חינם)
- **Mailgun** (10,000 מיילים/חודש חינם)
- **AWS SES** (62,000 מיילים/חודש חינם)

## איך להגדיר EmailJS (מומלץ)

### שלב 1: יצירת חשבון
1. לך ל-https://www.emailjs.com/
2. לחץ "Sign Up"
3. השתמש ב-Gmail שלך

### שלב 2: הוספת שירות
1. לך ל-"Email Services"
2. לחץ "Add New Service"
3. בחר "Gmail"
4. התחבר עם Gmail שלך
5. העתק את ה-Service ID

### שלב 3: יצירת תבנית
1. לך ל-"Email Templates"
2. לחץ "Create New Template"
3. השתמש בתבנית זו:

```
Subject: {{subject}}

שלום!

{{message}}

---
נשלח מ: {{from_name}}
זמן: {{timestamp}}
```

4. העתק את ה-Template ID

### שלב 4: קבלת מפתח ציבורי
1. לך ל-"Account" → "General"
2. העתק את ה-Public Key

### שלב 5: עדכון הקוד
עדכן את הקובץ `src/api/localClient.js`:

```javascript
const serviceId = 'YOUR_SERVICE_ID'; // מה-EmailJS
const templateId = 'YOUR_TEMPLATE_ID'; // מה-EmailJS  
const publicKey = 'YOUR_PUBLIC_KEY'; // מה-EmailJS
```

## בדיקה
1. לחץ על "בדיקת מייל" בדף ההגדרות
2. בדוק את הקונסול לראות אם נשלח
3. בדוק את תיבת המייל שלך

## הערות חשובות
- EmailJS חינמי עד 200 מיילים/חודש
- לפרויקטים גדולים יותר השתמש בשירותים מקצועיים
- תמיד יש Fallback ל-Mock אם השירות נכשל
