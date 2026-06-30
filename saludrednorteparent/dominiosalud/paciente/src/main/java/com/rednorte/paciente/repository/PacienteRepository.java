package com.rednorte.paciente.repository;

import com.rednorte.paciente.entities.Paciente;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio JPA para la entidad Paciente.
 * Implementa el patrón Repository para separar la lógica de acceso
 * a datos del resto de la aplicación.
 */
public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    /**
     * Busca un paciente por su RUT.
     * Spring Data JPA genera la query automáticamente desde el nombre del método.
     *
     * @param rut RUT del paciente (ej: "12345678-9")
     * @return Optional con el paciente si existe, vacío si no
     */
    Optional<Paciente> findByRut(String rut);
}
