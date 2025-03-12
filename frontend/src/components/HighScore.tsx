import { HighScoreModel } from "./model/HighScoreModel.ts";
import "./styles/HighScore.css";
import { useEffect, useState } from "react";
import axios from "axios";

type HighScoreProps = {
    highScores10: HighScoreModel[];
    highScores20: HighScoreModel[];
    highScores32: HighScoreModel[];
    getHighScoresFor10Cards: () => void;
    getHighScoresFor20Cards: () => void;
    getHighScoresFor32Cards: () => void;
};

const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    };
    return new Date(date).toLocaleDateString("de-DE", options);
};

export default function HighScore(props: Readonly<HighScoreProps>) {
    const [selectedTable, setSelectedTable] = useState<string | null>(null); // Track which table is selected
    const [githubUsernames, setGithubUsernames] = useState<Map<string, string>>(new Map());

    function fetchGithubUsernames(highScores: HighScoreModel[]) {
        const uniqueIds = new Set(
            highScores
                .filter(score => score.appUserGithubId !== "anonymousUser")
                .map(score => score.appUserGithubId)
        );

        const newUsernames = new Map(githubUsernames);

        uniqueIds.forEach(async (id) => {
            if (!newUsernames.has(id)) {
                axios.get(`https://api.github.com/user/${id}`)
                    .then((response) => {
                        newUsernames.set(id, response.data.login);
                        setGithubUsernames(new Map(newUsernames)); // State aktualisieren
                    })
                    .catch((error) => {
                        console.error(`Error fetching GitHub user ${id}:`, error);
                    });
            }
        });
    }

    useEffect(() => {
        fetchGithubUsernames([...props.highScores10, ...props.highScores20, ...props.highScores32]);
    }, [props.highScores10, props.highScores20, props.highScores32]);

    useEffect(() => {
        props.getHighScoresFor10Cards();
        props.getHighScoresFor20Cards();
        props.getHighScoresFor32Cards();
    }, []);

    // Function to select the table
    const handleTableSelect = (tableId: string) => {
        setSelectedTable(tableId);
    };

    // Function to go back to the compressed view
    const handleBack = () => {
        setSelectedTable(null);
    };

    const renderCompressedTable = (highScores: HighScoreModel[], cardType: string) => (
        <div className="high-score-table-compressed" onClick={() => handleTableSelect(cardType)}>
            <h3 className="high-score-table-compressed-h3">{cardType} Cards High-Score</h3>
            <table>
                <thead>
                <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Time</th>
                </tr>
                </thead>
                <tbody>
                {highScores.map((highScore, index) => (
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

    const renderDetailedTable = (highScores: HighScoreModel[], cardType: string, isSelected: boolean) => {
        if (!isSelected) return null; // Only render the selected table

        return (
            <div className="high-score-table">
                <h3 className="high-score-table-h3">{cardType} Cards High-Score</h3>
                <table>
                    <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player-Name</th>
                        <th>Date</th>
                        <th>Game Deck</th>
                        <th>Authentication</th>
                        <th>Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {highScores.map((highScore, index) => (
                        <tr key={highScore.id}>
                            <td>{index + 1}</td>
                            <td>{highScore.playerName}</td>
                            <td>{formatDate(highScore.date)}</td>
                            <td>{highScore.matchId}</td>
                            <td>
                                {highScore.appUserGithubId === "anonymousUser"
                                    ? "Anonymous"
                                    : `Github-User (${githubUsernames.get(highScore.appUserGithubId) || "Loading..."})`}
                            </td>
                            <td>{highScore.scoreTime}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="high-score">

            {/* Highscore Tables */}
            <div className={selectedTable === null ? 'high-score-item-container-compressed' : 'high-score-item-container-detailed'}>
                {selectedTable === null ? (
                    <>
                        {renderCompressedTable(props.highScores10, "10")}
                        {renderCompressedTable(props.highScores20, "20")}
                        {renderCompressedTable(props.highScores32, "32")}
                    </>
                ) : (
                    <>
                        {renderDetailedTable(props.highScores10, "10", selectedTable === "10")}
                        {renderDetailedTable(props.highScores20, "20", selectedTable === "20")}
                        {renderDetailedTable(props.highScores32, "32", selectedTable === "32")}
                    </>
                )}
            </div>
            {/* Show detailed view or compressed view */}
            {selectedTable !== null && (
                <button onClick={handleBack} className="button-group-button">Back to Overview</button>
            )}
        </div>
    );
}
