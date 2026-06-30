package com.rednorte.keycloakadapter.controller;

import com.rednorte.keycloakadapter.exception.BussinesRuleException;
import com.rednorte.keycloakadapter.service.JwtService;
import com.rednorte.keycloakadapter.service.KeycloakRestService;
import com.auth0.jwk.Jwk;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import java.security.interfaces.RSAPublicKey;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador principal del adaptador Keycloak para el Servicio Público de Salud RedNorte.
 * Expone endpoints para validar tokens JWT, obtener roles del usuario autenticado,
 * realizar login/logout y refrescar tokens de acceso contra el servidor Keycloak.
 */
@RestController
public class IndexController {

    private final Logger logger = LoggerFactory.getLogger(IndexController.class);

    @Autowired
    private KeycloakRestService restService;

    @Autowired
    private JwtService jwtService;

    /**
     * Valida el token JWT recibido y retorna los roles del usuario autenticado.
     *
     * @param authHeader Cabecera Authorization con el token Bearer
     * @return Mapa de roles del usuario o error 403 si el token es inválido
     * @throws BussinesRuleException si el token es inválido, expirado o no contiene roles
     */
    @GetMapping("/roles")
    public ResponseEntity<?> getRoles(@RequestHeader("Authorization") String authHeader)
            throws BussinesRuleException {
        try {
            DecodedJWT jwt = JWT.decode(authHeader.replace("Bearer", "").trim());

            // Verificar firma del JWT con la clave pública de Keycloak
            Jwk jwk = jwtService.getJwk();
            Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);
            algorithm.verify(jwt);

            // Extraer roles del realm_access
            List<String> roles = ((List<?>) jwt.getClaim("realm_access").asMap().get("roles"))
                    .stream().map(Object::toString).toList();

            // Verificar que el token no haya expirado
            Date expiryDate = jwt.getExpiresAt();
            if (expiryDate.before(new Date())) {
                throw new Exception("El token ha expirado");
            }

            // Retornar mapa de roles
            HashMap<String, Integer> rolesMap = new HashMap<>();
            for (String rol : roles) {
                rolesMap.put(rol, rol.length());
            }
            return ResponseEntity.ok(rolesMap);

        } catch (Exception e) {
            logger.error("Error al validar token JWT: {}", e.getMessage());
            throw new BussinesRuleException("01", e.getMessage(), HttpStatus.FORBIDDEN);
        }
    }

    /**
     * Verifica si el token JWT proporcionado es válido consultando el servidor Keycloak.
     *
     * @param authHeader Cabecera Authorization con el token Bearer
     * @return JSON con is_valid=true, o error 403 si el token es inválido
     * @throws BussinesRuleException si la validación falla
     */
    @GetMapping("/valid")
    public ResponseEntity<?> valid(@RequestHeader("Authorization") String authHeader)
            throws BussinesRuleException {
        try {
            restService.checkValidity(authHeader);
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("is_valid", "true");
            }});
        } catch (Exception e) {
            logger.error("Token inválido, excepción: {}", e.getMessage());
            throw new BussinesRuleException("is_valid", "false", HttpStatus.FORBIDDEN);
        }
    }

    /**
     * Autentica un usuario contra el servidor Keycloak del dominio SaludRedNorte.
     *
     * @param username Nombre de usuario
     * @param password Contraseña del usuario
     * @return Token de acceso JWT emitido por Keycloak
     */
    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(String username, String password) {
        String token = restService.login(username, password);
        return ResponseEntity.ok(token);
    }

    /**
     * Cierra la sesión del usuario invalidando el refresh token en Keycloak.
     *
     * @param refreshToken Token de refresco a invalidar
     * @return JSON con logout=true, o error 403 si el cierre de sesión falla
     * @throws BussinesRuleException si el logout falla en Keycloak
     */
    @PostMapping(value = "/logout", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> logout(
            @RequestParam(value = "refresh_token") String refreshToken)
            throws BussinesRuleException {
        try {
            restService.logout(refreshToken);
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("logout", "true");
            }});
        } catch (Exception e) {
            logger.error("Error al cerrar sesión: {}", e.getMessage());
            throw new BussinesRuleException("logout", "false", HttpStatus.FORBIDDEN);
        }
    }

    /**
     * Refresca el token de acceso usando el refresh token proporcionado.
     *
     * @param refreshToken Token de refresco válido
     * @return Nuevo token de acceso JWT
     * @throws BussinesRuleException si el refresco falla en Keycloak
     */
    @PostMapping(value = "/refresh", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> refresh(
            @RequestParam(value = "refresh_token") String refreshToken)
            throws BussinesRuleException {
        try {
            return ResponseEntity.ok(restService.refresh(refreshToken));
        } catch (Exception e) {
            logger.error("Error al refrescar token: {}", e.getMessage());
            throw new BussinesRuleException("refresh", "false", HttpStatus.FORBIDDEN);
        }
    }
}
