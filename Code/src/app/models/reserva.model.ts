export interface Reserva {
  id?: number;
  nombre: string;
  descripcion: string;
  telefono: string;
  correo: string;
  pais: string;
  precio?: number | null;
  dia: string;        // formato 'YYYY-MM-DD'
  hora_inicio: string; // formato 'HH:mm:ss'
  hora_final: string;  // formato 'HH:mm:ss'
}
