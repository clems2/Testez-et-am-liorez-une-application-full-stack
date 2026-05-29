package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import com.openclassrooms.starterjwt.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


@ExtendWith(MockitoExtension.class)
class AuthTokenFilterTest {

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private AuthTokenFilter authTokenFilter;

    // Nettoie le SecurityContext après chaque test pour éviter les fuites d'authentification entre tests.
    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // Vérifie que, avec un token valide, l'authentification est placée dans le SecurityContext et que la chaîne de filtres continue.
    @Test
    void doFilterInternal_shouldSetAuthentication_whenTokenIsValid() throws Exception {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("test@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .build();

        when(request.getHeader("Authorization")).thenReturn("Bearer valid.jwt.token");
        when(jwtUtils.validateJwtToken("valid.jwt.token")).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken("valid.jwt.token")).thenReturn("test@test.com");
        when(userDetailsService.loadUserByUsername("test@test.com")).thenReturn(userDetails);
        authTokenFilter.doFilterInternal(request, response, filterChain);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .isEqualTo(userDetails);
        verify(filterChain).doFilter(request, response);
    }

    // Vérifie que, sans header Authorization, aucune authentification n'est posée mais la chaîne de filtres continue.
    @Test
    void doFilterInternal_shouldNotSetAuthentication_whenNoToken() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);
        authTokenFilter.doFilterInternal(request, response, filterChain);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    // Vérifie que, avec un token invalide, aucune authentification n'est posée mais la chaîne de filtres continue.
    @Test
    void doFilterInternal_shouldNotSetAuthentication_whenTokenIsInvalid() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer invalid.token");
        when(jwtUtils.validateJwtToken("invalid.token")).thenReturn(false);
        authTokenFilter.doFilterInternal(request, response, filterChain);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    // Vérifie que, si une exception survient pendant le traitement, elle est capturée et la chaîne de filtres continue malgré tout.
    @Test
    void doFilterInternal_shouldContinueChain_whenExceptionThrown() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer some.token");
        when(jwtUtils.validateJwtToken("some.token"))
                .thenThrow(new RuntimeException("Unexpected error"));
        authTokenFilter.doFilterInternal(request, response, filterChain);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }
}