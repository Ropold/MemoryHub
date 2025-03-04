package ropold.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import ropold.backend.model.HighScoreModel;

@Repository
public interface HighScoreRepository extends MongoRepository<HighScoreModel, String> {
}
