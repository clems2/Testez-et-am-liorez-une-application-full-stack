package com.openclassrooms.starterjwt.controllers;
import com.openclassrooms.starterjwt.AbstractIntegrationTest;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserControllerIT extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    private User savedUser;

    @BeforeEach
    void setUp() {
        savedUser = userRepository.save(
                new User(
                        "test@test.com",
                        "Doe",
                        "John",
                        passwordEncoder.encode("password123"),
                        false
                )
        );
    }

    // Vérifie que GET /api/user/{id} retourne les informations du user pour un utilisateur authentifié.
    @Test
    @WithMockUser
    void findById_shouldReturnUser_whenExists() throws Exception {
        mockMvc.perform(get("/api/user/" + savedUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedUser.getId()))
                .andExpect(jsonPath("$.email").value("test@test.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.admin").value(false));
    }

    // Vérifie que GET /api/user/{id} retourne 404 quand le user demandé n'existe pas.
    @Test
    @WithMockUser
    void findById_shouldReturn404_whenNotExists() throws Exception {
        mockMvc.perform(get("/api/user/99999"))
                .andExpect(status().isNotFound());
    }

    // Vérifie que GET /api/user/{id} retourne 401 quand l'utilisateur n'est pas authentifié.
    @Test
    void findById_shouldReturn401_whenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/user/" + savedUser.getId()))
                .andExpect(status().isUnauthorized());
    }

    // Vérifie que DELETE /api/user/{id} supprime le compte quand l'utilisateur connecté est le propriétaire (même email).
    @Test
    @WithMockUser(username = "test@test.com")
    void delete_shouldDeleteUser_whenOwnAccount() throws Exception {
        mockMvc.perform(delete("/api/user/" + savedUser.getId()))
                .andExpect(status().isOk());
    }

    // Vérifie que DELETE /api/user/{id} retourne 401 quand l'utilisateur connecté tente de supprimer le compte d'un autre utilisateur (emails différents).
    @Test
    @WithMockUser(username = "other@test.com")
    void delete_shouldReturn401_whenNotOwnAccount() throws Exception {
        mockMvc.perform(delete("/api/user/" + savedUser.getId()))
                .andExpect(status().isUnauthorized());
    }

    // Vérifie que DELETE /api/user/{id} retourne 404 quand le user à supprimer n'existe pas.
    @Test
    @WithMockUser(username = "test@test.com")
    void delete_shouldReturn404_whenUserNotExists() throws Exception {
        mockMvc.perform(delete("/api/user/99999"))
                .andExpect(status().isNotFound());
    }
}