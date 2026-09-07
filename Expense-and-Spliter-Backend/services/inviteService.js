const nodemailer = require('nodemailer');
const Invite = require('../models/Invite');
const crypto = require('crypto');

// Mock transporter for development
const transporter = {
    sendMail: async (mailOptions) => {
        console.log('📧 [MOCK EMAIL SERVICE] Sending Email:', mailOptions);
        return { messageId: 'mock-id' };
    }
};

// In production, use real credentials
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// });

const sendInvitation = async (email, groupName, senderName, groupId, invitedBy) => {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Save invite to DB
    const invite = new Invite({
        email,
        groupId,
        invitedBy,
        token,
        status: 'PENDING',
        expiresAt
    });
    await invite.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const inviteLink = `${frontendUrl}/accept-invite?token=${token}`;

    const mailOptions = {
        from: '"FinPulse Splitter" <no-reply@finpulse.com>',
        to: email,
        subject: `Start splitting expenses in "${groupName}"`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>You've been invited!</h2>
                <p>Hello,</p>
                <p><strong>${senderName}</strong> has invited you to join the group <strong>"${groupName}"</strong> on FinPulse.</p>
                <p>Join to track shared expenses and settle up easily.</p>
                <br/>
                <a href="${inviteLink}" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept Invitation</a>
                <br/><br/>
                <p style="font-size: 12px; color: #666;">If you didn't expect this invite, you can ignore this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, token };
    } catch (error) {
        console.error('Email send failed:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendInvitation };
