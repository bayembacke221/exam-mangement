import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import ExamList from '../components/exams/ExamList';
import { useAuth } from '../context/AuthContext';

const ExamManagement = () => {
    const { currentUser } = useAuth();

    // Vérifier que l'utilisateur est un enseignant
    if (currentUser.role !== 'enseignant') {
        return (
            <Container className="my-5 text-center">
                <Card className="shadow-sm">
                    <Card.Body>
                        <h3>Accès non autorisé</h3>
                        <p>Vous n'avez pas les droits pour accéder à cette page.</p>
                        <Link to="/dashboard" className="btn btn-primary">
                            Retour au tableau de bord
                        </Link>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2>Gestion des examens</h2>
                        <Button as={Link} to="/exams/create" variant="primary">
                            <FaPlus className="me-2" /> Créer un examen
                        </Button>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col>
                    <ExamList />
                </Col>
            </Row>
        </Container>
    );
};

export default ExamManagement;