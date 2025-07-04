import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'empleada' | 'clienta';

export interface Usuario {
  id: string; // Corresponds to Firebase Auth UID
  nombre: string;
  email: string;
  rol: UserRole;
}

export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ultimaVisita?: Timestamp;
  observaciones?: string; // Solo visible para admin
  fechaRegistro: Timestamp;
  token?: string; // Para acceso de clienta sin login
}

export interface FichaTecnica {
  id: string;
  clienteId: string;
  empleadaNombre: string;
  fecha: string; // ISO date string
  servicioRealizado: string;
  tono: string;
  observaciones: string;
}

export interface Turno {
  id: string;
  clienteId: string;
  clienteNombre: string;
  servicio: string;
  servicioId: string;
  fecha: string; // ISO date string, for easier client-side manipulation
  empleadaAsignadaId: string;
  empleadaNombre: string;
  estado: 'pendiente' | 'realizado' | 'cancelado' | 'pendiente_pago';
  observaciones?: string; // Observaciones del turno específico
  precio?: number; // Precio del servicio al momento de agendar
  montoSeña?: number;
  señaPagada?: boolean;
}

export interface Servicio {
  id: string;
  nombre: string;
  precio: number;
  duracion: number; // en minutos
}
