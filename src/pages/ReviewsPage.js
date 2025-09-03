import React, { useState } from 'react';
import {Container, Row, Col, Card, CardBody } from 'reactstrap';

const ReviewsPage = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // HomePage와 동일한 후기 데이터를 사용합니다.
  const reviews = [
    { name: '김민준', rating: 5, comment: '여기서 만난 분과 좋은 인연을 이어가고 있어요! 정말 최고의 앱입니다.', image: 'https://placehold.co/100x100/A0C4FF/333333?text=M' },
    { name: '이서아', rating: 5, comment: '덕분에 취향이 비슷한 친구를 만나서 즐거운 시간을 보냈습니다. 일정 관리 기능도 편리해요!', image: 'https://placehold.co/100x100/FFC0CB/333333?text=F' },
    { name: '박준서', rating: 4, comment: '랜덤 매칭 기능이 신선하고 재밌네요. 다양한 사람들을 만날 수 있어서 좋았습니다.', image: 'https://placehold.co/100x100/B2F2BB/333333?text=M' },
    { name: '최유나', rating: 5, comment: '지도로 주변 맛집을 찾고 바로 약속을 잡을 수 있어서 정말 편해요. 강추합니다!', image: 'https://placehold.co/100x100/FFD6A5/333333?text=F' },
    { name: '정현우', rating: 4, comment: '깔끔한 UI와 직관적인 기능들이 마음에 듭니다. 앞으로도 자주 사용할 것 같아요.', image: 'https://placehold.co/100x100/CBAACB/333333?text=M' }
  ];

  const renderStars = (rating) => {
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += i < rating ? '★' : '☆';
    }
    return <span className="text-warning">{stars}</span>;
  };

  return (
    <>
      

      {/* --- 페이지 컨텐츠 --- */}
      <div className="bg-light text-dark py-5" style={{ paddingTop: '100px' }}>
        <Container>
          <h1 className="text-center font-weight-bolder mb-5">생생한 사용자 후기</h1>
          <Row>
            {reviews.map((review, index) => (
              <Col key={index} md="6" lg="4" className="mb-4">
                <Card className="h-100 shadow-sm">
                  <CardBody className="d-flex flex-column">
                    <div className="d-flex align-items-center mb-3">
                      <img src={review.image} alt={review.name} className="rounded-circle" style={{width: '50px', height: '50px', marginRight: '1rem'}}/>
                      <div>
                        <h5 className="mb-0 font-weight-bold">{review.name}</h5>
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="mb-0 font-italic font-weight-bold">"{review.comment}"</p>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </>
  );
};

export default ReviewsPage;
