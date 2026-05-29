package com.openclassrooms.starterjwt.mapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MapperTest {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private TeacherMapper teacherMapper;

    @Autowired
    private SessionMapper sessionMapper;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    private Teacher savedTeacher;
    private User savedUser;

    @BeforeEach
    void setUp() {
        savedTeacher = teacherRepository.save(
                Teacher.builder().firstName("Jane").lastName("Smith").build()
        );
        savedUser = userRepository.save(
                new User("mapper@test.com", "Doe", "John", "password", false)
        );
    }

    // Vérifie la conversion entité User -> UserDto.
    @Test
    void userMapper_shouldMapEntityToDto() {
        User user = User.builder()
                .id(1L).email("u@test.com").firstName("John").lastName("Doe")
                .password("pwd").admin(false)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build();

        UserDto dto = userMapper.toDto(user);
        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getEmail()).isEqualTo("u@test.com");
        assertThat(dto.getFirstName()).isEqualTo("John");
    }

    // Vérifie la conversion DTO UserDto -> entité User.
    @Test
    void userMapper_shouldMapDtoToEntity() {
        UserDto dto = new UserDto();
        dto.setId(1L);
        dto.setEmail("u@test.com");
        dto.setFirstName("John");
        dto.setLastName("Doe");
        dto.setAdmin(false);
        dto.setPassword("pwd");

        User user = userMapper.toEntity(dto);
        assertThat(user.getId()).isEqualTo(1L);
        assertThat(user.getEmail()).isEqualTo("u@test.com");
    }

    // Vérifie la conversion d'une liste (couvre toEntity/toDto sur List).
    @Test
    void userMapper_shouldMapLists() {
        UserDto dto = new UserDto();
        dto.setId(1L);
        dto.setEmail("u@test.com");
        dto.setFirstName("John");
        dto.setLastName("Doe");
        dto.setAdmin(false);
        dto.setPassword("pwd");

        List<User> entities = userMapper.toEntity(List.of(dto));
        List<UserDto> dtos = userMapper.toDto(entities);
        assertThat(entities).hasSize(1);
        assertThat(dtos).hasSize(1);
    }

    // Vérifie la conversion entité Teacher -> TeacherDto.
    @Test
    void teacherMapper_shouldMapEntityToDto() {
        Teacher teacher = Teacher.builder()
                .id(1L).firstName("Jane").lastName("Smith").build();

        TeacherDto dto = teacherMapper.toDto(teacher);

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getFirstName()).isEqualTo("Jane");
    }

    // Vérifie la conversion DTO TeacherDto -> entité Teacher.
    @Test
    void teacherMapper_shouldMapDtoToEntity() {
        TeacherDto dto = new TeacherDto();
        dto.setId(1L);
        dto.setFirstName("Jane");
        dto.setLastName("Smith");

        Teacher teacher = teacherMapper.toEntity(dto);

        assertThat(teacher.getId()).isEqualTo(1L);
        assertThat(teacher.getLastName()).isEqualTo("Smith");
    }

    // Vérifie que toEntity résout teacher_id en Teacher et users en List<User>.
    @Test
    void sessionMapper_shouldMapDtoToEntity_withTeacherAndUsers() {
        SessionDto dto = new SessionDto();
        dto.setName("Yoga");
        dto.setDate(new Date());
        dto.setDescription("Description");
        dto.setTeacher_id(savedTeacher.getId());
        dto.setUsers(List.of(savedUser.getId()));

        Session session = sessionMapper.toEntity(dto);
        assertThat(session.getName()).isEqualTo("Yoga");
        assertThat(session.getTeacher()).isNotNull();
        assertThat(session.getTeacher().getId()).isEqualTo(savedTeacher.getId());
        assertThat(session.getUsers()).hasSize(1);
    }

    // Vérifie que toEntity gère teacher_id null et users null (branches else).
    @Test
    void sessionMapper_shouldMapDtoToEntity_withNullTeacherAndUsers() {
        SessionDto dto = new SessionDto();
        dto.setName("Yoga");
        dto.setDate(new Date());
        dto.setDescription("Description");
        dto.setTeacher_id(null);
        dto.setUsers(null);

        Session session = sessionMapper.toEntity(dto);
        assertThat(session.getTeacher()).isNull();
        assertThat(session.getUsers()).isEmpty();
    }

    // Vérifie que toDto extrait teacher_id et la liste des ids d'users.
    @Test
    void sessionMapper_shouldMapEntityToDto() {
        Session session = Session.builder()
                .id(1L)
                .name("Yoga")
                .date(new Date())
                .description("Description")
                .teacher(savedTeacher)
                .users(new ArrayList<>(List.of(savedUser)))
                .build();

        SessionDto dto = sessionMapper.toDto(session);
        assertThat(dto.getName()).isEqualTo("Yoga");
        assertThat(dto.getTeacher_id()).isEqualTo(savedTeacher.getId());
        assertThat(dto.getUsers()).containsExactly(savedUser.getId());
    }

    // Vérifie que toDto gère un teacher null et une liste users null.
    @Test
    void sessionMapper_shouldMapEntityToDto_withNullTeacherAndUsers() {
        Session session = Session.builder()
                .id(1L)
                .name("Yoga")
                .date(new Date())
                .description("Description")
                .teacher(null)
                .users(null)
                .build();

        SessionDto dto = sessionMapper.toDto(session);
        assertThat(dto.getTeacher_id()).isNull();
        assertThat(dto.getUsers()).isEmpty();
    }
}