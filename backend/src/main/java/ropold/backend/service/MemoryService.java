package ropold.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ropold.backend.exception.MemoryNotFoundException;
import ropold.backend.model.MemoryModel;
import ropold.backend.repository.MemoryRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MemoryService {

    private final IdService idService;
    private final MemoryRepository memoryRepository;
    private final CloudinaryService cloudinaryService;

    public List<MemoryModel> getAllMemories() {
        return memoryRepository.findAll();
    }


    public List<MemoryModel> getActiveMemories() {
        return memoryRepository.findAll().stream()
                .filter(MemoryModel::isActive)
                .toList();
    }

    public MemoryModel getMemoryById(String id) {
        return memoryRepository.findById(id).orElseThrow(() -> new MemoryNotFoundException("No Memory found with id: " + id));
    }

    public MemoryModel addMemory(MemoryModel memoryModel) {
        MemoryModel newMemoryModel = new MemoryModel(
                idService.generateRandomId(),
                memoryModel.name(),
                memoryModel.matchId(),
                memoryModel.category(),
                memoryModel.description(),
                memoryModel.isActive(),
                memoryModel.appUserGithubId(),
                memoryModel.appUserUsername(),
                memoryModel.appUserAvatarUrl(),
                memoryModel.appUserGithubUrl(),
                memoryModel.imageUrl()
        );
        return memoryRepository.save(newMemoryModel);
    }

    public MemoryModel updateMemoryWithPut(String id, MemoryModel memoryModel) {
        if(memoryRepository.existsById(id)) {
            MemoryModel updatedMemoryModel = new MemoryModel(
                    id,
                    memoryModel.name(),
                    memoryModel.matchId(),
                    memoryModel.category(),
                    memoryModel.description(),
                    memoryModel.isActive(),
                    memoryModel.appUserGithubId(),
                    memoryModel.appUserUsername(),
                    memoryModel.appUserAvatarUrl(),
                    memoryModel.appUserGithubUrl(),
                    memoryModel.imageUrl()
            );
            return memoryRepository.save(updatedMemoryModel);
        } else {
            throw new MemoryNotFoundException("No Memory found with the Put-Id:" + id);
        }
    }

    public void deleteMemory(String id) {
        MemoryModel memoryModel = memoryRepository.findById(id)
                .orElseThrow(() -> new MemoryNotFoundException("No Memory found with ID: " + id));

        if(memoryModel.imageUrl() != null) {
            cloudinaryService.deleteImage(memoryModel.imageUrl());
        }
        memoryRepository.deleteById(id);
    }

    public List<MemoryModel> getMemoriesByIds(List<String> memoryIds) {
        return memoryRepository.findAllById(memoryIds);
    }


    public MemoryModel toggleMemoryActive(String id) {
        MemoryModel memory = memoryRepository.findById(id)
                .orElseThrow(() -> new MemoryNotFoundException("No Memory found with id: " + id));

        MemoryModel updatedMemoryModel = new MemoryModel(
                id,
                memory.name(),
                memory.matchId(),
                memory.category(),
                memory.description(),
                !memory.isActive(),
                memory.appUserGithubId(),
                memory.appUserUsername(),
                memory.appUserAvatarUrl(),
                memory.appUserGithubUrl(),
                memory.imageUrl()
        );
        return memoryRepository.save(updatedMemoryModel);
    }

    public MemoryModel addMemoryAvatar(MemoryModel memoryModel) {
        memoryModel = new MemoryModel(
                idService.generateRandomId(),
                memoryModel.name(),
                memoryModel.matchId(),
                memoryModel.category(),
                memoryModel.description(),
                memoryModel.isActive(),
                memoryModel.appUserGithubId(),
                memoryModel.appUserUsername(),
                memoryModel.appUserAvatarUrl(),
                memoryModel.appUserGithubUrl(),
                memoryModel.imageUrl()
        );
        return memoryRepository.save(memoryModel);
    }

    public MemoryModel updateMemoryAvatar(String id, MemoryModel memoryModel) {
        if (!memoryRepository.existsById(id)) {
            throw new MemoryNotFoundException("No Memory found with ID: " + id);
        }

        MemoryModel updatedMemoryModel = new MemoryModel(
                id,
                memoryModel.name(),
                memoryModel.matchId(),
                memoryModel.category(),
                memoryModel.description(),
                memoryModel.isActive(),
                memoryModel.appUserGithubId(),
                memoryModel.appUserUsername(),
                memoryModel.appUserAvatarUrl(),
                memoryModel.appUserGithubUrl(),
                memoryModel.imageUrl()
        );
        return memoryRepository.save(updatedMemoryModel);
    }


    //Only Used in Tests
    public List<MemoryModel> getMemoriesByMatchId(int matchId) {
        return memoryRepository.findAll().stream()
                .filter(memory -> memory.matchId() == matchId)
                .toList();
    }

    public List<MemoryModel> getActiveMemoriesFilterByMatchId(int numberOfMatchId) {
        return memoryRepository.findAll().stream()
                .filter(memory -> memory.isActive() && memory.matchId() == numberOfMatchId)
                .toList();
    }

    public List<MemoryModel> getMemoriesForGithubUser(String githubId) {
        return memoryRepository.findAll().stream()
                .filter(memory -> githubId.equals(memory.appUserGithubId()))
                .toList();
    }

    public List<Integer> getActiveMemoriesMatchIds() {
        return memoryRepository.findAll().stream()  // Alle MemoryModel-Objekte laden
                .filter(MemoryModel::isActive)  // Nur aktive Einträge filtern
                .map(MemoryModel::matchId)  // matchId extrahieren
                .distinct()  // Duplikate entfernen
                .sorted()  // Sortieren
                .toList();  // Mit Stream.toList() die Liste zurückgeben
    }

}
