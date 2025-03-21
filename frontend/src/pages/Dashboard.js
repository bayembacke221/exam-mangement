import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import examService from '../services/examService';
import submissionService from '../services/submissionService';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [exams, setExams] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Récupérer les examens
                const examsData = await examService.getAllExams();
                setExams(examsData);

                // Récupérer les soumissions en fonction du rôle
                if (currentUser.role === 'etudiant') {
                    const submissionsData = await submissionService.getMySubmissions();
                    setSubmissions(submissionsData);
                } else if (currentUser.role === 'enseignant') {
                    const submissionsData = await submissionService.getAllSubmissions();
                    setSubmissions(submissionsData);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const getStatusBadge = (statut) => {
        switch (statut) {
            case 'brouillon':
                return <Badge bg="secondary">Brouillon</Badge>;
            case 'publié':
                return <Badge bg="success">Publié</Badge>;
            case 'terminé':
                return <Badge bg="dark">Terminé</Badge>;
            default:
                return <Badge bg="info">{statut}</Badge>;
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-2">Chargement des données...</p>
            </Container>
        );
    }

    return (
        <Container>
            <h2 className="mb-4">Tableau de bord</h2>

            <Row>
                <Col lg={8}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Header>
                            <h5 className="mb-0 d-flex justify-content-between align-items-center">
                                <span>Examens {currentUser.role === 'etudiant' ? 'disponibles' : 'récents'}</span>
                                {currentUser.role === 'enseignant' && (
                                    <Button as={Link} to="/exams/create" size="sm" variant="primary">
                                        Créer un examen
                                    </Button>
                                )}
                            </h5>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {exams.length > 0 ? (
                                exams.slice(0, 5).map((exam) => (
                                    <ListGroup.Item key={exam.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <Link to={`/exams/${exam.id}`} className="text-decoration-none">
                                                <strong>{exam.titre}</strong>
                                            </Link>
                                            <div className="text-muted small">
                                                Date limite: {moment(exam.date_limite).format('LL')}
                                            </div>
                                        </div>
                                        <div>
                                            {getStatusBadge(exam.statut)}
                                        </div>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <ListGroup.Item className="text-center py-3">
                                    Aucun examen disponible
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                        {exams.length > 5 && (
                            <Card.Footer className="text-center">
                                <Button
                                    as={Link}
                                    to={currentUser.role === 'enseignant' ? '/exam-management' : '/dashboard'}
                                    variant="outline-primary"
                                    size="sm"
                                >
                                    Voir tous les examens
                                </Button>
                            </Card.Footer>
                        )}
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Header>
                            <h5 className="mb-0">Mon profil</h5>
                        </Card.Header>
                        <Card.Body>
                            <p><strong>Nom:</strong> {currentUser.nom} {currentUser.prenom}</p>
                            <p><strong>Email:</strong> {currentUser.email}</p>
                            <p><strong>Rôle:</strong> {currentUser.role === 'enseignant' ? 'Enseignant' : 'Étudiant'}</p>
                            {currentUser.role === 'etudiant' && (
                                <p><strong>Classe:</strong> {currentUser.classe}</p>
                            )}
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm">
                        <Card.Header>
                            <h5 className="mb-0">
                                {currentUser.role === 'etudiant' ? 'Mes dernières soumissions' : 'Dernières soumissions à évaluer'}
                            </h5>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {submissions.length > 0 ? (
                                submissions.slice(0, 3).map((submission) => (
                                    <ListGroup.Item key={submission.id}>
                                        <div>
                                            <Link
                                                to={currentUser.role === 'etudiant' ? `/my-submissions/${submission.id}` : `/submissions/${submission.id}`}
                                                className="text-decoration-none"
                                            >
                                                <strong>{submission.exam_titre}</strong>
                                            </Link>
                                            <div className="text-muted small">
                                                Soumis le: {moment(submission.date_soumission).format('LLL')}
                                            </div>
                                            {submission.note !== null ? (
                                                <div className="mt-1">
                                                    <Badge bg="info">Note: {submission.note}/20</Badge>
                                                </div>
                                            ) : (
                                                <div className="mt-1">
                                                    <Badge bg="warning" text="dark">En attente de note</Badge>
                                                </div>
                                            )}
                                        </div>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <ListGroup.Item className="text-center py-3">
                                    Aucune soumission
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                        {submissions.length > 3 && (
                            <Card.Footer className="text-center">
                                <Button
                                    as={Link}
                                    to={currentUser.role === 'etudiant' ? '/my-submissions' : '/submissions'}
                                    variant="outline-primary"
                                    size="sm"
                                >
                                    Voir toutes les soumissions
                                </Button>
                            </Card.Footer>
                        )}
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;