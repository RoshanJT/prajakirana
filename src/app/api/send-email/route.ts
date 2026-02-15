import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const { recipients, subject, message } = await request.json();

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json({ error: 'Recipients required' }, { status: 400 });
        }

        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.error('Missing SMTP Credentials in Environment Variables');
            return NextResponse.json({ error: 'Server configuration error: Missing SMTP credentials' }, { status: 500 });
        }

        // Configure Transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Loop through recipients and send individual personalized emails
        console.log(`Starting to send ${recipients.length} personalized emails...`);
        let successCount = 0;
        let failCount = 0;

        for (const recipient of recipients) {
            // Handle both object {email, name} and simple string email (legacy support)
            const recipientEmail = typeof recipient === 'string' ? recipient : recipient.email;
            const recipientName = typeof recipient === 'string' ? 'Donor' : recipient.name || 'Donor';

            if (!recipientEmail) continue;

            // Personalize content
            const personalizedSubject = subject.replace(/{{name}}/g, recipientName);
            const personalizedMessage = message.replace(/{{name}}/g, recipientName);

            const mailOptions = {
                from: `"PRAJAKIRANA SEVA CHARITABLE TRUST" <${process.env.SMTP_EMAIL}>`,
                to: recipientEmail,
                subject: personalizedSubject,
                text: personalizedMessage,
            };

            try {
                await transporter.sendMail(mailOptions);
                successCount++;
                // Add rate limiting delay (500ms) to avoid spam triggers
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                console.error(`Failed to send to ${recipientEmail}:`, err);
                failCount++;
            }
        }

        console.log(`Finished sending. Success: ${successCount}, Failed: ${failCount}`);

        if (successCount === 0 && failCount > 0) {
            return NextResponse.json({ error: 'Failed to send all emails' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Sent ${successCount} emails, failed ${failCount}`
        });

    } catch (error: any) {
        console.error('Error sending email batch:', error);
        return NextResponse.json({ error: error.message || 'Failed to send emails' }, { status: 500 });
    }
}
