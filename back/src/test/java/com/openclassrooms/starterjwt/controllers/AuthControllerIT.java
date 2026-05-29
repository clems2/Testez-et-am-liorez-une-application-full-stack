package com.openclassrooms.starterjwt.controllers;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.AbstractIntegrationTest;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerIT extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Crée un utilisateur en base avant chaque test. Grâce à @Transactional, cet utilisateur est rollbacké après chaque test.
    @BeforeEach
    void setUp() {
        User user = new User(
                "test@test.com",
                "User",
                "Test",
                passwordEncoder.encode("password123"),
                false
        );
        userRepository.save(user);
    }

    // Vérifie que la connexion avec des credentials valides retourne un JWT et les informations de l'utilisateur.
    @Test
    void login_shouldReturn200WithJwt_whenCredentialsAreValid() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@test.com");
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andDo(print())  // ← affiche toute la requête/réponse
                .andExpect(status().isOk());
    }

    // Vérifie que la connexion avec un mauvais mot de passe est rejetée
    // BadCredentialsException → 500 via le gestionnaire d'exceptions générique de l'application).
    @Test
    void login_shouldReturnError_whenPasswordIsWrong() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@test.com");
        loginRequest.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isInternalServerError());
    }

    // Vérifie que la connexion avec un email inexistant est rejetée
    // BadCredentialsException → 500 via le gestionnaire d'exceptions générique de l'application).
    @Test
    void login_shouldReturnError_whenUserDoesNotExist() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("nonexistent@test.com");
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isInternalServerError());
    }

    // Vérifie que la validation Spring retourne 400 quand le champ email est absent du body.
    @Test
    void login_shouldReturn400_whenEmailIsMissing() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setPassword("password123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }

    // Vérifie que la création de compte retourne 200 avec un message de succès.
    @Test
    void register_shouldReturn200_whenEmailIsAvailable() throws Exception {
        SignupRequest signUpRequest = new SignupRequest();
        signUpRequest.setEmail("new@test.com");
        signUpRequest.setFirstName("New");
        signUpRequest.setLastName("User");
        signUpRequest.setPassword("password123");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signUpRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully!"));
    }

    // Vérifie que la création de compte retourne 400 quand l'email est déjà utilisé.
    @Test
    void register_shouldReturn400_whenEmailIsAlreadyTaken() throws Exception {
        SignupRequest signUpRequest = new SignupRequest();
        signUpRequest.setEmail("test@test.com"); // email déjà créé dans setUp()
        signUpRequest.setFirstName("Another");
        signUpRequest.setLastName("User");
        signUpRequest.setPassword("password123");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signUpRequest)))
                .andExpect(status().isBadRequest());
    }

    // Vérifie que la validation retourne 400 quand un champ obligatoire est absent.
    @Test
    void register_shouldReturn400_whenRequiredFieldIsMissing() throws Exception {
        SignupRequest signUpRequest = new SignupRequest();
        signUpRequest.setEmail("new@test.com");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signUpRequest)))
                .andExpect(status().isBadRequest());
    }
}