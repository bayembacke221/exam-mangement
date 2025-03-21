import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AccessDenied = () => {
    return (
        <Container className="my-5 text-center">
            <Card className="shadow-sm">
                <Card.Body className="py-5">
                    <h2 className="mb-4 text-danger">Accès refusé</h2>
                    <p className="lead mb-4">
                        Vous n'avez pas les droits nécessaires pour accéder à cette page.
                    </p>
                    <Button as={Link} to="/dashboard" variant="primary">
                        Retour au tableau de bord
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AccessDenied;
