import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import ExploreMentors from './pages/ExploreMentors';
import ChatPage from './pages/ChatPage';
import BadgesPage from './pages/BadgesPage';
import SessionsPage from './pages/SessionsPage';
import CertificatesPage from './pages/CertificatesPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<ExploreMentors />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}