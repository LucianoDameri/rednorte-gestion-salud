package com.rednorte.keycloakadapter.exception;

import org.springframework.http.HttpStatus;

/**
 * Excepción de negocio para el adaptador Keycloak del Servicio Público de Salud RedNorte.
 * Se lanza cuando una regla de negocio es violada, como un token inválido,
 * sesión expirada o credenciales incorrectas.
 */
public class BussinesRuleException extends Exception {

    private long id;
    private String code;
    private HttpStatus httpStatus;

    /**
     * Constructor completo con id, código, mensaje y estado HTTP.
     *
     * @param id         Identificador numérico del error
     * @param code       Código de error legible
     * @param message    Descripción del error
     * @param httpStatus Estado HTTP asociado
     */
    public BussinesRuleException(long id, String code, String message, HttpStatus httpStatus) {
        super(message);
        this.id = id;
        this.code = code;
        this.httpStatus = httpStatus;
    }

    /**
     * Constructor con código, mensaje y estado HTTP.
     *
     * @param code       Código de error legible
     * @param message    Descripción del error
     * @param httpStatus Estado HTTP asociado
     */
    public BussinesRuleException(String code, String message, HttpStatus httpStatus) {
        super(message);
        this.code = code;
        this.httpStatus = httpStatus;
    }

    /**
     * Constructor con mensaje y causa original.
     *
     * @param message Descripción del error
     * @param cause   Excepción original que causó este error
     */
    public BussinesRuleException(String message, Throwable cause) {
        super(message, cause);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public void setHttpStatus(HttpStatus httpStatus) {
        this.httpStatus = httpStatus;
    }
}
