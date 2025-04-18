package com.skilltree.skilltreebackend.service;

import com.skilltree.skilltreebackend.model.User;
import java.util.List;

/**
 * Service interface for managing User operations.
 * Defines methods for CRUD and authentication.
 */
public interface UserService {
    User createUser(User user);
    List<User> getAllUsers();
    User getUserById(String id);
    User updateUser(String id, User user);
    void deleteUser(String id);
    User findByUsername(String username);
    User findByEmail(String email);
    User login(String email, String password);
    boolean existsByEmail(String email); // Add this method
}