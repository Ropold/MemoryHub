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

    public List<HighScoreModel> getAllHighScores() {
        return highScoreRepository.findAll();
    }

    public HighScoreModel addHighScore(HighScoreModel highScoreModel) {
        HighScoreModel newHighScoreModel = new HighScoreModel(
                idService.generateRandomId(),
                highScoreModel.playerName(),
                highScoreModel.appUserGithubId(),
                highScoreModel.matchId(),
                highScoreModel.numberOfCards(),
                highScoreModel.scoreTime(),
                LocalDateTime.now(),
                highScoreModel.position()
        );

        return highScoreRepository.save(newHighScoreModel);
    }
}
