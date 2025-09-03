import React, { useState } from 'react';
import { Button, Container, Navbar, NavbarBrand, Offcanvas, OffcanvasHeader, OffcanvasBody, Nav, NavItem, NavLink, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import myLogo from '../images/logo.png';
import '../css/HomePage.css';
import { useAuth } from '../contexts/AuthContext';

const AppLayout = ({ children, onLogout }) => {
  const { user, isAuthenticated, onNavigate } = useAuth();


  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const toggleProfileDropdown = () => setProfileDropdownOpen(!isProfileDropdownOpen);

  const handleMenuClick = (page) => {
    onNavigate(page);
    toggleMenu();
  };

  const renderNavButtons = () => {
    if (isAuthenticated && user) {
      return (
        <Dropdown isOpen={isProfileDropdownOpen} toggle={toggleProfileDropdown}>
          <DropdownToggle tag="span" style={{ cursor: 'pointer' }}>
            <img src={user.profileImage} alt="Profile" className="rounded-circle" style={{ height: '40px', width: '40px' }} />
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem onClick={() => onNavigate('profile')}>사용자 정보</DropdownItem>
            <DropdownItem>활동</DropdownItem>
            <DropdownItem divider />
            <DropdownItem onClick={onLogout}>로그아웃</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      );
    } else {
      return (
        <div>
          <Button className="btn-custom btn-login mr-2" onClick={() => onNavigate('login')}>로그인</Button>
          <Button className="btn-custom btn-register" onClick={() => onNavigate('register')}>회원가입</Button>
        </div>
      );
    }
  };

  return (
    <>
      {/* --- 데스크탑용 네비게이션 바 --- */}
      <Navbar color="light" light expand="lg" className="d-none d-lg-flex sticky-top shadow-sm">
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
      <Navbar color="light" light fixed="top" className="p-3 d-lg-none shadow-sm">
        <div className="d-flex justify-content-between align-items-center w-100">
          <Button color="link" className="p-0" onClick={toggleMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/></svg>
          </Button>
          <NavbarBrand href="#" onClick={() => onNavigate('home')} className="position-absolute" style={{left: '33%', transform: 'translateX(-50%)'}}>
            <img src={myLogo} alt="My App Logo" style={{ height: '40px' }} />
          </NavbarBrand>
          <div style={{minWidth: '50px'}} className="d-flex justify-content-end">
            {renderNavButtons()}
          </div>
        </div>
      </Navbar>

      {/* --- 모바일용 Offcanvas 메뉴 --- */}
      <Offcanvas isOpen={isMenuOpen} toggle={toggleMenu}>
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
      <div style={{ paddingTop: '0px' }}>
        {children}
      </div>
    </>
  );
};

export default AppLayout;

