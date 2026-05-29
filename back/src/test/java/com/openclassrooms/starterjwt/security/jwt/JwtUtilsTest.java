package com.openclassrooms.starterjwt.security.jwt;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.Date;
import static org.assertj.core.api.Assertions.assertThat;

// Comme jwtSecret et jwtExpirationMs sont injectés par @Value (donc absents hors contexte Spring), on les définit manuellement via ReflectionTestUtils.
class JwtUtilsTest {

    private JwtUtils jwtUtils;
    private final String jwtSecret = "bXlTdXBlclNlY3JldEtleUZvcllvZ2FBcHBUZXN0aW5nUHVycG9zZXNPbmx5MTIzNDU2Nzg5MEFCQ0RFRkdISUpLTE1OT1A=";
    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", jwtSecret);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 86400000);
    }

    private Authentication buildAuthentication() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("test@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .build();
        return new UsernamePasswordAuthenticationToken(userDetails, null);
    }

    // Vérifie que generateJwtToken produit un token non vide à partir d'une authentification valide.
    @Test
    void generateJwtToken_shouldReturnToken() {
        Authentication authentication = buildAuthentication();
        String token = jwtUtils.generateJwtToken(authentication);
        assertThat(token).isNotNull().isNotEmpty();
    }

    // Vérifie que getUserNameFromJwtToken extrait correctement le username contenu dans un token généré.
    @Test
    void getUserNameFromJwtToken_shouldReturnUsername() {
        Authentication authentication = buildAuthentication();
        String token = jwtUtils.generateJwtToken(authentication);
        String username = jwtUtils.getUserNameFromJwtToken(token);
        assertThat(username).isEqualTo("test@test.com");
    }

    // Vérifie que validateJwtToken retourne true pour un token valide.
    @Test
    void validateJwtToken_shouldReturnTrue_whenTokenIsValid() {
        Authentication authentication = buildAuthentication();
        String token = jwtUtils.generateJwtToken(authentication);
        assertThat(jwtUtils.validateJwtToken(token)).isTrue();
    }

    // Vérifie que validateJwtToken retourne false pour un token malformé.
    @Test
    void validateJwtToken_shouldReturnFalse_whenTokenIsMalformed() {
        assertThat(jwtUtils.validateJwtToken("not.a.valid.token")).isFalse();
    }

    // Vérifie que validateJwtToken retourne false pour un token vide.
    @Test
    void validateJwtToken_shouldReturnFalse_whenTokenIsEmpty() {
        assertThat(jwtUtils.validateJwtToken("")).isFalse();
    }

    // Vérifie que validateJwtToken retourne false pour un token expiré.
    @Test
    void validateJwtToken_shouldReturnFalse_whenTokenIsExpired() {
        String expiredToken = Jwts.builder()
                .setSubject("test@test.com")
                .setIssuedAt(new Date(System.currentTimeMillis() - 100000))
                .setExpiration(new Date(System.currentTimeMillis() - 50000))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
        assertThat(jwtUtils.validateJwtToken(expiredToken)).isFalse();
    }

    // Vérifie que validateJwtToken retourne false pour un token signé avec une clé différente (signature invalide).
    @Test
    void validateJwtToken_shouldReturnFalse_whenSignatureIsInvalid() {
        String tokenWithWrongSignature = Jwts.builder()
                .setSubject("test@test.com")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(SignatureAlgorithm.HS512,
                        "ZGlmZmVyZW50U2VjcmV0S2V5Rm9yVGVzdGluZ1RoZVNpZ25hdHVyZVZhbGlkYXRpb25XaXRoNTEyQml0c01pbmltdW1MZW5ndGgxMjM0NTY3OA==")
                .compact();
        assertThat(jwtUtils.validateJwtToken(tokenWithWrongSignature)).isFalse();
    }
}