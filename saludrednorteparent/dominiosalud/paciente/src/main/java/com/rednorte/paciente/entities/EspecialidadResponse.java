package com.rednorte.paciente.entities;

import lombok.Data;

/**
 * DTO que representa la respuesta del microservicio de Especialidades
 * al ser consultado via WebClient. Contiene la información básica
 * de una especialidad médica.
 */
@Data
public class EspecialidadResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
}
