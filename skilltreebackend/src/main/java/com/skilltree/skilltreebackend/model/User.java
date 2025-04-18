package com.skilltree.skilltreebackend.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Represents a User entity stored in the MongoDB 'users' collection.
 * Uses Lombok for reducing boilerplate and ensures unique username/email.
 * Includes validation and timestamps for tracking.
 */
@Data
@NoArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @NotBlank(message = "Username is required")
    @Indexed(unique = true)
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Indexed(unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    private String password; // To be hashed by service

    @Past(message = "Date of birth must be in the past")
    private LocalDateTime dateOfBirth;

    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private boolean isActive = true;

    /**
     * Constructor with essential fields, auto-sets createdAt.
     * @param username User's unique username
     * @param email User's unique email (case-insensitive)
     * @param password User's password (to be hashed)
     * @param dateOfBirth User's birth date
     */
    public User(String username, String email, String password, LocalDateTime dateOfBirth) {
        this.username = username;
        this.email = email.toLowerCase();
        this.password = password;
        this.dateOfBirth = dateOfBirth;
        this.createdAt = LocalDateTime.now();
    }
}