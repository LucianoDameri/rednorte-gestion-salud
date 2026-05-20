package com.rednorte.paciente.repository;

import com.rednorte.paciente.entities.SolicitudEspera;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio JPA para la entidad SolicitudEspera.
 * Provee acceso a datos para las solicitudes en lista de espera.
 */
public interface SolicitudEsperaRepository extends JpaRepository<SolicitudEspera, Long> {

    /**
     * Obtiene solicitudes por estado. Útil para el módulo de
     * reasignación automática (ej: buscar todas EN_ESPERA).
     *
     * @param estado EN_ESPERA, ASIGNADA, CANCELADA o ATENDIDA
     * @return Lista de solicitudes con ese estado
     */
    List<SolicitudEspera> findByEstado(String estado);

    /**
     * Obtiene todas las solicitudes de un paciente específico.
     *
     * @param pacienteId ID del paciente
     * @return Lista de solicitudes del paciente
     */
    List<SolicitudEspera> findByPacienteId(long pacienteId);
}
