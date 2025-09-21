import { SupabaseEntity, supabase } from './supabaseClient';

// יצירת entities לכל הטבלאות
export const FocusSession = new SupabaseEntity('focus_sessions');
export const FocusSetting = new SupabaseEntity('focus_settings');
export const Event = new SupabaseEntity('events');
export const Category = new SupabaseEntity('categories');
export const DailyImage = new SupabaseEntity('daily_images');
export const WorkTopic = new SupabaseEntity('work_topics');
export const DailyNotes = new SupabaseEntity('daily_notes');
export const StickyNotes = new SupabaseEntity('sticky_notes');
export const WorkSubject = new SupabaseEntity('work_subjects');
export const PomodoroSettings = new SupabaseEntity('pomodoro_settings');
export const Habit = new SupabaseEntity('habits');
export const HabitRecord = new SupabaseEntity('habit_records');

// מחלקת Auth עם Supabase
export class SupabaseAuth {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data.user;
  }

  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data.user;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  isAuthenticated() {
    return supabase.auth.getSession().then(({ data: { session } }) => {
      return !!session;
    });
  }

  async logout() {
    return this.signOut();
  }

  // מאזין לשינויים בסטטוס ההתחברות
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const User = new SupabaseAuth();
