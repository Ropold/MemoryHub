package ropold.backend.controller;


import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.Assertions;  // Importiere JUnit Assertions
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import ropold.backend.model.AppUser;
import ropold.backend.model.Category;
import ropold.backend.model.MemoryModel;
import ropold.backend.repository.AppUserRepository;
import ropold.backend.repository.MemoryRepository;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class MemoryControllerIntegrationTest {

    @MockBean
    private Cloudinary cloudinary;

    @Autowired
    MockMvc mockMvc;

    @Autowired
    MemoryRepository memoryRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @BeforeEach
    void setup() {
        memoryRepository.deleteAll();
        appUserRepository.deleteAll();

        MemoryModel memoryModel1 = new MemoryModel(
                "1",
                "Avatar Erinnerung",
                101,
                Category.GITHUB_AVATAR,
                "Eine Erinnerung, die mit einem GitHub-Avatar verknüpft ist",
                true,
                "user",
                "user1",
                "https://avatars.example.com/user1.png",
                "https://github.com/user1",
                "https://example.com/image1.jpg"
        );

        MemoryModel memoryModel2 = new MemoryModel(
                "2",
                "Cloudinary Erinnerung",
                102,
                Category.CLOUDINARY_IMAGE,
                "Eine Erinnerung, die mit einem Cloudinary-Bild gespeichert ist",
                false,
                "user",
                "user1",
                "https://avatars.example.com/user1.png",
                "https://github.com/user1",
                "https://example.com/image1.jpg"
        );

        memoryRepository.saveAll(List.of(memoryModel1, memoryModel2));

        // AppUser mit Favoriten-IDs, die mit MemoryModel-IDs übereinstimmen
        AppUser user = new AppUser(
                "user",
                "username",
                "Max Mustermann",
                "https://github.com/avatar",
                "https://github.com/mustermann",
                List.of("2") // IDs stimmen mit den gespeicherten MemoryModels überein
        );

        appUserRepository.save(user);
    }

    @Test
    @WithMockUser(username = "user")
    void getUserFavorites_shouldReturnFavorites() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/memory-hub/favorites")
                        .with(oidcLogin().idToken(i -> i.claim("sub", "user"))))
                .andExpect(status().isOk())
                .andExpect(content().json("""
             [
                 {
                     "id": "2",
                     "name": "Cloudinary Erinnerung",
                     "matchId": 102,
                     "category": "CLOUDINARY_IMAGE",
                     "description": "Eine Erinnerung, die mit einem Cloudinary-Bild gespeichert ist",
                     "isActive": false,
                     "appUserGithubId": "user",
                     "appUserUsername": "user1",
                     "appUserAvatarUrl": "https://avatars.example.com/user1.png",
                     "appUserGithubUrl": "https://github.com/user1",
                     "imageUrl": "https://example.com/image1.jpg"
                 }
             ]
             """));
    }

    @Test
    void addMemoryToFavorites_shouldAddMemoryAndReturnFavorites() throws Exception {
        AppUser userBefore = appUserRepository.findById("user").orElseThrow();
        Assertions.assertFalse(userBefore.favorites().contains("1"));

        mockMvc.perform(MockMvcRequestBuilders.post("/api/memory-hub/favorites/1")
                        .with(oidcLogin().idToken(i -> i.claim("sub", "user"))))
                .andExpect(status().isCreated());

        AppUser updatedUser = appUserRepository.findById("user").orElseThrow();
        Assertions.assertTrue(updatedUser.favorites().contains("1"));
    }

    @Test
    void removeMemoryFromFavorites_shouldRemoveMemoryAndReturnFavorites() throws Exception {
        AppUser userBefore = appUserRepository.findById("user").orElseThrow();
        Assertions.assertTrue(userBefore.favorites().contains("2"));

        mockMvc.perform(MockMvcRequestBuilders.delete("/api/memory-hub/favorites/2")
                        .with(oidcLogin().idToken(i -> i.claim("sub", "user")))
                )
                .andExpect(status().isNoContent()); // .isOk = 200, .isNoContent = 204

        AppUser updatedUser = appUserRepository.findById("user").orElseThrow();
        Assertions.assertFalse(updatedUser.favorites().contains("2"));
    }

    @Test
    void ToggleActiveStatus_shouldToggleActiveStatus() throws Exception {
        MemoryModel memoryBefore = memoryRepository.findById("1").orElseThrow();
        Assertions.assertTrue(memoryBefore.isActive());

        mockMvc.perform(MockMvcRequestBuilders.put("/api/memory-hub/1/toggle-active")
                        .with(oidcLogin().idToken(i -> i.claim("sub", "user")))
                )
                .andExpect(status().isOk());

        MemoryModel updatedMemory = memoryRepository.findById("1").orElseThrow();
        Assertions.assertFalse(updatedMemory.isActive());
    }

    @Test
    void getAllMemories_shouldReturnAllMemories() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/memory-hub")
                        .with(oidcLogin().idToken(i -> i.claim("sub", "user")))
                )
                .andExpect(status().isOk())
                .andExpect(content().json("""
             [
                 {
                     "id": "1",
                     "name": "Avatar Erinnerung",
                     "matchId": 101,
                     "category": "GITHUB_AVATAR",
                     "description": "Eine Erinnerung, die mit einem GitHub-Avatar verknüpft ist",
                     "isActive": true,
                     "appUserGithubId": "user",
                     "appUserUsername": "user1",
                     "appUserAvatarUrl": "https://avatars.example.com/user1.png",
                     "appUserGithubUrl": "https://github.com/user1",
                     "imageUrl": "https://example.com/image1.jpg"
                 },
                 {
                     "id": "2",
                     "name": "Cloudinary Erinnerung",
                     "matchId": 102,
                     "category": "CLOUDINARY_IMAGE",
                     "description": "Eine Erinnerung, die mit einem Cloudinary-Bild gespeichert ist",
                     "isActive": false,
                     "appUserGithubId": "user",
                     "appUserUsername": "user1",
                     "appUserAvatarUrl": "https://avatars.example.com/user1.png",
                     "appUserGithubUrl": "https://github.com/user1",
                     "imageUrl": "https://example.com/image1.jpg"
                 }
             ]
             """));
    }

    @Test
    void getActiveMatchIds_shouldReturnListOfIntWithMatchIds() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/memory-hub/active/match-ids")
                        .with(oidcLogin().idToken(i -> i.claim("sub", "user")))
                )
                .andExpect(status().isOk())
                .andExpect(content().json("[101]"));
    }

    @Test
    void getActiveMemoriesFilterByMatchId_shouldReturnFilteredMemories() throws Exception {
        // Beispiel für eine 'matchId' (z.B. 101)
        int matchId = 101;

        // Sicherstellen, dass nur Erinnerungen mit dieser 'matchId' aktiv sind
        mockMvc.perform(MockMvcRequestBuilders.get("/api/memory-hub/active/match-id/{numberOfMatchId}", matchId)
                        .with(oidcLogin().idToken(i -> i.claim("sub", "user"))))
                .andExpect(status().isOk())
                .andExpect(content().json("""
            [
              {
                 "id": "1",
                 "name": "Avatar Erinnerung",
                 "matchId": 101,
                 "category": "GITHUB_AVATAR",
                 "description": "Eine Erinnerung, die mit einem GitHub-Avatar verknüpft ist",
                 "isActive": true,
                 "appUserGithubId": "user",
                 "appUserUsername": "user1",
                 "appUserAvatarUrl": "https://avatars.example.com/user1.png",
                 "appUserGithubUrl": "https://github.com/user1",
                 "imageUrl": "https://example.com/image1.jpg"
              }
            ]
            """));
    }


    @Test
    void getActiveMemories_shouldReturnActiveMemories() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/memory-hub/active")
                        .with(oidcLogin().idToken(i -> i.claim("sub", "user")))
                )
                .andExpect(status().isOk())
                .andExpect(content().json("""
                [
                  {
                     "id": "1",
                     "name": "Avatar Erinnerung",
                     "matchId": 101,
                     "category": "GITHUB_AVATAR",
                     "description": "Eine Erinnerung, die mit einem GitHub-Avatar verknüpft ist",
                     "isActive": true,
                     "appUserGithubId": "user",
                     "appUserUsername": "user1",
                     "appUserAvatarUrl": "https://avatars.example.com/user1.png",
                     "appUserGithubUrl": "https://github.com/user1",
                     "imageUrl": "https://example.com/image1.jpg"
                  }
                ]
                """));
    }

    @Test
    void getMemoriesForGithubUser_shouldReturnGithubUserMemories() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/users/me/my-memories/user")
                        .with(oidcLogin().idToken(i -> i.claim("sub", "user")))
                )
                .andExpect(status().isOk())
                .andExpect(content().json("""
            [
              {
                 "id": "1",
                 "name": "Avatar Erinnerung",
                 "matchId": 101,
                 "category": "GITHUB_AVATAR",
                 "description": "Eine Erinnerung, die mit einem GitHub-Avatar verknüpft ist",
                 "isActive": true,
                 "appUserGithubId": "user",
                 "appUserUsername": "user1",
                 "appUserAvatarUrl": "https://avatars.example.com/user1.png",
                 "appUserGithubUrl": "https://github.com/user1",
                 "imageUrl": "https://example.com/image1.jpg"
              },
              {
                 "id": "2",
                 "name": "Cloudinary Erinnerung",
                 "matchId": 102,
                 "category": "CLOUDINARY_IMAGE",
                 "description": "Eine Erinnerung, die mit einem Cloudinary-Bild gespeichert ist",
                 "isActive": false,
                 "appUserGithubId": "user",
                 "appUserUsername": "user1",
                 "appUserAvatarUrl": "https://avatars.example.com/user1.png",
                 "appUserGithubUrl": "https://github.com/user1",
                 "imageUrl": "https://example.com/image1.jpg"
              }
            ]
            """));
    }



    @Test
    void getMemoryById_returnsMemory() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/memory-hub/1")
                        .with(oidcLogin().idToken(i -> i.claim("sub", "user")))
                )
                .andExpect(status().isOk())
                .andExpect(content().json("""
                {
                     "id": "1",
                     "name": "Avatar Erinnerung",
                     "matchId": 101,
                     "category": "GITHUB_AVATAR",
                     "description": "Eine Erinnerung, die mit einem GitHub-Avatar verknüpft ist",
                     "isActive": true,
                     "appUserGithubId": "user",
                     "appUserUsername": "user1",
                     "appUserAvatarUrl": "https://avatars.example.com/user1.png",
                     "appUserGithubUrl": "https://github.com/user1",
                     "imageUrl": "https://example.com/image1.jpg"
                  }
                """));
    }

    @Test
    void postMemory_shouldAddMemory() throws Exception {
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getName()).thenReturn("user");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(mockOAuth2User, null,
                        Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")))
        );

        memoryRepository.deleteAll();
        Uploader mockUploader = mock(Uploader.class);
        when(mockUploader.upload(any(), anyMap())).thenReturn(Map.of("secure_url", "https://www.test.de/"));
        when(cloudinary.uploader()).thenReturn(mockUploader);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/memory-hub")
                        .file(new MockMultipartFile("image", "test.jpg", "image/jpeg", "test image".getBytes()))
                        .file(new MockMultipartFile("memoryModelDto", "", "application/json", """
            {
            "name": "Avatar Erinnerung",
             "matchId": 101,
             "category": "GITHUB_AVATAR",
             "description": "Eine Erinnerung, die mit einem GitHub-Avatar verknüpft ist",
             "isActive": true,
             "appUserGithubId": "user",
             "appUserUsername": "user1",
             "appUserAvatarUrl": "https://avatars.example.com/user1.png",
             "appUserGithubUrl": "https://github.com/user1",
             "imageUrl": "https://example.com/image1.jpg"
          }
        """.getBytes())))
                .andExpect(status().isCreated());

        List<MemoryModel> allMemories = memoryRepository.findAll();
        Assertions.assertEquals(1, allMemories.size());
        MemoryModel savedMemoryModel = allMemories.getFirst();
        org.assertj.core.api.Assertions.assertThat(savedMemoryModel)
                .usingRecursiveComparison()
                .ignoringFields("id", "imageUrl")
                .isEqualTo(new MemoryModel(
                        null,
                        "Avatar Erinnerung",
                        101,
                        Category.GITHUB_AVATAR,
                        "Eine Erinnerung, die mit einem GitHub-Avatar verknüpft ist",
                        true,
                        "user",
                        "user1",
                        "https://avatars.example.com/user1.png",
                        "https://github.com/user1",
                        null
                ));
    }

    @Test
    void postMemory_withAvatar_andReturnMemory() throws Exception {
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getName()).thenReturn("user");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(mockOAuth2User, null,
                        Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")))
        );

        memoryRepository.deleteAll();

        mockMvc.perform(MockMvcRequestBuilders.post("/api/memory-hub/avatar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {
                     "name": "Avatar Erinnerung",
                     "matchId": 101,
                     "category": "GITHUB_AVATAR",
                     "description": "Eine Erinnerung, die mit einem GitHub-Avatar verknüpft ist",
                     "isActive": true,
                     "appUserGithubId": "user",
                     "appUserUsername": "user1",
                     "appUserAvatarUrl": "https://avatars.example.com/user1.png",
                     "appUserGithubUrl": "https://github.com/user1",
                     "imageUrl": "https://example.com/image1.jpg"
                    }
                """))
                .andExpect(status().isCreated());

        List<MemoryModel> allMemories = memoryRepository.findAll();
        Assertions.assertEquals(1, allMemories.size());

        MemoryModel savedMemoryModel = allMemories.getFirst();
        org.assertj.core.api.Assertions.assertThat(savedMemoryModel)
                .usingRecursiveComparison()
                .ignoringFields("id")
                .isEqualTo(new MemoryModel(
                        null,
                        "Avatar Erinnerung",
                        101,
                        Category.GITHUB_AVATAR,
                        "Eine Erinnerung, die mit einem GitHub-Avatar verknüpft ist",
                        true,
                        "user",
                        "user1",
                        "https://avatars.example.com/user1.png",
                        "https://github.com/user1",
                        "https://example.com/image1.jpg"
                ));
    }

    @Test
    void updateMemory_withAvatar_shouldUpdateMemoryDetails() throws Exception {
        // GIVEN
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getName()).thenReturn("user");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(mockOAuth2User, null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
        );

        MemoryModel existingMemory = new MemoryModel(
                "1",
                "Avatar Erinnerung",
                101,
                Category.GITHUB_AVATAR,
                "Eine Erinnerung, die mit einem GitHub-Avatar verknüpft ist",
                true,
                "user",
                "user1",
                "https://avatars.example.com/user1.png",
                "https://github.com/user1",
                "https://example.com/image1.jpg"
        );
        memoryRepository.save(existingMemory);

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.put("/api/memory-hub/avatar/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "name": "Updated Erinnerung",
                            "matchId": 102,
                            "category": "GITHUB_AVATAR",
                            "description": "Eine aktualisierte Erinnerung mit GitHub-Avatar",
                            "isActive": false,
                            "appUserGithubId": "user",
                            "appUserUsername": "userUpdated",
                            "appUserAvatarUrl": "https://avatars.example.com/userUpdated.png",
                            "appUserGithubUrl": "https://github.com/userUpdated",
                            "imageUrl": "https://example.com/updated-image.jpg"
                        }
                    """))
                .andExpect(status().isOk())
                .andExpect(content().json("""
                {
                    "id": "1",
                    "name": "Updated Erinnerung",
                    "matchId": 102,
                    "category": "GITHUB_AVATAR",
                    "description": "Eine aktualisierte Erinnerung mit GitHub-Avatar",
                    "isActive": false,
                    "appUserGithubId": "user",
                    "appUserUsername": "userUpdated",
                    "appUserAvatarUrl": "https://avatars.example.com/userUpdated.png",
                    "appUserGithubUrl": "https://github.com/userUpdated",
                    "imageUrl": "https://example.com/updated-image.jpg"
                }
            """));

        // THEN
        MemoryModel updatedMemory = memoryRepository.findById("1").orElseThrow();
        Assertions.assertFalse(updatedMemory.isActive());
        Assertions.assertEquals("Updated Erinnerung", updatedMemory.name());
        Assertions.assertEquals("https://example.com/updated-image.jpg", updatedMemory.imageUrl());
    }

    @Test
    void updateMemoryWithPut_shouldUpdateMemoryDetails() throws Exception {
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getName()).thenReturn("user");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(mockOAuth2User, null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
        );

        Uploader mockUploader = mock(Uploader.class);
        when(mockUploader.upload(any(), anyMap())).thenReturn(Map.of("secure_url", "https://example.com/updated-image.jpg"));
        when(cloudinary.uploader()).thenReturn(mockUploader);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/memory-hub/1")
                        .file(new MockMultipartFile("image", "test.jpg", "image/jpeg", "test image".getBytes()))
                        .file(new MockMultipartFile("memoryModelDto", "", "application/json", """
            {
                "name": "Updated Erinnerung",
                "matchId": 102,
                "category": "GITHUB_AVATAR",
                "description": "Eine aktualisierte Erinnerung mit GitHub-Avatar",
                "isActive": false,
                "appUserGithubId": "user",
                "appUserUsername": "userUpdated",
                "appUserAvatarUrl": "https://avatars.example.com/userUpdated.png",
                "appUserGithubUrl": "https://github.com/userUpdated",
                "imageUrl": "https://example.com/updated-image.jpg"
            }
            """.getBytes()))
                        .contentType("multipart/form-data")
                        .with(request -> { request.setMethod("PUT"); return request; }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Erinnerung"))
                .andExpect(jsonPath("$.imageUrl").value("https://example.com/updated-image.jpg"));

        Assertions.assertEquals("Updated Erinnerung", memoryRepository.findById("1").orElseThrow().name());
    }

    @Test
    void deleteMemory_shouldDeleteMemory() throws Exception {

        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getName()).thenReturn("user");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(mockOAuth2User, null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
        );

        Uploader mockUploader = mock(Uploader.class);
        when(mockUploader.upload(any(), anyMap())).thenReturn(Map.of("secure_url", "https://example.com/updated-image.jpg"));
        when(cloudinary.uploader()).thenReturn(mockUploader);

        mockMvc.perform(MockMvcRequestBuilders.delete("/api/memory-hub/1"))
                .andExpect(status().isNoContent());

        Assertions.assertTrue(memoryRepository.findById("1").isEmpty());
        verify(mockUploader).destroy(eq("image1"), anyMap());
    }

}
