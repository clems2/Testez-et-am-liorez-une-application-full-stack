package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.exception.UnauthorizedException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Slf4j
@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User findById(Long id) {
        return this.userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id " + id));
    }

    public void delete(Long id, String currentUserEmail) {
        User user = this.findById(id);
        if (!Objects.equals(user.getEmail(), currentUserEmail)) {
            log.warn("User {} attempted to delete account {}", currentUserEmail, user.getEmail());
            throw new UnauthorizedException("You are not authorized to delete this user");
        }
        this.userRepository.deleteById(id);
    }

}
