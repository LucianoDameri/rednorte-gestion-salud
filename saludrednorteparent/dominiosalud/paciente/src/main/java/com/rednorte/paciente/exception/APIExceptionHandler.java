package com.rednorte.paciente.exception;

import com.rednorte.paciente.common.ExceptionResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Manejador global de excepciones para el microservicio de Pacientes.
 * Captura excepciones y las transforma en respuestas HTTP estructuradas.
 * Implementa el patrón de manejo centralizado de errores.
 */
@RestControllerAdvice
public class APIExceptionHandler {

    /**
     * Captura excepciones genéricas no controladas.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception ex) {
        ExceptionResponse respuesta = new ExceptionResponse(
                "Técnico",
                "Error interno del servidor",
                "5000",
                ex.getMessage(),
                ""
        );
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(respuesta);
    }

    /**
     * Captura excepciones de reglas de negocio lanzadas explícitamente
     * en el controller, retornando el código y estado HTTP correspondiente.
     */
    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<?> handleBusinessRuleException(BusinessRuleException ex) {
        ExceptionResponse respuesta = new ExceptionResponse(
                "Negocio",
                "Error de validación o regla de negocio",
                ex.getCode(),
                ex.getMessage(),
                ""
        );
        return ResponseEntity.status(ex.getHttpStatus()).body(respuesta);
    }
}
