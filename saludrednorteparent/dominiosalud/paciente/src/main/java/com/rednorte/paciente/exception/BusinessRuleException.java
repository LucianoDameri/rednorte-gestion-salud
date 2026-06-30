package com.rednorte.paciente.exception;

import lombok.Data;
import org.springframework.http.HttpStatus;

/**
 * Excepción personalizada para reglas de negocio del dominio de Salud RedNorte.
 * Permite comunicar errores de negocio con código, estado HTTP y mensaje descriptivo.
 */
@Data
public class BusinessRuleException extends Exception {

    private long id;
    private String code;
    private HttpStatus httpStatus;

    public BusinessRuleException(long id, String code, HttpStatus httpStatus, String message) {
        super(message);
        this.id = id;
        this.code = code;
        this.httpStatus = httpStatus;
    }

    public BusinessRuleException(String code, HttpStatus httpStatus, String message) {
        super(message);
        this.code = code;
        this.httpStatus = httpStatus;
    }

    public BusinessRuleException(HttpStatus httpStatus, String message) {
        super(message);
        this.httpStatus = httpStatus;
    }
}
