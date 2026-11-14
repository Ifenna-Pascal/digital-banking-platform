// Sends transactional email through Brevo's HTTP API when SIB_API_KEY is set.
// Without a key (local dev, tests) it logs instead, so nothing ever blocks on email.
const send_mail = async ({ to, subject, text }) => {
    const key = process.env.SIB_API_KEY;
    if (!key) {
        if (process.env.NODE_ENV !== 'test') console.log(`[mail:disabled] to=${to} subject="${subject}"\n${text}`);
        return { sent: false };
    }
    try {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
            body: JSON.stringify({
                sender: {
                    email: process.env.MAIL_FROM_EMAIL || 'no-reply@example.com',
                    name: process.env.MAIL_FROM_NAME || 'Online Banking',
                },
                to: [{ email: to }],
                subject,
                textContent: text,
            }),
        });
        if (!res.ok) console.error('mail send failed', res.status, await res.text());
        return { sent: res.ok };
    } catch (error) {
        // email is best-effort: a mail outage must not fail a banking operation
        console.error('mail send failed', error.message);
        return { sent: false };
    }
};

module.exports = { send_mail };
