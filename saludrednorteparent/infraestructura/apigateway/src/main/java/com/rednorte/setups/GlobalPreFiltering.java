package com.rednorte.setups;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Filtro global de pre-procesamiento del API Gateway.
 * Se ejecuta antes de enrutar cada petición hacia los microservicios.
 * Útil para logging, trazabilidad y validaciones previas al enrutamiento.
 */
public class GlobalPreFiltering implements GlobalFilter {

    private static final Logger log = LoggerFactory.getLogger(GlobalPreFiltering.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("[RedNorte Gateway] Pre-filtro ejecutado para: {}",
                exchange.getRequest().getPath());
        return chain.filter(exchange);
    }
}
