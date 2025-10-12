import React, { useState, useRef } from 'react';
import { Button, Card, CardBody, Container, Row, Col, FormGroup, Label, Input } from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// ✨ 1. 선택 가능한 기본 이미지 목록을 정의합니다. (나중에 이 URL들을 원하는 이미지로 바꾸세요)
import bearImage from '../images/bear.png';
import duckImage from '../images/duck.png';
import rabbitImage from '../images/rabbit.png';
import frogImage from '../images/frog.png';

const defaultImages = [
  bearImage,
  duckImage,
  rabbitImage,
  frogImage,
];

const ProfileSetupPage = ({ animationClass }) => {
  const [step, setStep] = useState(1);
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    gender: '',
    name: user?.name || '',
    age: '',
    preferences: {},
    // ✨ 2. 기본 이미지 목록의 첫 번째 이미지를 초기값으로 설정합니다.
    profileImage: user?.profileImage || defaultImages[0],
    bio: ''
  });

  const foodPreferencesList = ['한식', '중식', '일식', '양식', '분식', '맵짱이','맵찔이', '채식주의','육식주의'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceToggle = (pref) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [pref]: !prev.preferences[pref],
      }
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, profileImage: event.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleNext = () => {
    if (step === 1 && !formData.gender) {
      alert('성별을 선택해주세요.');
      return;
    }
    if (step === 2 && (!formData.name || !formData.age)) {
      alert('이름과 나이를 입력해주세요.');
      return;
    }
    if (step === 3 && Object.values(formData.preferences).every(v => !v)) {
        alert('취향을 1개 이상 선택해주세요.');
        return;
    }
    setStep(step + 1);
  };
  
  const handleBack = () => {
    setStep(step - 1);
  };
  
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      
      const payload = {
      ...formData,
      age: formData.age ? parseInt(formData.age, 10) : null,
    };

    delete payload.gender;
      
      const response = await axios.put(`${API_URL}/api/user/profile`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      updateUser(response.data);
      alert("설정이 완료되었습니다! 이제 밥상친구를 시작해보세요.");
      navigate('/');
    } catch (error) {
      console.error("프로필 설정 실패:", error);
      alert("프로필 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        // ... (이전 코드와 동일)
        return (
          <>
            <h3 className="mb-4 text-center">성별을 선택해주세요</h3>
            <div className="d-flex justify-content-center" style={{ gap: '1rem' }}>
              <Button
                outline={formData.gender !== 'male'}
                color="primary"
                onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                className="w-100 py-3"
              >
                남성
              </Button>
              <Button
                outline={formData.gender !== 'female'}
                color="primary"
                onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                className="w-100 py-3"
              >
                여성
              </Button>
            </div>
            <Button color="primary" className="mt-4 w-100" onClick={handleNext}>다음</Button>
          </>
        );
      case 2:
        // ... (이전 코드와 동일)
        return (
          <>
            <h3 className="mb-4 text-center">이름과 나이를 알려주세요</h3>
            <FormGroup>
              <Label htmlFor="name">이름</Label>
              <Input id="name" name="name" placeholder="이름을 입력하세요" value={formData.name} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="age">나이</Label>
              <Input id="age" name="age" type="number" placeholder="나이를 입력하세요" value={formData.age} onChange={handleChange} />
            </FormGroup>
            <div className="d-flex justify-content-between mt-4">
              <Button color="secondary" onClick={handleBack}>이전</Button>
              <Button color="primary" onClick={handleNext}>다음</Button>
            </div>
          </>
        );
      case 3:
        // ... (이전 코드와 동일)
        return (
           <>
            <h3 className="mb-4 text-center">음식 취향을 알려주세요</h3>
            <div className="preference-grid">
              {foodPreferencesList.map(pref => (
                <Button
                  key={pref}
                  outline={!formData.preferences[pref]}
                  color="info"
                  onClick={() => handlePreferenceToggle(pref)}
                >
                  {pref}
                </Button>
              ))}
            </div>
            <div className="d-flex justify-content-between mt-4">
              <Button color="secondary" onClick={handleBack}>이전</Button>
              <Button color="primary" onClick={handleNext}>다음</Button>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h3 className="mb-4 text-center">프로필 이미지를 등록해주세요</h3>
            {/* 큰 미리보기 이미지 (업로드 또는 기본 이미지 선택 결과 표시) */}
            <div className="text-center mb-4">
              <img
                src={formData.profileImage}
                alt="Profile Preview"
                className="rounded-circle"
                style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer', border: '4px solid #eee' }}
                onClick={() => fileInputRef.current.click()}
              />
              <Input
                type="file"
                innerRef={fileInputRef}
                onChange={handleImageChange}
                style={{ display: 'none' }}
                accept="image/*"
              />
              <small className="d-block mt-2 text-muted">이미지를 클릭하여 직접 업로드</small>
            </div>
            
            {/* ✨ 3. 기본 이미지 선택 UI를 추가합니다. */}
            <div className="default-image-selector">
              {defaultImages.map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`Default ${index + 1}`}
                  className={`rounded-circle ${formData.profileImage === imgSrc ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, profileImage: imgSrc }))}
                />
              ))}
            </div>
            <small className="d-block text-center text-muted mt-2">또는 기본 이미지 선택</small>

             <div className="d-flex justify-content-between mt-5">
              <Button color="secondary" onClick={handleBack}>이전</Button>
              <Button color="success" onClick={handleSubmit}>가입 완료</Button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInStep {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .step-content-animation {
          animation: fadeInStep 0.4s ease-out;
        }
        .preference-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 0.75rem;
          max-height: 200px;
          overflow-y: auto;
          padding: 5px;
        }
        
        /* ✨ 4. 기본 이미지 선택 UI를 위한 스타일을 추가합니다. */
        .default-image-selector {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
        }
        .default-image-selector img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          cursor: pointer;
          border: 3px solid transparent;
          transition: border-color 0.2s ease-in-out;
        }
        .default-image-selector img:hover {
          border-color: #ddd;
        }
        .default-image-selector img.selected {
          border-color: #0d6efd; /* Bootstrap Primary Color */
        }
      `}</style>

      <div className="vh-150 d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col lg="7" md="10">
               <Card className={`shadow-lg border-0 ${animationClass}`} style={{ minHeight: '450px' }}>
                <CardBody className="p-5 d-flex flex-column justify-content-center">
                  <div key={step} className="step-content-animation">
                    {renderStepContent()}
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default ProfileSetupPage;