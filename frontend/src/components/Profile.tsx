import { UserDetails } from "./model/UserDetailsModel.ts";
import "./styles/Profile.css";

type ProfileProps = {
    userDetails: UserDetails | null;
};

export default function Profile(props: Readonly<ProfileProps>) {

    return (
        <div className="profile-container">
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
                    <p>GitHub Profile: <a href={props.userDetails.html_url} target="_blank" rel="noopener noreferrer">Visit Profile</a></p>
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
