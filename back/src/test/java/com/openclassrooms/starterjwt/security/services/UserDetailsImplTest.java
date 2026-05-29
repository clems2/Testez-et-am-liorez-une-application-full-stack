package com.openclassrooms.starterjwt.security.services;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class UserDetailsImplTest {

    private UserDetailsImpl buildUser(Long id) {
        return UserDetailsImpl.builder()
                .id(id)
                .username("test@test.com")
                .firstName("John")
                .lastName("Doe")
                .admin(true)
                .password("password")
                .build();
    }

    // Vérifie que le builder et les getters renvoient les bonnes valeurs.
    @Test
    void builderAndGetters_shouldReturnCorrectValues() {
        UserDetailsImpl user = buildUser(1L);
        assertThat(user.getId()).isEqualTo(1L);
        assertThat(user.getUsername()).isEqualTo("test@test.com");
        assertThat(user.getFirstName()).isEqualTo("John");
        assertThat(user.getLastName()).isEqualTo("Doe");
        assertThat(user.getAdmin()).isTrue();
        assertThat(user.getPassword()).isEqualTo("password");
    }

    // Vérifie que les méthodes booléennes de UserDetails renvoient true.
    @Test
    void userDetailsBooleanMethods_shouldReturnTrue() {
        UserDetailsImpl user = buildUser(1L);
        assertThat(user.isAccountNonExpired()).isTrue();
        assertThat(user.isAccountNonLocked()).isTrue();
        assertThat(user.isCredentialsNonExpired()).isTrue();
        assertThat(user.isEnabled()).isTrue();
    }

    // Vérifie que getAuthorities renvoie une collection vide.
    @Test
    void getAuthorities_shouldReturnEmptyCollection() {
        UserDetailsImpl user = buildUser(1L);
        assertThat(user.getAuthorities()).isEmpty();
    }

    // Vérifie que equals retourne true pour le même objet.
    @Test
    void equals_shouldReturnTrue_whenSameInstance() {
        UserDetailsImpl user = buildUser(1L);

        assertThat(user.equals(user)).isTrue();
    }

    // Vérifie que equals retourne true pour deux users avec le même id.
    @Test
    void equals_shouldReturnTrue_whenSameId() {
        UserDetailsImpl user1 = buildUser(1L);
        UserDetailsImpl user2 = buildUser(1L);
        assertThat(user1.equals(user2)).isTrue();
    }

    // Vérifie que equals retourne false pour deux users avec un id différent.
    @Test
    void equals_shouldReturnFalse_whenDifferentId() {
        UserDetailsImpl user1 = buildUser(1L);
        UserDetailsImpl user2 = buildUser(2L);
        assertThat(user1.equals(user2)).isFalse();
    }

    // Vérifie que equals retourne false quand comparé à null.
    @Test
    void equals_shouldReturnFalse_whenComparedToNull() {
        UserDetailsImpl user = buildUser(1L);
        assertThat(user.equals(null)).isFalse();
    }

    // Vérifie que equals retourne false quand comparé à une autre classe.
    @Test
    void equals_shouldReturnFalse_whenDifferentClass() {
        UserDetailsImpl user = buildUser(1L);
        assertThat(user.equals("a string")).isFalse();
    }
}