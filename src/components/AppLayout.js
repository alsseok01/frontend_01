// src/components/AppLayout.js

import React, { useState, useEffect } from 'react';
// 💡 1. react-router-dom에서 Link 컴포넌트를 import 합니다.
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
  NavLink
} from 'reactstrap';
import myLogo from '../images/logo.png';
import '../css/HomePage.css';
import { useAuth } from '../contexts/AuthContext';

const AppLayout = ({ children }) => {
  // 💡 2. useAuth 훅에서 onNavigate를 더 이상 사용하지 않으므로 제거합니다.
  const { user, isAuthenticated, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    setProfileMenuOpen(false);
  }, [isAuthenticated]);

  const handleMenuClick = () => {
    // 메뉴 아이템 클릭 시 Offcanvas 메뉴를 닫는 역할만 하도록 수정합니다.
    toggleMenu();
  };

  // 로그인/로그아웃 버튼 및 프로필 드롭다운 UI
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
              {/* 💡 3. 드롭다운 메뉴 아이템을 Link로 변경합니다. */}
              <Link to="/profile" className="custom-dropdown-item text-decoration-none d-block" onClick={() => setProfileMenuOpen(false)}>
                사용자 정보
              </Link>
              <Link to="/match-requests" className="custom-dropdown-item text-decoration-none d-block" onClick={() => setProfileMenuOpen(false)}>
                활동
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
          {/* 💡 4. 로그인/회원가입 버튼도 Link로 변경합니다. */}
          <Button tag={Link} to="/auth" className="btn-custom btn-login mr-2">로그인</Button>
          <Button tag={Link} to="/auth" onClick={() => sessionStorage.setItem('authMode', 'register')} className="btn-custom btn-register">회원가입</Button>
        </div>
      );
    }
  };

  return (
    <>
      {/* --- 데스크탑용 네비게이션 바 --- */}
      <Navbar color="light" light expand="lg" className="d-none d-lg-flex sticky-top shadow-sm" style={{ zIndex: 1030 }}>
        <Container className="d-flex align-items-center">
          {/* 💡 5. 로고와 브랜드 이름을 Link로 변경합니다. */}
          <NavbarBrand tag={Link} to="/">
            <img src={myLogo} alt="My App Logo" style={{ height: '40px' }} />
            <span className="ml-2 font-weight-bold">밥상친구</span>
          </NavbarBrand>
          <Nav className="mx-auto" navbar>
            {/* 💡 6. 각 네비게이션 항목들을 Link로 변경합니다. */}
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
                {!isAuthenticated && (
                  // 💡 7. 모바일 메뉴의 링크들도 모두 Link로 변경합니다.
                  <NavItem><NavLink tag={Link} to="/auth" onClick={handleMenuClick} className="offcanvas-nav-link-login">로그인이 필요합니다</NavLink></NavItem>
                )}
                <hr/>
                <NavItem><NavLink tag={Link} to="/matching" onClick={handleMenuClick} className="offcanvas-nav-link">🤝 매칭하기</NavLink></NavItem>
                <NavItem><NavLink tag={Link} to="/schedule" onClick={handleMenuClick} className="offcanvas-nav-link">📅 일정 만들기</NavLink></NavItem>
                <NavItem><NavLink tag={Link} to="/board" onClick={handleMenuClick} className="offcanvas-nav-link">📋 게시판</NavLink></NavItem>
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