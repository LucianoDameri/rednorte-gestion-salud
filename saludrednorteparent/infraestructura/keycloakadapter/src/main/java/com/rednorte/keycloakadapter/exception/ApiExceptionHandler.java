package com.rednorte.keycloakadapter.exception;

import java.net.UnknownHostException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Manejador global de excepciones del adaptador Keycloak para el Servicio Público de Salud RedNorte.
 * Intercepta excepciones lanzadas por los controladores y las convierte en respuestas HTTP
 * estructuradas con el modelo estándar de error de la plataforma.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    /**
     * Maneja errores de conexión con el servidor Keycloak u otros hosts externos.
     *
     * @param ex Excepción de host desconocido
     * @return Respuesta 206 con detalle del error de conexión
     */
    @ExceptionHandler(UnknownHostException.class)
    public ResponseEntity<StandarizedApiExceptionResponse> handleUnknownHostException(
            UnknownHostException ex) {
        StandarizedApiExceptionResponse response = new StandarizedApiExceptionResponse(
                "Error de conexión",
                "error-1024",
                ex.getMessage()
        );
        return new ResponseEntity<>(response, HttpStatus.PARTIAL_CONTENT);
    }

    /**
     * Maneja excepciones de reglas de negocio como tokens inválidos o sesiones expiradas.
     *
     * @param ex Excepción de regla de negocio con código y estado HTTP
     * @return Respuesta con el estado HTTP definido en la excepción
     */
    @ExceptionHandler(BussinesRuleException.class)
    public ResponseEntity<StandarizedApiExceptionResponse> handleBussinesRuleException(
            BussinesRuleException ex) {
        StandarizedApiExceptionResponse response = new StandarizedApiExceptionResponse(
                "Error de validación",
                ex.getCode(),
                ex.getMessage()
        );
        return new ResponseEntity<>(response, ex.getHttpStatus());
    }
}
