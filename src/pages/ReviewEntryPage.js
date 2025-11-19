import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, CardBody, CardHeader, Input, Button, FormGroup, Label } from 'reactstrap';
import axios from 'axios';
import{ getToken } from '../utils/tokenStorage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const ReviewEntryPage = () => {
    const [code, setCode] = useState('');
    const navigate = useNavigate();

    const handleSubmitCode = async () => {
        if (code.trim() === '') {
            alert('코드를 입력해주세요.');
            return;
        }
        try {
            const token = getToken();
            const response = await axios.post(`${API_URL}/api/reviews/verify`, { code }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { matchId, opponentId, opponentName, opponentProfileImage } = response.data;
            const opponent = { opponentId, opponentName, opponentProfileImage };

            navigate('/write-review', { state: { opponent, matchId } });

        } catch (error) {
            console.error("코드 인증 실패:", error);
            alert(error.response?.data?.error || "유효하지 않은 코드이거나, 매칭 참여자가 아닙니다.");
        }
    };

    return (
        <Container className="mt-5" style={{ paddingTop: '80px' }}>
            <Card>
                <CardHeader><h4>후기 작성을 위한 코드 입력</h4></CardHeader>
                <CardBody>
                    <p className="text-muted">상대방의 화면에 표시된 QR 코드를 스캔하거나 6자리 숫자 코드를 입력해주세요.</p>
                    
                    {/* ✅ [수정] QR 스캔 버튼 활성화 및 기능 연결 */}
                    <Button color="warning" block className="mt-3" onClick={() => navigate('/scan-review-qr')}>
                        📷 QR 코드 스캔하기
                    </Button>
                    
                    <hr />

                    <FormGroup>
                        <Label for="reviewCode"><h5>숫자 코드</h5></Label>
                        <Input
                            id="reviewCode"
                            name="reviewCode"
                            placeholder="6자리 숫자 코드를 입력하세요"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            maxLength={6}
                        />
                    </FormGroup>
                    <Button color="primary" block onClick={handleSubmitCode} className="mt-3">
                        상대방 확인하고 후기 작성하기
                    </Button>
                </CardBody>
            </Card>
        </Container>
    );
};

export default ReviewEntryPage;