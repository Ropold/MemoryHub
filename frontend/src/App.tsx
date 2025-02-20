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
import Profile from "./components/Profile.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AddMemoryCard from "./components/AddMemoryCard.tsx";
import MyMemories from "./components/MyMemories.tsx";
import {UserDetails} from "./components/model/UserDetailsModel.ts";
import Details from "./components/Details.tsx";

export default function App() {

    const [user, setUser] = useState<string>("anonymousUser");
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [activeMemories, setActiveMemories] = useState<MemoryModel[]>([]);
    const [allMemories, setAllMemories] = useState<MemoryModel[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);


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

    function getUserDetails() {
        axios.get("/api/users/me/details")
            .then((response) => {
                setUserDetails(response.data as UserDetails);
            })
            .catch((error) => {
                console.error(error);
                setUserDetails(null);
            });
    }

    function getAppUserFavorites(){
        axios.get(`/api/memory-hub/favorites`)
            .then((response) => {
                const favoriteIds = response.data.map((favorite: any) => favorite.id);
                setFavorites(favoriteIds);
            })
            .catch((error) => {
                console.error(error);
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

    const getAllMemories = () => {
        axios
            .get("/api/memory-hub")
            .then((response) => {
                setAllMemories(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function toggleFavorite(memoryId: string) {
        const isFavorite = favorites.includes(memoryId);

        if (isFavorite) {
            axios.delete(`/api/memory-hub/favorites/${memoryId}`)
                .then(() => {
                    setFavorites((prevFavorites) =>
                        prevFavorites.filter((id) => id !== memoryId)
                    );
                })
                .catch((error) => console.error(error));
        } else {
            axios.post(`/api/memory-hub/favorites/${memoryId}`)
                .then(() => {
                    setFavorites((prevFavorites) => [...prevFavorites, memoryId]);
                })
                .catch((error) => console.error(error));
        }
    }

    const handleNewMemorySubmit = (newMemory: MemoryModel) => {
        setAllMemories((prevMemories) => [...prevMemories, newMemory]);
    }

    useEffect(() => {
        getUser();
        getActiveMemories();
    }, []);

    useEffect(() => {
        if (user !== "anonymousUser") {
            getUserDetails();
            getAllMemories();
            getAppUserFavorites();
        }
    }, [user]);

  return (
    <>
      <Navbar
        user={user}
        getUser={getUser}
      />
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Home activeMemories={activeMemories} toggleFavorite={toggleFavorite} favorites={favorites} user={user}/>} />
        <Route path="/play" element={<Play activeMemories={activeMemories} />} />
        <Route path="/memory/:id" element={<Details allMemories={allMemories} />} />

        <Route element={<ProtectedRoute user={user} />}>
            <Route path="/my-memories" element={<MyMemories user={user} favorites={favorites} toggleFavorite={toggleFavorite} allMemories={allMemories} setAllMemories={setAllMemories}/>} />
            <Route path="/add" element={<AddMemoryCard userDetails={userDetails} handleSubmit={handleNewMemorySubmit} />} />
            <Route path="/profile" element={<Profile userDetails={userDetails} />} />
        </Route>
      </Routes>
      <Footer />
    </>
  )
}


