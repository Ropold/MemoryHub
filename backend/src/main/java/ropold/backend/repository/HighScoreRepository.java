package ropold.backend.repository;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import ropold.backend.model.HighScoreModel;

import java.util.List;

@Repository
public interface HighScoreRepository extends MongoRepository<HighScoreModel, String> {

    // Finde alle Highscores für eine bestimmte Kartenanzahl, sortiert nach scoreTime aufsteigend
    List<HighScoreModel> findByNumberOfCardsOrderByScoreTimeAsc(int numberOfCards);

    // Finde alle Highscores und sortiere sie nach scoreTime aufsteigend
    List<HighScoreModel> findAll(Sort sort);
}
