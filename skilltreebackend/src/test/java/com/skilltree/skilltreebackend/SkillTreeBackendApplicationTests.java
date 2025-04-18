package com.skilltree.skilltreebackend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = "spring.classformat.ignore=true")
class SkillTreeBackendApplicationTests {

    @Test
    void contextLoads() {
        // This test ensures the application context loads
    }

}