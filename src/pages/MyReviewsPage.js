import React, { useState, useEffect } from 'react';
import { Container, Card, CardBody, CardHeader, Spinner, Alert } from 'reactstrap';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const MyReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyReviews = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/api/reviews/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReviews(response.data);
            } catch (err) {
                setError("후기를 불러오는 중 오류가 발생했습니다.");
                console.error("후기 로딩 실패:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyReviews();
    }, []);

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
            {/* ✅ [수정] 페이지 제목 변경 */}
            <h2 className="mb-4 text-center font-weight-bold">내가 받은 후기</h2>
            {reviews.length > 0 ? (
                reviews.map(review => (
                    <Card key={review.id} className="mb-3 shadow-sm">
                        <CardHeader className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                {/* ✅ [수정] reviewee(나) -> reviewer(작성자) 정보로 변경 */}
                                <img
                                    src={review.reviewer.profileImage || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'}
                                    alt={review.reviewer.name}
                                    className="rounded-circle me-2"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                                <h5 className="mb-0">{review.reviewer.name}님이 남긴 후기</h5>
                            </div>
                            <small className="text-muted">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </small>
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