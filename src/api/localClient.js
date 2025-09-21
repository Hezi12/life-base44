import { localStorageManager } from '@/lib/localStorage';

// מחלקה בסיסית לכל Entity
class BaseEntity {
  constructor(entityType) {
    this.entityType = entityType;
  }

  async create(data) {
    return localStorageManager.create(this.entityType, data);
  }

  async find(filters = {}) {
    if (Object.keys(filters).length === 0) {
      return localStorageManager.read(this.entityType);
    }
    return localStorageManager.query(this.entityType, filters);
  }

  async filter(filters = {}) {
    return this.find(filters);
  }

  async list(orderBy = null, limit = null) {
    const items = localStorageManager.read(this.entityType);
    
    // Apply ordering if specified
    let sortedItems = [...items];
    if (orderBy) {
      if (orderBy.startsWith('-')) {
        const field = orderBy.substring(1);
        sortedItems.sort((a, b) => {
          if (a[field] < b[field]) return 1;
          if (a[field] > b[field]) return -1;
          return 0;
        });
      } else {
        sortedItems.sort((a, b) => {
          if (a[orderBy] < b[orderBy]) return -1;
          if (a[orderBy] > b[orderBy]) return 1;
          return 0;
        });
      }
    }
    
    // Apply limit if specified
    if (limit) {
      sortedItems = sortedItems.slice(0, limit);
    }
    
    return sortedItems;
  }

  async findById(id) {
    return localStorageManager.read(this.entityType, id);
  }

  async update(id, data) {
    return localStorageManager.update(this.entityType, id, data);
  }

  async delete(id) {
    return localStorageManager.delete(this.entityType, id);
  }

  async findFirst(filters = {}) {
    const items = await this.find(filters);
    return items[0] || null;
  }

  async count(filters = {}) {
    const items = await this.find(filters);
    return items.length;
  }

  async bulkCreate(itemsArray) {
    const results = [];
    for (const item of itemsArray) {
      const result = await this.create(item);
      results.push(result);
    }
    return results;
  }
}

// מחלקת Authentication מקומית
class LocalAuth {
  constructor() {
    this.currentUser = null;
    this.loadUser();
  }

  loadUser() {
    const data = localStorageManager.getData();
    this.currentUser = data.user || null;
  }

  async signIn(email) {
    // Mock authentication - תמיד מצליח
    const user = {
      id: 'local-user',
      name: 'משתמש מקומי',
      email: email || 'user@local.com',
      isAuthenticated: true,
      signedInAt: new Date().toISOString()
    };
    
    localStorageManager.updateData({ user });
    this.currentUser = user;
    return user;
  }

  async signOut() {
    const user = { ...this.currentUser, isAuthenticated: false };
    localStorageManager.updateData({ user });
    this.currentUser = null;
    return true;
  }

  async getCurrentUser() {
    if (!this.currentUser) {
      this.loadUser();
    }
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser && this.currentUser.isAuthenticated;
  }

  async logout() {
    return this.signOut();
  }
}

// יצירת client מקומי
export const localClient = {
  entities: {
    FocusSession: new BaseEntity('focusSessions'),
    FocusSetting: new BaseEntity('focusSettings'),
    Event: new BaseEntity('events'),
    Category: new BaseEntity('categories'),
    DailyImage: new BaseEntity('dailyImages'),
    WorkTopic: new BaseEntity('workTopics'),
    DailyNotes: new BaseEntity('dailyNotes'),
    StickyNotes: new BaseEntity('stickyNotes'),
    WorkSubject: new BaseEntity('workSubjects'),
    PomodoroSettings: new BaseEntity('pomodoroSettings'),
    Habit: new BaseEntity('habits'),
    HabitRecord: new BaseEntity('habitRecords')
  },
  auth: new LocalAuth(),
  integrations: {
    Core: {
      async InvokeLLM({ prompt, model = 'claude-3-5-sonnet-20241022' }) {
        try {
          // Import Anthropic dynamically to avoid bundling issues
          const { default: Anthropic } = await import('@anthropic-ai/sdk');
          
          const anthropic = new Anthropic({
            apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
            dangerouslyAllowBrowser: true // Required for client-side usage
          });

          const message = await anthropic.messages.create({
            model: model,
            max_tokens: 4000,
            temperature: 0.7,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          });

          // Return the response content
          return message.content[0].text;
          
        } catch (error) {
          console.error('Claude API Error:', error);
          
          // Fallback to mock response if API fails
          return `שגיאה בחיבור ל-Claude API. אנא בדוק את החיבור לאינטרנט ונסה שוב.
          
שגיאה טכנית: ${error.message}`;
        }
      },
      
      async SendEmail({ to, subject, body }) {
        // Mock email sending
        console.log('Mock email sent:', { to, subject, body });
        return { success: true, messageId: 'mock-' + Date.now() };
      },
      
      async UploadFile(file) {
        // Validation
        if (!file) {
          throw new Error('לא נבחר קובץ');
        }
        
        if (!file.type || !file.type.startsWith('image/')) {
          throw new Error('יש לבחור קובץ תמונה בלבד');
        }
        
        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new Error('הקובץ גדול מדי. מקסימום 5MB');
        }
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onload = function(e) {
            const base64Data = e.target.result;
            const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // שמירה ב-localStorage
            const fileData = {
              id: fileId,
              filename: file.name,
              size: file.size,
              type: file.type,
              data: base64Data,
              uploadedAt: new Date().toISOString()
            };
            
            // שמירת הקובץ
            localStorage.setItem(`uploaded_file_${fileId}`, JSON.stringify(fileData));
            
            // החזרת URL מקומי
            resolve({
              file_url: base64Data, // החזרת ה-base64 ישירות כ-URL
              url: base64Data,
              filename: file.name,
              size: file.size,
              fileId: fileId
            });
          };
          
          reader.onerror = function() {
            reject(new Error('שגיאה בקריאת הקובץ'));
          };
          
          reader.readAsDataURL(file);
        });
      },
      
      async GenerateImage({ prompt, size = '1024x1024' }) {
        // Mock image generation
        console.log('Mock image generation:', { prompt, size });
        return {
          url: `https://via.placeholder.com/${size.replace('x', 'x')}/0066cc/ffffff?text=${encodeURIComponent(prompt)}`,
          prompt
        };
      },
      
      async ExtractDataFromUploadedFile(fileUrl) {
        // Mock data extraction
        console.log('Mock data extraction from:', fileUrl);
        return {
          text: 'זהו טקסט מדומה שחולץ מהקובץ',
          metadata: { pages: 1, words: 10 }
        };
      },
      
      async CreateFileSignedUrl(filename) {
        // Mock signed URL creation
        return `https://mock-storage.com/upload/${Date.now()}-${filename}`;
      },
      
      async UploadPrivateFile(file) {
        // זהה ל-UploadFile אבל עם סימון שזה פרטי
        const result = await this.UploadFile(file);
        return {
          ...result,
          private: true
        };
      },

      // פונקציות נוספות לניהול קבצים
      getUploadedFile(fileId) {
        const fileData = localStorage.getItem(`uploaded_file_${fileId}`);
        return fileData ? JSON.parse(fileData) : null;
      },

      deleteUploadedFile(fileId) {
        localStorage.removeItem(`uploaded_file_${fileId}`);
        return true;
      },

      listUploadedFiles() {
        const files = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('uploaded_file_')) {
            const fileData = JSON.parse(localStorage.getItem(key));
            files.push(fileData);
          }
        }
        return files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      }
    }
  }
};
