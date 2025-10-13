// src/pages/QrScanPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ [수정] QrScanner를 Scanner로 변경합니다.
import { Scanner } from '@yudiel/react-qr-scanner';
import { Container, Card, CardBody, CardHeader, Alert, Button } from 'reactstrap';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const QrScanPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleDecode = async (result) => {
        const qrCode = result;
        if (qrCode) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(`${API_URL}/api/reviews/verify`, { code: qrCode }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const { matchId, opponentId, opponentName, opponentProfileImage } = response.data;
                const opponent = { opponentId, opponentName, opponentProfileImage };

                navigate('/write-review', { state: { opponent, matchId } });

            } catch (err) {
                console.error("QR 코드 인증 실패:", err);
                const errorMessage = err.response?.data?.error || "유효하지 않은 QR코드입니다. 다시 시도해주세요.";
                setError(errorMessage);
                setTimeout(() => setError(null), 3000);
            }
        }
    };

    const handleError = (error) => {
        console.error("QR Scanner Error:", error);
        if (error?.name === 'NotAllowedError') {
            setError("카메라 접근 권한이 필요합니다. 브라우저 설정에서 카메라 권한을 허용해주세요.");
        } else {
            setError("카메라를 시작하는 중 오류가 발생했습니다. 페이지를 새로고침 해주세요.");
        }
    };

    return (
        <Container className="mt-5" style={{ paddingTop: '80px' }}>
            <Card>
                <CardHeader className="d-flex justify-content-between align-items-center">
                    <h4>상대방의 QR 코드 스캔</h4>
                    <Button close onClick={() => navigate(-1)} />
                </CardHeader>
                <CardBody>
                    <p className="text-muted text-center">상대방의 화면에 표시된 QR 코드를 사각형 안에 맞춰주세요.</p>
                    
                    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', position: 'relative' }}>
                        {/* ✅ [수정] QrScanner 컴포넌트를 Scanner로 변경합니다. */}
                        <Scanner
                            onDecode={handleDecode}
                            onError={handleError}
                            containerStyle={{ paddingTop: '100%', position: 'relative' }}
                            videoStyle={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                         {error && (
                            <Alert color="danger" style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', zIndex: 10 }}>
                                {error}
                            </Alert>
                        )}
                    </div>
                </CardBody>
            </Card>
        </Container>
    );
};

export default QrScanPage;