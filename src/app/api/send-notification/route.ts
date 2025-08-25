import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('API route called - starting email send process');
    
    const { to, subject, body, eventId } = await request.json();
    console.log('Request data received:', { to, subject: subject?.substring(0, 50) + '...', eventId });

    if (!to || !subject || !body) {
      console.error('Missing required fields:', { to: !!to, subject: !!subject, body: !!body });
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    console.log('Resend API key found, importing Resend...');

    // Dynamic import to avoid build issues
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('Resend client created, sending email...');

    // Send email using Resend
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [to],
      subject,
      html: body,
    });

    console.log('Email sent successfully:', data);

    return NextResponse.json({ 
      success: true, 
      messageId: data.data?.id || 'unknown',
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    // More specific error handling
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Email service error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
