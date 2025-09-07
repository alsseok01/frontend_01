import React, { useState, useEffect} from 'react';
import { Button, Container, Navbar, NavbarBrand, Offcanvas, OffcanvasHeader, OffcanvasBody, Nav, NavItem, NavLink, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import myLogo from '../images/logo.png';
import '../css/HomePage.css';
import { useAuth } from '../contexts/AuthContext';

const AppLayout = ({ children }) => { // onLogout prop은 이제 Context에서 직접 사용하므로 제거합니다.
  const { user, isAuthenticated, onNavigate, logout } = useAuth(); // ✅ logout도 Context에서 직접 가져옵니다.

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

   useEffect(() => {
    setProfileMenuOpen(false); 
  }, [isAuthenticated]); // 이 배열 안에 있는 값이 바뀔 때마다 함수가 실행됩니다.

  
  const handleMenuClick = (page) => {
    onNavigate(page);
    toggleMenu();
  };

  const renderNavButtons = () => {
    if (isAuthenticated && user) {
      const defaultProfileImage = 'https://mblogthumb-phinf.pstatic.net/MjAyMDA2MTBfMTY1/MDAxNTkxNzQ2ODcyOTI2.Yw5WjjU3IuItPtqbegrIBJr3TSDMd_OPhQ2Nw-0-0ksg.8WgVjtB0fy0RCv0XhhUOOWt90Kz_394Zzb6xPjG6I8gg.PNG.lamute/user.png?type=w800';

      return (
        <div style={{ position: 'relative' }}>
          <img 
            src={user.profileImage || defaultProfileImage} 
            alt="Profile" 
            className="rounded-circle" 
            style={{ height: '40px', width: '40px', objectFit: 'cover', cursor: 'pointer' }} 
            onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
          />
          {isProfileMenuOpen && (
            <div 
              style={{
                position: 'absolute',
                top: '50px',
                right: '0px',
                width: '160px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '5px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 2000
              }}
            >
              <div 
                className="custom-dropdown-item" // CSS 적용을 위한 클래스
                onClick={() => {
                  onNavigate('profile');
                  setProfileMenuOpen(false);
                }}
              >
                사용자 정보
              </div>
              <div className="custom-dropdown-item">활동</div>
              <hr style={{ margin: '5px 0' }} />
              <div 
                className="custom-dropdown-item"
                onClick={logout} // Context에서 가져온 logout 함수를 직접 사용
              >
                로그아웃
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return (
         <div className="d-none d-lg-block">
        <Button className="btn-custom btn-login mr-2" onClick={() => onNavigate('login')}>로그인</Button>
        <Button className="btn-custom btn-register" onClick={() => onNavigate('register')}>회원가입</Button>
      </div>
      );
    }
  };

  return (
    <>
      {/* --- 데스크탑용 네비게이션 바 --- */}
      <Navbar color="light" light expand="lg" className="d-none d-lg-flex sticky-top shadow-sm" style={{ zIndex: 1030 }}>
        <Container className="d-flex align-items-center">
          <NavbarBrand href="#" onClick={() => onNavigate('home')}>
            <img src={myLogo} alt="My App Logo" style={{ height: '40px' }} />
            <span className="ml-2 font-weight-bold">밥상친구</span>
          </NavbarBrand>
          <Nav className="mx-auto" navbar>
            <NavItem><NavLink href="#" onClick={() => onNavigate('matching')} className="font-weight-bold">매칭하기</NavLink></NavItem>
            <NavItem><NavLink href="#" onClick={() => onNavigate('schedule')} className="font-weight-bold">일정 만들기</NavLink></NavItem>
            <NavItem><NavLink href="#" onClick={() => onNavigate('board')} className="font-weight-bold">게시판</NavLink></NavItem>
            <NavItem><NavLink href="#" onClick={() => onNavigate('reviews')} className="font-weight-bold">후기</NavLink></NavItem>
          </Nav>
          {renderNavButtons()}
        </Container>
      </Navbar>

      {/* --- 모바일용 네비게이션 바 --- */}
      <Navbar color="light" light fixed="top" className="p-3 d-lg-none shadow-sm"   style={{ zIndex: 1030 }}>
        <div className="d-flex justify-content-between align-items-center w-100">
          <Button color="link" className="p-0" onClick={toggleMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/></svg>
          </Button>
          <NavbarBrand href="#" onClick={() => onNavigate('home')} className="position-absolute" style={{left: '50%', transform: 'translateX(-50%)'}}>
            <img src={myLogo} alt="My App Logo" style={{ height: '40px' }} />
          </NavbarBrand>
          <div style={{minWidth: '50px'}} className="d-flex justify-content-end">
            {renderNavButtons()}
          </div>
        </div>
      </Navbar>

      {/* --- 모바일용 Offcanvas 메뉴 --- */}
      <Offcanvas isOpen={isMenuOpen} toggle={toggleMenu}   style={{ zIndex: 1040 }} className="custom-offcanvas">
        <OffcanvasHeader toggle={toggleMenu}>메뉴</OffcanvasHeader>
        <OffcanvasBody>
            <Nav vertical>
                {!isAuthenticated && (
                  <NavItem><NavLink href="#" onClick={() => handleMenuClick('login')} className="offcanvas-nav-link-login">로그인이 필요합니다</NavLink></NavItem>
                )}
                <hr/>
                <NavItem><NavLink href="#" onClick={() => handleMenuClick('matching')} className="offcanvas-nav-link">🤝 매칭하기</NavLink></NavItem>
                <NavItem><NavLink href="#" onClick={() => handleMenuClick('schedule')} className="offcanvas-nav-link">📅 일정 만들기</NavLink></NavItem>
                <NavItem><NavLink href="#" onClick={() => handleMenuClick('board')} className="offcanvas-nav-link">📋 게시판</NavLink></NavItem>
                <NavItem><NavLink href="#" onClick={() => handleMenuClick('reviews')} className="offcanvas-nav-link">⭐ 후기</NavLink></NavItem>
            </Nav>
        </OffcanvasBody>
      </Offcanvas>

      {/* --- 페이지 컨텐츠가 표시되는 영역 --- */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </>
  );
};

export default AppLayout;

