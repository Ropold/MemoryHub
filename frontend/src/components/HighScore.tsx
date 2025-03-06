import { HighScoreModel } from "./model/HighScoreModel.ts";

type HighScoreProps = {
    highScores10: HighScoreModel[];
    highScores20: HighScoreModel[];
    highScores32: HighScoreModel[];
}

export default function HighScore(props: Readonly<HighScoreProps>) {
    return (
        <div className="high-score">
            <h2>High Score</h2>
            <p>Here you can see the high score of the players!</p>
            <table>
                <thead>
                <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Score</th>
                </tr>
                </thead>
                <tbody>
                {props.highScores32.map((highScore, index) => (
                    <tr key={highScore.id}>
                        <td>{index + 1}</td>
                        <td>{highScore.playerName}</td>
                        <td>{highScore.scoreTime}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
