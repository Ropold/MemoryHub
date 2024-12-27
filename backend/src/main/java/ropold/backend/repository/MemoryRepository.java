package ropold.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import ropold.backend.model.MemoryModel;

public interface MemoryRepository extends MongoRepository<MemoryModel, String> {
}
