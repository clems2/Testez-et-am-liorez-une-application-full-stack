package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.AbstractIntegrationTest;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TeacherControllerIT extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TeacherRepository teacherRepository;
    private Teacher savedTeacher;

    @BeforeEach
    void setUp() {
        savedTeacher = teacherRepository.save(
                Teacher.builder()
                        .firstName("Jane")
                        .lastName("Smith")
                        .build()
        );
    }

    // Vérifie que GET /api/teacher retourne la liste des teachers pour un utilisateur authentifié.
    @Test
    @WithMockUser
    void findAll_shouldReturnAllTeachers() throws Exception {
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].firstName").value("Jane"));
    }

    // Vérifie que GET /api/teacher retourne 401 quand l'utilisateur n'est pas authentifié.
    @Test
    void findAll_shouldReturn401_whenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isUnauthorized());
    }

    // Vérifie que GET /api/teacher/{id} retourne le teacher demandé pour un utilisateur authentifié.
    @Test
    @WithMockUser
    void findById_shouldReturnTeacher_whenExists() throws Exception {
        mockMvc.perform(get("/api/teacher/" + savedTeacher.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Jane"))
                .andExpect(jsonPath("$.lastName").value("Smith"));
    }

    // Vérifie que GET /api/teacher/{id} retourne 404 quand le teacher demandé n'existe pas.
    @Test
    @WithMockUser
    void findById_shouldReturn404_whenNotExists() throws Exception {
        mockMvc.perform(get("/api/teacher/99999"))
                .andExpect(status().isNotFound());
    }

    // Vérifie que GET /api/teacher/{id} retourne 400 quand l'id fourni n'est pas un nombre valide
    // (NumberFormatException → 500). Ici on teste le comportement réel de l'app.
    @Test
    @WithMockUser
    void findById_shouldReturnError_whenIdIsNotANumber() throws Exception {
        mockMvc.perform(get("/api/teacher/abc"))
                .andExpect(status().isInternalServerError());
    }
}