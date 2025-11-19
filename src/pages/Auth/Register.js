import React, { useState } from 'react';
import { Button, Card, CardBody, FormGroup, Form, Input, InputGroup, Col, Row } from 'reactstrap'; 
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
//const API_URL = 'https://api.tablefriends.site';
const RegisterPage = ({ onSwitchMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const { register } = useAuth();

  const handleSendVerification = async () => {
    if (!email) {
      alert('이메일을 먼저 입력해주세요.');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/auth/send-verification-email`, { email });
      alert('인증 코드가 이메일로 전송되었습니다. 이메일을 확인해주세요.');
      setIsVerificationSent(true);
    } catch (error) {
      alert('인증 코드 전송에 실패했습니다. 이메일을 확인해주세요.');
      console.error('인증 코드 전송 실패:', error);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      alert('인증 코드를 입력해주세요.');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/auth/verify-email`, { email, code: verificationCode });
      alert('이메일 인증이 완료되었습니다.');
      setIsVerified(true);
    } catch (error) {
      alert('인증 코드가 올바르지 않습니다.');
      console.error('이메일 인증 실패:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isVerified) {
      alert('이메일 인증을 먼저 완료해주세요.');
      return;
    }

    if (!name || !email || !password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      await register(name, email, password);
      onSwitchMode('profileSetup');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || "회원가입 중 오류가 발생했습니다.";
      alert(`회원가입 실패: ${errorMessage}`);
      console.error('회원가입 실패:', error);
    }
  };

  return (
    <Row className="justify-content-center">
      <Col lg="5" md="8">
        <Card className="shadow-lg border-0">
          <CardBody className="px-lg-5 py-lg-5">
            <div className="text-center text-muted mb-4">
              <h2>회원가입</h2>
            </div>
            <Form role="form" onSubmit={handleRegister}>
              <FormGroup>
                <Input placeholder="이름" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </FormGroup>
              
              <FormGroup>
                <InputGroup>
                  <Input 
                    placeholder="이메일" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    disabled={isVerificationSent}
                  />
                  {/* InputGroupAddon 태그를 삭제하고 Button을 바로 넣습니다. */}
                  <Button color="secondary" onClick={handleSendVerification} disabled={isVerificationSent}>
                    인증번호 받기
                  </Button>
                </InputGroup>
              </FormGroup>

              {isVerificationSent && !isVerified && (
                <FormGroup>
                  <InputGroup>
                    <Input 
                      placeholder="인증 코드" 
                      type="text" 
                      value={verificationCode} 
                      onChange={(e) => setVerificationCode(e.target.value)} 
                      required 
                    />
                    {/* InputGroupAddon 태그를 삭제하고 Button을 바로 넣습니다. */}
                    <Button color="success" onClick={handleVerifyCode}>
                      인증 확인
                    </Button>
                  </InputGroup>
                </FormGroup>
              )}

              <FormGroup>
                <Input placeholder="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </FormGroup>
              
              {isVerified && <div className="text-success text-center my-3">✅ 이메일 인증이 완료되었습니다.</div>}

              <div className="text-center">
                <Button className="my-4" color="primary" type="submit" disabled={!isVerified}>
                  가입하기
                </Button>
              </div>
            </Form>
            <div className="text-center">
              <a href="#pablo" onClick={(e) => { e.preventDefault(); onSwitchMode('login'); }}>
                <small>이미 계정이 있으신가요? 로그인</small>
              </a>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default RegisterPage;