// Debug script to check notification timing and logic
// Run this with: node debug-notifications.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cljweouehfujfigmqhjc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsandlb3VlaGZ1amZpZ21xaGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTEyMTEsImV4cCI6MjA2NjIyNzIxMX0.HHmyuM_73-eoHZj4aEAd5IMUi20BSXjXDw2s8BYii0s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugNotifications() {
  try {
    console.log('🔍 Debugging notification system...\n');

    // Get current time
    const now = new Date();
    console.log('🕐 Current time:', now.toISOString());
    console.log('🕐 Current time (local):', now.toLocaleString());

    // Get all events with reminders
    const { data: events, error: eventsError } = await supabase
      .from('calendar')
      .select('*')
      .gt('reminderTime', 0);

    if (eventsError) {
      console.error('❌ Error fetching events:', eventsError);
      return;
    }

    console.log(`📊 Found ${events.length} events with reminders:\n`);

    let eventsDueForNotification = 0;

    events.forEach((event, index) => {
      const eventDate = new Date(event.date);
      const reminderTimeMs = event.reminderTime * 60 * 1000; // Convert minutes to milliseconds
      const notificationTime = new Date(eventDate.getTime() - reminderTimeMs);
      
      // Check if it's time to send the notification (within 5 minutes of the scheduled time)
      const timeDiff = Math.abs(now.getTime() - notificationTime.getTime());
      const fiveMinutes = 5 * 60 * 1000;
      const isDue = timeDiff <= fiveMinutes && notificationTime <= now;

      console.log(`${index + 1}. ${event.event}`);
      console.log(`   - Event Date: ${eventDate.toLocaleString()}`);
      console.log(`   - Reminder: ${event.reminderTime} minutes before`);
      console.log(`   - Notification Time: ${notificationTime.toLocaleString()}`);
      console.log(`   - Time Diff: ${Math.round(timeDiff / 1000 / 60)} minutes`);
      console.log(`   - Is Due: ${isDue ? '✅ YES' : '❌ NO'}`);
      console.log('');

      if (isDue) {
        eventsDueForNotification++;
      }
    });

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, settings');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`👥 Found ${users.length} users:\n`);

    let usersWithNotifications = 0;
    users.forEach((user, index) => {
      const settings = user.settings || {};
      const notificationsEnabled = settings.emailNotifications !== false;
      
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   - Notifications: ${notificationsEnabled ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   - Settings:`, settings);
      console.log('');

      if (notificationsEnabled) {
        usersWithNotifications++;
      }
    });

    console.log('📊 Summary:');
    console.log(`   - Events due for notification: ${eventsDueForNotification}`);
    console.log(`   - Users with notifications enabled: ${usersWithNotifications}`);
    console.log(`   - Total notifications that should be sent: ${eventsDueForNotification * usersWithNotifications}`);

    if (eventsDueForNotification > 0 && usersWithNotifications > 0) {
      console.log('\n💡 There should be notifications sent!');
      console.log('🔧 The issue might be:');
      console.log('   1. Edge Function not being triggered automatically');
      console.log('   2. Environment variables not set in Supabase');
      console.log('   3. Resend API key not configured');
    } else {
      console.log('\n💡 No notifications should be sent right now');
      console.log('   - Either no events are due, or no users have notifications enabled');
    }

  } catch (error) {
    console.error('❌ Error in debug script:', error);
  }
}

debugNotifications();


