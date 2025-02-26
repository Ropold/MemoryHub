package ropold.backend.controller;


import com.cloudinary.Cloudinary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import ropold.backend.model.AppUser;
import ropold.backend.model.Category;
import ropold.backend.model.MemoryModel;
import ropold.backend.repository.AppUserRepository;
import ropold.backend.repository.MemoryRepository;

import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
                "github123",
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
                "github456",
                "user2",
                "https://avatars.example.com/user2.png",
                "https://github.com/user2",
                "https://example.com/image2.jpg"
        );

        memoryRepository.saveAll(List.of(memoryModel1, memoryModel2));

        // AppUser mit Favoriten-IDs, die mit MemoryModel-IDs übereinstimmen
        AppUser user = new AppUser(
                "user",
                "username",
                "Max Mustermann",
                "https://github.com/avatar",
                "https://github.com/mustermann",
                List.of("1", "2") // IDs stimmen mit den gespeicherten MemoryModels überein
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
                     "id": "1",
                     "name": "Avatar Erinnerung",
                     "matchId": 101,
                     "category": "GITHUB_AVATAR",
                     "description": "Eine Erinnerung, die mit einem GitHub-Avatar verknüpft ist",
                     "isActive": true,
                     "appUserGithubId": "github123",
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
                     "appUserGithubId": "github456",
                     "appUserUsername": "user2",
                     "appUserAvatarUrl": "https://avatars.example.com/user2.png",
                     "appUserGithubUrl": "https://github.com/user2",
                     "imageUrl": "https://example.com/image2.jpg"
                 }
             ]
             """));
    }


}
