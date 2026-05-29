package com.openclassrooms.starterjwt.configuration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.test.context.ActiveProfiles;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class AppConfigTest {

    @Autowired
    private PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer;

    // Vérifie que le bean de configuration est présent dans le contexte Spring.
    @Test
    void propertySourcesPlaceholderConfigurer_shouldBeLoaded() {
        assertThat(propertySourcesPlaceholderConfigurer).isNotNull();
    }
}