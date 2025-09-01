// Check what data exists in production database
// Run this with: node check-production-data.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cljweouehfujfigmqhjc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsandlb3VlaGZ1amZpZ21xaGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTEyMTEsImV4cCI6MjA2NjIyNzIxMX0.HHmyuM_73-eoHZj4aEAd5IMUi20BSXjXDw2s8BYii0s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductionData() {
  try {
    console.log('🔍 Checking production database...\n');

    // Check all events (not just ones with reminders)
    const { data: allEvents, error: allEventsError } = await supabase
      .from('calendar')
      .select('*');

    if (allEventsError) {
      console.error('❌ Error fetching all events:', allEventsError);
    } else {
      console.log(`📊 Total events in production: ${allEvents.length}`);
      if (allEvents.length > 0) {
        console.log('📅 Events:');
        allEvents.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.event} (reminder: ${event.reminderTime} min)`);
        });
      }
    }

    // Check all users
    const { data: allUsers, error: allUsersError } = await supabase
      .from('profiles')
      .select('*');

    if (allUsersError) {
      console.error('❌ Error fetching all users:', allUsersError);
    } else {
      console.log(`\n👥 Total users in production: ${allUsers.length}`);
      if (allUsers.length > 0) {
        console.log('👤 Users:');
        allUsers.forEach((user, index) => {
          const settings = user.settings || {};
          const notificationsEnabled = settings.emailNotifications !== false;
          console.log(`   ${index + 1}. ${user.email} (notifications: ${notificationsEnabled ? 'ON' : 'OFF'})`);
        });
      }
    }

    console.log('\n💡 Next Steps:');
    if (allEvents.length === 0) {
      console.log('   1. Create events on your deployed website');
      console.log('   2. Set reminder times for the events');
    }
    if (allUsers.length === 0) {
      console.log('   1. Sign up users on your deployed website');
      console.log('   2. Enable notifications in their settings');
    }
    if (allEvents.length > 0 && allUsers.length > 0) {
      console.log('   ✅ Data exists! The issue might be timing or Edge Function configuration');
    }

  } catch (error) {
    console.error('❌ Error checking production data:', error);
  }
}

checkProductionData();


