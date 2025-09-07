import React, { useState } from 'react'; // useState import
import { Button, Card, CardBody, FormGroup, Form, Input, Container, Row, Col } from 'reactstrap';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = ({ onSwitchMode, onSetupComplete }) => {
  const { processLoginData } = useAuth();
  // 입력 필드 값을 관리하기 위한 state 추가
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  

  // ✅ [수정] 백엔드 API와 통신하는 로직으로 변경
  const handleRegister = async (e) => {
    e.preventDefault();

    // 입력값 검증
    if (!name || !email || !password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const userData = {
      name,
      email,
      password,
    };

    try {
      // 백엔드의 회원가입 API 주소 (환경에 맞게 수정)
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: "include"
      });

      if (response.ok) {
        const loginData = await response.json();
        processLoginData(loginData);
                
        alert('가입 완료! 프로필 설정 페이지로 이동합니다.');
        onSwitchMode('profileSetup'); // 로
      } else {
        // 서버에서 보낸 에러 메시지를 표시
        const errorMessage = await response.text();
        alert(`회원가입 실패: ${errorMessage}`);
      }
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      alert('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
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
                  {/* ✅ [수정] 각 Input에 value와 onChange 핸들러 추가 */}
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