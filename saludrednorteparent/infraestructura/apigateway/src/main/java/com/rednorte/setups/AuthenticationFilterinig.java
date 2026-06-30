package com.rednorte.setups;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.net.HttpHeaders;
import io.micrometer.common.util.StringUtils;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.OrderedGatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

/**
 * Filtro de autenticación del API Gateway para el Servicio Público de Salud RedNorte.
 * Valida el token Bearer de cada petición consultando el servicio de autenticación
 * (Keycloak Adapter) y verificando que el usuario tenga el rol requerido.
 *
 * Implementa el patrón Factory Method heredando de AbstractGatewayFilterFactory.
 */
@Slf4j
@Component
public class AuthenticationFilterinig extends AbstractGatewayFilterFactory<AuthenticationFilterinig.Config> {

    private final WebClient.Builder webclientBuilder;
    private static final Logger log = LoggerFactory.getLogger(AuthenticationFilterinig.class);

    public AuthenticationFilterinig(WebClient.Builder webClientBuilder) {
        super(AuthenticationFilterinig.Config.class);
        this.webclientBuilder = webClientBuilder;
    }

    @Override
    public GatewayFilter apply(Config config) {
        log.info("[RedNorte Gateway] Filtro de autenticación activado");
        return new OrderedGatewayFilter((exchange, chain) -> {

            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                log.warn("[RedNorte Gateway] Petición sin header Authorization");
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Header Authorization requerido");
            }

            String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
            String[] parts = authHeader.split(" ");

            if (parts.length != 2 || !"Bearer".equals(parts[0])) {
                log.warn("[RedNorte Gateway] Formato de token inválido");
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Formato de token inválido");
            }

            return webclientBuilder.build()
                    .get()
                    .uri("http://KEYCLOAKADAPTER/roles")
                    .header(HttpHeaders.AUTHORIZATION, parts[1])
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .map(response -> {
                        if (response != null) {
                            log.info("[RedNorte Gateway] Roles recibidos: {}", response);
                            if (response.get("Partners") == null
                                    || StringUtils.isEmpty(response.get("Partners").asText())) {
                                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Rol Partners requerido");
                            }
                        } else {
                            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sin roles asignados");
                        }
                        return exchange;
                    })
                    .onErrorMap(error -> new ResponseStatusException(
                            HttpStatus.SERVICE_UNAVAILABLE, "Error de comunicación con autenticación", error.getCause()))
                    .flatMap(chain::filter);

        }, 1);
    }

    public static class Config {}
}
