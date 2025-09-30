// API endpoint לבדיקת התראות מיקוד מתוזמן
// רץ כל דקה דרך Vercel Cron Job

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import moment from 'moment';

// הגדרות Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// הגדרות מייל
const emailConfig = {
  gmail: {
    enabled: true,
    user: 'schwartzhezi@gmail.com',
    pass: 'suqd jnyq yftm ulag' // Gmail App Password
  }
};

// יצירת Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// פונקציה לשליחת מייל
async function sendEmail({ to, subject, body }) {
  try {
    // ניסיון לשלוח דרך Gmail
    if (emailConfig.gmail.enabled) {
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: emailConfig.gmail.user,
          pass: emailConfig.gmail.pass
        }
      });

      const mailOptions = {
        from: emailConfig.gmail.user,
        to: to,
        subject: subject,
        text: body,
        html: body.replace(/\n/g, '<br>')
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    }

    // אם Gmail לא זמין, השתמש ב-EmailJS
    const { default: emailjs } = await import('@emailjs/browser');
    
    const result = await emailjs.send(
      'YOUR_SERVICE_ID', // עדכן עם ה-Service ID שלך
      'YOUR_TEMPLATE_ID', // עדכן עם ה-Template ID שלך
      {
        to_email: to,
        subject: subject,
        message: body,
        from_name: 'מערכת המיקוד שלך'
      },
      'YOUR_PUBLIC_KEY' // עדכן עם ה-Public Key שלך
    );
    
    console.log('✅ Email sent via EmailJS:', result.text);
    return { success: true, messageId: result.text };

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

// פונקציה לבדיקת התראות
async function checkFocusNotifications() {
  try {
    console.log('🔍 Checking focus notifications...');
    
    // טען הגדרות מיקוד
    const { data: focusSettings, error } = await supabase
      .from('focus_settings')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error loading focus settings:', error);
      return;
    }

    if (focusSettings.length === 0 || !focusSettings[0].notify_on_time) {
      console.log('No focus settings or notifications disabled');
      return;
    }

    const settings = focusSettings[0];
    const now = moment();
    const today = now.format('dddd'); // יום בשבוע באנגלית
    
    console.log(`Today: ${today}, Current time: ${now.format('HH:mm')}`);
    
    // בדוק אם יש מיקוד מתוזמן היום
    const todaySchedules = settings.schedule.filter(schedule => schedule.day === today);
    
    if (todaySchedules.length === 0) {
      console.log('No scheduled focus sessions for today');
      return;
    }

    console.log(`Found ${todaySchedules.length} scheduled sessions for today`);

    for (const schedule of todaySchedules) {
      const scheduledTime = moment(schedule.time, 'HH:mm');
      const notificationTime = scheduledTime.clone().subtract(settings.notification_minutes_before, 'minutes');
      
      console.log(`Schedule: ${schedule.time}, Notification time: ${notificationTime.format('HH:mm')}`);
      
      // בדוק אם הגיע זמן ההתראה (בטווח של דקה)
      const timeDiff = Math.abs(now.diff(notificationTime, 'minutes'));
      if (timeDiff <= 1) {
        // בדוק אם כבר שלחנו התראה לזמן הזה היום
        const notificationKey = `focus_notification_${today}_${schedule.time}_${settings.notification_minutes_before}`;
        
        // בדוק ב-localStorage (אם יש גישה) או במסד נתונים
        const { data: existingNotification } = await supabase
          .from('focus_notifications_log')
          .select('*')
          .eq('notification_key', notificationKey)
          .eq('date', moment().format('YYYY-MM-DD'))
          .limit(1);

        if (!existingNotification || existingNotification.length === 0) {
          // שלח התראה במייל
          const emailResult = await sendEmail({
            to: 'schwartzhezi@gmail.com',
            subject: `התראה: מיקוד מתוזמן בעוד ${settings.notification_minutes_before} דקות`,
            body: `שלום!

המיקוד המתוזמן שלך יתחיל בעוד ${settings.notification_minutes_before} דקות (${scheduledTime.format('HH:mm')}).

זמן להתכונן למיקוד!

המערכת שלך`
          });

          if (emailResult.success) {
            // שמור שהתראה נשלחה היום
            await supabase
              .from('focus_notifications_log')
              .insert({
                notification_key: notificationKey,
                date: moment().format('YYYY-MM-DD'),
                time: moment().format('HH:mm:ss'),
                schedule_time: schedule.time,
                notification_minutes_before: settings.notification_minutes_before,
                email_sent: true,
                message_id: emailResult.messageId
              });

            console.log('✅ Focus notification sent for', schedule.time);
          } else {
            console.error('❌ Failed to send notification for', schedule.time);
          }
        } else {
          console.log('⏭️ Notification already sent for', schedule.time);
        }
      }
    }
  } catch (error) {
    console.error('Error checking focus notifications:', error);
  }
}

// Handler ראשי
export default async function handler(req, res) {
  // רק GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await checkFocusNotifications();
    
    res.status(200).json({ 
      success: true, 
      message: 'Focus notifications checked successfully',
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
    });

  } catch (error) {
    console.error('Cron job error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
