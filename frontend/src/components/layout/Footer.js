import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-dark text-white py-3 mt-auto">
            <Container className="text-center">
                <p className="mb-0">© {new Date().getFullYear()} Plateforme d'Examens. Tous droits réservés.</p>
            </Container>
        </footer>
    );
};

export default Footer;