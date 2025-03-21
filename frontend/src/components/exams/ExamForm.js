import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import examService from '../../services/examService';
import { useAuth } from '../../context/AuthContext';

const ExamForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        date_limite: '',
        statut: 'brouillon',
        fichier: null
    });

    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            const fetchExam = async () => {
                try {
                    const examData = await examService.getExamById(id);

                    // Vérifier que l'utilisateur est bien l'enseignant qui a créé l'examen
                    if (examData.enseignant_id !== currentUser.id) {
                        setError('Vous n\'êtes pas autorisé à modifier cet examen');
                        return;
                    }

                    // Formater la date pour le champ de formulaire (YYYY-MM-DD)
                    const dateObj = new Date(examData.date_limite);
                    const formattedDate = dateObj.toISOString().split('T')[0];

                    setFormData({
                        titre: examData.titre,
                        description: examData.description || '',
                        date_limite: formattedDate,
                        statut: examData.statut,
                        fichier: null // Le fichier doit être sélectionné à nouveau si nécessaire
                    });

                    if (examData.fichier_url) {
                        setPreview(`${process.env.REACT_APP_API_URL}${examData.fichier_url}`);
                    }

                    setLoading(false);
                } catch (error) {
                    console.error('Erreur lors de la récupération de l\'examen:', error);
                    setError('Impossible de charger les détails de l\'examen');
                    setLoading(false);
                }
            };

            fetchExam();
        }
    }, [id, isEditMode, currentUser.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                fichier: file
            });

            // Créer une URL pour la prévisualisation du fichier
            const fileUrl = URL.createObjectURL(file);
            setPreview(fileUrl);
        }
    };

    const validateForm = () => {
        if (!formData.titre.trim()) {
            setError('Le titre est obligatoire');
            return false;
        }

        if (!formData.date_limite) {
            setError('La date limite est obligatoire');
            return false;
        }

        // En mode création, un fichier est requis
        if (!isEditMode && !formData.fichier) {
            setError('Veuillez uploader un fichier pour l\'examen');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            if (isEditMode) {
                await examService.updateExam(id, formData);
                navigate(`/exams/${id}`);
            } else {
                const result = await examService.createExam(formData);
                navigate(`/exams/${result.id}`);
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'examen:', error);
            setError(error.response?.data?.error || 'Erreur lors de l\'enregistrement de l\'examen');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-2">Chargement des données...</p>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <Card className="shadow-sm">
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">{isEditMode ? 'Modifier l\'examen' : 'Créer un nouvel examen'}</h3>
                        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                            <FaArrowLeft className="me-2" /> Retour
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Titre de l'examen *</Form.Label>
                            <Form.Control
                                type="text"
                                name="titre"
                                value={formData.titre}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Date limite de soumission *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="date_limite"
                                        value={formData.date_limite}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Statut *</Form.Label>
                                    <Form.Select
                                        name="statut"
                                        value={formData.statut}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="brouillon">Brouillon</option>
                                        <option value="publié">Publié</option>
                                        <option value="terminé">Terminé</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-4">
                            <Form.Label>Fichier de l'examen {!isEditMode && '*'}</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={handleFileChange}
                            />
                            <Form.Text className="text-muted">
                                Formats acceptés: PDF, DOC, DOCX, etc. Taille maximale: 10 MB
                            </Form.Text>

                            {preview && (
                                <div className="mt-2">
                                    <p>Fichier actuel: <a href={preview} target="_blank" rel="noopener noreferrer">Voir le fichier</a></p>
                                </div>
                            )}
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button variant="primary" type="submit" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Enregistrement en cours...
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="me-2" /> {isEditMode ? 'Enregistrer les modifications' : 'Créer l\'examen'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ExamForm;