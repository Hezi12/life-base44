// כרגע משתמש ב-localStorage - אפשר לשנות ל-Supabase אחר כך
import { localClient } from './localClient';

export const FocusSession = localClient.entities.FocusSession;
export const FocusSetting = localClient.entities.FocusSetting;
export const Event = localClient.entities.Event;
export const Category = localClient.entities.Category;
export const DailyImage = localClient.entities.DailyImage;
export const WorkTopic = localClient.entities.WorkTopic;
export const DailyNotes = localClient.entities.DailyNotes;
export const StickyNotes = localClient.entities.StickyNotes;
export const WorkSubject = localClient.entities.WorkSubject;
export const PomodoroSettings = localClient.entities.PomodoroSettings;
export const Habit = localClient.entities.Habit;
export const HabitRecord = localClient.entities.HabitRecord;

// auth sdk:
export const User = localClient.auth;