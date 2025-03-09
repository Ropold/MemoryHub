import { HighScoreModel } from "./model/HighScoreModel.ts";
import "./styles/HighScore.css";

type HighScoreProps = {
    highScores10: HighScoreModel[];
    highScores20: HighScoreModel[];
    highScores32: HighScoreModel[];
}

const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };
    return new Date(date).toLocaleDateString('de-DE', options);
};

export default function HighScore(props: Readonly<HighScoreProps>) {
    return (
        <div className="high-score">
            {/* High Scores Table Container */}
            <div className="high-score-item-container">

                {/* Top 10 High Scores Table */}
                <div className="high-score-table">
                    <h3>10 Cards High-Score</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Date</th>
                            <th>Game-Deck</th>
                            <th>Time</th>
                        </tr>
                        </thead>
                        <tbody>
                        {props.highScores10.map((highScore, index) => (
                            <tr key={highScore.id}>
                                <td>{index + 1}</td>
                                <td>{highScore.playerName}</td>
                                <td>{formatDate(highScore.date)}</td>
                                <td>{highScore.matchId}</td>
                                <td>{highScore.scoreTime}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Top 20 High Scores Table */}
                <div className="high-score-table">
                    <h3>20 Cards High-Score</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Date</th>
                            <th>Game-Deck</th>
                            <th>Time</th>
                        </tr>
                        </thead>
                        <tbody>
                        {props.highScores20.map((highScore, index) => (
                            <tr key={highScore.id}>
                                <td>{index + 1}</td>
                                <td>{highScore.playerName}</td>
                                <td>{formatDate(highScore.date)}</td>
                                <td>{highScore.matchId}</td>
                                <td>{highScore.scoreTime}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Top 32 High Scores Table */}
                <div className="high-score-table">
                    <h3>32 Cards High-Score</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Date</th>
                            <th>Game-Deck</th>
                            <th>Time</th>
                        </tr>
                        </thead>
                        <tbody>
                        {props.highScores32.map((highScore, index) => (
                            <tr key={highScore.id}>
                                <td>{index + 1}</td>
                                <td>{highScore.playerName}</td>
                                <td>{formatDate(highScore.date)}</td>
                                <td>{highScore.matchId}</td>
                                <td>{highScore.scoreTime}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
