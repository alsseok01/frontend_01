// src/pages/MatchRequestsPage.js

import React, { useEffect, useState } from 'react'; // useState 추가
import { useNavigate } from 'react-router-dom';
// Modal 관련 컴포넌트와 axios 추가
import { Button, Card, CardBody, CardHeader, ListGroup, ListGroupItem, Container, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';
import '../css/BoardPage.css';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; 

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const MatchRequestsPage = () => {
  const {
    matchRequests,
    fetchMatchRequests,
    acceptMatch,
    rejectMatch,
    confirmMatch,
    sentMatchRequests,
    fetchSentMatchRequests,
    deleteMatch,
    user
  } = useAuth();

  const navigate = useNavigate();

  // ✅ [추가] 후기 코드 모달을 제어하기 위한 상태
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewCodes, setReviewCodes] = useState(null);

  useEffect(() => {
    fetchMatchRequests();
    fetchSentMatchRequests();
  }, [fetchMatchRequests, fetchSentMatchRequests]);

  // ✅ [추가] '후기 작성' 버튼 클릭 시 실행될 핸들러
  const handleOpenReviewModal = async (matchId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/reviews/match/${matchId}/code`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviewCodes(response.data);
      setReviewModalOpen(true);
    } catch (error) {
      console.error("후기 코드를 가져오는데 실패했습니다:", error);
      alert(error.response?.data?.error || "후기 코드를 가져오는데 실패했습니다.");
    }
  };

  // ✅ [추가] 후기 코드 모달을 닫는 함수
  const toggleReviewModal = () => {
    setReviewModalOpen(!isReviewModalOpen);
    setReviewCodes(null); // 모달이 닫힐 때 코드 상태를 초기화
  };


  const handleDelete = async (matchId) => {
    if (window.confirm('정말로 이 신청을 삭제하시겠습니까?')) {
      await deleteMatch(matchId);
    }
  };
  
  const onAccept = async (id) => {
    await acceptMatch(id);
  };

  const onReject = async (id) => {
    await rejectMatch(id);
  };

  const onConfirm = async (id) => {
    if (window.confirm('약속을 확정하시겠습니까? 확정 후에는 상대방의 후기를 작성할 수 있습니다.')) { // 문구 수정
        await confirmMatch(id);
    }
  };

  const handleChat = (matchOrId) => {
    const match =
      typeof matchOrId === 'object'
        ? matchOrId
        : sentMatchRequests.find((m) => m.id === matchOrId) ||
          matchRequests.find((m) => m.id === matchOrId);
    if (!match) return;
    const opponent =
      match.requester?.id === user.id ? match.schedule?.member : match.requester;
    navigate(`/chat/${match.id}`, { state: { opponent } });
  };

  const renderSentRequestStatus = (request) => {
    const status = String(request.status || '').toUpperCase();
    switch (status) {
      case 'ACCEPTED':
        return (
          <div className="request-status">
            <span className="status-accepted">수락됨</span>
            <Button onClick={() => handleChat(request)} color="primary" size="sm">
              채팅
            </Button>
            <Button color="success" size="sm" onClick={() => onConfirm(request.id)} className="ms-2">
              확정하기
            </Button>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="request-status">
            <span className="status-rejected">거절됨</span>
            <Button
              onClick={() => handleDelete(request.id)}
              color="danger"
              outline
              size="sm"
              className="delete-button"
            >
              X
            </Button>
          </div>
        );
      // ✅ [추가] '확정됨' 상태일 때 '후기 작성' 버튼을 보여줍니다.
      case 'CONFIRMED':
        return (
          <div className="request-status">
            <span style={{ color: '#17a2b8', fontWeight: 'bold' }}>확정됨</span>
            <Button onClick={() => handleOpenReviewModal(request.id)} color="info" size="sm">
              후기 작성
            </Button>
          </div>
        );
      default: // PENDING
        return <span>대기중</span>;
    }
  };

  // ✅ [삭제] 확정된 매칭을 필터링하던 아래 두 줄을 삭제합니다.
  // const receivedRequestsToDisplay = matchRequests.filter(m => String(m.status).toUpperCase() !== 'CONFIRMED');
  // const sentRequestsToDisplay = sentMatchRequests.filter(m => String(m.status).toUpperCase() !== 'CONFIRMED');

  return (
    <>
      <Container className="mt-4" style={{ paddingTop: '60px' }}>
        <Row className="text-center mb-4">
          <Col xs="4" className="pe-2">
              <Card className="h-100 shadow-sm">
                  <CardBody className="p-2 p-md-3">
                      <h6 className="text-muted" style={{fontSize: '0.8rem'}}>보낸 신청</h6>
                      <h4 className="font-weight-bold mb-0">{sentMatchRequests.length}</h4>
                  </CardBody>
              </Card>
          </Col>
          <Col xs="4" className="px-1">
              <Card className="h-100 shadow-sm">
                  <CardBody className="p-2 p-md-3">
                      <h6 className="text-muted" style={{fontSize: '0.8rem'}}>받은 신청</h6>
                      <h4 className="font-weight-bold mb-0">{matchRequests.length}</h4>
                  </CardBody>
              </Card>
          </Col>
          <Col xs="4" className="ps-2">
              <Card className="h-100 shadow-sm">
                  <CardBody className="p-2 p-md-3">
                      <h6 className="text-muted" style={{fontSize: '0.8rem'}}>내 평점</h6>
                      <h4 className="font-weight-bold mb-0">N/A</h4>
                  </CardBody>
              </Card>
          </Col>
        </Row>

        <Card className="mb-4">
          <CardHeader><h4>받은 매칭 신청</h4></CardHeader>
          <CardBody>
            <ListGroup flush>
              {/* ✅ [수정] 필터링된 배열 대신 원본 matchRequests 배열을 사용합니다. */}
              {matchRequests.length > 0 ? (
                matchRequests.map(m => {
                  const status = String(m.status || '').toUpperCase();
                  return (
                    <ListGroupItem key={m.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{m.requester?.name ?? '알 수 없음'}</strong> 님이&nbsp;
                        <strong>{m.schedule?.placeName ?? ''}</strong> 일정에 신청했습니다.
                      </div>
                      {status === 'PENDING' ? (
                        <div>
                          <Button color="success" size="sm" onClick={() => onAccept(m.id)} className="me-2">수락</Button>
                          <Button color="danger" size="sm" onClick={() => onReject(m.id)}>거절</Button>
                        </div>
                      ) : status === 'ACCEPTED' ? (
                        <div>
                          <Button color="primary" size="sm" onClick={() => handleChat(m)} className="me-2">채팅</Button>
                          <Button color="success" size="sm" onClick={() => onConfirm(m.id)}>확정하기</Button>
                        </div>
                      ) : status === 'REJECTED' ? (
                        <span className="status-rejected">거절됨</span>
                      // ✅ [추가] '확정됨' 상태일 때 '후기 작성' 버튼을 보여줍니다.
                      ) : status === 'CONFIRMED' ? (
                        <div>
                          <Button color="info" size="sm" onClick={() => handleOpenReviewModal(m.id)}>후기 작성</Button>
                        </div>
                      ) : null}
                    </ListGroupItem>
                  );
                })
              ) : (
                <p className="text-muted">받은 매칭 신청이 없습니다.</p>
              )}
            </ListGroup>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h4>내가 보낸 신청</h4></CardHeader>
          <CardBody>
            <ListGroup flush>
              {/* ✅ [수정] 필터링된 배열 대신 원본 sentMatchRequests 배열을 사용합니다. */}
              {sentMatchRequests.length > 0 ? (
                sentMatchRequests.map(m => (
                  <ListGroupItem key={m.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{m.schedule?.member?.name ?? '알 수 없음'}</strong> 님의&nbsp;
                      <strong>{m.schedule?.placeName ?? ''}</strong> 일정에 신청
                    </div>
                    {renderSentRequestStatus(m)}
                  </ListGroupItem>
                ))
              ) : (
                <p className="text-muted">보낸 신청이 없습니다.</p>
              )}
            </ListGroup>
          </CardBody>
        </Card>
      </Container>
      
      {/* ✅ [추가] 후기 코드 생성 모달 */}
      <Modal isOpen={isReviewModalOpen} toggle={toggleReviewModal} centered>
        <ModalHeader toggle={toggleReviewModal}>후기 작성을 위한 코드 생성</ModalHeader>
        <ModalBody className="text-center">
          <p>상대방이 아래 코드를 스캔하거나 입력하도록 안내해주세요.</p>
          {reviewCodes && (
            <>
              <div className="mb-4">
                <QRCodeSVG  value={reviewCodes.qrCode} size={256} />
              </div>
              <div>
                <h5>숫자 코드</h5>
                <p className="display-6 font-weight-bold">{reviewCodes.numericCode}</p>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleReviewModal}>닫기</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default MatchRequestsPage;