package com.skilltree.skilltreebackend.repository;

import com.skilltree.skilltreebackend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

/**
 * Repository interface for User entity, extending MongoRepository for CRUD operations.
 * Provides custom queries for email and username lookup.
 */
public interface UserRepository extends MongoRepository<User, String> {
    /**
     * Finds a user by email (case-insensitive).
     * @param email The email to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByEmailIgnoreCase(String email);

    /**
     * Finds a user by username.
     * @param username The username to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByUsername(String username);
}