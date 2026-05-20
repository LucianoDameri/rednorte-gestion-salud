package com.rednorte.paciente.common;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Modelo estándar de respuesta para errores de la API.
 * Sigue la especificación RFC 7807 (Problem Details for HTTP APIs).
 */
@Schema(description = "Modelo estándar de respuesta para errores de la API [RFC7807]")
@NoArgsConstructor
@Data
public class ExceptionResponse {

    @Schema(description = "Tipo de error", example = "Negocio")
    private String type;

    @Schema(description = "Título descriptivo del error", example = "Error de validación")
    private String title;

    @Schema(description = "Código interno del error", example = "5020")
    private String code;

    @Schema(description = "Detalle del error", example = "El RUT ingresado ya existe")
    private String detail;

    @Schema(description = "Instancia o ruta donde ocurrió el error", example = "/paciente/crear")
    private String instance;

    public ExceptionResponse(String type, String title, String code, String detail, String instance) {
        this.type = type;
        this.title = title;
        this.code = code;
        this.detail = detail;
        this.instance = instance;
    }
}
