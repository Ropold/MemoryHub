package ropold.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ropold.backend.model.MemoryModel;
import ropold.backend.repository.MemoryRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MemoryService {

    private final IdService idService;
    private final MemoryRepository memoryRepository;

    public List<MemoryModel> getAllMemories() {
        return memoryRepository.findAll();
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

}
