package com.skilltree.skilltreebackend.service.impl;

import com.skilltree.skilltreebackend.model.User;
import com.skilltree.skilltreebackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Implementation of UserService for managing User operations.
 * Handles CRUD, validation, and authentication with MongoDB.
 */
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public User createUser(User user) {
        if (user.getUsername() == null || user.getEmail() == null || user.getPassword() == null) {
            throw new IllegalArgumentException("Username, email, and password are required");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword())); // Hash password
        user.setCreatedAt(LocalDateTime.now()); // Set creation time
        return mongoTemplate.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return mongoTemplate.findAll(User.class);
    }

    @Override
    public User getUserById(String id) {
        return mongoTemplate.findById(id, User.class);
    }

    @Override
    public User updateUser(String id, User user) {
        User existingUser = getUserById(id);
        if (existingUser == null) return null;
        if (user.getUsername() != null) existingUser.setUsername(user.getUsername());
        if (user.getEmail() != null) existingUser.setEmail(user.getEmail().toLowerCase());
        if (user.getPassword() != null) existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getDateOfBirth() != null) existingUser.setDateOfBirth(user.getDateOfBirth());
        existingUser.setLastLogin(LocalDateTime.now()); // Update on any change
        return mongoTemplate.save(existingUser);
    }

    @Override
    public void deleteUser(String id) {
        User user = getUserById(id);
        if (user != null) mongoTemplate.remove(user);
    }

    @Override
    public User findByUsername(String username) {
        return mongoTemplate.findOne(new Query(Criteria.where("username").is(username)), User.class);
    }

    @Override
    public User findByEmail(String email) {
        return mongoTemplate.findOne(new Query(Criteria.where("email").is(email.toLowerCase())), User.class);
    }

    @Override
    public User login(String email, String password) {
        User user = findByEmail(email);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            user.setLastLogin(LocalDateTime.now());
            mongoTemplate.save(user); // Update last login
            return user;
        }
        throw new RuntimeException("Invalid email or password");
    }

    @Override
    public boolean existsByEmail(String email) {
        Query query = new Query(Criteria.where("email").is(email.toLowerCase()));
        return mongoTemplate.exists(query, User.class);
    }
}