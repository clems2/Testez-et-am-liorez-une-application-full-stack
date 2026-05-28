package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.exception.UnauthorizedException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;
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
    }

    // Plan de tests — Account : la page Account charge les infos de l'utilisateur.
    // Vérifie que findById() retourne le bon user.
    @Test
    void findById_shouldReturnUser_whenExists() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        User result = userService.findById(1L);
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo("test@test.com");
        verify(userRepository).findById(1L);
    }

    // Vérifie que findById() lance une NotFoundException quand l'id ne correspond à aucun user en base.
    @Test
    void findById_shouldThrowNotFoundException_whenNotExists() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.findById(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("99");
        verify(userRepository).findById(99L);
    }

    // Vérifie que delete() supprime bien le compte quand l'utilisateur courant est bien le propriétaire du compte (emails identiques).
    @Test
    void delete_shouldDeleteUser_whenEmailMatches() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        userService.delete(1L, "test@test.com");
        verify(userRepository).deleteById(1L);
    }

    // Vérifie que delete() lance une UnauthorizedException quand l'email de l'utilisateur courant ne correspond pas au propriétaire du compte.
    @Test
    void delete_shouldThrowUnauthorizedException_whenEmailDoesNotMatch() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        assertThatThrownBy(() -> userService.delete(1L, "other@test.com"))
                .isInstanceOf(UnauthorizedException.class);
        verify(userRepository, never()).deleteById(1L);
    }

    // Vérifie que delete() propage la NotFoundException de findById() quand le user à supprimer n'existe pas en base.
    @Test
    void delete_shouldThrowNotFoundException_whenUserNotExists() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.delete(99L, "test@test.com"))
                .isInstanceOf(NotFoundException.class);
        verify(userRepository, never()).deleteById(99L);
    }
}