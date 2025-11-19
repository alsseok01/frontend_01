import React, { useState } from 'react';
import { Container, Card, CardBody, CardHeader, Button, FormGroup, Label, Input } from 'reactstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import{ getToken } from '../utils/tokenStorage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const WriteReviewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, fetchMatchRequests, fetchSentMatchRequests, fetchMySchedules } = useAuth();
    const { opponent, matchId } = location.state || {};

    const [rating, setRating] = useState(3);
    const [comment, setComment] = useState('');

    const handleSubmit = async () => {
        if (!opponent || !matchId) {
            alert("후기 작성에 필요한 정보가 없습니다.");
            return;
        }

        try {
            const token = getToken();
            const payload = {
                matchId,
                revieweeId: opponent.opponentId,
                rating,
                comment,
            };
            await axios.post(`${API_URL}/api/reviews`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("후기가 성공적으로 등록되었습니다.");

            await fetchMatchRequests();
            await fetchSentMatchRequests();
            await fetchMySchedules();

            navigate('/match-requests');

        } catch (error) {
            console.error("후기 등록 실패:", error);
            alert(error.response?.data || "후기 등록 중 오류가 발생했습니다.");
        }
    };

    if (!opponent) {
        return (
            <Container className="mt-5">
                <p>후기를 작성할 상대방 정보가 없습니다. 매칭 내역에서 다시 시도해주세요.</p>
            </Container>
        );
    }

    return (
        <Container className="mt-5" style={{ paddingTop: '80px' }}>
            <Card>
                <CardHeader>
                    <h4>'{opponent.opponentName}'님과의 만남은 어떠셨나요?</h4>
                </CardHeader>
                <CardBody>
                    <div className="text-center mb-4">
                        <img
                            src={opponent.opponentProfileImage || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'}
                            alt={opponent.opponentName}
                            className="rounded-circle"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                        <h5 className="mt-2">{opponent.opponentName}</h5>
                    </div>
                    <FormGroup>
                        <Label for="rating"><h5>평점</h5></Label>
                        <div className="d-flex justify-content-center mb-3">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span
                                    key={star}
                                    onClick={() => setRating(star)}
                                    style={{ cursor: 'pointer', fontSize: '2.5rem', color: star <= rating ? '#ffc107' : '#e4e5e9' }}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <Label for="comment"><h5>한 줄 후기</h5></Label>
                        <Input
                            id="comment"
                            name="comment"
                            type="textarea"
                            rows="4"
                            placeholder="상대방에 대한 솔직한 후기를 남겨주세요."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                    </FormGroup>
                    <Button color="primary" block onClick={handleSubmit} className="mt-4">후기 등록하기</Button>
                </CardBody>
            </Card>
        </Container>
    );
};

export default WriteReviewPage;