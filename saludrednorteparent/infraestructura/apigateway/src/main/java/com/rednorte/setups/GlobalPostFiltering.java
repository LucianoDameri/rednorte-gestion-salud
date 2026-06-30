package com.rednorte.setups;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

/**
 * Filtro global de post-procesamiento del API Gateway.
 * Se ejecuta después de que los microservicios responden.
 * Útil para logging de respuestas, métricas y auditoría.
 */
@Configuration
public class GlobalPostFiltering {

    private static final Logger log = LoggerFactory.getLogger(GlobalPostFiltering.class);

    @Bean
    public GlobalFilter postGlobalFilter() {
        return (exchange, chain) -> chain.filter(exchange)
                .then(Mono.fromRunnable(() ->
                        log.info("[RedNorte Gateway] Post-filtro ejecutado. Estado: {}",
                                exchange.getResponse().getStatusCode())
                ));
    }
}
