import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import aiService from '../../services/aiService';

const Chatbot = ({ examId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Charger les messages précédents s'il y en a
        const fetchPreviousMessages = async () => {
            try {
                const result = await aiService.getChatHistory(examId);
                if (result.history && result.history.length > 0) {
                    setMessages(result.history.map(msg => ({
                        type: msg.is_bot ? 'bot' : 'user',
                        text: msg.is_bot ? msg.reponse : msg.question
                    })));
                }
            } catch (error) {
                console.log('Aucun historique de chat trouvé');
            }
        };

        fetchPreviousMessages();
    }, [examId]);

    useEffect(() => {
        // Faire défiler vers le bas lorsque de nouveaux messages arrivent
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Ajouter le message de l'utilisateur
        setMessages([...messages, { type: 'user', text: newMessage }]);
        const question = newMessage;
        setNewMessage('');
        setLoading(true);

        try {
            const response = await aiService.chatbotQuery(examId, question);

            // Ajouter la réponse du bot
            setMessages(prev => [...prev, { type: 'bot', text: response.response }]);
        } catch (error) {
            console.error('Erreur lors de la communication avec le chatbot:', error);
            setMessages(prev => [...prev, {
                type: 'bot',
                text: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer ultérieurement."
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mb-4">
            <Card.Header as="h5">Assistant IA</Card.Header>
            <Card.Body className="p-0">
                <div
                    className="chat-messages p-3"
                    style={{ height: '400px', overflowY: 'auto' }}
                >
                    {messages.length === 0 ? (
                        <div className="text-center text-muted mt-5">
                            <p>Bonjour ! Je suis votre assistant pour cet examen.</p>
                            <p>Posez-moi vos questions concernant le sujet.</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`mb-3 d-flex ${msg.type === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                            >
                                <div
                                    className={`p-3 rounded ${
                                        msg.type === 'user'
                                            ? 'bg-primary text-white'
                                            : 'bg-light'
                                    }`}
                                    style={{ maxWidth: '75%' }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className="d-flex justify-content-start mb-3">
                            <div className="p-3 rounded bg-light">
                                <Spinner animation="border" size="sm" /> En train d'écrire...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <Form onSubmit={handleSubmit} className="p-3 border-top">
                    <div className="d-flex">
                        <Form.Control
                            type="text"
                            placeholder="Posez votre question..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            className="ms-2"
                            disabled={loading || !newMessage.trim()}
                        >
                            Envoyer
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default Chatbot;