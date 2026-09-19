import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PageTransition from './components/animations/PageTransition';
import ScrollToTop from './components/animations/ScrollToTop';
import { ScrollProgress } from './components/animations/ScrollProgress';
import CommandPalette from './components/animations/CommandPalette';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DestinationDiscoveryPage from './pages/DestinationDiscoveryPage';
import DestinationDetailsPage from './pages/DestinationDetailsPage';
import AITripPlannerPage from './pages/AITripPlannerPage';
import GeneratedItineraryPage from './pages/GeneratedItineraryPage';
import InteractiveMapPage from './pages/InteractiveMapPage';
import WeatherPage from './pages/WeatherPage';
import MyTripsPage from './pages/MyTripsPage';
import BudgetManagementPage from './pages/BudgetManagementPage';
import TravelBuddiesPage from './pages/TravelBuddiesPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import JoinGroupPage from './pages/JoinGroupPage';
import GroupChatPage from './pages/GroupChatPage';
import CommunityPostsPage from './pages/CommunityPostsPage';
import UserProfilePage from './pages/UserProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 relative">
      <ScrollProgress />
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
            <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
            <Route path="/auth/callback" element={<PageTransition><AuthCallbackPage /></PageTransition>} />
            <Route path="/destinations" element={<PageTransition><DestinationDiscoveryPage /></PageTransition>} />
            <Route path="/destinations/:id" element={<PageTransition><DestinationDetailsPage /></PageTransition>} />
            <Route path="/plan-trip" element={<PageTransition><AITripPlannerPage /></PageTransition>} />
            <Route path="/itinerary/:id" element={<PageTransition><GeneratedItineraryPage /></PageTransition>} />
            <Route path="/map" element={<PageTransition><InteractiveMapPage /></PageTransition>} />
            <Route path="/weather" element={<PageTransition><WeatherPage /></PageTransition>} />
            <Route path="/my-trips" element={<PageTransition><MyTripsPage /></PageTransition>} />
            <Route path="/budget" element={<PageTransition><BudgetManagementPage /></PageTransition>} />
            <Route path="/buddies" element={<PageTransition><TravelBuddiesPage /></PageTransition>} />
            <Route path="/groups" element={<PageTransition><GroupsPage /></PageTransition>} />
            <Route path="/groups/join/:inviteCode" element={<PageTransition><JoinGroupPage /></PageTransition>} />
            <Route path="/groups/:groupId" element={<PageTransition><GroupDetailsPage /></PageTransition>} />
            <Route path="/groups/:id/chat" element={<PageTransition><GroupChatPage /></PageTransition>} />
            <Route path="/community" element={<PageTransition><CommunityPostsPage /></PageTransition>} />
            <Route path="/messages" element={<PageTransition><MessagesPage /></PageTransition>} />
            <Route path="/chat/:userId" element={<PageTransition><ChatPage /></PageTransition>} />
            <Route path="/profile" element={<PageTransition><UserProfilePage /></PageTransition>} />
            <Route path="/notifications" element={<PageTransition><NotificationsPage /></PageTransition>} />
            <Route path="/admin" element={<PageTransition><AdminDashboardPage /></PageTransition>} />
            <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
      <ScrollToTop />
      <CommandPalette />
      <Footer />
    </div>
  );
}


