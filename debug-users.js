// Debug script to check user notification settings
// Run this with: node debug-users.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cljweouehfujfigmqhjc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsandlb3VlaGZ1amZpZ21xaGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTEyMTEsImV4cCI6MjA2NjIyNzIxMX0.HHmyuM_73-eoHZj4aEAd5IMUi20BSXjXDw2s8BYii0s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUsers() {
  try {
    console.log('🔍 Checking users and their notification settings...\n');

    // Get all users from profiles table
    const { data: profileUsers, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, settings, full_name');

    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError);
    } else {
      console.log(`📊 Found ${profileUsers.length} users in profiles table:\n`);
      profileUsers.forEach((user, index) => {
        const settings = user.settings || {};
        const notificationsEnabled = settings.emailNotifications !== false;
        
        console.log(`${index + 1}. ${user.full_name || 'No name'} (${user.email})`);
        console.log(`   - Notifications: ${notificationsEnabled ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`   - Settings:`, settings);
        console.log('');
      });
    }

    // Check if there are users in auth but not in profiles
    console.log('🔐 Checking auth.users table...\n');
    
    // Note: We can't directly query auth.users with anon key, but we can check if current user exists
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Error getting current user:', authError);
    } else if (user) {
      console.log('✅ Current authenticated user:', user.email);
      
      // Check if this user exists in profiles
      const { data: profile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileCheckError) {
        console.log('❌ User not found in profiles table - this is the issue!');
        console.log('💡 Need to manually add user to profiles table');
      } else {
        console.log('✅ User found in profiles table');
      }
    } else {
      console.log('❌ No authenticated user found');
    }

    // Check calendar events
    console.log('\n📅 Checking calendar events...\n');
    
    const { data: events, error: eventsError } = await supabase
      .from('calendar')
      .select('*');

    if (eventsError) {
      console.error('❌ Error fetching events:', eventsError);
    } else {
      console.log(`📊 Found ${events.length} total events:\n`);
      
      const eventsWithReminders = events.filter(e => e.reminderTime > 0);
      console.log(`📊 Found ${eventsWithReminders.length} events with reminders:\n`);

      eventsWithReminders.forEach((event, index) => {
        const eventDate = new Date(event.date);
        const reminderTimeMs = event.reminderTime * 60 * 1000;
        const notificationTime = new Date(eventDate.getTime() - reminderTimeMs);
        
        console.log(`${index + 1}. ${event.event}`);
        console.log(`   - Date: ${eventDate.toLocaleString()}`);
        console.log(`   - Reminder: ${event.reminderTime} minutes before`);
        console.log(`   - Notification time: ${notificationTime.toLocaleString()}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error in debug script:', error);
  }
}

debugUsers();
