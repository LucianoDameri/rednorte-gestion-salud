package com.rednorte.paciente.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.util.List;
import lombok.Data;

/**
 * Entidad que representa un Paciente del Servicio Público de Salud RedNorte.
 * Un paciente puede tener múltiples solicitudes en lista de espera
 * para distintas especialidades médicas.
 */
@Data
@Entity
@Table(name = "paciente")
public class Paciente {

    @GeneratedValue(strategy = GenerationType.AUTO)
    @Id
    private long id;

    private String nombre;
    private String apellido;

    /** RUT del paciente, identificador único en Chile (ej: 12345678-9) */
    private String rut;

    private String telefono;
    private String email;

    /** Solicitudes de lista de espera asociadas al paciente */
    @OneToMany(
        fetch = FetchType.LAZY,
        mappedBy = "paciente",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<SolicitudEspera> solicitudes;

    /**
     * Campo transient para futuras integraciones con el historial
     * de atenciones del paciente (no persiste en base de datos).
     */
    @Transient
    private List<?> atenciones;
}
