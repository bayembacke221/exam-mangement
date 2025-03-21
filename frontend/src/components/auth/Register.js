import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const Register = () => {
    const [userData, setUserData] = useState({
        nom: '',
        prenom: '',
        email: '',
        mdp: '',
        mdp_confirm: '',
        classe: '',
        role: 'etudiant' // Par défaut, rôle étudiant
    });

    const [classes, setClasses] = useState(['Chargement...']);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [classError, setClassError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setLoadingClasses(true);
                console.log('Récupération des classes...');

                const classesData = await authService.getClasses();
                console.log('Classes reçues:', classesData);

                if (classesData && classesData.length > 0) {
                    setClasses(classesData);
                } else {
                    // Définir une liste par défaut si aucune classe n'est reçue
                    console.log('Aucune classe reçue, utilisation des valeurs par défaut');
                    setClasses(['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2']);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des classes:', error);
                setClassError('Impossible de charger la liste des classes');
                // Définir une liste par défaut en cas d'erreur
                setClasses(['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2']);
            } finally {
                setLoadingClasses(false);
            }
        };

        fetchClasses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        });
    };

    const validateForm = () => {
        // Vérifier que les mots de passe correspondent
        if (userData.mdp !== userData.mdp_confirm) {
            setError('Les mots de passe ne correspondent pas');
            return false;
        }

        // Vérifier que le mot de passe est assez fort
        if (userData.mdp.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return false;
        }

        // Vérifier que tous les champs requis sont remplis
        if (!userData.nom || !userData.prenom || !userData.email || !userData.mdp) {
            setError('Tous les champs sont obligatoires');
            return false;
        }

        // Si c'est un étudiant, une classe est requise
        if (userData.role === 'etudiant' && !userData.classe) {
            setError('Veuillez sélectionner une classe');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Copier les données sans le champ mdp_confirm
            const { mdp_confirm, ...dataToSend } = userData;

            await register(dataToSend);
            navigate('/login', { state: { message: 'Inscription réussie. Vous pouvez maintenant vous connecter.' } });
        } catch (error) {
            setError(error.response?.data?.error || 'Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-4 mb-4">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Header as="h4" className="text-center">Inscription</Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nom</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="nom"
                                                placeholder="Votre nom"
                                                value={userData.nom}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Prénom</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="prenom"
                                                placeholder="Votre prénom"
                                                value={userData.prenom}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="Votre email"
                                        value={userData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Mot de passe</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="mdp"
                                                placeholder="Mot de passe"
                                                value={userData.mdp}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Confirmer le mot de passe</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="mdp_confirm"
                                                placeholder="Confirmer le mot de passe"
                                                value={userData.mdp_confirm}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Rôle</Form.Label>
                                    <Form.Select
                                        name="role"
                                        value={userData.role}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="etudiant">Étudiant</option>
                                        <option value="enseignant">Enseignant</option>
                                    </Form.Select>
                                </Form.Group>

                                {userData.role === 'etudiant' && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Classe</Form.Label>
                                        {classError && <div className="text-danger">{classError}</div>}
                                        <Form.Select
                                            name="classe"
                                            value={userData.classe}
                                            onChange={handleChange}
                                            required={userData.role === 'etudiant'}
                                            disabled={loadingClasses}
                                        >
                                            <option value="">Sélectionner une classe</option>
                                            {classes.map((classe, index) => (
                                                <option key={index} value={classe}>{classe}</option>
                                            ))}
                                        </Form.Select>
                                        {loadingClasses && <div className="text-muted">Chargement des classes...</div>}
                                    </Form.Group>
                                )}

                                <div className="d-grid gap-2">
                                    <Button variant="primary" type="submit" disabled={loading}>
                                        {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                        <Card.Footer className="text-center">
                            <div>Déjà un compte? <Link to="/login">Se connecter</Link></div>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;