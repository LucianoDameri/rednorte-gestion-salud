package com.rednorte.springBootAdmin;

import de.codecentric.boot.admin.server.config.EnableAdminServer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Servidor de administración y monitoreo del Servicio Público de Salud RedNorte.
 * Permite visualizar el estado de todos los microservicios registrados en Eureka,
 * métricas, logs y detalles de salud en tiempo real.
 */
@Configuration
@EnableAutoConfiguration
@EnableDiscoveryClient
@EnableScheduling
@EnableAdminServer
@SpringBootApplication
public class SpringBootAdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootAdminApplication.class, args);
    }
}
