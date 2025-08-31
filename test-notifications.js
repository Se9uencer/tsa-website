// Test script to manually trigger the notification function
// Run this with: node test-notifications.js

const SUPABASE_URL = 'https://cljweouehfujfigmqhjc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsandlb3VlaGZ1amZpZ21xaGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTEyMTEsImV4cCI6MjA2NjIyNzIxMX0.HHmyuM_73-eoHZj4aEAd5IMUi20BSXjXDw2s8BYii0s';

async function testNotifications() {
  try {
    console.log('🧪 Testing notification function...\n');
    
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
      } else {
        console.log('📧 No notifications sent (no events due or no users with notifications enabled)');
      }
    } else {
      console.log('❌ Notification function failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing notifications:', error);
  }
}

testNotifications();
