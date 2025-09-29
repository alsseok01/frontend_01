import React, { useState } from 'react';
import { Button, Card, CardBody, FormGroup, Form, Input, Container, Row, Col } from 'reactstrap';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = ({ onSwitchMode }) => {
  // ✅ [수정] useAuth()는 한 번만 호출하여 register 함수를 가져옵니다.
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      // ✅ [수정] 직접 axios를 호출하는 대신, AuthContext의 register 함수를 사용합니다.
      await register(name, email, password);
      
      alert('회원가입이 완료되었습니다. 프로필 설정 화면으로 이동합니다.');
      // 이제 register 함수가 상태를 변경했으므로, App.js가 자동으로 페이지를 올바르게 전환합니다.

    } catch (error) {
      const errorMessage = error.response?.data || "회원가입 중 오류가 발생했습니다.";
      alert(`회원가입 실패: ${errorMessage}`);
      console.error('회원가입 실패:', error);
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col lg="5" md="7">
            <Card className="shadow-lg border-0">
              <CardBody className="px-lg-5 py-lg-5">
                <div className="text-center text-muted mb-4">
                  <h2>회원가입</h2>
                </div>
                <Form role="form" onSubmit={handleRegister}>
                  <FormGroup>
                    <Input placeholder="이름" type="text" required 
                           value={name} onChange={(e) => setName(e.target.value)} />
                  </FormGroup>
                  <FormGroup>
                    <Input placeholder="이메일" type="email" required 
                           value={email} onChange={(e) => setEmail(e.target.value)} />
                  </FormGroup>
                  <FormGroup>
                    <Input placeholder="비밀번호" type="password" required 
                           value={password} onChange={(e) => setPassword(e.target.value)} />
                  </FormGroup>
                  <div className="text-center">
                    <Button className="my-4" color="primary" type="submit">가입하기</Button>
                  </div>
                </Form>
                <div className="text-center">
                  <Button color="link" onClick={() => onSwitchMode('login')}>
                    <small>이미 계정이 있으신가요? 로그인</small>
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterPage;