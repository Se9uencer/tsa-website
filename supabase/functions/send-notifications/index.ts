// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current time
    const now = new Date();
    console.log('Checking for notifications at:', now.toISOString());

    // Get all events with reminders that need to be sent
    const { data: events, error: eventsError } = await supabase
      .from('calendar')
      .select('*')
      .gt('reminderTime', 0)
      .not('date', 'is', null);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch events' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${events.length} events with reminders`);

    let notificationsSent = 0;

    for (const event of events) {
      const eventDate = new Date(event.date);
      const reminderTimeMs = event.reminderTime * 60 * 1000;
      const notificationTime = new Date(eventDate.getTime() - reminderTimeMs);
      
      const timeDiff = Math.abs(now.getTime() - notificationTime.getTime());
      const fiveMinutes = 5 * 60 * 1000;

      if (timeDiff <= fiveMinutes && notificationTime <= now) {
        console.log(`Sending notification for event: ${event.event}`);

        // Get all users who have email notifications enabled
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, email, settings')
          .not('email', 'is', null);

        if (usersError) {
          console.error('Error fetching users:', usersError);
          continue;
        }

        console.log(`Found ${users.length} users to check for notifications`);

        // Send email to each user who has notifications enabled
        for (const user of users) {
          const settings = user.settings || {};
          if (settings.emailNotifications !== false) { // Default to true if not set
            try {
              console.log(`Sending notification to ${user.email} for event: ${event.event}`);
              
              // Send email directly using Resend API
              const emailResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'calendar-reminder@onresend.com',
                  to: [user.email],
                  subject: `Reminder: ${event.event}`,
                  html: createEmailBody(event),
                }),
              });

              if (emailResponse.ok) {
                console.log(`✅ Email sent to ${user.email} for event: ${event.event}`);
                notificationsSent++;
              } else {
                const errorText = await emailResponse.text();
                console.error(`❌ Failed to send email to ${user.email}:`, errorText);
              }
            } catch (error) {
              console.error(`❌ Error sending email to ${user.email}:`, error);
            }
          } else {
            console.log(`⏭️ Skipping ${user.email} - notifications disabled`);
          }
        }

        console.log(`Notification processed for event: ${event.event}`);
      }
    }

    console.log(`Sent ${notificationsSent} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent,
        message: `Processed ${events.length} events, sent ${notificationsSent} notifications`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-notifications function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function createEmailBody(event) {
  const eventDate = new Date(event.date).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">North Creek TSA Event Reminder</h2>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e293b; margin-top: 0;">${event.event}</h3>
        <p style="color: #64748b; margin: 8px 0;"><strong>Date & Time:</strong> ${eventDate}</p>
        <p style="color: #64748b; margin: 8px 0;"><strong>Type:</strong> ${event.type}</p>
        <p style="color: #64748b; margin: 8px 0;"><strong>Urgency:</strong> ${event.urgency}</p>
        ${event.description ? `<p style="color: #64748b; margin: 8px 0;"><strong>Description:</strong> ${event.description}</p>` : ''}
      </div>
      <p style="color: #64748b; font-size: 14px;">This is an automated reminder from the North Creek TSA Portal.</p>
    </div>
  `;
}
