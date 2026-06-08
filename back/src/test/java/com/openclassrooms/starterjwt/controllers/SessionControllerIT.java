package com.openclassrooms.starterjwt.controllers;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.AbstractIntegrationTest;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.Date;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SessionControllerIT extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private Session savedSession;
    private Teacher savedTeacher;
    private Teacher secondTeacher;
    private User savedUser;

    @BeforeEach
    void setUp() {
        savedTeacher = teacherRepository.save(
                Teacher.builder().firstName("Jane").lastName("Smith").build()
        );
        secondTeacher = teacherRepository.save(
                Teacher.builder().firstName("John").lastName("Doe").build()
        );
        savedUser = userRepository.save(
                new User("user@test.com", "Doe", "John",
                        passwordEncoder.encode("password123"), false)
        );

        savedSession = sessionRepository.save(
                Session.builder()
                        .name("Morning Yoga")
                        .description("A great session")
                        .date(new Date())
                        .teacher(savedTeacher)
                        .users(new ArrayList<>())
                        .build()
        );
    }

    // Construit un SessionDto valide pour les tests create/update.
    private SessionDto buildValidSessionDto() {
        SessionDto dto = new SessionDto();
        dto.setName("New Session");
        dto.setDate(new Date());
        dto.setTeacher_id(secondTeacher.getId());
        dto.setDescription("A brand new session");
        dto.setUsers(new ArrayList<>());
        return dto;
    }

    // Vérifie que findById retourne les détails de la session demandée.
    @Test
    @WithMockUser
    void findById_shouldReturnSession_whenExists() throws Exception {
        mockMvc.perform(get("/api/session/" + savedSession.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedSession.getId()))
                .andExpect(jsonPath("$.name").value("Morning Yoga"))
                .andExpect(jsonPath("$.description").value("A great session"))
                .andExpect(jsonPath("$.teacher_id").value(savedTeacher.getId()))
                .andExpect(jsonPath("$.date").exists())
                .andExpect(jsonPath("$.users").isArray());
    }

    // Vérifie que findById retourne 404 quand la session n'existe pas.
    @Test
    @WithMockUser
    void findById_shouldReturn404_whenNotExists() throws Exception {
        mockMvc.perform(get("/api/session/99999"))
                .andExpect(status().isNotFound());
    }

    // Vérifie que findAll retourne la liste de toutes les sessions.
    @Test
    @WithMockUser
    void findAll_shouldReturnAllSessions() throws Exception {
        mockMvc.perform(get("/api/session"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(savedSession.getId()))
                .andExpect(jsonPath("$[0].name").value("Morning Yoga"))
                .andExpect(jsonPath("$[0].description").value("A great session"))
                .andExpect(jsonPath("$[0].teacher_id").value(savedTeacher.getId()))
                .andExpect(jsonPath("$[0].users").isArray());
    }

    // Vérifie que create persiste une nouvelle session et la retourne.
    @Test
    @WithMockUser
    void create_shouldCreateSession() throws Exception {
        SessionDto dto = buildValidSessionDto();
        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("New Session"))
                .andExpect(jsonPath("$.date").exists())
                .andExpect(jsonPath("$.description").value("A brand new session"))
                .andExpect(jsonPath("$.teacher_id").value(secondTeacher.getId()))
                .andExpect(jsonPath("$.users").isArray());
    }

    // Vérifie que create retourne 400 quand un champ obligatoire (name) est manquant.
    @Test
    @WithMockUser
    void create_shouldReturn400_whenNameIsMissing() throws Exception {
        SessionDto dto = buildValidSessionDto();
        dto.setName(null); // champ obligatoire manquant
        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    // Vérifie que update modifie la session existante et la retourne.
    @Test
    @WithMockUser
    void update_shouldUpdateSession() throws Exception {
        SessionDto dto = buildValidSessionDto();
        dto.setName("Updated Session");
        mockMvc.perform(put("/api/session/" + savedSession.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedSession.getId()))
                .andExpect(jsonPath("$.name").value("Updated Session"))
                .andExpect(jsonPath("$.date").exists())
                .andExpect(jsonPath("$.description").value("A brand new session"))
                .andExpect(jsonPath("$.teacher_id").value(secondTeacher.getId()))
                .andExpect(jsonPath("$.users").isArray());
    }

    // Vérifie que update retourne 400 quand un champ obligatoire est manquant.
    @Test
    @WithMockUser
    void update_shouldReturn400_whenNameIsMissing() throws Exception {
        SessionDto dto = buildValidSessionDto();
        dto.setName(null);
        mockMvc.perform(put("/api/session/" + savedSession.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    // Vérifie que delete supprime la session existante.
    @Test
    @WithMockUser
    void delete_shouldDeleteSession() throws Exception {
        mockMvc.perform(delete("/api/session/" + savedSession.getId()))
                .andExpect(status().isOk());
    }

    // Vérifie que delete retourne 404 quand la session n'existe pas.
    @Test
    @WithMockUser
    void delete_shouldReturn404_whenNotExists() throws Exception {
        mockMvc.perform(delete("/api/session/99999"))
                .andExpect(status().isNotFound());
    }

    // Vérifie que participate ajoute le user à la session.
    @Test
    @WithMockUser
    void participate_shouldAddUserToSession() throws Exception {
        mockMvc.perform(post("/api/session/" + savedSession.getId()
                        + "/participate/" + savedUser.getId()))
                .andExpect(status().isOk());
    }

    // Vérifie que participate retourne 400 quand le user participe déjà.
    @Test
    @WithMockUser
    void participate_shouldReturn400_whenAlreadyParticipating() throws Exception {
        mockMvc.perform(post("/api/session/" + savedSession.getId()
                        + "/participate/" + savedUser.getId()))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/session/" + savedSession.getId()
                        + "/participate/" + savedUser.getId()))
                .andExpect(status().isBadRequest());
    }

    // Vérifie que noLongerParticipate retire le user de la session.
    @Test
    @WithMockUser
    void noLongerParticipate_shouldRemoveUserFromSession() throws Exception {
        mockMvc.perform(post("/api/session/" + savedSession.getId()
                        + "/participate/" + savedUser.getId()))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/session/" + savedSession.getId()
                        + "/participate/" + savedUser.getId()))
                .andExpect(status().isOk());
    }

    // Vérifie que noLongerParticipate retourne 400 quand le user ne participe pas à la session.
    @Test
    @WithMockUser
    void noLongerParticipate_shouldReturn400_whenNotParticipating() throws Exception {
        mockMvc.perform(delete("/api/session/" + savedSession.getId()
                        + "/participate/" + savedUser.getId()))
                .andExpect(status().isBadRequest());
    }
}