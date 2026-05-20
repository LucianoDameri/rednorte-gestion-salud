// ─── Paciente ──────────────────────────────────────────────────────────────────
export interface Paciente {
  id: number;
  rut: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  // Solo presente en GET /bff/paciente/:id (vista agregada)
  solicitudes?: SolicitudConTurno[];
}

// ─── Solicitud ─────────────────────────────────────────────────────────────────
export interface Solicitud {
  id: number;
  pacienteId: number;
  especialidadId: number;
  tipoAtencion: 'CONSULTA' | 'PROCEDIMIENTO' | 'CIRUGIA' | 'DIAGNOSTICO';
  descripcion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SolicitudConTurno extends Solicitud {
  listaEspera: ListaEspera | null;
}

// ─── Lista de Espera ───────────────────────────────────────────────────────────
export interface ListaEspera {
  id: number;
  solicitudId: number;
  pacienteId: number;
  prioridad: 'URGENTE' | 'ALTA' | 'NORMAL' | 'BAJA';
  estado: 'EN_ESPERA' | 'ASIGNADA' | 'ATENDIDA' | 'CANCELADA';
  numeroTurno?: number;
  fechaEstimada?: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── BFF Health ────────────────────────────────────────────────────────────────
export interface BffHealth {
  service: string;
  status: 'UP' | 'DEGRADED';
  timestamp: string;
  port: number | string;
  downstream: {
    paciente: { name: string; status: 'UP' | 'DOWN' };
    solicitud: { name: string; status: 'UP' | 'DOWN' };
    listaEspera: { name: string; status: 'UP' | 'DOWN' };
  };
}
