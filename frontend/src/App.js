import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';

// Composants de navigation et de mise en page
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages publiques
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AccessDenied from './pages/AccessDenied';

// Pages privées
import Dashboard from './pages/Dashboard';
import ExamManagement from './pages/ExamManagement';
import ExamDetail from './components/exams/ExamDetail';
import ExamForm from './components/exams/ExamForm';
import SubmissionPage from './components/submissions/SubmissionPage';
import SubmissionDetail from './components/submissions/SubmissionDetail';

// Routes protégées
import PrivateRoute from './utils/PrivateRoute';
import RoleRoute from './utils/RoleRoute';

// Import des styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/style.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="d-flex flex-column min-vh-100">
                    <Header />
                    <Container className="flex-grow-1 py-4">
                        <Routes>
                            {/* Routes publiques */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/access-denied" element={<AccessDenied />} />

                            {/* Routes protégées (pour tous les utilisateurs authentifiés) */}
                            <Route element={<PrivateRoute />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/exams/:id" element={<ExamDetail />} />
                            </Route>

                            {/* Routes réservées aux enseignants */}
                            <Route element={<RoleRoute allowedRoles={['enseignant']} />}>
                                <Route path="/exam-management" element={<ExamManagement />} />
                                <Route path="/exams/create" element={<ExamForm />} />
                                <Route path="/exams/edit/:id" element={<ExamForm />} />
                                <Route path="/submissions/exam/:examId" element={<SubmissionPage />} />
                                <Route path="/submissions/:id" element={<SubmissionDetail />} />
                            </Route>

                            {/* Routes réservées aux étudiants */}
                            <Route element={<RoleRoute allowedRoles={['etudiant']} />}>
                                <Route path="/my-submissions" element={<SubmissionPage />} />
                                <Route path="/my-submissions/:id" element={<SubmissionDetail />} />
                            </Route>
                        </Routes>
                    </Container>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;