// מערכת אחסון מקומית
class LocalStorageManager {
  constructor() {
    this.storageKey = 'life-app-data';
    this.initializeData();
  }

  initializeData() {
    const existingData = localStorage.getItem(this.storageKey);
    if (!existingData) {
      const initialData = {
        focusSessions: [],
        focusSettings: [{
          id: 'default-focus-settings',
          defaultDuration: 25,
          breakDuration: 5,
          longBreakDuration: 15,
          sessionsUntilLongBreak: 4,
          schedule: [],
          notify_on_time: true,
          notification_minutes_before: 5
        }],
        events: [],
        categories: [
          { id: '1', name: 'עבודה', color: '#3b82f6' },
          { id: '2', name: 'לימודים', color: '#10b981' },
          { id: '3', name: 'אישי', color: '#f59e0b' }
        ],
        dailyImages: [],
        workTopics: [],
        dailyNotes: [],
        stickyNotes: [],
        workSubjects: [],
        pomodoroSettings: {
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          sessionsUntilLongBreak: 4,
          soundEnabled: true,
          autoStartBreaks: false
        },
        habits: [],
        habitRecords: [],
        user: {
          id: 'local-user',
          name: 'משתמש מקומי',
          email: 'user@local.com',
          isAuthenticated: true
        }
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }

  getData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {};
  }

  setData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  updateData(updates) {
    const currentData = this.getData();
    const newData = { ...currentData, ...updates };
    this.setData(newData);
    return newData;
  }

  // Generic CRUD operations
  create(entityType, item) {
    const data = this.getData();
    const items = data[entityType] || [];
    const newItem = {
      ...item,
      id: item.id || this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    this.updateData({ [entityType]: items });
    return newItem;
  }

  read(entityType, id = null) {
    const data = this.getData();
    const items = data[entityType] || [];
    return id ? items.find(item => item.id === id) : items;
  }

  update(entityType, id, updates) {
    const data = this.getData();
    const items = data[entityType] || [];
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.updateData({ [entityType]: items });
      return items[index];
    }
    return null;
  }

  delete(entityType, id) {
    const data = this.getData();
    const items = data[entityType] || [];
    const filteredItems = items.filter(item => item.id !== id);
    this.updateData({ [entityType]: filteredItems });
    return true;
  }

  // Query operations
  query(entityType, filters = {}) {
    const items = this.read(entityType);
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (typeof value === 'function') {
          return value(item[key]);
        }
        return item[key] === value;
      });
    });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const localStorageManager = new LocalStorageManager();
