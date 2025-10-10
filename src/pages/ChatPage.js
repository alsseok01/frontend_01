// src/pages/ChatPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { CompatClient, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button, ListGroup, ListGroupItem, Container, Card, CardBody, CardHeader } from 'reactstrap';

const ChatPage = () => {
    const { matchId } = useParams();
    const location = useLocation();
    const { user } = useAuth();
    
    // 상대방 정보를 location.state에서 가져옵니다.
    const opponent = location.state?.opponent;

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const clientRef = useRef(null);

    useEffect(() => {
        const connect = () => {
            const token = localStorage.getItem('token');
            const socket = new SockJS(`http://localhost:8080/ws?token=${token}`);
            const client = Stomp.over(socket);
            
            client.connect({ Authorization: `Bearer ${token}` }, () => {
                client.subscribe(`/topic/chat/${matchId}`, (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    setMessages(prevMessages => [...prevMessages, receivedMessage]);
                });
            });

            clientRef.current = client;
        };

        connect();

        return () => {
            if (clientRef.current) {
                clientRef.current.disconnect();
            }
        };
    }, [matchId]);

    const sendMessage = () => {
        if (clientRef.current && message.trim() !== '' && user) {
            const chatMessage = {
                senderId: user.id,
                senderName: user.name,
                content: message,
            };
            clientRef.current.send(`/app/chat/${matchId}`, {}, JSON.stringify(chatMessage));
            setMessage('');
        }
    };

    if (!opponent) {
        return <Container className="mt-5"><p>채팅 상대를 찾을 수 없습니다.</p></Container>
    }

    return (
        <Container className="mt-4">
            <Card>
                <CardHeader>
                    <h4>{opponent.name}님과의 대화</h4>
                </CardHeader>
                <CardBody>
                    <ListGroup style={{ height: '50vh', overflowY: 'auto', marginBottom: '1rem' }}>
                        {messages.map((msg, index) => (
                            <ListGroupItem
                                key={index}
                                className={`d-flex ${msg.senderId === user.id ? 'justify-content-end' : ''}`}
                            >
                                <div
                                    className={`p-2 rounded ${msg.senderId === user.id ? 'bg-primary text-white' : 'bg-light'}`}
                                >
                                    <strong>{msg.senderName}:</strong> {msg.content}
                                </div>
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                    <div className="d-flex">
                        <Input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="메시지를 입력하세요..."
                        />
                        <Button onClick={sendMessage} color="primary" className="ms-2">전송</Button>
                    </div>
                </CardBody>
            </Card>
        </Container>
    );
};

export default ChatPage;