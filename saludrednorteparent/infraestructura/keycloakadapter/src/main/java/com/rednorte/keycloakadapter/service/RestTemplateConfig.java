package com.rednorte.keycloakadapter.service;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuración del cliente HTTP RestTemplate para el adaptador Keycloak de RedNorte.
 * Provee un bean de RestTemplate reutilizable para todas las comunicaciones
 * con el servidor Keycloak del Servicio Público de Salud RedNorte.
 */
@Configuration
public class RestTemplateConfig {

    /**
     * Crea y registra el bean RestTemplate en el contexto de Spring.
     *
     * @return Instancia de RestTemplate lista para inyección
     */
    @Bean
    public RestTemplate getRestTemplate() {
        return new RestTemplate();
    }
}
