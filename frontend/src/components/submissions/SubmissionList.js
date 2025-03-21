import React from 'react';
import { Table, Badge, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEye, FaDownload } from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

const SubmissionList = ({ submissions, isTeacher }) => {
    return (
        <Card className="shadow-sm">
            <Card.Header>
                <h5 className="mb-0">
                    {isTeacher ? 'Liste des soumissions' : 'Mes soumissions'}
                </h5>
            </Card.Header>
            <Card.Body>
                {submissions.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="mb-0">Aucune soumission disponible</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <Table hover className="align-middle">
                            <thead>
                            <tr>
                                {isTeacher && <th>Étudiant</th>}
                                <th>Examen</th>
                                <th>Date de soumission</th>
                                <th>Note</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {submissions.map((submission) => (
                                <tr key={submission.id}>
                                    {isTeacher && (
                                        <td>
                                            {submission.etudiant_nom} {submission.etudiant_prenom}
                                        </td>
                                    )}
                                    <td>{submission.exam_titre}</td>
                                    <td>{moment(submission.date_soumission).format('LLL')}</td>
                                    <td>
                                        {submission.note !== null ? (
                                            <Badge bg="info">{submission.note}/20</Badge>
                                        ) : (
                                            <Badge bg="warning" text="dark">En attente</Badge>
                                        )}
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Button
                                                as={Link}
                                                to={isTeacher ? `/submissions/${submission.id}` : `/my-submissions/${submission.id}`}
                                                variant="outline-primary"
                                                size="sm"
                                                title="Voir les détails"
                                            >
                                                <FaEye />
                                            </Button>
                                            {submission.fichier_url && (
                                                <Button
                                                    href={`${process.env.REACT_APP_API_URL}${submission.fichier_url}`}
                                                    target="_blank"
                                                    variant="outline-success"
                                                    size="sm"
                                                    title="Télécharger la copie"
                                                >
                                                    <FaDownload />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default SubmissionList;
