package com.openclassrooms.starterjwt.services;
import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;
    private User adminUser;
    private User regularUser;
    private UserDetailsImpl userDetails;
    private LoginRequest loginRequest;
    private SignupRequest signUpRequest;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(1L)
                .email("admin@test.com")
                .firstName("Admin")
                .lastName("User")
                .password("encoded_password")
                .admin(true)
                .build();

        regularUser = User.builder()
                .id(2L)
                .email("user@test.com")
                .firstName("Regular")
                .lastName("User")
                .password("encoded_password")
                .admin(false)
                .build();

        userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("admin@test.com")
                .firstName("Admin")
                .lastName("User")
                .password("encoded_password")
                .build();

        loginRequest = new LoginRequest();
        loginRequest.setEmail("admin@test.com");
        loginRequest.setPassword("password");

        signUpRequest = new SignupRequest();
        signUpRequest.setEmail("new@test.com");
        signUpRequest.setFirstName("New");
        signUpRequest.setLastName("User");
        signUpRequest.setPassword("password123");
    }

    // Vérifie que login() retourne un JwtResponse correctement rempli pour un utilisateur admin.
    @Test
    void login_shouldReturnJwtResponse_withAdminFlag_whenUserIsAdmin() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("fake-jwt-token");
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
        JwtResponse result = authService.login(loginRequest);
        assertThat(result).isNotNull();
        assertThat(result.getToken()).isEqualTo("fake-jwt-token");
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getUsername()).isEqualTo("admin@test.com");
        assertThat(result.getFirstName()).isEqualTo("Admin");
        assertThat(result.getLastName()).isEqualTo("User");
        assertThat(result.getAdmin()).isTrue();
    }

    // Vérifie que login() retourne isAdmin=false pour un utilisateur non-admin.
    @Test
    void login_shouldReturnJwtResponse_withAdminFalse_whenUserIsNotAdmin() {
        UserDetailsImpl regularUserDetails = UserDetailsImpl.builder()
                .id(2L)
                .username("user@test.com")
                .firstName("Regular")
                .lastName("User")
                .password("encoded_password")
                .build();
        LoginRequest regularLoginRequest = new LoginRequest();
        regularLoginRequest.setEmail("user@test.com");
        regularLoginRequest.setPassword("password");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("fake-jwt-token");
        when(authentication.getPrincipal()).thenReturn(regularUserDetails);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(regularUser));
        JwtResponse result = authService.login(regularLoginRequest);
        assertThat(result.getAdmin()).isFalse();
    }

    // Vérifie que login() retourne isAdmin=false quand le user n'est pas trouvé en base (cas défensif avec orElse(false)).
    @Test
    void login_shouldReturnAdminFalse_whenUserNotFoundInRepository() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("fake-jwt-token");
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.empty());
        JwtResponse result = authService.login(loginRequest);
        assertThat(result.getAdmin()).isFalse();
    }

    // Vérifie que register() crée et sauvegarde un nouveau user quand l'email n'est pas déjà pris.
    @Test
    void register_shouldSaveUser_whenEmailNotTaken() {
        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password123");
        authService.register(signUpRequest);
        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode("password123");
    }

    // Vérifie que register() lance une BadRequestException quand l'email est déjà utilisé.
    @Test
    void register_shouldThrowBadRequestException_whenEmailAlreadyTaken() {
        when(userRepository.existsByEmail("new@test.com")).thenReturn(true);
        assertThatThrownBy(() -> authService.register(signUpRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Email is already taken");
        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(anyString());
    }
}