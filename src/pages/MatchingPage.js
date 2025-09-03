import React, { useState } from 'react';
import { Container,} from 'reactstrap';
import '../css/HomePage.css';
import { useAuth } from '../contexts/AuthContext'; 

const MatchingPage = ({  }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const { onNavigate } = useAuth(); 
  const [isDesktop,] = useState(window.innerWidth >= 992);
  
  

  return (
    <>
      

      {/* 상단 섹션 (첫 화면) */}
      <div className="d-flex flex-column text-white text-center position-relative" >
       
        

        {/* ✅ [수정] 데스크탑과 모바일의 레이아웃을 다르게 렌더링합니다. */}
        {isDesktop ? (
                  <>
                    <div className="flex-grow-1 d-flex align-items-start justify-content-center pt-0 mt-0">
                      <Container>
                        <div style={{ backgroundColor: 'rgba(78, 172, 209, 0)', padding: '1%', borderRadius: '3rem' }} className="fade-in-up-text">
                          <h1 className="display-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>매칭하기</h1>
                          <p className="lead mt-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>취향이 맞는 사람들과 매칭해보세요!</p>
                        </div>
                      </Container>
                    </div>
                    
                  </>
                ) : (
                  // 모바일 레이아웃: 텍스트와 버튼을 그룹화하여 중앙 정렬
                  <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                    <div className="fade-in-up-text" style={{ marginTop: "100px" }}>
                      <Container>
                        <div style={{ backgroundColor: 'rgba(78, 172, 209, 0)', padding: '1%', borderRadius: '5rem' }}>
                          <h1 className="display-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>매칭하기</h1>
                          <p className="lead mt-3" style={{ whiteSpace: 'nowrap', fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>취향이 맞는 사람들과 매칭해보세요!</p>
                        </div>
                      </Container>
                    </div>
                    
                  </div>
                )}

        
      </div>

      {/* --- 페이지 컨텐츠 --- */}
      
    </>
  );
};

export default MatchingPage;

