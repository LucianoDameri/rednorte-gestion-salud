package com.rednorte.paciente;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Aplicación principal del microservicio de Pacientes.
 * Gestiona el registro de pacientes y sus solicitudes de lista de espera
 * para el Servicio Público de Salud RedNorte.
 */
@SpringBootApplication
public class PacienteApplication {

    public static void main(String[] args) {
        SpringApplication.run(PacienteApplication.class, args);
    }

    /**
     * Bean de WebClient con balanceo de carga para comunicación
     * con el microservicio de Especialidades vía Eureka.
     */
    @Bean
    @LoadBalanced
    public WebClient.Builder loadBalancedWebClientBuilder() {
        return WebClient.builder();
    }
}
