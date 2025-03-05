package ropold.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import ropold.backend.model.HighScoreModel;
import ropold.backend.repository.HighScoreRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HighScoreService {

    private final HighScoreRepository highScoreRepository;
    private final IdService idService;

    public List<HighScoreModel> getAllHighScores() {
        // Verwende die findAll-Methode mit Sortierung nach scoreTime aufsteigend
        return highScoreRepository.findAll(Sort.by(Sort.Order.asc("scoreTime")));
    }

    public HighScoreModel addHighScore(HighScoreModel highScoreModel) {
        HighScoreModel newHighScoreModel = new HighScoreModel(
                idService.generateRandomId(),
                highScoreModel.playerName(),
                highScoreModel.appUserGithubId(),
                highScoreModel.matchId(),
                highScoreModel.numberOfCards(),
                highScoreModel.scoreTime(),
                LocalDateTime.now()
        );

        List<HighScoreModel> scoresForCategory = highScoreRepository.findByNumberOfCardsOrderByScoreTimeAsc(newHighScoreModel.numberOfCards());

        if (scoresForCategory.size() >= 10) {
            // Falls es schon 10 Einträge gibt, lösche den schlechtesten (höchste scoreTime)
            Optional<HighScoreModel> worstScore = scoresForCategory.stream()
                    .max((s1, s2) -> Double.compare(s1.scoreTime(), s2.scoreTime()));

            worstScore.ifPresent(score -> highScoreRepository.deleteById(score.id()));
        }

        // Speichere den neuen HighScore
        return highScoreRepository.save(newHighScoreModel);
    }

    public void deleteHighScore(String id) {
        highScoreRepository.deleteById(id);
    }
}
