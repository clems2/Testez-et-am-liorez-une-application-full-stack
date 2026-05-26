package com.openclassrooms.starterjwt;

import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.testcontainers.containers.MySQLContainer;

/**
 * Classe parente pour tous les tests d'intégration.
 * Démarre un container MySQL partagé entre tous les tests d'intégration
 * (un seul container pour tout le module, pas un par classe de test).
 *
 * Les classes de test d'intégration héritent de cette classe via :
 *
 *   @SpringBootTest
 *   @ContextConfiguration(initializers = AbstractIntegrationTest.Initializer.class)
 *   class MyControllerIT extends AbstractIntegrationTest { ... }
 */
public abstract class AbstractIntegrationTest {

    @SuppressWarnings("resource")
    static final MySQLContainer<?> MYSQL_CONTAINER = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("yoga_test")
            .withUsername("test")
            .withPassword("test")
            .withReuse(true);

    static {
        MYSQL_CONTAINER.start();
    }

    /**
     * Injecte dynamiquement l'URL JDBC du container dans la config Spring,
     * pour que Spring se connecte au container MySQL au lieu du compose.yaml.
     */
    public static class Initializer
            implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        @Override
        public void initialize(ConfigurableApplicationContext applicationContext) {
            TestPropertyValues.of(
                    "spring.datasource.url=" + MYSQL_CONTAINER.getJdbcUrl(),
                    "spring.datasource.username=" + MYSQL_CONTAINER.getUsername(),
                    "spring.datasource.password=" + MYSQL_CONTAINER.getPassword(),
                    "spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver"
            ).applyTo(applicationContext.getEnvironment());
        }
    }
}