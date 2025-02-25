package ropold.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ropold.backend.exception.MemoryNotFoundException;
import ropold.backend.model.Category;
import ropold.backend.model.MemoryModel;
import ropold.backend.repository.MemoryRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MemoryServiceTest {
    IdService idService = mock(IdService.class);
    MemoryRepository memoryRepository = mock(MemoryRepository.class);
    CloudinaryService cloudinaryService = mock(CloudinaryService.class);
    MemoryService memoryService = new MemoryService(idService, memoryRepository, cloudinaryService);

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

    List<MemoryModel> memories = List.of(memoryModel1, memoryModel2);

    @BeforeEach
    void setup() {
        memoryRepository.deleteAll();
        memoryRepository.saveAll(List.of(memoryModel1, memoryModel2));
    }

    @Test
    void getActiveMemories() {
        // Given
        List<MemoryModel> activeMemories = List.of(memoryModel1);
        when(memoryRepository.findAll()).thenReturn(memories);

        // When
        List<MemoryModel> expected = memoryService.getActiveMemories();

        // Then
        assertEquals(expected, activeMemories);
    }

    @Test
    void getAllMemories() {
        // Given
        when(memoryRepository.findAll()).thenReturn(memories);

        // When
        List<MemoryModel> expected = memoryService.getAllMemories();

        // Then
        assertEquals(expected, memories);
    }

    @Test
    void getMemoryById() {
        // Given
        when(memoryRepository.findById("1")).thenReturn(Optional.of(memoryModel1));

        // When
        MemoryModel expected = memoryService.getMemoryById("1");

        // Then
        assertNotNull(expected);
        assertEquals(expected, memoryModel1);
    }

    @Test
    void addMemory() {
        // Given
        MemoryModel memoryModel3 = new MemoryModel(
                "3",
                "Cloudinary Erinnerung Nr3",
                103,
                Category.CLOUDINARY_IMAGE,
                "Eine Erinnerung, die mit einem Cloudinary-Bild gespeichert ist",
                false,
                "github456",
                "user2",
                "https://avatars.example.com/user2.png",
                "https://github.com/user2",
                "https://example.com/image2.jpg"
        );

        when(idService.generateRandomId()).thenReturn("3");
        when(memoryRepository.save(memoryModel3)).thenReturn(memoryModel3);

        MemoryModel expected = memoryService.addMemory(memoryModel3);

        assertEquals(memoryModel3, expected);
    }

    @Test
    void updateMemoryWithPut() {
        // Given
        MemoryModel existingMemory = new MemoryModel(
                "3",
                "Cloudinary Erinnerung Nr3",
                103,
                Category.CLOUDINARY_IMAGE,
                "Eine Erinnerung, die mit einem Cloudinary-Bild gespeichert ist",
                false,
                "github456",
                "user2",
                "https://avatars.example.com/user2.png",
                "https://github.com/user2",
                "https://example.com/image2.jpg"
        );

        MemoryModel updatedMemory = new MemoryModel(
                "3",
                existingMemory.name(),
                existingMemory.matchId(),
                existingMemory.category(),
                existingMemory.description(),
                true,
                existingMemory.appUserGithubId(),
                existingMemory.appUserUsername(),
                existingMemory.appUserAvatarUrl(),
                existingMemory.appUserGithubUrl(),
                existingMemory.imageUrl()
        );

        when(memoryRepository.existsById("3")).thenReturn(true);
        when(memoryRepository.save(any(MemoryModel.class))).thenReturn(updatedMemory);

        // When
        MemoryModel expected = memoryService.updateMemoryWithPut("3", updatedMemory);

        // Then
        assertEquals(updatedMemory, expected);
        verify(memoryRepository, times(1)).existsById("3");
        verify(memoryRepository, times(1)).save(updatedMemory);
    }

    @Test
    void deleteMemory() {
        // Given
        when(memoryRepository.findById("1")).thenReturn(Optional.of(memoryModel1));

        // When
        memoryService.deleteMemory("1");

        // Then
        verify(memoryRepository, times(1)).deleteById("1");
    }

    @Test
    void getMemoriesByIds() {
        // Given
        List<String> memoryIds = List.of("1", "2");
        when(memoryRepository.findAllById(memoryIds)).thenReturn(memories);

        // When
        List<MemoryModel> expected = memoryService.getMemoriesByIds(memoryIds);

        // Then
        assertEquals(expected, memories);
    }

    @Test
    void toggleMemoryActive() {
        // Given
        MemoryModel existingMemory = new MemoryModel(
                "3",
                "Cloudinary Erinnerung Nr3",
                103,
                Category.CLOUDINARY_IMAGE,
                "Eine Erinnerung, die mit einem Cloudinary-Bild gespeichert ist",
                false,
                "github456",
                "user2",
                "https://avatars.example.com/user2.png",
                "https://github.com/user2",
                "https://example.com/image2.jpg"
        );

        MemoryModel updatedMemory = new MemoryModel(
                "3",
                existingMemory.name(),
                existingMemory.matchId(),
                existingMemory.category(),
                existingMemory.description(),
                true,
                existingMemory.appUserGithubId(),
                existingMemory.appUserUsername(),
                existingMemory.appUserAvatarUrl(),
                existingMemory.appUserGithubUrl(),
                existingMemory.imageUrl()
        );

        when(memoryRepository.findById("3")).thenReturn(Optional.of(existingMemory));
        when(memoryRepository.save(any(MemoryModel.class))).thenReturn(updatedMemory);

        // When
        MemoryModel expected = memoryService.toggleMemoryActive("3");

        // Then
        assertEquals(updatedMemory, expected);
        verify(memoryRepository, times(1)).findById("3");
        verify(memoryRepository, times(1)).save(updatedMemory);
    }

    @Test
    void addMemoryAvatar() {
        // Given
        MemoryModel memoryModel3 = new MemoryModel(
                "3", // Wird durch idService.generateRandomId() überschrieben
                "Cloudinary Erinnerung Nr3",
                103,
                Category.CLOUDINARY_IMAGE,
                "Eine Erinnerung, die mit einem Cloudinary-Bild gespeichert ist",
                false,
                "github456",
                "user2",
                "https://avatars.example.com/user2.png",
                "https://github.com/user2",
                "https://example.com/image2.jpg"
        );

        // Simuliere die Generierung einer neuen ID
        when(idService.generateRandomId()).thenReturn("3");

        // Simuliere das Speichern des memoryModel3
        when(memoryRepository.save(any(MemoryModel.class))).thenReturn(memoryModel3);

        // When
        MemoryModel expected = memoryService.addMemoryAvatar(memoryModel3);

        // Then
        assertEquals(memoryModel3, expected);
        verify(idService, times(1)).generateRandomId(); // Verifizieren, dass eine neue ID generiert wurde
        verify(memoryRepository, times(1)).save(any(MemoryModel.class)); // Verifizieren, dass das Modell gespeichert wurde
    }

    @Test
    void updateMemoryAvatar_Success() {
        // Given
        MemoryModel existingMemory = new MemoryModel(
                "3",
                "Cloudinary Erinnerung Nr3",
                103,
                Category.CLOUDINARY_IMAGE,
                "Eine Erinnerung, die mit einem Cloudinary-Bild gespeichert ist",
                false,
                "github456",
                "user2",
                "https://avatars.example.com/user2.png",
                "https://github.com/user2",
                "https://example.com/image2.jpg"
        );

        MemoryModel updatedMemory = new MemoryModel(
                "3",
                existingMemory.name(),
                existingMemory.matchId(),
                existingMemory.category(),
                existingMemory.description(),
                true,
                existingMemory.appUserGithubId(),
                existingMemory.appUserUsername(),
                existingMemory.appUserAvatarUrl(),
                existingMemory.appUserGithubUrl(),
                existingMemory.imageUrl()
        );

        // Simuliere, dass das Memory mit der ID "3" existiert
        when(memoryRepository.existsById("3")).thenReturn(true);
        // Simuliere das Speichern des aktualisierten Memory
        when(memoryRepository.save(any(MemoryModel.class))).thenReturn(updatedMemory);

        // When
        MemoryModel result = memoryService.updateMemoryAvatar("3", updatedMemory);

        // Then
        assertEquals(updatedMemory, result);
        verify(memoryRepository, times(1)).existsById("3"); // Verifizieren, dass überprüft wurde, ob das Memory existiert
        verify(memoryRepository, times(1)).save(updatedMemory); // Verifizieren, dass das Memory gespeichert wurde
    }

    @Test
    void updateMemoryAvatar_MemoryNotFoundException() {
        // Given
        MemoryModel updatedMemory = new MemoryModel(
                "4", // ID die nicht existiert
                "Cloudinary Erinnerung Nr4",
                104,
                Category.CLOUDINARY_IMAGE,
                "Eine Erinnerung, die mit einem Cloudinary-Bild gespeichert ist",
                false,
                "github789",
                "user3",
                "https://avatars.example.com/user3.png",
                "https://github.com/user3",
                "https://example.com/image3.jpg"
        );

        // Simuliere, dass das Memory mit der ID "4" nicht existiert
        when(memoryRepository.existsById("4")).thenReturn(false);

        // When / Then
        Exception exception = assertThrows(MemoryNotFoundException.class, () -> {
            memoryService.updateMemoryAvatar("4", updatedMemory);
        });

        assertEquals("No Memory found with ID: 4", exception.getMessage());
        verify(memoryRepository, times(1)).existsById("4"); // Verifizieren, dass überprüft wurde, ob das Memory existiert
        verify(memoryRepository, times(0)).save(any(MemoryModel.class)); // Verifizieren, dass der Speicher-Mechanismus nicht aufgerufen wurde
    }

    @Test
    void getMemoriesByMatchId_Success() {
        // Given
        MemoryModel memoryModel1 = new MemoryModel(
                "1",
                "Avatar Erinnerung 1",
                101,
                Category.GITHUB_AVATAR,
                "Eine Erinnerung mit einem GitHub-Avatar",
                true,
                "github123",
                "user1",
                "https://avatars.example.com/user1.png",
                "https://github.com/user1",
                "https://example.com/image1.jpg"
        );

        MemoryModel memoryModel2 = new MemoryModel(
                "2",
                "Cloudinary Erinnerung 2",
                102,
                Category.CLOUDINARY_IMAGE,
                "Eine Erinnerung mit einem Cloudinary-Bild",
                false,
                "github456",
                "user2",
                "https://avatars.example.com/user2.png",
                "https://github.com/user2",
                "https://example.com/image2.jpg"
        );

        MemoryModel memoryModel3 = new MemoryModel(
                "3",
                "GitHub Avatar Erinnerung 3",
                101,
                Category.GITHUB_AVATAR,
                "Eine weitere Erinnerung mit einem GitHub-Avatar",
                true,
                "github789",
                "user3",
                "https://avatars.example.com/user3.png",
                "https://github.com/user3",
                "https://example.com/image3.jpg"
        );

        List<MemoryModel> allMemories = List.of(memoryModel1, memoryModel2, memoryModel3);

        // Simuliere, dass alle Memories aus dem Repository abgerufen werden
        when(memoryRepository.findAll()).thenReturn(allMemories);

        // When
        List<MemoryModel> memoriesByMatchId = memoryService.getMemoriesByMatchId(101);

        // Then
        List<MemoryModel> expectedMemories = List.of(memoryModel1, memoryModel3);
        assertEquals(expectedMemories, memoriesByMatchId);
        verify(memoryRepository, times(1)).findAll(); // Verifizieren, dass alle Erinnerungen abgerufen wurden
    }

    @Test
    void getMemoriesByMatchId_EmptyResult() {
        // Given
        MemoryModel memoryModel1 = new MemoryModel(
                "1",
                "Avatar Erinnerung 1",
                101,
                Category.GITHUB_AVATAR,
                "Eine Erinnerung mit einem GitHub-Avatar",
                true,
                "github123",
                "user1",
                "https://avatars.example.com/user1.png",
                "https://github.com/user1",
                "https://example.com/image1.jpg"
        );

        List<MemoryModel> allMemories = List.of(memoryModel1);

        // Simuliere, dass alle Memories aus dem Repository abgerufen werden
        when(memoryRepository.findAll()).thenReturn(allMemories);

        // When
        List<MemoryModel> memoriesByMatchId = memoryService.getMemoriesByMatchId(999); // Eine nicht existierende matchId

        // Then
        List<MemoryModel> expectedMemories = List.of(); // Keine Memories sollten zurückgegeben werden
        assertEquals(expectedMemories, memoriesByMatchId);
        verify(memoryRepository, times(1)).findAll(); // Verifizieren, dass alle Erinnerungen abgerufen wurden
    }

}

