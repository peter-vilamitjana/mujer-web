/**
 * Universo fijo de horarios que ofrece el wizard de reserva. Sin
 * dependencias de servidor (firebase-admin) para poder importarse tanto
 * desde componentes cliente (BookingFlow) como desde código server
 * (booking-utils.ts) sin arrastrar Node builtins al bundle del browser.
 */
export const ALL_TIME_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];
