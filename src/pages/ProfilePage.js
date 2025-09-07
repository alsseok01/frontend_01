import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; 
import axios from 'axios';
import { Button, Card, CardBody, FormGroup, Form, Input, CardHeader, Label, Badge } from 'reactstrap';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const foodPreferencesList = ['한식', '중식', '일식', '양식', '분식', '맵짱이','맵찔이', '채식주의','육식주의'];

const ProfilePage = ({ onNavigate }) => {
  const { user, updateUserProfile } = useAuth();

  const [tempUser, setTempUser] = useState(null); 
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setTempUser(user);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceToggle = (pref) => {
    setTempUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [pref]: !prev.preferences?.[pref], // ?. 연산자로 preferences가 없을 경우를 대비
      }
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempUser(prev => ({ ...prev, profileImage: event.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('인증 정보가 만료되었습니다. 다시 로그인해주세요.');
        onNavigate('login');
        return;
      }

      await axios.put(`${API_URL}/api/user/profile`, tempUser, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      updateUserProfile(tempUser);

      alert('정보가 성공적으로 저장되었습니다.');
      onNavigate('home');

    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
      alert("정보 저장에 실패했습니다. 다시 시도해주세요.");
    }
    // ✅ [오류 수정] 로딩 체크 로직을 이 함수 밖으로 이동시켰습니다.
  };
  
  // ✅ [오류 수정] 데이터가 로딩되기 전(tempUser가 null일 때) 렌더링을 막는 '가드 클로즈'를
  // 컴포넌트의 메인 return 바로 위, 올바른 위치로 이동시켰습니다.
  if (!tempUser) {
    return <div>사용자 정보를 불러오는 중입니다...</div>;
  }

  // 이제 이 아래의 코드는 tempUser가 확실히 존재할 때만 실행됩니다.
  return (
    <div className="p-3 p-md-4">
      <Card className="shadow-sm">
        <CardHeader><h3>사용자 정보 수정</h3></CardHeader>
        <CardBody>
          <Form>
            <div className="text-center mb-4">
              <img
                src={tempUser.profileImage}
                alt="Profile"
                className="rounded-circle"
                style={{ width: '100px', height: '100px', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => fileInputRef.current.click()}
              />
              <Input
                type="file"
                innerRef={fileInputRef} 
                onChange={handleImageChange}
                style={{ display: 'none' }}
                accept="image/*"
              />
              <small className="d-block mt-2 text-muted">이미지를 클릭하여 변경</small>
            </div>
            
            <FormGroup>
              <Label htmlFor="name">이름</Label>
              {/* ✅ 데이터가 없을 경우를 대비해 || '' 추가 */}
              <Input id="name" name="name" value={tempUser.name || ''} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="age">나이</Label>
              <Input id="age" name="age" type="number" value={tempUser.age || ''} onChange={handleChange} />
            </FormGroup>

            <FormGroup>
              <Label>음식 취향 (클릭하여 변경)</Label>
              <div
                className="preference-grid" // CSS 클래스를 재활용하거나 새로 만듭니다.
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '0.75rem',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  border: '1px solid #dee2e6',
                  padding: '10px',
                  borderRadius: '0.25rem'
                }}
              >
                {/* 전체 취향 목록을 버튼으로 표시합니다. */}
                {foodPreferencesList.map(pref => (
                  <Button
                    key={pref}
                    // tempUser.preferences에 해당 취향이 true이면 선택된 상태(primary), 아니면 기본 상태(outline)
                    outline={!tempUser.preferences?.[pref]}
                    color="info"
                    onClick={() => handlePreferenceToggle(pref)}
                  >
                    {pref}
                  </Button>
                ))}
              </div>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="bio">자기소개</Label>
              <Input
                id="bio"
                name="bio"
                type="textarea"
                rows="4"
                placeholder="자신을 소개해주세요."
                value={tempUser.bio || ''}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">이메일</Label>
              <Input id="email" name="email" type="email" value={tempUser.email || ''} readOnly disabled />
            </FormGroup>
            <div className="d-flex justify-content-end mt-4">
              <Button color="secondary" className="mr-2" onClick={() => onNavigate('home')}>취소</Button>
              <Button color="primary" onClick={handleSave}>저장</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProfilePage;