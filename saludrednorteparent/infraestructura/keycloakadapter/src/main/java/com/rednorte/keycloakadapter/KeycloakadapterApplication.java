package com.rednorte.keycloakadapter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Adaptador de autenticación Keycloak para el Servicio Público de Salud RedNorte.
 * Actúa como intermediario entre el API Gateway y el servidor Keycloak,
 * validando tokens JWT y exponiendo los roles del usuario autenticado.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class KeycloakadapterApplication {

    public static void main(String[] args) {
        SpringApplication.run(KeycloakadapterApplication.class, args);
    }
}
