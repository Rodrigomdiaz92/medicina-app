

export interface Recordatorio {
  id: string;
  titulo: string;
  descripcion: string;
  fechaProgramada: number;
  notificationId: string | null;
  completado: boolean;
  creadoEn: number;
}
