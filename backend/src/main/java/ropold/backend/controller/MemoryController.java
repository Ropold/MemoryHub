package ropold.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ropold.backend.model.MemoryModel;
import ropold.backend.model.MemoryModelDto;
import ropold.backend.service.MemoryService;

import java.util.List;

@RestController
@RequestMapping("/api/memory-hub")
@RequiredArgsConstructor
public class MemoryController {

    private final MemoryService memoryService;

    @GetMapping()
    public List<MemoryModel> getAllMemories() {
        return memoryService.getAllMemories();
    }

    @PostMapping()
    public MemoryModel addMemory(@RequestBody MemoryModelDto memoryModelDto) {
        return memoryService.addMemory(
                new MemoryModel(
                        null,
                        memoryModelDto.name(),
                        memoryModelDto.matchId(),
                        memoryModelDto.category(),
                        memoryModelDto.description(),
                        memoryModelDto.isActive(),
                        memoryModelDto.appUserGithubId(),
                        memoryModelDto.appUserUsername(),
                        memoryModelDto.appUserAvatarUrl(),
                        memoryModelDto.appUserGithubUrl(),
                        memoryModelDto.imageUrl()
                ));
    }

}


