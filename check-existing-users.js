// Check existing users and their notification settings
// Run this with: node check-existing-users.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cljweouehfujfigmqhjc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsandlb3VlaGZ1amZpZ21xaGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTEyMTEsImV4cCI6MjA2NjIyNzIxMX0.HHmyuM_73-eoHZj4aEAd5IMUi20BSXjXDw2s8BYii0s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExistingUsers() {
  try {
    console.log('🔍 Checking existing users and their settings...\n');

    // Check all users in profiles table
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`📊 Found ${users.length} users in production database:\n`);

    if (users.length === 0) {
      console.log('💡 No users found in production database');
      console.log('🔧 This means:');
      console.log('   - No one has signed up on the deployed website yet');
      console.log('   - Or users exist but not in the profiles table');
      console.log('   - The notification system will work once users sign up');
      return;
    }

    let usersWithNotifications = 0;
    let usersWithoutNotifications = 0;
    let usersWithDefaultSettings = 0;

    users.forEach((user, index) => {
      const settings = user.settings || {};
      const notificationsEnabled = settings.emailNotifications !== false;
      
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   - User ID: ${user.id}`);
      console.log(`   - Created: ${user.created_at}`);
      console.log(`   - Settings:`, settings);
      console.log(`   - Notifications: ${notificationsEnabled ? '✅ Enabled' : '❌ Disabled'}`);
      
      if (notificationsEnabled) {
        usersWithNotifications++;
      } else {
        usersWithoutNotifications++;
      }
      
      if (!user.settings || Object.keys(user.settings).length === 0) {
        usersWithDefaultSettings++;
      }
      
      console.log('');
    });

    console.log('📊 Summary:');
    console.log(`   - Total users: ${users.length}`);
    console.log(`   - Users with notifications enabled: ${usersWithNotifications}`);
    console.log(`   - Users with notifications disabled: ${usersWithoutNotifications}`);
    console.log(`   - Users with default settings: ${usersWithDefaultSettings}`);

    console.log('\n💡 Key Points:');
    console.log('   - The notification system works for ALL users (old and new)');
    console.log('   - Users with default settings (no settings object) will get notifications');
    console.log('   - Only users who explicitly disabled notifications won\'t get emails');
    console.log('   - The system respects each user\'s individual preference');

  } catch (error) {
    console.error('❌ Error checking existing users:', error);
  }
}

checkExistingUsers();


