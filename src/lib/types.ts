import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'empleada' | 'clienta';

export interface Usuario {
  id: string; // Corresponds to Firebase Auth UID
  nombre: string;
  email: string;
  rol: UserRole;
}

export interface Cliente {
  id:string;
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
  duracion: number; // en minutos
}

export interface PreciosPorLargo {
  corto: number;
  mediano: number;
  largo: number;
}
export type LargoPelo = keyof PreciosPorLargo;

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio?: number; // Para servicios con precio fijo
  precios?: PreciosPorLargo; // Para servicios con precio variable
  duracion: number; // en minutos
  imagen?: string;
  badge?: string;
  destacado?: boolean;
}
