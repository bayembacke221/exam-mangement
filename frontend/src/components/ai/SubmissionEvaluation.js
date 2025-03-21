import React, { useState } from 'react';
import { Card, Button, Spinner, Alert, Form, Table } from 'react-bootstrap';
import aiService from '../../services/aiService';

const SubmissionEvaluation = ({ submissionId, onEvaluationComplete }) => {
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [finalGrade, setFinalGrade] = useState(null);
    const [teacherComment, setTeacherComment] = useState('');

    const evaluateSubmission = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await aiService.evaluateSubmission(submissionId);
            setEvaluation(result.evaluation);
            setFinalGrade(result.evaluation.note_finale);
            setSuccess(result.message);
        } catch (error) {
            if (error.response?.data?.needsCorrection) {
                setError(`Veuillez d'abord générer un corrigé type pour cet examen.`);
            } else {
                setError(error.response?.data?.error || 'Erreur lors de l\'évaluation');
            }
        } finally {
            setLoading(false);
        }
    };

    const submitFinalGrade = async () => {
        try {
            await aiService.submitFinalGrade(submissionId, {
                note: finalGrade,
                commentaire: teacherComment
            });
            setSuccess('Note validée avec succès!');
            if (onEvaluationComplete) {
                onEvaluationComplete({
                    note: finalGrade,
                    commentaire: teacherComment
                });
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Erreur lors de la validation de la note');
        }
    };

    return (
        <Card className="mb-4">
            <Card.Header as="h5">Évaluation Automatique</Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                {!evaluation && (
                    <div className="text-center mb-3">
                        <p>Évaluez cette soumission automatiquement à l'aide de l'IA.</p>
                        <Button
                            variant="primary"
                            onClick={evaluateSubmission}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" />
                                    {' '}Évaluation en cours...
                                </>
                            ) : 'Évaluer automatiquement'}
                        </Button>
                    </div>
                )}

                {evaluation && (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>Évaluation détaillée</h5>
                            <h4>
                                Note proposée: <span className="text-primary">{evaluation.note_finale}/20</span>
                            </h4>
                        </div>

                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>Question</th>
                                <th>Points obtenus</th>
                                <th>Points max</th>
                                <th>Justification</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Object.entries(evaluation.evaluation_detaillee).map(([question, detail], index) => (
                                <tr key={index}>
                                    <td>{question}</td>
                                    <td className="text-center">{detail.points_obtenus}</td>
                                    <td className="text-center">{detail.points_max}</td>
                                    <td>{detail.justification}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>

                        <h5>Commentaire général</h5>
                        <p>{evaluation.commentaire_general}</p>

                        <div className="row">
                            <div className="col-md-6">
                                <h6>Points forts</h6>
                                <ul>
                                    {evaluation.points_forts.map((point, index) => (
                                        <li key={index}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="col-md-6">
                                <h6>Axes d'amélioration</h6>
                                <ul>
                                    {evaluation.axes_amelioration.map((axe, index) => (
                                        <li key={index}>{axe}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <hr />

                        <h5>Validation de la note</h5>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Note finale (sur 20)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    max="20"
                                    step="0.5"
                                    value={finalGrade}
                                    onChange={(e) => setFinalGrade(parseFloat(e.target.value))}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Commentaire de l'enseignant</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={teacherComment}
                                    onChange={(e) => setTeacherComment(e.target.value)}
                                    placeholder="Ajoutez un commentaire personnalisé à l'attention de l'étudiant..."
                                />
                            </Form.Group>

                            <Button variant="success" onClick={submitFinalGrade}>
                                Valider la note
                            </Button>
                        </Form>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default SubmissionEvaluation;
