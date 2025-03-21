import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, Table } from 'react-bootstrap';
import aiService from '../../services/aiService';

const PlagiarismDetection = ({ examId }) => {
    const [plagiarismResult, setPlagiarismResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchExistingResults = async () => {
            try {
                const result = await aiService.getPlagiarismResults(examId);
                if (result.result) {
                    setPlagiarismResult(result.result);
                }
            } catch (error) {
                console.log('Aucun résultat de plagiat existant');
            }
        };

        fetchExistingResults();
    }, [examId]);

    const detectPlagiarism = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await aiService.checkPlagiarism(examId);
            setPlagiarismResult(result.result);
            setSuccess(result.message);
        } catch (error) {
            setError(error.response?.data?.error || 'Erreur lors de la détection de plagiat');
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour obtenir une couleur en fonction du niveau de risque
    const getRiskColor = (risk) => {
        if (risk === 'élevé') return 'danger';
        if (risk === 'moyen') return 'warning';
        return 'success';
    };

    return (
        <Card className="mb-4">
            <Card.Header as="h5">Détection de Plagiat</Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <div className="text-center mb-3">
                    <Button
                        variant="primary"
                        onClick={detectPlagiarism}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" />
                                {' '}Analyse en cours...
                            </>
                        ) : plagiarismResult ? 'Actualiser l\'analyse de plagiat' : 'Détecter le plagiat'}
                    </Button>
                </div>

                {plagiarismResult && (
                    <div>
                        <h5>Matrice de similarité</h5>
                        <div className="table-responsive">
                            <Table striped bordered hover size="sm">
                                <thead>
                                <tr>
                                    <th>Étudiant 1</th>
                                    <th>Étudiant 2</th>
                                    <th>Similarité</th>
                                </tr>
                                </thead>
                                <tbody>
                                {plagiarismResult.matrice_similarite.map((item, index) => (
                                    <tr key={index}>
                                        <td>ID: {item[0]}</td>
                                        <td>ID: {item[1]}</td>
                                        <td>{item[2]}%</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </div>

                        <h5>Évaluation des risques</h5>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>Étudiant</th>
                                <th>Niveau de risque</th>
                                <th>Justification</th>
                            </tr>
                            </thead>
                            <tbody>
                            {plagiarismResult.evaluation_risque.map((item, index) => (
                                <tr key={index}>
                                    <td>ID: {item.etudiant_id}</td>
                                    <td>
                                        <Alert variant={getRiskColor(item.risque)} className="mb-0 py-1">
                                            {item.risque.toUpperCase()}
                                        </Alert>
                                    </td>
                                    <td>{item.justification}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>

                        {plagiarismResult.passages_suspects.length > 0 && (
                            <>
                                <h5>Passages suspects</h5>
                                {plagiarismResult.passages_suspects.map((item, index) => (
                                    <Card key={index} className="mb-2" border="warning">
                                        <Card.Header>
                                            Similarité entre les étudiants: {item.etudiants.join(', ')}
                                            (Confiance: {item.confiance}%)
                                        </Card.Header>
                                        <Card.Body>
                                            <blockquote className="blockquote mb-0">
                                                <p>{item.texte}</p>
                                            </blockquote>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default PlagiarismDetection;

