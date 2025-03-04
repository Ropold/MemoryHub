package ropold.backend.exception;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import ropold.backend.repository.MemoryRepository;
import ropold.backend.service.MemoryService;

import java.util.Collections;
import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private Cloudinary cloudinary;

    @Autowired
    private MemoryRepository memoryRepository;

    @MockBean
    private MemoryService memoryService;

    @Test
    void whenMemoryNotFoundException_thenReturnsNotFound() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/memory-hub/{id}", "non-existing-id"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("No Memory found with id: non-existing-id"));
    }

    @Test
    @WithMockUser(username = "testUser")
    void postMemory_shouldFailValidation_whenFieldsAreInvalid() throws Exception {
        memoryRepository.deleteAll();

        Uploader mockUploader = mock(Uploader.class);
        when(mockUploader.upload(any(), any())).thenReturn(Map.of("secure_url", "https://res.cloudinary.com/dzjjlydk3/image/upload/v1733473109/dauqufxqzou7akwyoxha.jpg"));
        when(cloudinary.uploader()).thenReturn(mockUploader);

        // Wenn wir den Request durchführen, dann stellen wir sicher, dass ungültige Felder den richtigen Fehler auslösen
        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/memory-hub")
                        .file(new MockMultipartFile("image", "test.jpg", "image/jpeg", "test image".getBytes()))
                        .file(new MockMultipartFile("memoryModelDto", "", "application/json", """
                {
                    "name": "B",
                    "matchId": 1,
                    "category": "CLOUDINARY_IMAGE",
                    "description": "   ",
                    "isActive": true,
                    "appUserGithubId": "123",
                    "appUserUsername": "Ropold",
                    "appUserAvatarUrl": "https://avatars.githubusercontent.com/u/154427648?v=4",
                    "appUserGithubUrl": "https://github.com/Ropold",
                    "imageUrl": ""
                }
            """.getBytes())))
                // Erwartete Validierungsfehler
                .andExpect(status().isBadRequest())
                .andExpect(MockMvcResultMatchers.content().json("""
                {
                    "imageUrl":"Image URL must not be blank","name":"Name must contain at least 3 characters"
                }
            """));
    }

    @Test
    @WithMockUser(username = "user")
    void postMemory_shouldReturnAccessDenied_whenUserIsNotAuthorized() throws Exception {

        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getName()).thenReturn("user");

        SecurityContextHolder.getContext().setAuthentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(mockOAuth2User, null,
                        Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"))));

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/memory-hub")
                        .file(new MockMultipartFile("image", "test.jpg", "image/jpeg", "test image".getBytes()))
                        .file(new MockMultipartFile("memoryModelDto", "", "application/json", """
                {
                    "name": "Test Memory",
                    "matchId": 1,
                    "category": "CLOUDINARY_IMAGE",
                    "description": "A test memory",
                    "isActive": true,
                    "appUserGithubId": "123",
                    "appUserUsername": "Ropold",
                    "appUserAvatarUrl": "https://avatars.githubusercontent.com/u/154427648?v=4",
                    "appUserGithubUrl": "",
                    "imageUrl": "https://res.cloudinary.com/dzjjlydk3/image/upload/v1733473109/dauqufxqzou7akwyoxha.jpg"
                }
                """.getBytes())))
                // THEN: Der Test erwartet einen 403 Forbidden Status und die AccessDeniedException sollte ausgelöst werden
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", is("You are not allowed to create memories for other users")))
                .andReturn();
    }

    @Test
    void whenRuntimeExceptionThrown_thenReturnsInternalServerError() throws Exception {
        when(memoryService.getMemoryById(any())).thenThrow(new RuntimeException("Unexpected error"));

        mockMvc.perform(MockMvcRequestBuilders.get("/api/memory-hub/{id}", "any-id"))
                .andExpect(status().isInternalServerError()) // Überprüft den Statuscode 500
                .andExpect(jsonPath("$.message").value("Unexpected error"));  // Überprüft die Fehlermeldung
    }

}
