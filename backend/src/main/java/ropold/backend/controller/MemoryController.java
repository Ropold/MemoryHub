package ropold.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ropold.backend.model.MemoryModel;
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
    public MemoryModel addMemory(MemoryModel memoryModel) {
        return memoryService.addMemory(memoryModel);
    }

}
