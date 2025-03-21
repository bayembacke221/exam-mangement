import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Badge, Alert } from 'react-bootstrap';
import { FaDownload} from 'react-icons/fa';
import examService from '../../services/examService';
import submissionService from '../../services/submissionService';
import { useAuth } from '../../context/AuthContext';
import moment from 'moment';
import 'moment/locale/fr';
import PlagiarismDetection from "../ai/PlagiarismDetection";
import AutoCorrection from "../ai/AutoCorrection";
import Chatbot from "../ai/Chatbot";

moment.locale('fr');

const ExamDetail = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitFile, setSubmitFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const examData = await examService.getExamById(id);
                setExam(examData);

                // Si l'utilisateur est un étudiant, vérifier s'il a déjà soumis une copie
                if (currentUser.role === 'etudiant') {
                    try {
                        const submissions = await submissionService.getSubmissionsByExam(id);
                        if (submissions.length > 0) {
                            setSubmission(submissions[0]);
                        }
                    } catch (error) {
                        console.error('Erreur lors de la récupération des soumissions:', error);
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'examen:', error);
                setError('Impossible de charger les détails de l\'examen.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, currentUser]);

    const handleDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
            try {
                await examService.deleteExam(id);
                navigate('/exam-management');
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'examen:', error);
                alert('Erreur lors de la suppression de l\'examen.');
            }
        }
    };

    const handleFileChange = (e) => {
        setSubmitFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!submitFile) {
            setSubmitError('Veuillez sélectionner un fichier à soumettre.');
            return;
        }

        setSubmitting(true);
        setSubmitError(null);

        try {
            await submissionService.submitExam({
                examen_id: id,
                fichier_url: submitFile
            });

            // Recharger la page pour voir la soumission
            window.location.reload();
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            setSubmitError(error.response?.data?.error || 'Erreur lors de la soumission de la copie.');
        } finally {
            setSubmitting(false);
        }
    };

    const isDeadlinePassed = () => {
        if (!exam) return false;
        const now = new Date();
        const deadline = new Date(exam.date_limite);
        return now > deadline;
    };

    if (loading) {
        return (
            <Container className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-2">Chargement des détails de l'examen...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="my-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (!exam) {
        return (
            <Container className="my-5">
                <Alert variant="warning">Examen non trouvé ou vous n'avez pas les droits pour y accéder.</Alert>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <Card className="shadow-sm mb-4">
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">{exam.titre}</h3>
                        <Badge bg={
                            exam.statut === 'brouillon' ? 'secondary' :
                                exam.statut === 'publié' ? 'success' :
                                    'dark'
                        }>
                            {exam.statut}
                        </Badge>
                    </div>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={8}>
                            <p className="text-muted mb-4">
                                <strong>Date limite :</strong> {moment(exam.date_limite).format('LLLL')}
                                {isDeadlinePassed() && (
                                    <Badge bg="danger" className="ms-2">Expirée</Badge>
                                )}
                            </p>

                            {exam.description && (
                                <div className="mb-4">
                                    <h5>Description</h5>
                                    <p>{exam.description}</p>
                                </div>
                            )}

                            {exam.fichier_url && (
                                <div className="mb-4">
                                    <h5>Sujet de l'examen</h5>
                                    <Button
                                        href={`${process.env.REACT_APP_API_URL}${exam.fichier_url}`}
                                        target="_blank"
                                        variant="outline-primary"
                                    >
                                        <FaDownload className="me-2" /> Télécharger le sujet
                                    </Button>
                                </div>
                            )}
                        </Col>

                        <Col md={4}>
                            <Card className="border-light">
                                <Card.Body>
                                    <h5>Informations</h5>
                                    <p><strong>Créé par :</strong> {exam.enseignant_nom} {exam.enseignant_prenom}</p>
                                    <p><strong>Date de création :</strong> {moment(exam.created_at).format('LL')}</p>
                                </Card.Body>
                            </Card>

                        </Col>
                    </Row>
                </Card.Body>
                {/* Fonctionnalités d'IA pour enseignants */}
                {currentUser.role === 'enseignant' && (
                    <div className="mt-4">
                        <h4 className="mb-3">Intelligence Artificielle - Outils de correction</h4>
                        <Row>
                            <Col md={12} className="mb-4">
                                <AutoCorrection examId={id} />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12} className="mb-4">
                                <PlagiarismDetection examId={id} />
                            </Col>
                        </Row>
                    </div>
                )}

                {/* Chatbot pour les étudiants */}
                {currentUser.role === 'etudiant' && (
                    <div className="mt-4">
                        <h4 className="mb-3">Assistant IA</h4>
                        <Chatbot examId={id} />
                    </div>
                )}
                {currentUser.role === 'etudiant' && (
                    <Card.Footer>
                        <h5>Soumettre votre copie</h5>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="file"
                                accept=".pdf"
                                className="form-control mb-3"
                                onChange={handleFileChange}
                            />
                            {submitError && (
                                <Alert variant="danger">{submitError}</Alert>
                            )}
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Soumission en cours...' : 'Soumettre la copie'}
                            </Button>
                        </form>
                        {submission && (
                            <Alert variant="success" className="mt-3">
                                Vous avez déjà soumis votre copie le {moment(submission.created_at).format('LLLL')}.
                            </Alert>
                        )}
                    </Card.Footer>
                )}
            </Card>
        </Container>
);
};

export default ExamDetail;