
type NavbarProps = {
    user: string
}

export default function Navbar(props: Readonly<NavbarProps>) {
    return (
        <nav>
            <h2>Navbar</h2>
            <p>User: {props.user}</p>
            <button>Button</button>
        </nav>
    );
}