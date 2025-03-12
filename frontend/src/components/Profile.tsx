import { UserDetails } from "./model/UserDetailsModel.ts";
import "./styles/Profile.css";
import { HighScoreModel } from "./model/HighScoreModel.ts";
import { useEffect, useState } from "react";

type ProfileProps = {
    user: string;
    userDetails: UserDetails | null;
    highScores10: HighScoreModel[];
    highScores20: HighScoreModel[];
    highScores32: HighScoreModel[];
    getHighScoresFor10Cards: () => void;
    getHighScoresFor20Cards: () => void;
    getHighScoresFor32Cards: () => void;
};

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

// Funktion zur Berechnung der Ränge
const calculateRanks = (scores: HighScoreModel[], userId: string) => {
    const sortedScores = [...scores].sort((a, b) => a.scoreTime - b.scoreTime);
    return sortedScores
        .map((score, index) => ({ id: score.id, rank: index + 1 }))
        .filter((ranked) => scores.find((s) => s.id === ranked.id)?.appUserGithubId === userId);
};

export default function Profile(props: Readonly<ProfileProps>) {
    const [userHighScores, setUserHighScores] = useState<HighScoreModel[]>([]);
    const [userRanks, setUserRanks] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        props.getHighScoresFor10Cards();
        props.getHighScoresFor20Cards();
        props.getHighScoresFor32Cards();
    }, []);

    useEffect(() => {
        if (props.userDetails) {
            // Alle Highscores des Users filtern
            const filteredHighScores = [
                ...props.highScores10,
                ...props.highScores20,
                ...props.highScores32,
            ].filter((score) => score.appUserGithubId === props.user);

            setUserHighScores(filteredHighScores);

            // Ränge für jede Kartenanzahl berechnen
            const ranks10 = calculateRanks(props.highScores10, props.user);
            const ranks20 = calculateRanks(props.highScores20, props.user);
            const ranks32 = calculateRanks(props.highScores32, props.user);

            // In ein Objekt speichern (id -> rank)
            const rankMap: { [key: string]: number } = {};
            [...ranks10, ...ranks20, ...ranks32].forEach((rank) => {
                rankMap[rank.id] = rank.rank;
            });

            setUserRanks(rankMap);
        }
    }, [props.highScores10, props.highScores20, props.highScores32, props.userDetails]);

    return (
        <div className="profile-container">
            {/* Highscore-Tabelle */}
            <div className="high-score-table">
                <h3>Highscores by {props.userDetails?.login}</h3>
                {userHighScores.length > 0 ? (
                    <div>
                        <table>
                            <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Number of Cards</th>
                                <th>My HighScore Names</th>
                                <th>Date</th>
                                <th>Game-Deck</th>
                                <th>Time</th>
                            </tr>
                            </thead>
                            <tbody>
                            {userHighScores.map((highScore) => (
                                <tr key={highScore.id}>
                                    <td>{userRanks[highScore.id] ?? "-"}</td>
                                    <td>{highScore.numberOfCards} Cards</td>
                                    <td>{highScore.playerName}</td>
                                    <td>{formatDate(highScore.date)}</td>
                                    <td>{highScore.matchId}</td>
                                    <td>{highScore.scoreTime}s</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No high scores available for this user.</p>
                )}
            </div>

            {/* GitHub-Profil */}
            <h2>GitHub Profile</h2>
            {props.userDetails ? (
                <div>
                    <p>Username: {props.userDetails.login}</p>
                    <p>Name: {props.userDetails.name || "No name provided"}</p>
                    <p>Location: {props.userDetails.location ?? "No location provided"}</p>
                    {props.userDetails.bio && <p>Bio: {props.userDetails.bio}</p>}
                    <p>Followers: {props.userDetails.followers}</p>
                    <p>Following: {props.userDetails.following}</p>
                    <p>Public Repositories: {props.userDetails.public_repos}</p>
                    <p>
                        GitHub Profile:{" "}
                        <a href={props.userDetails.html_url} target="_blank" rel="noopener noreferrer">
                            Visit Profile
                        </a>
                    </p>
                    <img src={props.userDetails.avatar_url} alt={`${props.userDetails.login}'s avatar`} />
                    <p>Account Created: {new Date(props.userDetails.created_at).toLocaleDateString()}</p>
                    <p>Last Updated: {new Date(props.userDetails.updated_at).toLocaleDateString()}</p>
                </div>
            ) : (
                <p className="loading">Loading...</p>
            )}
        </div>
    );
}
