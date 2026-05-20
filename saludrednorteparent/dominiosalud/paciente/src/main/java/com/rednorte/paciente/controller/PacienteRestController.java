package com.rednorte.paciente.controller;

import com.rednorte.paciente.entities.EspecialidadResponse;
import com.rednorte.paciente.entities.Paciente;
import com.rednorte.paciente.entities.SolicitudEspera;
import com.rednorte.paciente.exception.BusinessRuleException;
import com.rednorte.paciente.repository.PacienteRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Controlador REST del microservicio de Pacientes.
 * Expone endpoints para gestionar pacientes y sus solicitudes de
 * lista de espera en el Servicio Público de Salud RedNorte.
 *
 * Patrones aplicados:
 * - Repository Pattern: acceso a datos via PacienteRepository
 * - Circuit Breaker: manejo de fallos al llamar al microservicio de Especialidades
 */
@RestController
@RequestMapping("/paciente")
public class PacienteRestController {

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private WebClient.Builder webClientBuilder;

    /**
     * Lista todos los pacientes registrados.
     *
     * @return 200 OK con lista de pacientes, o 204 No Content si está vacío.
     */
    @GetMapping
    public ResponseEntity<List<Paciente>> listar() {
        List<Paciente> pacientes = pacienteRepository.findAll();
        if (pacientes.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(pacientes);
    }

    /**
     * Obtiene un paciente por ID, enriqueciendo sus solicitudes con
     * el nombre de la especialidad consultado al microservicio de Especialidades.
     *
     * @param id ID del paciente
     * @return 200 OK con paciente enriquecido, o 404 Not Found.
     * @throws BusinessRuleException si el microservicio de Especialidades no responde
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable("id") Long id) throws BusinessRuleException {
        Optional<Paciente> optional = pacienteRepository.findById(id);

        if (!optional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Paciente paciente = optional.get();
        List<SolicitudEspera> solicitudesEnriquecidas = new ArrayList<>();

        try {
            for (SolicitudEspera solicitud : paciente.getSolicitudes()) {
                EspecialidadResponse especialidad = webClientBuilder.build()
                        .get()
                        .uri("http://BUSINESSDOMAIN-ESPECIALIDAD/especialidad/{id}",
                                solicitud.getEspecialidadId())
                        .retrieve()
                        .bodyToMono(EspecialidadResponse.class)
                        .block();

                if (especialidad != null) {
                    solicitud.setEspecialidadNombre(especialidad.getNombre());
                }
                solicitudesEnriquecidas.add(solicitud);
            }
        } catch (Exception ex) {
            throw new BusinessRuleException("5020", HttpStatus.SERVICE_UNAVAILABLE,
                    "El microservicio de Especialidades no está disponible. Contacte al administrador.");
        }

        paciente.setSolicitudes(solicitudesEnriquecidas);
        return ResponseEntity.ok(paciente);
    }

    /**
     * Busca un paciente por su RUT.
     *
     * @param rut RUT del paciente (ej: "12345678-9")
     * @return 200 OK con el paciente, o 404 Not Found.
     */
    @GetMapping("/rut/{rut}")
    public ResponseEntity<?> obtenerPorRut(@PathVariable("rut") String rut) {
        Optional<Paciente> optional = pacienteRepository.findByRut(rut);
        if (!optional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(optional.get());
    }

    /**
     * Registra un nuevo paciente con sus solicitudes de lista de espera.
     * Establece la relación bidireccional y asigna valores por defecto
     * a estado (EN_ESPERA) y prioridad (NORMAL) si no se especifican.
     *
     * @param paciente Datos del nuevo paciente
     * @return 201 Created con el paciente registrado.
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Paciente paciente) {
        if (paciente.getSolicitudes() != null) {
            paciente.getSolicitudes().forEach(solicitud -> {
                solicitud.setPaciente(paciente);
                if (solicitud.getEstado() == null || solicitud.getEstado().isBlank()) {
                    solicitud.setEstado("EN_ESPERA");
                }
                if (solicitud.getPrioridad() == null || solicitud.getPrioridad().isBlank()) {
                    solicitud.setPrioridad("NORMAL");
                }
            });
        }
        Paciente guardado = pacienteRepository.save(paciente);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    /**
     * Actualiza los datos personales de un paciente existente.
     *
     * @param id    ID del paciente a actualizar
     * @param input Nuevos datos del paciente
     * @return 200 OK con paciente actualizado, o 404 Not Found.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable("id") Long id,
                                        @RequestBody Paciente input) {
        Optional<Paciente> optional = pacienteRepository.findById(id);
        if (!optional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Paciente paciente = optional.get();
        paciente.setNombre(input.getNombre());
        paciente.setApellido(input.getApellido());
        paciente.setTelefono(input.getTelefono());
        paciente.setEmail(input.getEmail());

        return ResponseEntity.ok(pacienteRepository.save(paciente));
    }

    /**
     * Elimina un paciente y todas sus solicitudes asociadas
     * (gracias a CascadeType.ALL y orphanRemoval en la entidad).
     *
     * @param id ID del paciente a eliminar
     * @return 200 OK si se eliminó, o 404 Not Found si no existe.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable("id") Long id) {
        if (!pacienteRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        pacienteRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
