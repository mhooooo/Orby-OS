import { Resend } from 'resend';

let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (resendInstance) {
    return resendInstance;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }

  resendInstance = new Resend(apiKey);
  return resendInstance;
}

const resend = new Proxy({} as Resend, {
  get(target, prop) {
    const client = getResendClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

interface InquiryNotificationData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  itinerary_snapshot?: Record<string, unknown> | null;
}

export async function sendInquiryNotification(inquiry: InquiryNotificationData) {
  try {
    // Parse itinerary snapshot for email content
    const itinerary = inquiry.itinerary_snapshot as {
      region?: string;
      groupSize?: number;
      startDate?: string;
      endDate?: string;
      vibe?: string[];
      transport?: string;
      courses?: Array<{ name: string; id: string }>;
      totalPrice?: number;
    } | null;

    // Build itinerary details HTML
    let itineraryHTML = '<p style="color: #6B7280; font-style: italic;">No itinerary details provided</p>';

    if (itinerary && Object.keys(itinerary).length > 0) {
      itineraryHTML = `
        <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin-top: 12px;">
          ${itinerary.region ? `<p style="margin: 8px 0;"><strong>Region:</strong> ${itinerary.region}</p>` : ''}
          ${itinerary.groupSize ? `<p style="margin: 8px 0;"><strong>Group Size:</strong> ${itinerary.groupSize} golfers</p>` : ''}
          ${itinerary.startDate && itinerary.endDate ? `
            <p style="margin: 8px 0;"><strong>Dates:</strong> ${new Date(itinerary.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(itinerary.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          ` : ''}
          ${itinerary.vibe && itinerary.vibe.length > 0 ? `
            <p style="margin: 8px 0;"><strong>Vibe:</strong> ${itinerary.vibe.join(', ')}</p>
          ` : ''}
          ${itinerary.transport ? `<p style="margin: 8px 0;"><strong>Transport:</strong> ${itinerary.transport}</p>` : ''}
          ${itinerary.courses && itinerary.courses.length > 0 ? `
            <div style="margin-top: 12px;">
              <strong>Selected Courses:</strong>
              <ul style="margin: 8px 0; padding-left: 20px;">
                ${itinerary.courses.map(course => `<li>${course.name}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${itinerary.totalPrice ? `
            <p style="margin: 12px 0 0 0; font-size: 18px; font-weight: bold; color: #FF6B35;">
              Estimated Total: ฿${itinerary.totalPrice.toLocaleString()}
            </p>
          ` : ''}
        </div>
      `;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Golf Trip Inquiry</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #F3F4F6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;">
    <!-- Header -->
    <div style="background-color: #1E1F20; padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 600;">
        Golf Okay
      </h1>
      <p style="margin: 8px 0 0 0; color: #9CA3AF; font-size: 14px;">
        New Trip Inquiry Received
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px;">
      <!-- Alert Badge -->
      <div style="background-color: #FEF3C7; border-left: 4px solid #FBBF24; padding: 12px 16px; margin-bottom: 24px; border-radius: 4px;">
        <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: 500;">
          ⚠️ Action Required: New customer inquiry waiting for response
        </p>
      </div>

      <!-- Customer Details -->
      <div style="margin-bottom: 32px;">
        <h2 style="margin: 0 0 16px 0; color: #1E1F20; font-size: 20px; font-weight: 600; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px;">
          Customer Details
        </h2>
        <div style="background: #F9FAFB; padding: 20px; border-radius: 8px;">
          <p style="margin: 0 0 12px 0; color: #374151;">
            <strong style="color: #1E1F20;">Name:</strong> ${inquiry.name}
          </p>
          <p style="margin: 0 0 12px 0; color: #374151;">
            <strong style="color: #1E1F20;">Email:</strong>
            <a href="mailto:${inquiry.email}" style="color: #00D4FF; text-decoration: none;">${inquiry.email}</a>
          </p>
          ${inquiry.phone ? `
            <p style="margin: 0 0 12px 0; color: #374151;">
              <strong style="color: #1E1F20;">Phone:</strong> ${inquiry.phone}
            </p>
          ` : ''}
          ${inquiry.message ? `
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #1E1F20;">Message:</p>
              <p style="margin: 0; color: #374151; white-space: pre-wrap;">${inquiry.message}</p>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Itinerary Details -->
      <div style="margin-bottom: 32px;">
        <h2 style="margin: 0 0 16px 0; color: #1E1F20; font-size: 20px; font-weight: 600; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px;">
          Trip Itinerary
        </h2>
        ${itineraryHTML}
      </div>

      <!-- Reference Info -->
      <div style="background: #EEF2FF; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <p style="margin: 0; color: #4338CA; font-size: 12px;">
          <strong>Inquiry ID:</strong> ${inquiry.id}
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="mailto:${inquiry.email}?subject=Re: Your Golf Trip Inquiry - Golf Okay"
           style="display: inline-block; background-color: #FF6B35; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 24px; font-weight: 600; font-size: 16px;">
          Reply to Customer
        </a>
      </div>

      <!-- Admin Dashboard Link (placeholder) -->
      <div style="text-align: center; margin-top: 16px;">
        <a href="#" style="color: #6B7280; font-size: 14px; text-decoration: none;">
          View in Admin Dashboard →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #F9FAFB; padding: 24px; text-align: center; border-top: 1px solid #E5E7EB;">
      <p style="margin: 0; color: #6B7280; font-size: 12px;">
        This notification was sent from Golf Okay inquiry system
      </p>
      <p style="margin: 8px 0 0 0; color: #9CA3AF; font-size: 12px;">
        © ${new Date().getFullYear()} Golf Okay. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Golf Okay <onboarding@resend.dev>',
      to: 'info@golfokay.co',
      subject: `New Golf Trip Inquiry - ${inquiry.name}`,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending inquiry notification email:', error);
      throw error;
    }

    console.log('Inquiry notification email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send inquiry notification:', error);
    // Don't throw - we log the error but don't want to fail the inquiry submission
    throw error;
  }
}
