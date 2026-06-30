package com.rednorte.eurekaServer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Servidor de descubrimiento de servicios (Eureka Server) del
 * Servicio Público de Salud RedNorte.
 * Todos los microservicios se registran aquí al iniciar,
 * permitiendo la comunicación entre ellos sin usar IPs fijas.
 */
@EnableEurekaServer
@SpringBootApplication
public class EurekaServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
