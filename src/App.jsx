import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/admin/ProtectedRoute';
import './App.css';

// Public pages (preloaded eagerly for Home, lazy for the rest)
import Home from './pages/Home';
const Books = lazy(() => import('./pages/Books'));
const BookDetails = lazy(() => import('./pages/BookDetails'));
const Articles = lazy(() => import('./pages/Articles'));
const ArticleDetails = lazy(() => import('./pages/ArticleDetails'));
const Videos = lazy(() => import('./pages/Videos'));
const Consultations = lazy(() => import('./pages/Consultations'));
const QuranProject = lazy(() => import('./pages/QuranProject'));
const Contact = lazy(() => import('./pages/Contact'));
const Team = lazy(() => import('./pages/Team'));
const About = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin pages (always lazy)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageBooks = lazy(() => import('./pages/admin/ManageBooks'));
const ManageArticles = lazy(() => import('./pages/admin/ManageArticles'));
const ManageVideos = lazy(() => import('./pages/admin/ManageVideos'));
const ViewConsultations = lazy(() => import('./pages/admin/ViewConsultations'));
const ViewContacts = lazy(() => import('./pages/admin/ViewContacts'));
const ManageTeam = lazy(() => import('./pages/admin/ManageTeam'));

const PageLoader = () => (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <div
            style={{
                width: 48,
                height: 48,
                border: '4px solid var(--color-bg-secondary)',
                borderTopColor: 'var(--color-accent)',
                borderRadius: '50%',
                animation: 'spin 0.9s linear infinite',
            }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

function App() {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <AuthProvider>
                    <ErrorBoundary>
                        <Router>
                            <Suspense fallback={<PageLoader />}>
                                <Routes>
                                    {/* Public Routes */}
                                    <Route element={<Layout />}>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/books" element={<Books />} />
                                        <Route path="/books/:id" element={<BookDetails />} />
                                        <Route path="/articles" element={<Articles />} />
                                        <Route path="/articles/:id" element={<ArticleDetails />} />
                                        <Route path="/videos" element={<Videos />} />
                                        <Route path="/consultations" element={<Consultations />} />
                                        <Route path="/quran" element={<QuranProject />} />
                                        <Route path="/contact" element={<Contact />} />
                                        <Route path="/team" element={<Team />} />
                                        <Route path="/about" element={<About />} />
                                        <Route path="*" element={<NotFound />} />
                                    </Route>

                                    {/* Admin Login */}
                                    <Route path="/admin/login" element={<AdminLogin />} />

                                    {/* Protected Admin Routes */}
                                    <Route
                                        path="/admin"
                                        element={
                                            <ProtectedRoute>
                                                <AdminLayout />
                                            </ProtectedRoute>
                                        }
                                    >
                                        <Route path="dashboard" element={<AdminDashboard />} />
                                        <Route path="books" element={<ManageBooks />} />
                                        <Route path="articles" element={<ManageArticles />} />
                                        <Route path="videos" element={<ManageVideos />} />
                                        <Route path="consultations" element={<ViewConsultations />} />
                                        <Route path="contacts" element={<ViewContacts />} />
                                        <Route path="team" element={<ManageTeam />} />
                                    </Route>
                                </Routes>
                            </Suspense>
                        </Router>
                    </ErrorBoundary>
                </AuthProvider>
            </ThemeProvider>
        </HelmetProvider>
    );
}

export default App;
