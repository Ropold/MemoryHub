import './App.css'
import Footer from "./components/Footer.tsx";
import Navbar from "./components/Navbar.tsx";
import {useEffect, useState} from "react";
import axios from "axios";

export default function App() {

    const [user, setUser] = useState<string>("anonymousUser");


    function getUser() {
        axios.get("/api/users/me")
            .then((response) => {
                setUser(response.data.toString());
            })
            .catch((error) => {
                console.error(error);
                setUser("anonymousUser");
            });
    }

    useEffect(() => {
        getUser();
    }, []);

  return (
    <>
      <Navbar
        user={user}
      />
      <h2>App</h2>
      <Footer />
    </>
  )
}


