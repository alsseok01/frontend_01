import React from 'react';

import { Button, Card, CardBody, FormGroup, Form, Input, Container, Row, Col } from 'reactstrap';

const ForgotPasswordPage = ({ onSwitchMode }) => (
  <Container className="mt-5">
    <Row className="justify-content-center">
      <Col lg="5" md="7">
        <Card className="shadow-lg border-0">
          <CardBody className="px-lg-5 py-lg-5">
            <div className="text-center text-muted mb-4"><h2>비밀번호 찾기</h2></div>
            <Form role="form" onSubmit={(e) => e.preventDefault()}>
              <FormGroup><Input placeholder="가입한 이메일" type="email" /></FormGroup>
              <div className="text-center">
                <Button className="my-4" color="primary" type="button" onClick={() => { alert('이메일로 임시 비밀번호를 전송했습니다.'); onSwitchMode('login'); }}>전송</Button>
              </div>
            </Form>
            <div className="text-center"><a href="#/" onClick={() => onSwitchMode('login')}><small>로그인 페이지로 돌아가기</small></a></div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default ForgotPasswordPage;
