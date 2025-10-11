import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader, ListGroup, ListGroupItem, Container, Row, Col } from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';
import '../css/BoardPage.css';

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

  useEffect(() => {
    fetchMatchRequests();
    fetchSentMatchRequests();
  }, [fetchMatchRequests, fetchSentMatchRequests]);

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
    if (window.confirm('약속을 확정하시겠습니까? 확정 후에는 매칭 목록에서 사라집니다.')) {
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
            <Button onClick={() => handleChat(request)} color="primary" size="sm" className="me-2">
              채팅
            </Button>
            <Button color="success" size="sm" onClick={() => onConfirm(request.id)}>확정하기</Button>
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
      default: // PENDING
        return <span>대기중</span>;
    }
  };

  const receivedRequestsToDisplay = matchRequests.filter(
    m => String(m.status).toUpperCase() !== 'CONFIRMED'
  );

  const sentRequestsToDisplay = sentMatchRequests.filter(
    m => String(m.status).toUpperCase() !== 'CONFIRMED'
  );

  return (
    // ✅ [수정] Container에 `paddingTop` 스타일을 추가하여 모바일 헤더와 겹치지 않도록 공간을 확보합니다.
    <Container className="mt-4" style={{ paddingTop: '60px' }}>
      <Row className="text-center mb-4">
        <Col xs="4" className="pe-2">
            <Card className="h-100 shadow-sm">
                <CardBody className="p-2 p-md-3">
                    <h6 className="text-muted" style={{fontSize: '0.8rem'}}>보낸 신청</h6>
                    <h4 className="font-weight-bold mb-0">{sentRequestsToDisplay.length}</h4>
                </CardBody>
            </Card>
        </Col>
        <Col xs="4" className="px-1">
            <Card className="h-100 shadow-sm">
                <CardBody className="p-2 p-md-3">
                    <h6 className="text-muted" style={{fontSize: '0.8rem'}}>받은 신청</h6>
                    <h4 className="font-weight-bold mb-0">{receivedRequestsToDisplay.length}</h4>
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

      {/* 받은 매칭 신청 카드 */}
      <Card className="mb-4">
        <CardHeader><h4>받은 매칭 신청</h4></CardHeader>
        <CardBody>
          <ListGroup flush>
            {receivedRequestsToDisplay.length > 0 ? (
              receivedRequestsToDisplay.map(m => {
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

      {/* 내가 보낸 신청 카드 */}
      <Card>
        <CardHeader><h4>내가 보낸 신청</h4></CardHeader>
        <CardBody>
          <ListGroup flush>
            {sentRequestsToDisplay.length > 0 ? (
              sentRequestsToDisplay.map(m => (
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
  );
};

export default MatchRequestsPage;