package com.rednorte.especialidad.controller;

import com.rednorte.especialidad.entities.Especialidad;
import com.rednorte.especialidad.repository.EspecialidadRepository;
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

/**
 * Controlador REST del microservicio de Especialidades Médicas.
 * Gestiona el catálogo de especialidades del Servicio Público de Salud RedNorte.
 *
 * Este microservicio es consumido por el microservicio de Pacientes
 * para obtener el nombre de cada especialidad en las solicitudes de espera.
 */
@RestController
@RequestMapping("/especialidad")
public class EspecialidadRestController {

    @Autowired
    private EspecialidadRepository especialidadRepository;

    /**
     * Lista todas las especialidades médicas disponibles.
     *
     * @return 200 OK con la lista, o 204 No Content si el catálogo está vacío.
     */
    @GetMapping
    public ResponseEntity<List<Especialidad>> listar() {
        List<Especialidad> especialidades = especialidadRepository.findAll();
        if (especialidades.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(especialidades);
    }

    /**
     * Obtiene una especialidad por su ID.
     * Endpoint consumido por el microservicio de Pacientes via WebClient.
     *
     * @param id ID de la especialidad
     * @return 200 OK con la especialidad, o 404 Not Found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable("id") Long id) {
        Optional<Especialidad> optional = especialidadRepository.findById(id);
        if (!optional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(optional.get());
    }

    /**
     * Busca una especialidad por su código único.
     *
     * @param codigo Código de la especialidad (ej: "CARD", "OFTAL")
     * @return 200 OK con la especialidad, o 404 Not Found.
     */
    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<?> obtenerPorCodigo(@PathVariable("codigo") String codigo) {
        Optional<Especialidad> optional = especialidadRepository.findByCodigo(codigo);
        if (!optional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(optional.get());
    }

    /**
     * Registra una nueva especialidad en el catálogo.
     *
     * @param especialidad Datos de la nueva especialidad
     * @return 201 Created con la especialidad registrada.
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Especialidad especialidad) {
        Especialidad guardada = especialidadRepository.save(especialidad);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    /**
     * Actualiza los datos de una especialidad existente.
     *
     * @param id    ID de la especialidad a actualizar
     * @param input Datos actualizados
     * @return 200 OK con la especialidad actualizada, o 404 Not Found.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable("id") Long id,
                                        @RequestBody Especialidad input) {
        Optional<Especialidad> optional = especialidadRepository.findById(id);
        if (!optional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Especialidad especialidad = optional.get();
        especialidad.setCodigo(input.getCodigo());
        especialidad.setNombre(input.getNombre());
        especialidad.setDescripcion(input.getDescripcion());

        return ResponseEntity.ok(especialidadRepository.save(especialidad));
    }

    /**
     * Elimina una especialidad del catálogo.
     *
     * @param id ID de la especialidad a eliminar
     * @return 200 OK si se eliminó, o 404 Not Found.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable("id") Long id) {
        if (!especialidadRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        especialidadRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
