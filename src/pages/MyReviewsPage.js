import React, { useState, useEffect } from 'react';
import { Container, Card, CardBody, CardHeader, Spinner, Alert, Button } from 'reactstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import{ getToken } from '../utils/tokenStorage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const MyReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { refreshUser } = useAuth();

    useEffect(() => {
        const fetchMyReviews = async () => {
            try {
                const token = getToken();
                const response = await axios.get(`${API_URL}/api/reviews/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (Array.isArray(response.data)) {
                    setReviews(response.data);
                } else {
                    console.warn("API did not return an array for reviews:", response.data);
                    setReviews([]);
                }

            } catch (err) {
                setError("후기를 불러오는 중 오류가 발생했습니다.");
                console.error("후기 로딩 실패:", err);
                setReviews([]); // ✅ [수정] 오류 발생 시에도 빈 배열 설정
            } finally {
                setLoading(false);
            }
        };

        fetchMyReviews();
    }, []);

    const handleDelete = async (reviewId) => {
        if (!window.confirm("이 후기를 정말로 삭제하시겠습니까?\n(참고: 삭제해도 회원님의 평균 평점은 변경되지 않습니다.)")) {
            return;
        }
        try {
            const token = getToken();
            await axios.delete(`${API_URL}/api/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
            
            
            alert("후기가 삭제되었습니다.");

        } catch (err) {
            alert(err.response?.data || "후기 삭제 중 오류가 발생했습니다.");
            console.error("후기 삭제 실패:", err);
        }
    };

    const renderStars = (rating) => {
        let stars = '';
        for (let i = 0; i < 5; i++) {
            stars += i < rating ? '★' : '☆';
        }
        return <span className="text-warning">{stars}</span>;
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner color="primary" />
                <h4 className="ms-3">내 후기 목록을 불러오는 중...</h4>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert color="danger">{error}</Alert>
            </Container>
        );
    }

   return (
        <Container className="mt-5" style={{ paddingTop: '60px' }}>
            <h2 className="mb-4 text-center font-weight-bold">내가 받은 후기</h2>
            {reviews.length > 0 ? (
                reviews.map(review => (
                    <Card key={review.id} className="mb-3 shadow-sm">
                        <CardHeader className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <img
                                    src={review.reviewer.profileImage || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'}
                                    alt={review.reviewer.name}
                                    className="rounded-circle me-2"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                                <h5 className="mb-0">{review.reviewer.name}님이 남긴 후기</h5>
                            </div>
                            
                            {/* ✅ [수정] 날짜와 삭제 버튼을 함께 묶음 */}
                            <div className="d-flex align-items-center">
                                <small className="text-muted me-2">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </small>
                                <Button
                                    color="danger"
                                    outline
                                    size="sm"
                                    onClick={() => handleDelete(review.id)}
                                    style={{ padding: '0.1rem 0.4rem', fontSize: '0.8rem' }}
                                >
                                    삭제
                                </Button>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="mb-2">
                                {renderStars(review.rating)}
                            </div>
                            <p className="mb-0 font-italic">"{review.comment}"</p>
                        </CardBody>
                    </Card>
                ))
            ) : (
                <p className="text-center text-muted mt-5">아직 받은 후기가 없습니다.</p>
            )}
        </Container>
    );
};

export default MyReviewsPage;