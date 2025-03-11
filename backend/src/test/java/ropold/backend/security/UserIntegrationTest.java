package ropold.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.web.servlet.MockMvc;
import ropold.backend.model.AppUser;
import ropold.backend.repository.AppUserRepository;
import ropold.backend.service.MemoryService;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UserIntegrationTest {
    @Autowired
    MockMvc mockMvc;

    @Autowired
    AppUserRepository appUserRepository;

    @Autowired
    MemoryService memoryService;

    @BeforeEach
    void setup() {
        appUserRepository.deleteAll();
        AppUser testUser = new AppUser(
                "user",
                "username",
                "max mustermann",
                "https://github.com/avatar",
                "https://github.com/mustermann",
                List.of("favorite1", "favorite2")
        );
        appUserRepository.save(testUser);
    }

    @Test
    void testGetMe_withLoggedInUser_expectUsername() throws Exception {
        // Erstellen eines Mock OAuth2User
        OAuth2User mockUser = mock(OAuth2User.class);
        when(mockUser.getName()).thenReturn("user");

        // Simuliere den OAuth2User in der SecurityContext
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        Authentication authentication = new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isOk())
                .andExpect(content().string("user"));
    }

    @Test
    void testGetMe_withoutLogin_expectAnonymousUsername() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isOk())
                .andExpect(content().string("anonymousUser"));
    }


    @Test
    void testGetUserDetails_withLoggedInUser_expectUserDetails() throws Exception {
        // Erstellen eines Mock OAuth2User
        OAuth2User mockUser = mock(OAuth2User.class);
        when(mockUser.getAttributes()).thenReturn(Map.of(
                "login", "username",
                "name", "max mustermann",
                "avatar_url", "https://github.com/avatar",
                "html_url", "https://github.com/mustermann"
        ));

        // Simuliere den OAuth2User in der SecurityContext
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        Authentication authentication = new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        mockMvc.perform(get("/api/users/me/details"))
                .andExpect(status().isOk())
                .andExpect(content().json("""
                {
                    "login": "username",
                    "name": "max mustermann",
                    "avatar_url": "https://github.com/avatar",
                    "html_url": "https://github.com/mustermann"
                }
            """));
    }

    @Test
    void testGetUserDetails_withoutLogin_expectErrorMessage() throws Exception {
        mockMvc.perform(get("/api/users/me/details"))
                .andExpect(status().isOk())
                .andExpect(content().json("""
                {
                    "message": "User not authenticated"
                }
            """));
    }

}
