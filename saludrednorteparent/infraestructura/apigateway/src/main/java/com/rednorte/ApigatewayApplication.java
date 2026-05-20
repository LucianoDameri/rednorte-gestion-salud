package com.rednorte;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Aplicación principal del API Gateway del Servicio Público de Salud RedNorte.
 * Actúa como punto de entrada único para todas las peticiones al sistema,
 * enrutando el tráfico hacia los microservicios correspondientes
 * y aplicando filtros de autenticación y logging.
 */
@SpringBootApplication
public class ApigatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApigatewayApplication.class, args);
    }
}
