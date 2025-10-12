import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Container,
  Navbar,
  NavbarBrand,
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Nav,
  NavItem,
  NavLink,
  Badge // Badge 컴포넌트 import
} from 'reactstrap';
import myLogo from '../images/logo.png';
import '../css/HomePage.css';
import { useAuth } from '../contexts/AuthContext';

const AppLayout = ({ children }) => {
  const { user, isAuthenticated, logout, unreadMessageCount, clearUnreadMessages } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    setProfileMenuOpen(false);
  }, [isAuthenticated]);

  const handleMenuClick = () => {
    toggleMenu();
  };

  const renderNavButtons = () => {
    if (isAuthenticated && user) {
      const defaultProfileImage = 'https://mblogthumb-phinf.pstatic.net/MjAyMDA2MTBfMTY1/MDAxNTkxNzQ2ODcyOTI2.Yw5WjjU3IuItPtqbegrIBJr3TSDMd_OPhQ2Nw-0-0ksg.8WgVjtB0fy0RCv0XhhUOOWt90Kz_394Zzb6xPjG6I8gg.PNG.lamute/user.png?type=w800';

      return (
        // 🔔 1. 이 div가 프로필 이미지와 알림 배지를 함께 묶어주는 기준점이 됩니다.
        <div style={{ position: 'relative' }}>
          <img
            src={user.profileImage || defaultProfileImage}
            alt="Profile"
            className="rounded-circle"
            style={{ height: '40px', width: '40px', objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
          />
          
          {/* 🔔 2. 읽지 않은 메시지가 1개 이상일 때만 숫자 배지가 표시됩니다. */}
          {unreadMessageCount > 0 && (
            <Badge color="danger" pill style={{
              position: 'absolute', // 이미지를 기준으로 위치를 잡습니다.
              top: '-5px',          // 이미지 상단에서 살짝 위로
              right: '-5px',         // 이미지 우측에서 살짝 바깥으로
              fontSize: '0.7em',
              border: '2px solid white'
            }}>
              {unreadMessageCount}
            </Badge>
          )}

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
              <Link to="/profile" className="custom-dropdown-item text-decoration-none d-block" onClick={() => setProfileMenuOpen(false)}>
                사용자 정보
              </Link>
              <Link 
                to="/match-requests" 
                className="custom-dropdown-item text-decoration-none d-block d-flex justify-content-between align-items-center" 
                onClick={() => {
                  setProfileMenuOpen(false);
                  clearUnreadMessages(); // 활동 페이지로 이동 시, 알림 숫자를 0으로 초기화합니다.
                }}
              >
                <span>활동</span>
                {unreadMessageCount > 0 && (
                  <Badge color="danger" pill>{unreadMessageCount}</Badge>
                )}
              </Link>
              <hr style={{ margin: '5px 0' }} />
              <div className="custom-dropdown-item" onClick={logout}>
                로그아웃
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="d-none d-lg-block">
          <Button tag={Link} to="/auth" className="btn-custom btn-login mr-2">로그인</Button>
          <Button tag={Link} to="/auth" state={{ mode: 'register' }} className="btn-custom btn-register">회원가입</Button>
        </div>
      );
    }
  };

  return (
    <>
      {/* --- 데스크탑용 네비게이션 바 --- */}
      <Navbar color="light" light expand="lg" className="d-none d-lg-flex sticky-top shadow-sm" style={{ zIndex: 1030 }}>
        <Container className="d-flex align-items-center">
          <NavbarBrand tag={Link} to="/">
            <img src={myLogo} alt="My App Logo" style={{ height: '40px' }} />
            <span className="ml-2 font-weight-bold">밥상친구</span>
          </NavbarBrand>
          <Nav className="mx-auto" navbar>
            <NavItem><NavLink tag={Link} to="/matching" className="font-weight-bold">매칭하기</NavLink></NavItem>
            <NavItem><NavLink tag={Link} to="/schedule" className="font-weight-bold">일정 만들기</NavLink></NavItem>
            <NavItem><NavLink tag={Link} to="/board" className="font-weight-bold">게시판</NavLink></NavItem>
          </Nav>
          {renderNavButtons()}
        </Container>
      </Navbar>

      {/* --- 모바일용 네비게이션 바 --- */}
      <Navbar color="light" light fixed="top" className="p-3 d-lg-none shadow-sm" style={{ zIndex: 1030 }}>
        <div className="d-flex justify-content-between align-items-center w-100">
          <Button color="link" className="p-0" onClick={toggleMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/></svg>
          </Button>
          <NavbarBrand tag={Link} to="/" className="position-absolute" style={{left: '50%', transform: 'translateX(-50%)'}}>
            <img src={myLogo} alt="My App Logo" style={{ height: '40px' }} />
          </NavbarBrand>
          <div style={{minWidth: '50px'}} className="d-flex justify-content-end">
            {renderNavButtons()}
          </div>
        </div>
      </Navbar>

      {/* --- 모바일용 Offcanvas 메뉴 --- */}
      <Offcanvas isOpen={isMenuOpen} toggle={toggleMenu} style={{ zIndex: 1040 }} className="custom-offcanvas">
        <OffcanvasHeader toggle={toggleMenu}>메뉴</OffcanvasHeader>
        <OffcanvasBody>
            <Nav vertical>
                {!isAuthenticated ? (
                  <NavItem><NavLink tag={Link} to="/auth" onClick={handleMenuClick} className="offcanvas-nav-link-login">로그인이 필요합니다</NavLink></NavItem>
                ) : (
                  <NavItem>
                    <NavLink 
                      tag={Link} 
                      to="/match-requests"
                      onClick={() => {
                          handleMenuClick();
                          clearUnreadMessages();
                      }} 
                      className="offcanvas-nav-link d-flex justify-content-between align-items-center"
                    >
                      <span>📊 활동</span>
                      {unreadMessageCount > 0 && (
                          <Badge color="danger" pill>{unreadMessageCount}</Badge>
                      )}
                    </NavLink>
                  </NavItem>
                )}
                <hr/>
                <NavItem><NavLink tag={Link} to="/matching" onClick={handleMenuClick} className="offcanvas-nav-link">🤝 매칭하기</NavLink></NavItem>
                <NavItem><NavLink tag={Link} to="/schedule" onClick={handleMenuClick} className="offcanvas-nav-link">📅 일정 만들기</NavLink></NavItem>
                <NavItem><NavLink tag={Link} to="/board" onClick={handleMenuClick} className="offcanvas-nav-link">📋 게시판</NavLink></NavItem>
            </Nav>
        </OffcanvasBody>
      </Offcanvas>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </>
  );
};

export default AppLayout;