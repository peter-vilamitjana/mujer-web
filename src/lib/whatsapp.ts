// src/lib/whatsapp.ts
// Skeleton for WhatsApp Business API integration.
// Currently stubs the send — wire up Meta Cloud API or Twilio WABA credentials
// in environment variables when ready.
// Required env vars (future): WHATSAPP_API_URL, WHATSAPP_API_TOKEN, WHATSAPP_FROM_NUMBER

import type { WhatsAppMessage } from './whatsapp-templates';

export async function sendWhatsAppMessage(
    message: WhatsAppMessage
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
    const apiUrl = process.env.WHATSAPP_API_URL;
    const apiToken = process.env.WHATSAPP_API_TOKEN;
    const fromNumber = process.env.WHATSAPP_FROM_NUMBER;

    // If env vars not configured, log and skip — non-blocking (don't fail the
    // booking flow), but callers can tell "skipped" apart from "actually sent".
    if (!apiUrl || !apiToken || !fromNumber) {
        console.warn('[WhatsApp] Env vars not configured — skipping send to', message.to);
        return { success: true, skipped: true };
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
                from: fromNumber,
                to: message.to,
                body: message.body,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('[WhatsApp] API error:', response.status, text);
            return { success: false, error: `API returned ${response.status}` };
        }

        return { success: true };
    } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        console.error('[WhatsApp] Fetch error:', error);
        return { success: false, error };
    }
}
