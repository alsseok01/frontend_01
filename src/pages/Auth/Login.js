import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, CardBody, FormGroup, Form, Input, InputGroup, InputGroupText, Container, Row, Col } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onSwitchMode }) => { 
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
 const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    try {
      await login(email, password, { remember }); 
      navigate('/'); 
    } catch (error) {
      alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      console.error('로그인 실패:', error);
    }
  };
  
  const GOOGLE_AUTH_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/oauth2/authorization/google`;
  const KAKAO_AUTH_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/oauth2/authorization/kakao`;

  const backgroundImageUrl = '';

  return (
    <div
      className="vh-100 d-flex align-items-center"
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col lg="5" md="8">
            <Card className="shadow-lg border-0">
              <CardBody className="px-lg-5 py-lg-5">
                <div className="text-center text-muted mb-4">
                  <h2>로그인</h2>
                  <small>계정 정보로 로그인해주세요.</small>
                </div>
                <Form role="form" onSubmit={handleLogin}>
                  <FormGroup className="mb-3">
                    <InputGroup>
                      <InputGroupText>📧</InputGroupText>
                      <Input placeholder="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </InputGroup>
                  </FormGroup>
                  <FormGroup>
                    <InputGroup>
                      <InputGroupText>🔒</InputGroupText>
                      <Input placeholder="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </InputGroup>
                  </FormGroup>
                  <FormGroup check className="mb-3">
                    <Input type="checkbox" id="rememberMe" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                    <label htmlFor="rememberMe" className="form-check-label ms-2">로그인 상태 유지</label>
                  </FormGroup>                  <div className="text-center">
                    <Button className="my-4 w-100" color="primary" type="submit">로그인</Button>
                  </div>
                </Form>
                
                <div className="text-center">
                  <small className="text-muted">또는 소셜 계정으로 로그인</small>
                  <div className="btn-wrapper text-center mt-3">
                    <Button
                      className="btn-neutral btn-icon"
                      color="default"
                      href={GOOGLE_AUTH_URL}
                      tag="a"
                      style={{ border: '1px solid #ddd' }}
                    >
                      <span className="btn-inner--icon">
                        <svg height="20" width="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path><path d="M1 1h22v22H1z" fill="none"></path></svg>
                      </span>
                      <span className="btn-inner--text ml-2">Google</span>
                    </Button>
                    <Button
                      className="btn-icon ml-3"
                      href={KAKAO_AUTH_URL}
                      tag="a"
                      style={{ backgroundColor: '#FEE500', color: '#000000', border: '1px solid #FEE500' }}
                    >
                      <span className="btn-inner--icon">
                       <svg height="20" width="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 5.58 2 10.05c0 3.03 1.95 5.65 4.7 6.84l-.57 2.07c-.12.44.34.82.75.59l2.76-1.5c.42.09.85.13 1.36.13 5.52 0 10-3.58 10-8.05S17.52 2 12 2z" fill="#191919"></path></svg>
                      </span>
                      <span className="btn-inner--text ml-2">Kakao</span>
                    </Button>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <Button color="secondary" size="sm" onClick={() => onSwitchMode('forgotPassword')}>비밀번호 찾기</Button>
                  <Button color="secondary" size="sm" className="ml-3" onClick={() => onSwitchMode('register')}>회원가입</Button>
                </div>

              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;



