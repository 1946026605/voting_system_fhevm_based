import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext";
import { FHEProvider } from "./contexts/FHEContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Proposals from "./pages/Proposals";
import CreateProposal from "./pages/CreateProposal";
import Vote from "./pages/Vote";
import VotingHistory from "./pages/VotingHistory";
import "./App.css";

function App() {
  return (
    <WalletProvider>
      <FHEProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/proposals" element={<Proposals />} />
                <Route path="/create" element={<CreateProposal />} />
                <Route path="/vote/:proposalId" element={<Vote />} />
                <Route path="/history" element={<VotingHistory />} />
              </Routes>
            </main>
          </div>
        </Router>
      </FHEProvider>
    </WalletProvider>
  );
}

export default App;
