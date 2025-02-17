import './App.css'
import Footer from "./components/Footer.tsx";
import Navbar from "./components/Navbar.tsx";
import {useEffect, useState} from "react";
import axios from "axios";
import {Route, Routes} from "react-router-dom";
import Home from "./components/Home.tsx";
import NotFound from "./components/NotFound.tsx";
import {MemoryModel} from "./components/model/MemoryModel.ts";
import Play from "./components/Play.tsx";

export default function App() {

    const [user, setUser] = useState<string>("anonymousUser");
    const [activeMemories, setActiveMemories] = useState<MemoryModel[]>([]);


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

    const getActiveMemories = () => {
        axios
            .get("/api/memory-hub/active")
            .then((response) => {
                setActiveMemories(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    useEffect(() => {
        getUser();
        getActiveMemories();
    }, []);

  return (
    <>
      <Navbar
        user={user}
        getUser={getUser}
      />
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Play activeMemories={activeMemories} />} />
      </Routes>
      <Footer />
    </>
  )
}


