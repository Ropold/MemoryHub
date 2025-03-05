package ropold.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ropold.backend.model.HighScoreModel;
import ropold.backend.repository.HighScoreRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HighScoreService {

    private final HighScoreRepository highScoreRepository;
    private final IdService idService;

    public List<HighScoreModel> getBestHighScoresForCards(int numberOfCards) {
        // Holen Sie sich die besten 10 Highscores für die angegebene Kartenanzahl, sortiert nach scoreTime
        return highScoreRepository.findTop10ByNumberOfCardsOrderByScoreTimeAsc(numberOfCards);
    }

    public HighScoreModel addHighScore(HighScoreModel highScoreModel) {
        // Erstelle das neue HighScoreModel mit einer neuen ID und aktuellen Zeitstempel
        HighScoreModel newHighScoreModel = new HighScoreModel(
                idService.generateRandomId(),
                highScoreModel.playerName(),
                highScoreModel.appUserGithubId(),
                highScoreModel.matchId(),
                highScoreModel.numberOfCards(),
                highScoreModel.scoreTime(),
                LocalDateTime.now()
        );

        // Finde die besten 10 Highscores für diese Kartenanzahl
        List<HighScoreModel> scoresForCategory = highScoreRepository.findTop10ByNumberOfCardsOrderByScoreTimeAsc(newHighScoreModel.numberOfCards());

        // Überprüfe, ob der neue Highscore eine bessere Zeit als der schlechteste Highscore hat
        if (scoresForCategory.size() >= 10 && newHighScoreModel.scoreTime() > scoresForCategory.get(9).scoreTime()) {
            // Wenn der neue Highscore schlechter ist als der schlechteste der aktuellen Top 10, wird er nicht gespeichert
            return null;
        }

        // Wenn schon 10 Einträge existieren, lösche den schlechtesten (höchste scoreTime)
        if (scoresForCategory.size() >= 10) {
            // Der schlechteste Eintrag ist der letzte, wenn die Liste nach scoreTime aufsteigend sortiert ist
            HighScoreModel worstScore = scoresForCategory.get(9); // Der 10. Eintrag in einer Liste mit maximal 10 Einträgen
            highScoreRepository.deleteById(worstScore.id());
        }

        // Speichere das neue HighScore
        return highScoreRepository.save(newHighScoreModel);
    }


    public void deleteHighScore(String id) {
        highScoreRepository.deleteById(id);
    }
}
