
// Pivot LATAM: email eliminado. Canal de notificaciones = WhatsApp Business API.
// sendEmail es un stub no-op hasta que el flujo WhatsApp esté conectado.
// Ver: src/lib/whatsapp.ts + src/lib/whatsapp-templates.ts

export interface NotificationPayload {
    to: string;
    subject: string;
    type: 'confirmation' | 'welcome' | 'reminder';
    data: Record<string, unknown>;
}

export const notificationService = {
    async sendEmail(_payload: NotificationPayload): Promise<boolean> {
        // No-op: email canal removido. WhatsApp activo cuando WHATSAPP_TOKEN esté en prod.
        return true;
    }
};
