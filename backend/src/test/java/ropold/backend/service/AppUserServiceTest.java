package ropold.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import ropold.backend.model.AppUser;
import ropold.backend.repository.AppUserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AppUserServiceTest {

    @Mock
    private AppUserRepository appUserRepository;

    @InjectMocks
    private AppUserService appUserService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getUserById_UserExists_ReturnsUser() {
        String userId = "user";
        AppUser user = new AppUser(userId, "username", "name", "avatarUrl", "githubUrl", List.of());
        when(appUserRepository.findById(userId)).thenReturn(Optional.of(user));

        AppUser result = appUserService.getUserById(userId);

        assertNotNull(result);
        assertEquals(user, result);
        verify(appUserRepository, times(1)).findById(userId);
    }

    @Test
    void getUserById_UserDoesNotExist_ThrowsException() {
        String userId = "user";
        when(appUserRepository.findById(userId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> appUserService.getUserById(userId));
        assertEquals("User not found", exception.getMessage());
        verify(appUserRepository, times(1)).findById(userId);
    }

    @Test
    void getUserFavorites_ReturnsFavorites() {
        String userId = "user";
        List<String> favorites = List.of("memory1", "memory2");
        AppUser user = new AppUser(userId, "username", "name", "avatarUrl", "githubUrl", favorites);
        when(appUserRepository.findById(userId)).thenReturn(Optional.of(user));

        List<String> result = appUserService.getUserFavorites(userId);

        assertNotNull(result);
        assertEquals(favorites, result);
        verify(appUserRepository, times(1)).findById(userId);
    }

    @Test
    void addMemoryToFavorites_MemoryNotInFavorites_AddsMemory() {
        String userId = "user";
        String memoryId = "memory";
        AppUser user = new AppUser(userId, "username", "name", "avatarUrl", "githubUrl", new ArrayList<>());
        when(appUserRepository.findById(userId)).thenReturn(Optional.of(user));

        appUserService.addMemoryToFavorites(userId, memoryId);

        assertTrue(user.favorites().contains(memoryId));
        verify(appUserRepository, times(1)).save(user);
    }

    @Test
    void addMemoryToFavorites_MemoryInFavorites_DoesNotAddMemory() {
        String userId = "user";
        String memoryId = "memory";
        AppUser user = new AppUser(userId, "username", "name", "avatarUrl", "githubUrl", List.of(memoryId));
        when(appUserRepository.findById(userId)).thenReturn(Optional.of(user));

        appUserService.addMemoryToFavorites(userId, memoryId);

        assertTrue(user.favorites().contains(memoryId));
        verify(appUserRepository, never()).save(user);
    }

    @Test
    void removeMemoryFromFavorites_MemoryInFavorites_DoesNothing() {
        String userId = "user";
        String memoryId = "memory";
        List<String> favorites = new ArrayList<>();
        AppUser user = new AppUser(userId, "username", "name", "avatarUrl", "githubUrl", favorites);
        when(appUserRepository.findById(userId)).thenReturn(Optional.of(user));

        appUserService.removeMemoryFromFavorites(userId, memoryId);

        assertTrue(user.favorites().isEmpty());
        verify(appUserRepository, never()).save(user);
    }

}
