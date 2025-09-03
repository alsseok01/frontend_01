import React, { useState, useEffect, useRef } from 'react';
import { Button, Container, Row, Col,  Card, CardBody } from 'reactstrap';
import homePageBg from '../images/HomePage.png';
import '../css/HomePage.css';
import { useAuth } from '../contexts/AuthContext'; 

const HomePage = ({  }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const { onNavigate } = useAuth(); 
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);

  // ✅ [추가] 기능 소개 섹션이 화면에 보이는지 여부를 감지하는 상태
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const featuresRef = useRef(null); // 기능 소개 섹션을 참조할 ref

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener('resize', handleResize);
    
    // ✅ [추가] Intersection Observer 설정
   const observer = new IntersectionObserver(
      ([entry]) => {
        // featuresRef가 화면에 보일 때마다 true, 사라지면 false로 상태를 설정합니다.
        setFeaturesVisible(entry.isIntersecting);
      },
      { 
        threshold: 0.1, // 섹션이 10% 보였을 때 감지
      } 
    );

    const currentFeaturesRef = featuresRef.current; // 클린업 함수에서 참조하기 위함
    if (currentFeaturesRef) {
      observer.observe(currentFeaturesRef);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentFeaturesRef) {
        observer.unobserve(currentFeaturesRef); // 컴포넌트가 사라질 때 관찰 중지
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

  // 예시 후기 데이터
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

  const heroStyle = {
    height: isDesktop ? 'calc(100vh - 72px)' : '100vh',
    backgroundImage: `url(${homePageBg})`,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    ...(!isDesktop && { backgroundRepeat: 'no-repeat' })
  };

  return (
    <>
      <style>{`
         /* 후기 자동 스크롤(캐러셀) 효과 */
        .review-carousel-container {
          overflow: hidden;
        }
        .review-carousel-track {
          display: flex;
          width: calc(320px * ${reviews.length * 2});
          animation: scroll ${reviews.length * 5}s linear infinite;
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
            transform: translateX(calc(-320px * ${reviews.length}));
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
                    <Button size="lg" className="btn-custom btn-matching mx-2" onClick={() => onNavigate('matching')}>매칭하기</Button>
                    <Button size="lg" className="btn-custom btn-schedule mx-2" onClick={() => onNavigate('schedule')}>일정 만들기</Button>
                  </Col>
                </Row>
              </Container>
            </div>
          </>
        ) : (
          // 모바일 레이아웃: 텍스트와 버튼을 그룹화하여 중앙 정렬
          <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
            <div className="fade-in-up-text" style={{ marginTop: "-3px" }}>
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
                    <Button size="lg" className="btn-custom btn-matching mx-2" onClick={() => onNavigate('matching')}>매칭하기</Button>
                    <Button size="lg" className="btn-custom btn-schedule mx-2" onClick={() => onNavigate('schedule')}>일정 만들기</Button>
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
          <h2 className="text-center mb-4 font-weight-bold">생생한 사용자 후기</h2>
          <Row className="justify-content-center" >
            <Col lg="10" xl="9">
              <div className="review-carousel-container">
                <div className="review-carousel-track">
                  {[...reviews, ...reviews].map((review, index) => (
                    <div key={index} className="review-card-wrapper">
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
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};


export default HomePage;

