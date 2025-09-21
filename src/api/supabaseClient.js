import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// מחלקה בסיסית לניהול טבלאות
export class SupabaseEntity {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async create(data) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert([{
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async list(orderBy = null, limit = null) {
    let query = supabase.from(this.tableName).select('*');
    
    if (orderBy) {
      if (orderBy.startsWith('-')) {
        const field = orderBy.substring(1);
        query = query.order(field, { ascending: false });
      } else {
        query = query.order(orderBy, { ascending: true });
      }
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async filter(filters = {}) {
    let query = supabase.from(this.tableName).select('*');
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async bulkCreate(itemsArray) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(itemsArray.map(item => ({
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })))
      .select();
    
    if (error) throw error;
    return data || [];
  }

  async count(filters = {}) {
    let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true });
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  async findFirst(filters = {}) {
    const results = await this.filter(filters);
    return results[0] || null;
  }
}
