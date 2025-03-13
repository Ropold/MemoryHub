import './App.css'
import Footer from "./components/Footer.tsx";
import Navbar from "./components/Navbar.tsx";
import {useEffect, useState} from "react";
import axios from "axios";
import {Route, Routes, useLocation} from "react-router-dom";
import ListOfAllCards from "./components/ListOfAllCards.tsx";
import NotFound from "./components/NotFound.tsx";
import {MemoryModel} from "./components/model/MemoryModel.ts";
import Play from "./components/Play.tsx";
import Profile from "./components/Profile.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AddMemoryCard from "./components/AddMemoryCard.tsx";
import MyMemories from "./components/MyMemories.tsx";
import {UserDetails} from "./components/model/UserDetailsModel.ts";
import Details from "./components/Details.tsx";
import Favorites from "./components/Favorites.tsx";
import Welcome from "./components/Welcome.tsx";
import HighScore from "./components/HighScore.tsx";
import {HighScoreModel} from "./components/model/HighScoreModel.ts";

export default function App() {

    const [user, setUser] = useState<string>("anonymousUser");
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [activeMemories, setActiveMemories] = useState<MemoryModel[]>([]);
    const [allMemories, setAllMemories] = useState<MemoryModel[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [highScores10, setHighScores10] = useState<HighScoreModel[]>([]);
    const [highScores20, setHighScores20] = useState<HighScoreModel[]>([]);
    const [highScores32, setHighScores32] = useState<HighScoreModel[]>([]);

    const resetCurrentPage = () => {
        setCurrentPage(1);
    };

    const resetEditingState = () => {
        setIsEditing(false);  // Der Zustand wird auf false gesetzt
    }

    const location = useLocation();

    const toggleSearchBar = () => {
        setShowSearch((prevState) => !prevState); // Toggle die Sichtbarkeit der Suchleiste// Setzt die Suchanfrage zurück
    };

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
        axios.get<MemoryModel[]>(`/api/memory-hub/favorites`)
            .then((response) => {
                const favoriteIds = response.data.map((memory) => memory.id);
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

    const getHighScoresFor10Cards = () => {
        axios
            .get("/api/high-score/10")
            .then((response) => {
                setHighScores10(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const getHighScoresFor20Cards = () => {
        axios
            .get("/api/high-score/20")
            .then((response) => {
                setHighScores20(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const getHighScoresFor32Cards = () => {
        axios
            .get("/api/high-score/32")
            .then((response) => {
                setHighScores32(response.data);
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
    }, []);

    useEffect(() => {
        if (user !== "anonymousUser") {
            getUserDetails();
            getAppUserFavorites();
        }
    }, [user]);

    useEffect(() => {
        window.scroll(0, 0);
    }, [location]);

  return (
    <>
      <Navbar userDetails={userDetails} getUserDetails={getUserDetails} user={user} getUser={getUser} getActiveMemories={getActiveMemories} toggleSearchBar={toggleSearchBar} showSearch={showSearch} resetCurrentPage={resetCurrentPage} resetEditingState={resetEditingState} getHighScoresFor10Cards={getHighScoresFor10Cards} getHighScoresFor20Cards={getHighScoresFor20Cards} getHighScoresFor32Cards={getHighScoresFor32Cards}/>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Welcome userDetails={userDetails}/>} />
        <Route path="/list-of-all-cards" element={<ListOfAllCards activeMemories={activeMemories} toggleFavorite={toggleFavorite} favorites={favorites} user={user} showSearch={showSearch} currentPage={currentPage} paginate={setCurrentPage}/>} />
        <Route path="/play" element={<Play highScores10={highScores10} highScores20={highScores20} highScores32={highScores32} user={user}/>} />
        <Route path="/memory/:id" element={<Details allMemories={allMemories} favorites={favorites} user={user} toggleFavorite={toggleFavorite}/>} />
        <Route path="/high-score" element={<HighScore highScores10={highScores10} highScores20={highScores20} highScores32={highScores32} getHighScoresFor10Cards={getHighScoresFor10Cards} getHighScoresFor20Cards={getHighScoresFor20Cards} getHighScoresFor32Cards={getHighScoresFor32Cards}/>} />

        <Route element={<ProtectedRoute user={user} />}>
            <Route path="/favorites" element={<Favorites favorites={favorites} user={user} toggleFavorite={toggleFavorite}/>} />
            <Route path="/my-memories" element={<MyMemories userDetails={userDetails} user={user} favorites={favorites} toggleFavorite={toggleFavorite} allMemories={allMemories} setAllMemories={setAllMemories} isEditing={isEditing} setIsEditing={setIsEditing} getAllMemories={getAllMemories}/>} />
            <Route path="/add" element={<AddMemoryCard userDetails={userDetails} handleSubmit={handleNewMemorySubmit} />} />
            <Route path="/profile" element={<Profile user={user} userDetails={userDetails} highScores10={highScores10} highScores20={highScores20} highScores32={highScores32} getHighScoresFor10Cards={getHighScoresFor10Cards} getHighScoresFor20Cards={getHighScoresFor20Cards} getHighScoresFor32Cards={getHighScoresFor32Cards}/>} />
        </Route>
      </Routes>
      <Footer />
    </>
  )
}


