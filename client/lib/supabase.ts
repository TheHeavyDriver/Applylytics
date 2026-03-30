import { createClient } from '@supabase/supabase-js';
import type { Application, FollowUp } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

export async function getApplications(userId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('applied_date', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createApplication(application: Partial<Application> & { user_id: string }) {
  const { data, error } = await supabase
    .from('applications')
    .insert(application)
    .select()
    .single();
  
  if (error) throw error;
  
  const appliedDate = new Date(application.applied_date || new Date());
  const followUpDate = new Date(appliedDate);
  followUpDate.setDate(followUpDate.getDate() + 7);
  
  await supabase
    .from('follow_ups')
    .insert({
      user_id: application.user_id,
      application_id: data.id,
      type: 'email',
      scheduled_date: followUpDate.toISOString().split('T')[0],
      completed: false,
    });
  
  return data;
}

export async function updateApplication(id: string, updates: Partial<Application>) {
  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Supabase update error:', error);
    throw error;
  }
  return data;
}

export async function deleteApplication(id: string) {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function getFollowUps(userId: string) {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*, applications(*)')
    .eq('user_id', userId)
    .order('scheduled_date', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function createFollowUp(followUp: Partial<FollowUp> & { user_id: string }) {
  const { data, error } = await supabase
    .from('follow_ups')
    .insert(followUp)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateFollowUp(id: string, updates: Partial<FollowUp>) {
  const { data, error } = await supabase
    .from('follow_ups')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteFollowUp(id: string) {
  const { error } = await supabase
    .from('follow_ups')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function generateFollowUpSuggestions(userId: string) {
  const applications = await getApplications(userId);
  const followUps = await getFollowUps(userId);
  const suggestions: { application: Application; daysSinceApplied: number; suggestion: string }[] = [];
  
  const activeStatuses = ['applied', 'screening', 'interview', 'technical'];
  const today = new Date();
  
  for (const app of applications) {
    if (!activeStatuses.includes(app.status)) continue;
    
    const appliedDate = new Date(app.applied_date);
    const daysSinceApplied = Math.floor((today.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
    const hasFollowUp = followUps.some(fu => fu.application_id === app.id && !fu.completed);
    
    if (hasFollowUp) continue;
    
    if (daysSinceApplied >= 7 && daysSinceApplied < 14 && app.status === 'applied') {
      suggestions.push({
        application: app,
        daysSinceApplied,
        suggestion: 'Time to follow up! You haven\'t heard back yet.'
      });
    } else if (daysSinceApplied >= 14 && app.status === 'applied') {
      suggestions.push({
        application: app,
        daysSinceApplied,
        suggestion: 'Strong follow up recommended. Consider a different approach.'
      });
    } else if (app.status === 'interview' && daysSinceApplied >= 3) {
      suggestions.push({
        application: app,
        daysSinceApplied,
        suggestion: 'Send a thank-you note if you haven\'t already.'
      });
    }
  }
  
  return suggestions;
}
