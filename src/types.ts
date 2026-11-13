

export interface Recordatorio {
  id: string;
  titulo: string;
  descripcion: string;
  fechaProgramada: number;
  notificationId: string | null;
  completado: boolean;
  creadoEn: number;
}

export interface UbicacionFarmacia {
  latitude: number;
  longitude: number;
  direccion?: string;
}

export interface ContactoVinculado {
  id: string;
  nombre: string;
  telefono?: string;
}

export interface Recordatorio {
  id: string;
  titulo: string;
  descripcion: string;
  fechaProgramada: number;
  notificationId: string | null;
  completado: boolean;
  creadoEn: number;
  imagenUri?: string | null;
  ubicacion?: UbicacionFarmacia | null;
  contacto?: ContactoVinculado | null;
  calendarEventId?: string | null;
}