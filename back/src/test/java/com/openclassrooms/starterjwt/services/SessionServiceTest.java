package com.openclassrooms.starterjwt.services;
import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SessionService sessionService;
    private Session session;
    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("test@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("encoded_password")
                .admin(false)
                .build();

        session = Session.builder()
                .id(1L)
                .name("Morning Yoga")
                .description("A great session")
                .teacher(Teacher.builder().id(1L).build())
                .users(new ArrayList<>())
                .build();
    }

    // Vérifie que create() sauvegarde la session et retourne l'entité persistée.
    @Test
    void create_shouldSaveAndReturnSession() {
        when(sessionRepository.save(session)).thenReturn(session);
        Session result = sessionService.create(session);
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Morning Yoga");
        verify(sessionRepository).save(session);
    }

    // Vérifie que findAll() retourne toutes les sessions disponibles.
    @Test
    void findAll_shouldReturnAllSessions() {
        List<Session> sessions = Arrays.asList(session,
                Session.builder().id(2L).name("Evening Yoga").users(new ArrayList<>()).build());
        when(sessionRepository.findAll()).thenReturn(sessions);
        List<Session> result = sessionService.findAll();
        assertThat(result).hasSize(2);
        verify(sessionRepository).findAll();
    }

    // Vérifie que getById() retourne la bonne session quand elle existe.
    @Test
    void getById_shouldReturnSession_whenExists() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        Session result = sessionService.getById(1L);
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(sessionRepository).findById(1L);
    }

    // Vérifie que getById() lance une NotFoundException quand la session demandée n'existe pas.
    @Test
    void getById_shouldThrowNotFoundException_whenNotExists() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> sessionService.getById(99L))
                .isInstanceOf(NotFoundException.class);
        verify(sessionRepository).findById(99L);
    }

    // Vérifie que delete() supprime bien la session quand elle existe.
    @Test
    void delete_shouldDeleteSession_whenExists() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        sessionService.delete(1L);
        verify(sessionRepository).delete(session);
    }

    // Vérifie que delete() lance une NotFoundException quand la session à supprimer n'existe pas.
    @Test
    void delete_shouldThrowNotFoundException_whenNotExists() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> sessionService.delete(99L))
                .isInstanceOf(NotFoundException.class);
        verify(sessionRepository, never()).delete(any());
    }

    // Vérifie que update() met à jour l'id et sauvegarde la session modifiée.
    @Test
    void update_shouldSetIdAndSaveSession() {
        Session updatedSession = Session.builder()
                .name("Updated Yoga")
                .description("Updated description")
                .users(new ArrayList<>())
                .build();
        when(sessionRepository.save(any(Session.class))).thenReturn(updatedSession);
        Session result = sessionService.update(1L, updatedSession);
        assertThat(updatedSession.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Updated Yoga"); // ← assertion sur result
        verify(sessionRepository).save(updatedSession);
    }

    // Vérifie que participate() ajoute le user à la session quand il ne participe pas encore.
    @Test
    void participate_shouldAddUser_whenNotAlreadyParticipating() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        sessionService.participate(1L, 1L);
        assertThat(session.getUsers()).contains(user);
        verify(sessionRepository).save(session);
    }

    // Vérifie que participate() lance une NotFoundException quand la session demandée n'existe pas.
    @Test
    void participate_shouldThrowNotFoundException_whenSessionNotExists() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> sessionService.participate(99L, 1L))
                .isInstanceOf(NotFoundException.class);
        verify(sessionRepository, never()).save(any());
    }

    // Vérifie que participate() lance une NotFoundException quand le user demandé n'existe pas.
    @Test
    void participate_shouldThrowNotFoundException_whenUserNotExists() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> sessionService.participate(1L, 99L))
                .isInstanceOf(NotFoundException.class);
        verify(sessionRepository, never()).save(any());
    }

    // Vérifie que participate() lance une BadRequestException quand le user participe déjà à la session.
    @Test
    void participate_shouldThrowBadRequestException_whenAlreadyParticipating() {
        session.getUsers().add(user);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        assertThatThrownBy(() -> sessionService.participate(1L, 1L))
                .isInstanceOf(BadRequestException.class);
        verify(sessionRepository, never()).save(any());
    }

    // Vérifie que noLongerParticipate() retire le user de la session quand il participait.
    @Test
    void noLongerParticipate_shouldRemoveUser_whenParticipating() {
        session.getUsers().add(user);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        sessionService.noLongerParticipate(1L, 1L);
        assertThat(session.getUsers()).doesNotContain(user);
        verify(sessionRepository).save(session);
    }

    // Vérifie que noLongerParticipate() lance une NotFoundException quand la session demandée n'existe pas.
    @Test
    void noLongerParticipate_shouldThrowNotFoundException_whenSessionNotExists() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.noLongerParticipate(99L, 1L))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).save(any());
    }

    // Vérifie que noLongerParticipate() lance une BadRequestException quand le user ne participe pas à la session.
    @Test
    void noLongerParticipate_shouldThrowBadRequestException_whenNotParticipating() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        assertThatThrownBy(() -> sessionService.noLongerParticipate(1L, 1L))
                .isInstanceOf(BadRequestException.class);
        verify(sessionRepository, never()).save(any());
    }
}