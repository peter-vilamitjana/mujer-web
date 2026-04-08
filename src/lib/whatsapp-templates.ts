// src/lib/whatsapp-templates.ts

export interface WhatsAppMessage {
    to: string;   // phone number in E.164 format e.g. "+5491112345678"
    body: string;
}

interface ConfirmationVars {
    clientName: string;
    salonName: string;
    date: string;      // "viernes 11 de abril"
    time: string;      // "14:30"
    serviceName: string;
    staffName: string;
    clientPhone: string;
}

export interface ReminderVars {
    clientName: string;
    salonName: string;
    date: string;
    time: string;
    serviceName: string;
    staffName: string;
    clientPhone: string;
}

export function buildConfirmationMessage(vars: ConfirmationVars): WhatsAppMessage {
    return {
        to: vars.clientPhone,
        body: `Hola ${vars.clientName} 👋\n\n✅ *Tu turno está confirmado en ${vars.salonName}*\n\n📅 ${vars.date} a las ${vars.time}h\n💇 ${vars.serviceName} con ${vars.staffName}\n\n¡Te esperamos!`,
    };
}

export function buildReminderMessage(vars: ReminderVars): WhatsAppMessage {
    return {
        to: vars.clientPhone,
        body: `Hola ${vars.clientName}! 👋\n\n⏰ *Recordatorio de turno — mañana en ${vars.salonName}*\n\n📅 ${vars.date} a las ${vars.time}h\n💇 ${vars.serviceName} con ${vars.staffName}`,
    };
}
