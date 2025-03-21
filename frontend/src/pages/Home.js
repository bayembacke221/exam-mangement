import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { currentUser } = useAuth();

    return (
        <Container>
            <div className="text-center mb-5">
                <h1 className="display-4 mb-4">Bienvenue sur la Plateforme d'Examens</h1>
                <p className="lead">
                    Une solution complète pour gérer les examens et les soumissions en ligne
                </p>
            </div>

            <Row className="justify-content-center">
                <Col md={8} lg={6} className="text-center mb-4">
                    {currentUser ? (
                        <Card className="shadow">
                            <Card.Body>
                                <Card.Title>Vous êtes connecté en tant que {currentUser.role}</Card.Title>
                                <Card.Text>
                                    Accédez à votre tableau de bord pour gérer vos examens ou soumissions.
                                </Card.Text>
                                <Button as={Link} to="/dashboard" variant="primary">
                                    Aller au tableau de bord
                                </Button>
                            </Card.Body>
                        </Card>
                    ) : (
                        <Card className="shadow">
                            <Card.Body>
                                <Card.Title>Connectez-vous pour commencer</Card.Title>
                                <Card.Text>
                                    Accédez à la plateforme pour gérer vos examens ou soumettre vos devoirs.
                                </Card.Text>
                                <Button as={Link} to="/login" variant="primary" className="me-2">
                                    Connexion
                                </Button>
                                <Button as={Link} to="/register" variant="outline-primary">
                                    Inscription
                                </Button>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>

            <Row className="mt-5">
                <Col md={4} className="mb-4">
                    <Card className="h-100 shadow">
                        <Card.Body>
                            <Card.Title>Pour les étudiants</Card.Title>
                            <Card.Text>
                                Accédez facilement à vos examens, téléchargez les sujets et soumettez vos copies.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="h-100 shadow">
                        <Card.Body>
                            <Card.Title>Pour les enseignants</Card.Title>
                            <Card.Text>
                                Créez des examens, partagez-les avec vos étudiants et notez les copies facilement.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="h-100 shadow">
                        <Card.Body>
                            <Card.Title>Plateforme sécurisée</Card.Title>
                            <Card.Text>
                                Toutes les données sont sécurisées et les accès sont contrôlés par rôle.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Home;