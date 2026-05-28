package com.openclassrooms.starterjwt.services;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// @ExtendWith(MockitoExtension.class) initialise les mocks Mockito (@Mock, @InjectMocks) avant chaque test, sans démarrer Spring.
// C'est un test unitaire pur : rapide, isolé, sans contexte Spring.
@ExtendWith(MockitoExtension.class)
class TeacherServiceTest {

    // @Mock crée une fausse implémentation de TeacherRepository.
    @Mock
    private TeacherRepository teacherRepository;

    // @InjectMocks crée une instance de TeacherService en injectant
    @InjectMocks
    private TeacherService teacherService;
    private Teacher teacher1;
    private Teacher teacher2;

    // On utilise le builder Lombok généré par @Builder sur Teacher.
    @BeforeEach
    void setUp() {
        teacher1 = Teacher.builder()
                .id(1L)
                .firstName("Jane")
                .lastName("Smith")
                .build();

        teacher2 = Teacher.builder()
                .id(2L)
                .firstName("John")
                .lastName("Doe")
                .build();
    }

    // Vérifie que findAll() retourne bien la liste complète des teachers telle que retournée par le repository.
    @Test
    void findAll_shouldReturnAllTeachers() {
        List<Teacher> expected = Arrays.asList(teacher1, teacher2);
        when(teacherRepository.findAll()).thenReturn(expected);
        List<Teacher> result = teacherService.findAll();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactlyInAnyOrder(teacher1, teacher2);
        verify(teacherRepository).findAll();
    }

    // Vérifie que findAll() retourne une liste vide quand aucun teacher n'existe en base.
    @Test
    void findAll_shouldReturnEmptyList_whenNoTeachers() {
        when(teacherRepository.findAll()).thenReturn(List.of());
        List<Teacher> result = teacherService.findAll();
        assertThat(result).isEmpty();
        verify(teacherRepository).findAll();
    }

    // Plan de tests — Informations session : la page detail affiche le nom du professeur.
    // Vérifie que findById() retourne le bon teacher quand l'id existe.
    @Test
    void findById_shouldReturnTeacher_whenExists() {
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher1));
        Teacher result = teacherService.findById(1L);
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getFirstName()).isEqualTo("Jane");
        assertThat(result.getLastName()).isEqualTo("Smith");
        verify(teacherRepository).findById(1L);
    }

    // Vérifie que findById() lance une NotFoundException quand le teacher demandé n'existe pas en base.
    @Test
    void findById_shouldThrowNotFoundException_whenNotExists() {
        when(teacherRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> teacherService.findById(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("99");
        verify(teacherRepository).findById(99L);
    }
}