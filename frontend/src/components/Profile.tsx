
type ProfileProps = {
    user: string;
}

export default function Profile(props: Readonly<ProfileProps>) {
    return (
        <div>
            <h2>Profile</h2>
            <p><strong>User: </strong>{props.user}</p>
        </div>
    );
}