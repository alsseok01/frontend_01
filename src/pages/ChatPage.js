import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../contexts/AuthContext';
import { getToken } from '../utils/tokenStorage';
import { Input, Button, ListGroup, ListGroupItem, Container, Card, CardBody, CardHeader } from 'reactstrap';
import axios from 'axios'; // axios import

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const ChatPage = () => {
    const { matchId } = useParams();
    const location = useLocation();
    const { user, deleteMatch, markMatchAsRead } = useAuth();
    const opponent = location.state?.opponent;
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const clientRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (matchId) {
            markMatchAsRead(matchId);
        }
    }, [matchId, markMatchAsRead]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleLeaveChat = async () => {
        if (window.confirm("채팅방을 나가시겠습니까? 대화 내용이 사라집니다.")) {
            try {
                await deleteMatch(matchId);
                alert("채팅방을 나갔습니다.");
                navigate('/match-requests'); // 매칭 요청 페이지로 이동
            } catch (error) {
                console.error("채팅방 나가기 실패:", error);
            }
        }
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = getToken();
                const response = await axios.get(`${API_URL}/api/chat/${matchId}/history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setMessages(response.data);
            } catch (error) {
                console.error("채팅 내역을 불러오는데 실패했습니다:", error);
            }
        };
        fetchHistory();
    }, [matchId]);

    // 웹소켓 연결 로직
    useEffect(() => {
        const connect = () => {
            const token = getToken()
            const socket = new SockJS(`http://localhost:8080/ws`);
            //const socket = new SockJS(`https://api.tablefriends.site/ws`);
            const client = Stomp.over(socket);
            
            client.connect({ Authorization: `Bearer ${token}` }, () => {
                client.subscribe(`/topic/chat/${matchId}`, (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    // ✅ 2. [수정] 내가 보낸 메시지든 남이 보낸 메시지든, 서버에서 오면 무조건 state에 추가 (단순화)
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
        if (clientRef.current && clientRef.current.connected && message.trim() !== '' && user) {
            const chatMessage = {
                senderId: user.id,
                senderName: user.name,
                content: message,
            };
            
            clientRef.current.publish({
                destination: `/app/chat/${matchId}`,
                body: JSON.stringify(chatMessage)
            });
            
            // ✅ 3. [수정] 메시지 전송 후 여기서 바로 state를 업데이트하던 코드를 삭제합니다.
            // (서버를 통해 다시 메시지를 받아 state가 업데이트되도록 로직을 일원화)
            setMessage('');
        }
    };

    if (!opponent) {
        return <Container className="mt-5"><p>채팅 상대를 찾을 수 없습니다.</p></Container>
    }

    return (
        <Container className="mt-4">
            <Card>
                <CardHeader className="d-flex justify-content-between align-items-center">
                    <h4>{opponent.name}님과의 대화</h4>
                    <Button color="danger" outline size="sm" onClick={handleLeaveChat}>나가기</Button>
                </CardHeader>
                <CardBody>
                    <div style={{ height: '50vh', overflowY: 'auto', marginBottom: '1rem' }}>
                        <ListGroup flush>
                            {messages.map((msg, index) => (
                                <ListGroupItem
                                    key={index} // 실제로는 DB에서 받은 메시지 ID를 사용하는 것이 더 좋습니다.
                                    className={`d-flex border-0 ${msg.senderId === user.id ? 'justify-content-end' : 'justify-content-start'}`}
                                    style={{backgroundColor: 'transparent'}}
                                >
                                    <div className={`p-2 rounded ${msg.senderId === user.id ? 'bg-primary text-white' : 'bg-light'}`}>
                                        <strong>{msg.senderName}:</strong> {msg.content}
                                    </div>
                                </ListGroupItem>
                            ))}
                            <div ref={messagesEndRef} />
                        </ListGroup>
                    </div>
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