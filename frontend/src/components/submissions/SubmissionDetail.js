import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Form, Alert } from 'react-bootstrap';
import { FaDownload, FaArrowLeft, FaSave } from 'react-icons/fa';
import submissionService from '../../services/submissionService';
import examService from '../../services/examService';
import { useAuth } from '../../context/AuthContext';
import moment from 'moment';
import 'moment/locale/fr';
import SubmissionEvaluation from "../ai/SubmissionEvaluation";

moment.locale('fr');

const SubmissionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [submission, setSubmission] = useState(null);
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [gradeData, setGradeData] = useState({
        note: '',
        commentaire: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const submissionData = await submissionService.getSubmissionById(id);
                setSubmission(submissionData);

                // Récupérer les détails de l'examen
                const examData = await examService.getExamById(submissionData.examen_id);
                setExam(examData);

                // Remplir le formulaire de notation si une note existe déjà
                if (submissionData.note !== null) {
                    setGradeData({
                        note: submissionData.note,
                        commentaire: submissionData.commentaire || ''
                    });
                }

                setLoading(false);
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
                setError('Impossible de charger les détails de la soumission.');
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleGradeChange = (e) => {
        const { name, value } = e.target;
        setGradeData({
            ...gradeData,
            [name]: value
        });
    };

    const handleSubmitGrade = async (e) => {
        e.preventDefault();

        // Valider la note (entre 0 et 20)
        const note = parseFloat(gradeData.note);
        if (isNaN(note) || note < 0 || note > 20) {
            setError('La note doit être un nombre entre 0 et 20.');
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await submissionService.gradeSubmission(id, gradeData);

            // Mettre à jour l'état local
            setSubmission({
                ...submission,
                note: gradeData.note,
                commentaire: gradeData.commentaire
            });

            setSuccessMessage('La note a été enregistrée avec succès !');
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de la note:', error);
            setError('Erreur lors de l\'enregistrement de la note.');
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
                <p className="mt-2">Chargement des détails de la soumission...</p>
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

    if (!submission || !exam) {
        return (
            <Container className="my-5">
                <Alert variant="warning">Soumission non trouvée ou vous n'avez pas les droits pour y accéder.</Alert>
            </Container>
        );
    }

    // Vérifier si l'utilisateur a les droits d'accès
    const isTeacher = currentUser.role === 'enseignant';
    const isStudent = currentUser.role === 'etudiant';
    const hasAccess = (isTeacher && currentUser.id === exam.enseignant_id) ||
        (isStudent && currentUser.id === submission.etudiant_id);

    if (!hasAccess) {
        return (
            <Container className="my-5">
                <Alert variant="danger">Vous n'avez pas les droits pour accéder à cette soumission.</Alert>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <Card className="shadow-sm mb-4">
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">Détail de la soumission</h3>
                        <Button
                            variant="outline-secondary"
                            onClick={() => navigate(-1)}
                        >
                            <FaArrowLeft className="me-2" /> Retour
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <h5>Informations de l'examen</h5>
                            <p><strong>Titre :</strong> {exam.titre}</p>
                            <p><strong>Enseignant :</strong> {exam.enseignant_nom} {exam.enseignant_prenom}</p>
                            <p><strong>Date limite :</strong> {moment(exam.date_limite).format('LL')}</p>

                            {exam.fichier_url && (
                                <div className="mb-4">
                                    <Button
                                        href={`${process.env.REACT_APP_API_URL}${exam.fichier_url}`}
                                        target="_blank"
                                        variant="outline-primary"
                                        size="sm"
                                    >
                                        <FaDownload className="me-2" /> Sujet de l'examen
                                    </Button>
                                </div>
                            )}
                        </Col>

                        <Col md={6}>
                            <h5>Informations de la soumission</h5>
                            {isTeacher && (
                                <p><strong>Étudiant :</strong> {submission.etudiant_nom} {submission.etudiant_prenom}</p>
                            )}
                            <p><strong>Date de soumission :</strong> {moment(submission.date_soumission).format('LLLL')}</p>

                            {submission.fichier_url && (
                                <div className="mb-4">
                                    <Button
                                        href={`${process.env.REACT_APP_API_URL}${submission.fichier_url}`}
                                        target="_blank"
                                        variant="outline-success"
                                    >
                                        <FaDownload className="me-2" /> Télécharger la copie
                                    </Button>
                                </div>
                            )}
                        </Col>
                    </Row>

                    <hr />
                    {/* Évaluation automatique pour les enseignants */}
                    {isTeacher && (
                        <div className="mb-4">
                            <SubmissionEvaluation
                                submissionId={id}
                                onEvaluationComplete={(evalData) => {
                                    setGradeData({
                                        note: evalData.note,
                                        commentaire: evalData.commentaire || gradeData.commentaire
                                    });
                                    setSuccessMessage("Note proposée par l'IA appliquée. Vous pouvez l'ajuster si nécessaire.");
                                }}
                            />
                        </div>
                    )}
                    {/* Section de notation (pour les enseignants) */}
                    {isTeacher ? (
                        <div className="mt-4">
                            <h5>Évaluation</h5>
                            {successMessage && (
                                <Alert variant="success">{successMessage}</Alert>
                            )}
                            {error && (
                                <Alert variant="danger">{error}</Alert>
                            )}

                            <Form onSubmit={handleSubmitGrade}>
                                <Row>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Note (sur 20)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="note"
                                                value={gradeData.note}
                                                onChange={handleGradeChange}
                                                min="0"
                                                max="20"
                                                step="0.5"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={9}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Commentaire</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="commentaire"
                                                value={gradeData.commentaire}
                                                onChange={handleGradeChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button type="submit" variant="primary" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Enregistrement en cours...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="me-2" /> Enregistrer la note
                                        </>
                                    )}
                                </Button>
                            </Form>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <h5>Évaluation</h5>

                            {submission.note !== null ? (
                                <div>
                                    <p><strong>Note :</strong> <span className="badge bg-info fs-6">{submission.note}/20</span></p>

                                    {submission.commentaire && (
                                        <div className="mt-3">
                                            <p><strong>Commentaire de l'enseignant :</strong></p>
                                            <p>{submission.commentaire}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Alert variant="warning">
                                    Votre copie n'a pas encore été évaluée.
                                </Alert>
                            )}
                        </div>
                    )}
                    {/* Affichage de l'évaluation automatique pour l'étudiant */}
                    {isStudent && submission.evaluation_auto && (
                        <div className="mt-4">
                            <h5>Évaluation détaillée par l'IA</h5>
                            <div className="border p-3 rounded bg-light">
                                {(() => {
                                    try {
                                        const aiEval = JSON.parse(submission.evaluation_auto);
                                        return (
                                            <>
                                                <p><strong>Note proposée:</strong> {aiEval.note_finale}/20</p>
                                                <p><strong>Commentaire général:</strong> {aiEval.commentaire_general}</p>

                                                <Row className="mt-3">
                                                    <Col md={6}>
                                                        <h6>Points forts:</h6>
                                                        <ul>
                                                            {aiEval.points_forts.map((point, idx) => (
                                                                <li key={idx}>{point}</li>
                                                            ))}
                                                        </ul>
                                                    </Col>
                                                    <Col md={6}>
                                                        <h6>Axes d'amélioration:</h6>
                                                        <ul>
                                                            {aiEval.axes_amelioration.map((axe, idx) => (
                                                                <li key={idx}>{axe}</li>
                                                            ))}
                                                        </ul>
                                                    </Col>
                                                </Row>
                                            </>
                                        );
                                    } catch (e) {
                                        return <p>Les détails de l'évaluation automatique ne sont pas disponibles.</p>;
                                    }
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Alerte de plagiat */}
                    {submission.plagiat_flag > 0 && (
                        <Alert variant={submission.plagiat_flag >= 1 ? "danger" : "warning"} className="mt-3">
                            <strong>{submission.plagiat_flag >= 1 ? "⚠️ Plagiat détecté" : "⚠️ Suspicion de plagiat"}</strong>
                            {submission.plagiat_details && <p className="mt-2">{submission.plagiat_details}</p>}
                        </Alert>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SubmissionDetail;
