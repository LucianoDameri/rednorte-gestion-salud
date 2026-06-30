package com.rednorte.especialidad;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Aplicación principal del microservicio de Especialidades Médicas.
 * Gestiona el catálogo de especialidades disponibles en la red
 * del Servicio Público de Salud RedNorte.
 */
@SpringBootApplication
public class EspecialidadApplication {

    public static void main(String[] args) {
        SpringApplication.run(EspecialidadApplication.class, args);
    }
}
