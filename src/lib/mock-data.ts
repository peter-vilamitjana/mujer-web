import type { Cliente, Turno, ComentarioInterno } from './types';

export const mockClientes: Cliente[] = [
  { id: '1', nombre: 'Elena', apellido: 'García', telefono: '1122334455', email: 'elena.g@example.com', token: 'elena-token-123' },
  { id: '2', nombre: 'Sofía', apellido: 'Martínez', telefono: '1166778899', email: 'sofia.m@example.com', token: 'sofia-token-456' },
  { id: '3', nombre: 'Valentina', apellido: 'Rodríguez', telefono: '1133445566', email: 'valentina.r@example.com', token: 'valentina-token-789' },
  { id: '4', nombre: 'Camila', apellido: 'Lopez', telefono: '1177889900', email: 'camila.l@example.com', token: 'camila-token-101' },
];

export const mockTurnos: Turno[] = [
  { id: 't1', clienteId: '1', clienteNombre: 'Elena García', fecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), servicio: 'Coloración', tonoColor: '7.3 Rubio Dorado', observaciones: 'Cubrir canas y dar brillo.' },
  { id: 't2', clienteId: '1', clienteNombre: 'Elena García', fecha: '2024-05-15T10:00:00Z', servicio: 'Corte', observaciones: 'Cortar puntas y dar forma.' },
  { id: 't3', clienteId: '2', clienteNombre: 'Sofía Martínez', fecha: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), servicio: 'Peinado para evento', observaciones: 'Peinado recogido para una boda.' },
  { id: 't4', clienteId: '2', clienteNombre: 'Sofía Martínez', fecha: '2024-05-10T14:30:00Z', servicio: 'Balayage', tonoColor: 'Miel y Caramelo', observaciones: 'Aclarar de medios a puntas.' },
  { id: 't5', clienteId: '3', clienteNombre: 'Valentina Rodríguez', fecha: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), servicio: 'Tratamiento de Keratina', observaciones: 'Reducir frizz y alisar.' },
  { id: 't6', clienteId: '4', clienteNombre: 'Camila Lopez', fecha: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), servicio: 'Corte y Nutrición', observaciones: 'Cliente nueva, primera visita.' },
];

export const mockComentarios: ComentarioInterno[] = [
  { id: 'c1', clienteId: '1', empleadaNombre: 'Ana', fecha: '2024-05-15T10:00:00Z', comentario: 'El cuero cabelludo es un poco sensible. Usar productos hipoalergénicos.' },
  { id: 'c2', clienteId: '2', empleadaNombre: 'Laura', fecha: '2024-05-10T14:30:00Z', comentario: 'Le gusta conversar durante el servicio. Muy amable.' },
];
