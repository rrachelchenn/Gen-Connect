// Email notifications using Resend
let resend = null;

// Safely initialize Resend - don't crash if package not available
try {
  const { Resend } = require('resend');
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Resend email service initialized');
} catch (error) {
  console.warn('⚠️ Resend package not available - emails disabled:', error.message);
}

// Send email notification for contact request
const sendContactRequestNotification = async (contactData) => {
  // Skip if resend not configured
  if (!resend) {
    console.log('⚠️ Email skipped - Resend not configured');
    return false;
  }

  const { name, email, phone, preferredTopics, message, tutorName } = contactData;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'rachel_chen@berkeley.edu',
      subject: `📬 New Contact Request for ${tutorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">New Contact Request</h2>
          <p>A senior has requested to connect with <strong>${tutorName}</strong>.</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Contact Information:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
            <p><strong>Interested in:</strong> ${preferredTopics}</p>
            ${message ? `<p><strong>Message:</strong><br>${message}</p>` : ''}
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            <strong>Next steps:</strong> Reach out to ${name} at ${email} or ${phone} to schedule a session.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">
            GenConnect Notification • ${new Date().toLocaleString()}
          </p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return false;
    }

    console.log('✅ Contact request email sent to rachel_chen@berkeley.edu');
    return true;
  } catch (error) {
    console.error('❌ Failed to send contact email:', error.message);
    return false;
  }
};

// Send email notification for tutor application
const sendTutorApplicationNotification = async (applicationData) => {
  // Skip if resend not configured
  if (!resend) {
    console.log('⚠️ Email skipped - Resend not configured');
    return false;
  }

  const { name, email, phone, college, major, age, specialties, bio, availability, experience, why_tutor } = applicationData;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'rachel_chen@berkeley.edu',
      subject: `🎓 New Tutor Application from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">New Tutor Application</h2>
          <p>A student has applied to become a GenConnect tutor!</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Applicant Information:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
            <p><strong>College:</strong> ${college}</p>
            <p><strong>Major:</strong> ${major}</p>
            <p><strong>Age:</strong> ${age}</p>
            <p><strong>Specialties:</strong> ${Array.isArray(specialties) ? specialties.join(', ') : specialties}</p>
            <p><strong>Availability:</strong> ${availability}</p>
          </div>
          
          <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">About Them:</h3>
            <p><strong>Bio:</strong><br>${bio}</p>
            ${experience ? `<p><strong>Experience:</strong><br>${experience}</p>` : ''}
            <p><strong>Why they want to tutor:</strong><br>${why_tutor}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            <strong>Next steps:</strong> Review their application and reach out at ${email} to schedule an interview.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">
            GenConnect Notification • ${new Date().toLocaleString()}
          </p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return false;
    }

    console.log('✅ Tutor application email sent to rachel_chen@berkeley.edu');
    return true;
  } catch (error) {
    console.error('❌ Failed to send application email:', error.message);
    return false;
  }
};

module.exports = {
  sendContactRequestNotification,
  sendTutorApplicationNotification
};

