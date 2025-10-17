import React, { useEffect, useMemo } from 'react';
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
    user,
    refreshUser
  } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    refreshUser(); 
    fetchMatchRequests();
    fetchSentMatchRequests();
  }, [fetchMatchRequests, fetchSentMatchRequests, refreshUser]);

  const visibleMatchRequests = useMemo(() => {
    return matchRequests.filter(m => {
        const status = String(m.status || '').toUpperCase();
        if (status === 'REJECTED' || (status === 'CONFIRMED' && m.hostReviewed)) {
            return false;
        }
        return true;
    });
  }, [matchRequests]);

  const visibleSentMatchRequests = useMemo(() => {
    return sentMatchRequests.filter(m => {
        const status = String(m.status || '').toUpperCase();
        if (status === 'REJECTED' || (status === 'CONFIRMED' && m.requesterReviewed)) {
            return false;
        }
        return true;
    });
  }, [sentMatchRequests]);

  const handleWriteReviewClick = (match) => {
    const isRequester = user.id === match.requester.id;
    const opponentMember = isRequester ? match.schedule.member : match.requester;
    const opponentInfo = {
        opponentId: opponentMember.id,
        opponentName: opponentMember.name,
        opponentProfileImage: opponentMember.profileImage
    };
    navigate('/write-review', { state: { opponent: opponentInfo, matchId: match.id } });
  };

  const onAccept = async (id) => {
    await acceptMatch(id);
  };

  const onReject = async (id) => {
    if (window.confirm('정말로 이 신청을 거절하시겠습니까?')) {
        await rejectMatch(id);
    }
  };

  const onConfirm = async (id) => {
    if (window.confirm('약속을 확정하시겠습니까? 확정 후에는 상대방의 후기를 작성할 수 있습니다.')) {
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
  
  // ✅ [수정] '내가 보낸 신청' 목록에서 '확정됨' 상태일 때 채팅 버튼을 추가합니다.
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
          </div>
        );
      case 'CONFIRMED':
        if (request.requester.id === user.id && !request.requesterReviewed) {
          return (
            <div className="request-status">
              <span style={{ color: '#17a2b8', fontWeight: 'bold' }}>확정됨</span>
              <Button onClick={() => handleChat(request)} color="primary" size="sm" className="me-2">채팅</Button>
              <Button onClick={() => handleWriteReviewClick(request)} color="info" size="sm">
                후기 작성
              </Button>
            </div>
          );
        }
        return null;
      case 'REJECTED':
        return null; 
      default:
        return <span>대기중</span>;
    }
  };

  const displayRating = user && user.reviewCount >= 5
    ? parseFloat(user.averageRating).toFixed(1)
    : 'N/A';

  return (
    <>
      <Container className="mt-4" style={{ paddingTop: '60px' }}>
        <Row className="text-center mb-4">
            <Col xs="4" className="pe-2">
                <Card className="h-100 shadow-sm"><CardBody className="p-2 p-md-3">
                    <h6 className="text-muted" style={{fontSize: '0.8rem'}}>보낸 신청</h6>
                    <h4 className="font-weight-bold mb-0">{visibleSentMatchRequests.length}</h4>
                </CardBody></Card>
            </Col>
            <Col xs="4" className="px-1">
                <Card className="h-100 shadow-sm"><CardBody className="p-2 p-md-3">
                    <h6 className="text-muted" style={{fontSize: '0.8rem'}}>받은 신청</h6>
                    <h4 className="font-weight-bold mb-0">{visibleMatchRequests.length}</h4>
                </CardBody></Card>
            </Col>
            <Col xs="4" className="ps-2">
                <Card className="h-100 shadow-sm"><CardBody className="p-2 p-md-3">
                    <h6 className="text-muted" style={{fontSize: '0.8rem'}}>내 평점</h6>
                    <h4 className="font-weight-bold mb-0">{displayRating}</h4>
                </CardBody></Card>
            </Col>
        </Row>

        <Card className="mb-4">
          <CardHeader><h4>받은 매칭 신청</h4></CardHeader>
          <CardBody>
            <ListGroup flush>
              {visibleMatchRequests.length > 0 ? (
                visibleMatchRequests.map(m => {
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
                      // ✅ [수정] '받은 신청' 목록에서 '확정됨' 상태일 때 채팅 버튼을 추가합니다.
                      ) : status === 'CONFIRMED' ? (
                        (m.schedule.member.id === user.id && !m.hostReviewed) ? (
                            <div>
                                <Button color="primary" size="sm" onClick={() => handleChat(m)} className="me-2">채팅</Button>
                                <Button color="info" size="sm" onClick={() => handleWriteReviewClick(m)}>후기 작성</Button>
                            </div>
                        ) : null
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
              {visibleSentMatchRequests.length > 0 ? (
                visibleSentMatchRequests.map(m => (
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
    </>
  );
};

export default MatchRequestsPage;