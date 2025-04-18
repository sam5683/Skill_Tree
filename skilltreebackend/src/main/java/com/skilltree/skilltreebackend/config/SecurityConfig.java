package com.skilltree.skilltreebackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * Configuration class for Spring Security settings.
 * Defines password encoding, user details, and HTTP security rules.
 * Supports Basic Auth initially, with plans for JWT integration.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Provides a BCryptPasswordEncoder bean for secure password hashing.
     * @return BCryptPasswordEncoder instance with default strength
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Defines in-memory user details for initial authentication.
     * @return UserDetailsService with an admin user (to be replaced with DB later)
     */
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails admin = User.withUsername("admin")
                .password(passwordEncoder().encode("admin123"))
                .roles("ADMIN")
                .build();
        return new InMemoryUserDetailsManager(admin);
    }

    /**
     * Configures the security filter chain using Lambda DSL.
     * Allows public access to /api/users and /api/users/login, secures others with ADMIN role.
     * @param http HttpSecurity instance
     * @return SecurityFilterChain instance
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disabled for stateless REST APIs
            .cors(cors -> {}) // Enable CORS
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/users", "/api/users/login").permitAll() // Public endpoints
                .requestMatchers("/api/users/**").hasRole("ADMIN") // Secure other operations
                .anyRequest().authenticated()
            )
            .httpBasic(); // Enable Basic Auth for now
        return http.build();
    }

    /**
     * Configures CORS to allow requests from the frontend (localhost:5500).
     * @return CorsFilter instance
     */
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:5500"); // Match your frontend
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true);
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}