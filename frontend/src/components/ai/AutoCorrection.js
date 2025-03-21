import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, Table } from 'react-bootstrap';
import aiService from '../../services/aiService';

const AutoCorrection = ({ examId }) => {
    const [correction, setCorrection] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const generateCorrection = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await aiService.generateExamCorrection(examId);
            setCorrection(result.correction);
            setSuccess(result.message);
        } catch (error) {
            setError(error.response?.data?.error || 'Erreur lors de la génération du corrigé');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchExistingCorrection = async () => {
            try {
                const result = await aiService.getExamCorrection(examId);
                if (result.correction) {
                    setCorrection(result.correction);
                }
            } catch (error) {
                console.log('Aucun corrigé existant trouvé');
            }
        };

        fetchExistingCorrection();
    }, [examId]);

    return (
        <Card className="mb-4">
            <Card.Header as="h5">Correction Automatique</Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                {!correction && (
                    <div className="text-center mb-3">
                        <p>Générez un corrigé type pour cet examen à l'aide de l'IA.</p>
                        <Button
                            variant="primary"
                            onClick={generateCorrection}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" />
                                    {' '}Génération en cours...
                                </>
                            ) : 'Générer un corrigé type'}
                        </Button>
                    </div>
                )}

                {correction && (
                    <div>
                        <Alert variant="info">
                            Le corrigé type a été généré. Vous pouvez maintenant utiliser ce corrigé pour évaluer automatiquement les copies des étudiants.
                        </Alert>

                        <h5>Concepts clés</h5>
                        <ul>
                            {correction.concepts_cles.map((concept, index) => (
                                <li key={index}>{concept}</li>
                            ))}
                        </ul>

                        <h5>Grille de notation</h5>
                        <Table striped bordered hover size="sm">
                            <thead>
                            <tr>
                                <th>Question</th>
                                <th>Points</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Object.entries(correction.grille_notation).map(([question, points], index) => (
                                <tr key={index}>
                                    <td>{question}</td>
                                    <td>{points}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>

                        <h5>Corrigé détaillé</h5>
                        <div className="border p-3 bg-light mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {Object.entries(correction.corrige_type).map(([question, reponse], index) => (
                                <div key={index} className="mb-3">
                                    <h6>{question}</h6>
                                    <p>{reponse}</p>
                                    <hr />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default AutoCorrection;


