// Script to add test data using service role key (bypasses RLS)
// Run this with: node add-test-data-admin.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cljweouehfujfigmqhjc.supabase.co';
// You'll need to get this from your Supabase dashboard
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTestData() {
  try {
    console.log('🧪 Adding test data to production database (admin mode)...\n');

    // Add test users to profiles table (using proper UUIDs)
    const testUsers = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001', // Valid UUID
        email: 'test1@example.com',
        full_name: 'Test User 1',
        settings: { emailNotifications: true }
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002', // Valid UUID
        email: 'test2@example.com',
        full_name: 'Test User 2',
        settings: { emailNotifications: true }
      }
    ];

    console.log('👥 Adding test users...');
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .insert(testUsers)
      .select();

    if (usersError) {
      console.error('❌ Error adding users:', usersError);
    } else {
      console.log('✅ Added test users:', usersData);
    }

    // Add test events to calendar table (let database auto-generate IDs)
    const now = new Date();
    const testEvents = [
      {
        event: 'Test Event - 15 minutes',
        date: new Date(now.getTime() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
        type: 'meeting',
        urgency: 'medium',
        description: 'Test event for 15-minute reminder',
        reminderTime: 15
      },
      {
        event: 'Test Event - 1 hour',
        date: new Date(now.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        type: 'conference',
        urgency: 'high',
        description: 'Test event for 1-hour reminder',
        reminderTime: 60
      }
    ];

    console.log('\n📅 Adding test events...');
    const { data: eventsData, error: eventsError } = await supabase
      .from('calendar')
      .insert(testEvents)
      .select();

    if (eventsError) {
      console.error('❌ Error adding events:', eventsError);
    } else {
      console.log('✅ Added test events:', eventsData);
    }

    console.log('\n🎉 Test data added successfully!');
    console.log('💡 Now you can test the notification function');

  } catch (error) {
    console.error('❌ Error adding test data:', error);
  }
}

addTestData();
