package com.rednorte.keycloakadapter.exception;

/**
 * Modelo de respuesta estandarizado para errores del adaptador Keycloak de RedNorte.
 * Sigue el estándar RFC 7807 (Problem Details for HTTP APIs) para comunicar
 * errores de autenticación y autorización de forma estructurada.
 */
public class StandarizedApiExceptionResponse {

    private String type = "/errors/autenticacion";
    private String title;
    private String code;
    private String detail;
    private String instance = "/errors/autenticacion/rednorte";

    /**
     * Constructor principal para crear una respuesta de error estructurada.
     *
     * @param title  Título descriptivo del tipo de error
     * @param code   Código interno del error
     * @param detail Descripción detallada del error ocurrido
     */
    public StandarizedApiExceptionResponse(String title, String code, String detail) {
        super();
        this.title = title;
        this.code = code;
        this.detail = detail;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public String getInstance() {
        return instance;
    }

    public void setInstance(String instance) {
        this.instance = instance;
    }
}
