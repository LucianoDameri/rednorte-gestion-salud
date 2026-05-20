package com.rednorte.especialidad.repository;

import com.rednorte.especialidad.entities.Especialidad;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio JPA para la entidad Especialidad.
 * Provee operaciones CRUD y consultas personalizadas sobre
 * el catálogo de especialidades médicas.
 */
public interface EspecialidadRepository extends JpaRepository<Especialidad, Long> {

    /**
     * Busca una especialidad por su código único.
     *
     * @param codigo Código de la especialidad (ej: "CARD")
     * @return Optional con la especialidad si existe
     */
    Optional<Especialidad> findByCodigo(String codigo);
}
