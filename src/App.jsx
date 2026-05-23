import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Books from './pages/Books';
import Articles from './pages/Articles';
import Videos from './pages/Videos';
import Consultations from './pages/Consultations';
import QuranProject from './pages/QuranProject';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBooks from './pages/admin/ManageBooks';
import ManageArticles from './pages/admin/ManageArticles';
import ManageVideos from './pages/admin/ManageVideos';
import ViewConsultations from './pages/admin/ViewConsultations';
import ViewContacts from './pages/admin/ViewContacts';
import ProtectedRoute from './components/admin/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/consultations" element={<Consultations />} />
            <Route path="/quran" element={<QuranProject />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="books" element={<ManageBooks />} />
            <Route path="articles" element={<ManageArticles />} />
            <Route path="videos" element={<ManageVideos />} />
            <Route path="consultations" element={<ViewConsultations />} />
            <Route path="contacts" element={<ViewContacts />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
