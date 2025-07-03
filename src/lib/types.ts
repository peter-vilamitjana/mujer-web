export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  token: string;
}

export interface Turno {
  id:string;
  clienteId: string;
  clienteNombre: string;
  fecha: string; // ISO date string
  servicio: string;
  tonoColor?: string;
  observaciones: string;
}

export interface ComentarioInterno {
  id: string;
  clienteId: string;
  empleadaNombre: string;
  fecha: string; // ISO date string
  comentario: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'empleada';
}
