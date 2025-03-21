import React, { useState, useEffect } from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import examService from "../../services/examService";
import submissionService from "../../services/submissionService";
import SubmissionList from "./SubmissionList";
import {useAuth} from "../../context/AuthContext";

const SubmissionPage = () => {
    const { examId } = useParams();
    const { currentUser } = useAuth();
    const isTeacher = currentUser.role === 'enseignant';

    const [exam, setExam] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let submissionsData;

                if (isTeacher && examId) {
                    // Pour un enseignant visualisant les soumissions d'un examen
                    const examData = await examService.getExamById(examId);
                    setExam(examData);

                    // Vérifier que l'enseignant est l'auteur de l'examen
                    if (examData.enseignant_id !== currentUser.id) {
                        setError("Vous n'êtes pas autorisé à voir les soumissions de cet examen");
                        setLoading(false);
                        return;
                    }

                    submissionsData = await submissionService.getSubmissionsByExam(examId);
                } else if (isTeacher) {
                    // Pour un enseignant visualisant toutes les soumissions
                    submissionsData = await submissionService.getAllSubmissions();
                } else {
                    // Pour un étudiant visualisant ses propres soumissions
                    submissionsData = await submissionService.getMySubmissions();
                }

                setSubmissions(submissionsData);
                setLoading(false);
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
                setError('Impossible de charger les soumissions.');
                setLoading(false);
            }
        };

        fetchData();
    }, [examId, currentUser.id, isTeacher]);

    if (loading) {
        return (
            <Container className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-2">Chargement des soumissions...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="my-5">
                <Alert variant="danger">{error}</Alert>
                <div className="text-center mt-3">
                    <Button as={Link} to="/dashboard" variant="primary">
                        <FaArrowLeft className="me-2" /> Retour au tableau de bord
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            {exam && (
                <div className="mb-4 d-flex justify-content-between align-items-center">
                    <h2>Soumissions pour: {exam.titre}</h2>
                    <Button as={Link} to={`/exams/${exam.id}`} variant="outline-secondary">
                        <FaArrowLeft className="me-2" /> Retour à l'examen
                    </Button>
                </div>
            )}

            {!exam && (
                <h2 className="mb-4">
                    {isTeacher ? 'Toutes les soumissions' : 'Mes soumissions'}
                </h2>
            )}

            <SubmissionList
                submissions={submissions}
                isTeacher={isTeacher}
            />
        </Container>
    );
};


export default SubmissionPage;