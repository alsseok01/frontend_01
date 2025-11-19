import React, { useState, useEffect, useRef } from 'react';
import { Button, Container, Row, Col,  Card, CardBody } from 'reactstrap';
import homePageBg from '../images/HomePage.png';
import defaultAvatar from '../images/user.png';
import '../css/HomePage.css';
import { useAuth } from '../contexts/AuthContext'; 
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const HomePage = ({  }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const { onNavigate } = useAuth(); 
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);

  const [featuresVisible, setFeaturesVisible] = useState(false);
  const featuresRef = useRef(null); 
  const [featuredReviews, setFeaturedReviews] = useState([]);

  useEffect(() => {
    // ✅ [추가] 컴포넌트가 마운트될 때 AI 추천 후기를 불러옵니다.
    const fetchFeaturedReviews = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/ai/featured-reviews`);
        setFeaturedReviews(response.data);
      } catch (error) {
        console.error("AI 추천 후기를 불러오는 데 실패했습니다.", error);
      }
    };
    fetchFeaturedReviews();

    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener('resize', handleResize);
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setFeaturesVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } 
    );

    const currentFeaturesRef = featuresRef.current;
    if (currentFeaturesRef) {
      observer.observe(currentFeaturesRef);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentFeaturesRef) {
        observer.unobserve(currentFeaturesRef);
      }
    };
  }, []);

  const features = [
    {
      icon: '🤝',
      title: '스마트 매칭',
      description: '관심사와 취향을 분석하여 꼭 맞는 밥상친구를 찾아드려요.',
      style: { background: '#f8f9fa', color: '#333' },
      animationDelay: '0s'
    },
    {
      icon: '📅',
      title: '간편한 일정 관리',
      description: '지도와 연동된 캘린더로 약속을 손쉽게 잡고 관리하세요.',
      style: { background: '#f8f9fa', color: '#333' },
      animationDelay: '0.2s'
    },
    {
      icon: '💬',
      title: '실시간 커뮤니티',
      description: '게시판과 후기를 통해 다른 사용자들과 소통하고 정보를 나눠보세요.',
      style: { background: '#f8f9fa', color: '#333' },
      animationDelay: '0.4s'
    }
  ];

  
  const renderStars = (rating) => {
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += i < rating ? '★' : '☆';
    }
    return <span className="text-warning">{stars}</span>;
  };

  const heroStyle = {
    height: isDesktop ? 'calc(100vh - 72px)' : '100vh',
    backgroundImage: `url(${homePageBg})`,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    ...(!isDesktop && { backgroundRepeat: 'no-repeat' })
  };

  const carouselTrackStyle = featuredReviews.length > 0 ? {
    display: 'flex',
    width: `calc(320px * ${featuredReviews.length * 2})`,
    animation: `scroll ${featuredReviews.length * 5}s linear infinite`,
  } : { display: 'none' };

  return (
    <>
       <style>{`
        .review-carousel-container {
          overflow: hidden;
        }
        .review-carousel-container:hover .review-carousel-track {
          animation-play-state: paused;
        }
        .review-card-wrapper {
            flex-shrink: 0;
            width: 300px;
            margin-right: 20px;
        }
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-320px * ${featuredReviews.length}));
          }
        }
      `}</style>

      {/* 데스크탑용 네비게이션 바 */}
      

      {/* 상단 섹션 (첫 화면) */}
      <div className="d-flex flex-column text-white text-center position-relative" style={heroStyle}>
        {/* 모바일용 네비게이션 바 */}
        

        

        {/* ✅ [수정] 데스크탑과 모바일의 레이아웃을 다르게 렌더링합니다. */}
        {isDesktop ? (
          <>
            <div className="flex-grow-1 d-flex align-items-start justify-content-center pt-5 mt-5">
              <Container>
                <div style={{ backgroundColor: 'rgba(78, 172, 209, 0.18)', padding: '2rem', borderRadius: '1rem' }} className="fade-in-up-text">
                  <h1 className="display-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>밥상친구</h1>
                  <p className="lead mt-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>혼밥하기 싫거나 같이 식사할 친구가 필요하다면, 밥상친구와 함께하세요!</p>
                </div>
              </Container>
            </div>
            <div className="pb-5 fade-in-up-buttons">
              <Container>
                <Row className="justify-content-center">
                  <Col md="8" lg="6" className="d-flex justify-content-center">
                    <Button size="lg" className="btn-custom btn-matching mx-2" tag={Link} to="/matching">매칭하기</Button>
                    <Button size="lg" className="btn-custom btn-schedule mx-2" tag={Link} to="/schedule">일정 만들기</Button>
                  </Col>
                </Row>
              </Container>
            </div>
          </>
        ) : (
          // 모바일 레이아웃: 텍스트와 버튼을 그룹화하여 중앙 정렬
          <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
            <div className="fade-in-up-text" style={{ marginTop: "30px" }}>
              <Container>
                <div style={{ backgroundColor: 'rgba(78, 172, 209, 0.18)', padding: '1%', borderRadius: '3rem' }}>
                  <h1 className="display-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>밥상친구</h1>
                  <p className="lead mt-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>혼밥하기 싫거나 같이 식사할 친구가 필요하다면, 밥상친구와 함께하세요!</p>
                </div>
              </Container>
            </div>
            <div className="mt-2 fade-in-up-buttons">
              <Container>
                <Row className="justify-content-center">
                  <Col xs="12" className="d-flex justify-content-center"  style={{ marginTop: "380px" }}>
                    <Button size="lg" className="btn-custom btn-matching mx-2" tag={Link} to="/matching">매칭하기</Button>
                    <Button size="lg" className="btn-custom btn-schedule mx-2" tag={Link} to="/schedule">일정 만들기</Button>
                  </Col>
                </Row>
              </Container>
            </div>
          </div>
        )}

        <div className="position-absolute" style={{bottom: '20px', left: '50%', transform: 'translateX(-50%)', cursor: 'pointer'}}
          onClick={() => document.getElementById('reviews-section').scrollIntoView({ behavior: 'smooth' })}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708 .708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
          </svg>
        </div>
      </div>

      <div id="features-section" ref={featuresRef} className="py-5 text-center bg-white">
        <Container>
            <h2 className="mb-5 font-weight-bolder">주요 기능</h2>
            <Row>
                {/* ✅ [수정] features 배열을 map으로 순회하며 동적으로 카드를 생성합니다. */}
                {features.map((feature, index) => (
                    <Col md="4" className="mb-4" key={index}>
                        {/* ✅ [수정] featuresVisible 상태에 따라 is-visible 클래스를 동적으로 추가합니다. */}
                        <Card 
                            className={`h-100 shadow border-0 feature-card ${featuresVisible ? 'is-visible' : ''}`} 
                            style={{ 
                                animationDelay: feature.animationDelay, 
                                background: feature.style.background,
                                color: feature.style.color 
                            }}
                        >
                            <CardBody className="d-flex flex-column align-items-center">
                                <div className="display-4 mb-3">{feature.icon}</div>
                                <h4 className="font-weight-bold">{feature.title}</h4>
                                <p className="text-muted">{feature.description}</p>
                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
      </div>

      {/* 하단 후기 섹션 */}
      <div id="reviews-section" className="bg-light text-dark py-5">
        <Container>
          <h2 className="text-center mb-4 font-weight-bold">AI가 추천하는 사용자 후기</h2>
          <Row className="justify-content-center" >
            <Col lg="10" xl="9">
              <div className="review-carousel-container">
                <div className="review-carousel-track" style={carouselTrackStyle}>
                  {/* 무한 캐러셀 효과를 위해 배열을 두 번 렌더링합니다. */}
                  {featuredReviews.length > 0 && [...featuredReviews, ...featuredReviews].map((review, index) => (
                    <div key={index} className="review-card-wrapper">
                      <Card className="h-100 shadow-sm">
                        <CardBody className="d-flex flex-column">
                          <div className="d-flex align-items-center mb-3">
                            <img src={review.reviewerProfileImage || defaultAvatar} alt={review.reviewerName} className="rounded-circle" style={{width: '50px', height: '50px', marginRight: '1rem', objectFit: 'cover'}}/>
                            <div>
                              <h5 className="mb-0 font-weight-bold">{review.reviewerName}</h5>
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <p className="mb-0 font-italic font-weight-bold">"{review.comment}"</p>
                        </CardBody>
                      </Card>
                    </div>
                  ))}
                </div>
                {featuredReviews.length === 0 && (
                    <p className="text-center text-muted">아직 추천할 만한 후기가 없어요.</p>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};


export default HomePage;

