import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Card, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';
import examService from '../../services/examService';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

const ExamList = ({ filterByTeacher = false }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchExams();
    }, [filterByTeacher]);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const data = await examService.getAllExams();
            setExams(data);
            setError(null);
        } catch (error) {
            console.error('Erreur lors de la récupération des examens:', error);
            setError('Impossible de charger les examens. Veuillez réessayer plus tard.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
            try {
                await examService.deleteExam(id);
                // Mettre à jour la liste des examens après la suppression
                setExams(exams.filter(exam => exam.id !== id));
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'examen:', error);
                alert('Erreur lors de la suppression de l\'examen.');
            }
        }
    };

    const getStatusBadge = (statut) => {
        switch (statut) {
            case 'brouillon':
                return <Badge bg="secondary">Brouillon</Badge>;
            case 'publié':
                return <Badge bg="success">Publié</Badge>;
            case 'terminé':
                return <Badge bg="dark">Terminé</Badge>;
            default:
                return <Badge bg="info">{statut}</Badge>;
        }
    };

    // Filtrer les examens en fonction de la recherche et du statut
    const filteredExams = exams.filter(exam => {
        const matchesSearch = exam.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || exam.statut === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="text-center my-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-2">Chargement des examens...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        );
    }

    return (
        <Card className="shadow-sm">
            <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Liste des examens</h5>
                    <Button as={Link} to="/exams/create" variant="primary" size="sm">
                        Créer un examen
                    </Button>
                </div>
            </Card.Header>
            <Card.Body>
                <div className="mb-4 d-flex flex-column flex-md-row gap-3">
                    <InputGroup className="mb-0 flex-grow-1">
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Rechercher un examen..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                    <Form.Select
                        className="w-auto"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="brouillon">Brouillons</option>
                        <option value="publié">Publiés</option>
                        <option value="terminé">Terminés</option>
                    </Form.Select>
                </div>

                {filteredExams.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="mb-0">Aucun examen trouvé</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <Table hover className="align-middle">
                            <thead>
                            <tr>
                                <th>Titre</th>
                                <th>Date limite</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredExams.map((exam) => (
                                <tr key={exam.id}>
                                    <td>
                                        <Link to={`/exams/${exam.id}`} className="text-decoration-none">
                                            {exam.titre}
                                        </Link>
                                    </td>
                                    <td>{moment(exam.date_limite).format('LL')}</td>
                                    <td>{getStatusBadge(exam.statut)}</td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Button as={Link} to={`/exams/${exam.id}`} variant="outline-primary" size="sm" title="Voir">
                                                <FaEye />
                                            </Button>
                                            <Button as={Link} to={`/exams/edit/${exam.id}`} variant="outline-secondary" size="sm" title="Modifier">
                                                <FaEdit />
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(exam.id)} title="Supprimer">
                                                <FaTrash />
                                            </Button>
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

export default ExamList;