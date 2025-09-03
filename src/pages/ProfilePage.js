import React, { useState, useRef } from 'react';

import { Button, Card, CardBody, FormGroup, Form, Input, CardHeader, Label, Badge } from 'reactstrap';

const ProfilePage = ({ user, setUser, onNavigate }) => {
  const [tempUser, setTempUser] = useState(user);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempUser(prev => ({ ...prev, [name]: value }));
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

  const handleSave = () => {
    setUser(tempUser);
    alert('정보가 저장되었습니다.');
    onNavigate('home');
  };

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
              <Input id="name" name="name" value={tempUser.name} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="age">나이</Label>
              <Input id="age" name="age" type="number" value={tempUser.age} onChange={handleChange} />
            </FormGroup>

            <FormGroup>
              <Label>음식 취향</Label>
              {/* ✨ 1. 이 div에 스타일을 추가하여 스크롤 가능한 영역으로 만듭니다. */}
              <div
                style={{
                  maxHeight: '150px',       // 최대 높이를 150px로 설정
                  overflowY: 'auto',        // 내용이 넘치면 세로 스크롤바 자동 생성
                  border: '1px solid #dee2e6', // 테두리 추가
                  padding: '10px',          // 안쪽 여백 추가
                  borderRadius: '0.25rem' // 모서리를 둥글게
                }}
              >
                {Object.keys(tempUser.preferences).filter(key => tempUser.preferences[key]).map(pref => (
                  // ✨ 2. 뱃지가 줄바꿈되도록 mb-1(아래쪽 마진)을 추가합니다.
                  <Badge color="info" className="mr-1 mb-1" key={pref}>{pref}</Badge>
                ))}
                {Object.keys(tempUser.preferences).filter(key => tempUser.preferences[key]).length === 0 && (
                  <small className="text-muted">선택된 취향이 없습니다.</small>
                )}
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
                value={tempUser.bio}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">이메일</Label>
              <Input id="email" name="email" type="email" value={tempUser.email} onChange={handleChange} />
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