export async function sendWhatsApp(to: string, templateName: string, languageCode: string = 'en_US') {
    const token = process.env.META_WHATSAPP_TOKEN;
    const phoneId = process.env.META_PHONE_NUMBER_ID;

    if (!token || !phoneId) {
        console.error('WhatsApp Error: Missing credentials');
        return { success: false, error: 'Missing credentials' };
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: to,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: languageCode,
                    },
                },
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(JSON.stringify(data));
        }
        return { success: true, data };
    } catch (error) {
        console.error('WhatsApp Error:', error);
        return { success: false, error };
    }
}
