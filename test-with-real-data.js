// Test script that will work once real data is added to production
// Run this after adding users and events to production

const SUPABASE_URL = 'https://cljweouehfujfigmqhjc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsandlb3VlaGZ1amZpZ21xaGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTEyMTEsImV4cCI6MjA2NjIyNzIxMX0.HHmyuM_73-eoHZj4aEAd5IMUi20BSXjXDw2s8BYii0s';

async function testWithRealData() {
  try {
    console.log('🧪 Testing notification function with real data...\n');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    const result = await response.json();
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Body:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Notification function executed successfully!');
      if (result.notificationsSent > 0) {
        console.log(`📧 Sent ${result.notificationsSent} notifications`);
        console.log('🎉 The system is working! Check your email inboxes.');
      } else {
        console.log('📧 No notifications sent');
        console.log('💡 This could mean:');
        console.log('   - No events are due for notifications right now');
        console.log('   - No users have notifications enabled');
        console.log('   - Check the timing of your events');
      }
    } else {
      console.log('❌ Notification function failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing notifications:', error);
  }
}

console.log('💡 Instructions:');
console.log('1. Go to your deployed website');
console.log('2. Sign up 2 users');
console.log('3. Create an event with 15-minute reminder');
console.log('4. Set event time to 15 minutes from now');
console.log('5. Run this script to test\n');

testWithRealData();


