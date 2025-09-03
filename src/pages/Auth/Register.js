import React from 'react';
import { Button, Card, CardBody, FormGroup, Form, Input, Container, Row, Col } from 'reactstrap';

const RegisterPage = ({ onSwitchMode, onSetupComplete }) => {
  const handleRegister = (e) => {
    e.preventDefault();
    alert('가입 완료! 사용자 설정 페이지로 이동합니다.');
    // ✅ [수정] 'login' 대신 'profileSetup' 페이지로 이동하도록 변경
    onSwitchMode('profileSetup');
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
                  <FormGroup><Input placeholder="이름" type="text" required /></FormGroup>
                  <FormGroup><Input placeholder="이메일" type="email" required /></FormGroup>
                  <FormGroup><Input placeholder="비밀번호" type="password" required /></FormGroup>
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

