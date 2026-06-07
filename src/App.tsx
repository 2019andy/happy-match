import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { LevelSelect } from "@/pages/LevelSelect";
import { Game } from "@/pages/Game";
import { Settings } from "@/pages/Settings";
import { Achievements } from "@/pages/Achievements";
import { Shop } from "@/pages/Shop";
import { Leaderboard } from "@/pages/Leaderboard";
import { DailyChallengePage } from '@/pages/DailyChallenge';
import { Login } from '@/pages/Login';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/level-select" element={<LevelSelect />} />
        <Route path="/game" element={<Game />} />
        <Route path="/game/:levelId" element={<Game />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/daily-challenge" element={<DailyChallengePage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}
