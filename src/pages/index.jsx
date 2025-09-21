import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Focus from "./Focus";

import Schedule from "./Schedule";

import Computer from "./Computer";

import Habits from "./Habits";

import Chat from "./Chat";

import Design from "./Design";

import ActiveFocusSession from "./ActiveFocusSession";

import FocusHistory from "./FocusHistory";

import Profile from "./Profile";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Focus: Focus,
    
    Schedule: Schedule,
    
    Computer: Computer,
    
    Habits: Habits,
    
    Chat: Chat,
    
    Design: Design,
    
    ActiveFocusSession: ActiveFocusSession,
    
    FocusHistory: FocusHistory,
    
    Profile: Profile,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Focus" element={<Focus />} />
                
                <Route path="/Schedule" element={<Schedule />} />
                
                <Route path="/Computer" element={<Computer />} />
                
                <Route path="/Habits" element={<Habits />} />
                
                <Route path="/Chat" element={<Chat />} />
                
                <Route path="/Design" element={<Design />} />
                
                <Route path="/ActiveFocusSession" element={<ActiveFocusSession />} />
                
                <Route path="/FocusHistory" element={<FocusHistory />} />
                
                <Route path="/Profile" element={<Profile />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}