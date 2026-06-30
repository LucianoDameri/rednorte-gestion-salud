package com.rednorte.keycloakadapter.service;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.UrlJwkProvider;
import java.net.URL;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * Servicio de validación JWT para el adaptador Keycloak del Servicio Público de Salud RedNorte.
 * Obtiene y almacena en caché la clave pública JWK del servidor Keycloak para
 * verificar la firma de los tokens JWT presentados por los usuarios.
 */
@Service
public class JwtService {

    /** URL del endpoint JWKS de Keycloak (JSON Web Key Set). */
    @Value("${keycloak.jwk-set-uri}")
    private String jwksUrl;

    /** Identificador del certificado de clave pública en el JWKS. */
    @Value("${keycloak.certs-id}")
    private String certsId;

    /**
     * Obtiene la clave JWK pública de Keycloak para verificar tokens JWT.
     * El resultado se almacena en caché para evitar consultas repetidas al servidor.
     *
     * @return Clave JWK pública del servidor Keycloak
     * @throws Exception si no se puede obtener la clave del servidor JWKS
     */
    @Cacheable(value = "jwkCache")
    public Jwk getJwk() throws Exception {
        URL url = new URL(jwksUrl);
        UrlJwkProvider urlJwkProvider = new UrlJwkProvider(url);
        return urlJwkProvider.get(certsId.trim());
    }
}
