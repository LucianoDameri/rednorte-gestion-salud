package com.rednorte.paciente.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;

/**
 * Entidad que representa una Solicitud en Lista de Espera.
 * Vincula a un Paciente con una Especialidad médica solicitada,
 * incluyendo información de prioridad, tipo de atención y estado.
 */
@Data
@Entity
@Table(name = "solicitud_espera")
public class SolicitudEspera {

    @GeneratedValue(strategy = GenerationType.AUTO)
    @Id
    private long id;

    /** ID de la especialidad médica (referencia al microservicio de Especialidades) */
    private long especialidadId;

    /**
     * Nombre de la especialidad obtenido dinámicamente desde
     * el microservicio de Especialidades. No persiste en BD.
     */
    @Transient
    private String especialidadNombre;

    /**
     * Tipo de atención requerida.
     * Valores: CONSULTA, PROCEDIMIENTO, CIRUGIA, DIAGNOSTICO
     */
    private String tipoAtencion;

    /**
     * Nivel de prioridad de la solicitud.
     * Valores: URGENTE, ALTA, NORMAL, BAJA
     */
    private String prioridad;

    /**
     * Estado actual de la solicitud en lista de espera.
     * Valores: EN_ESPERA, ASIGNADA, CANCELADA, ATENDIDA
     */
    private String estado;

    /** Paciente al que pertenece esta solicitud */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, targetEntity = Paciente.class)
    @JoinColumn(name = "pacienteId", nullable = true)
    private Paciente paciente;
}
