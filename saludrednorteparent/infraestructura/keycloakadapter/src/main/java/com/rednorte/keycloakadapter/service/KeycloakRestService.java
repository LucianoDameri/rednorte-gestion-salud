package com.rednorte.keycloakadapter.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Servicio de comunicación con el servidor Keycloak del Servicio Público de Salud RedNorte.
 * Encapsula todas las operaciones contra la API REST de Keycloak: autenticación,
 * validación de tokens, cierre de sesión y refresco de tokens de acceso.
 * El realm configurado es "SaludRedNorte".
 */
@Service
public class KeycloakRestService {

    @Autowired
    private RestTemplate restTemplate;

    /** URI del endpoint de tokens de Keycloak. */
    @Value("${keycloak.token-uri}")
    private String keycloakTokenUri;

    /** URI del endpoint de información de usuario. */
    @Value("${keycloak.user-info-uri}")
    private String keycloakUserInfo;

    /** URI del endpoint de logout de Keycloak. */
    @Value("${keycloak.logout}")
    private String keycloakLogout;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.authorization-grant-type}")
    private String grantType;

    @Value("${keycloak.authorization-grant-type-refresh}")
    private String grantTypeRefresh;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    @Value("${keycloak.scope}")
    private String scope;

    /**
     * Autentica un usuario contra el realm SaludRedNorte de Keycloak.
     *
     * @param username Nombre de usuario
     * @param password Contraseña del usuario
     * @return Token de acceso JWT como String JSON
     */
    public String login(String username, String password) {
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("username", username);
        map.add("password", password);
        map.add("client_id", clientId);
        map.add("grant_type", grantType);
        map.add("client_secret", clientSecret);
        map.add("scope", scope);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, new HttpHeaders());
        return restTemplate.postForObject(keycloakTokenUri, request, String.class);
    }

    /**
     * Verifica la validez de un token consultando el endpoint de información de usuario.
     *
     * @param token Token Bearer a validar
     * @return Información del usuario si el token es válido
     * @throws Exception si el token es inválido o ha expirado
     */
    public String checkValidity(String token) throws Exception {
        return getUserInfo(token);
    }

    /**
     * Cierra la sesión del usuario invalidando su refresh token en Keycloak.
     *
     * @param refreshToken Token de refresco a invalidar
     * @throws Exception si el logout falla en el servidor Keycloak
     */
    public void logout(String refreshToken) throws Exception {
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", clientId);
        map.add("client_secret", clientSecret);
        map.add("refresh_token", refreshToken);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, (HttpHeaders) null);
        restTemplate.postForObject(keycloakLogout, request, String.class);
    }

    /**
     * Obtiene los roles del usuario a partir de su token de acceso.
     *
     * @param token Token Bearer del usuario autenticado
     * @return Lista de roles asignados al usuario en el realm SaludRedNorte
     * @throws Exception si el token es inválido o no contiene información de roles
     */
    public List<String> getRoles(String token) throws Exception {
        String response = getUserInfo(token);
        Map<?, ?> map = new ObjectMapper().readValue(response, HashMap.class);
        return (List<String>) map.get("roles");
    }

    /**
     * Refresca el token de acceso usando un refresh token válido.
     *
     * @param refreshToken Token de refresco vigente
     * @return Nuevo token de acceso JWT como String JSON
     * @throws Exception si el refresh token es inválido o ha expirado
     */
    public String refresh(String refreshToken) throws Exception {
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", clientId);
        map.add("grant_type", grantTypeRefresh);
        map.add("refresh_token", refreshToken);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, (HttpHeaders) null);
        return restTemplate.postForObject(keycloakTokenUri, request, String.class);
    }

    /**
     * Consulta la información del usuario autenticado en Keycloak.
     *
     * @param token Token Bearer del usuario
     * @return Respuesta JSON con la información del usuario
     */
    private String getUserInfo(String token) {
        MultiValueMap<String, String> headers = new LinkedMultiValueMap<>();
        headers.add("Authorization", token);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(null, headers);
        return restTemplate.postForObject(keycloakUserInfo, request, String.class);
    }
}
