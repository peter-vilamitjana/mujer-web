
export interface NotificationPayload {
    to: string;
    subject: string;
    type: 'confirmation' | 'welcome' | 'reminder';
    data: any; // Dynamic data for templates (e.g., clientName, date, serviceName)
}

export const notificationService = {
    async sendEmail(payload: NotificationPayload): Promise<boolean> {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Error sending notification:", error);
                return false;
            }

            return true;
        } catch (error) {
            console.error("Error sending notification:", error);
            return false;
        }
    }
};
