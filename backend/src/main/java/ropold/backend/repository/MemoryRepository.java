package ropold.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import ropold.backend.model.MemoryModel;

@Repository
public interface MemoryRepository extends MongoRepository<MemoryModel, String> {
}
