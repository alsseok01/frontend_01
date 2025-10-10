// src/pages/MatchRequestsPage.js

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader, ListGroup, ListGroupItem, Container } from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';
import '../css/BoardPage.css';

const MatchRequestsPage = () => {
  const {
    matchRequests,
    fetchMatchRequests,
    acceptMatch,
    rejectMatch,
    sentMatchRequests,
    fetchSentMatchRequests,
    deleteSentMatch,
    user
  } = useAuth();
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatchRequests();
    fetchSentMatchRequests();
  }, [fetchMatchRequests, fetchSentMatchRequests]);

  const handleDelete = async (matchId) => {
    if (window.confirm("정말로 이 신청을 삭제하시겠습니까?")) {
      await deleteSentMatch(matchId);
      // ✅ deleteSentMatch 내부에서 목록을 갱신하므로 별도 호출이 필요 없을 수 있습니다.
      // 만약 갱신이 안된다면 아래 코드를 추가하세요.
      // await fetchSentMatchRequests();
    }
  };
  
  // ✅ [수정] 버튼 클릭 시 호출될 함수들
  const onAccept = async (id) => {
    await acceptMatch(id);
    // acceptMatch 함수 내부에서 목록을 갱신하므로 추가 호출이 필요 없을 수 있습니다.
    // 만약 갱신이 안된다면 아래 코드를 활성화 하세요.
    // await fetchMatchRequests();
    // await fetchSentMatchRequests();
  };

  const onReject = async (id) => {
    await rejectMatch(id);
    // rejectMatch 함수 내부에서 목록을 갱신하므로 추가 호출이 필요 없을 수 있습니다.
    // 만약 갱신이 안된다면 아래 코드를 활성화 하세요.
    // await fetchMatchRequests();
  };

  const handleChat = (match) => {
    if (!match) return;
    const opponent = match.requester?.id === user.id ? match.schedule?.member : match.requester;
    navigate(`/chat/${match.id}`, { state: { opponent } });
  };

  const renderSentRequestStatus = (request) => {
    switch (request.status) {
      case 'ACCEPTED':
        return (
          <div className="request-status">
            <span className="status-accepted">수락됨</span>
            <Button onClick={() => handleChat(request)} color="primary" size="sm">채팅</Button>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="request-status">
            <span className="status-rejected">거절됨</span>
            <Button onClick={() => handleDelete(request.id)} color="danger" outline size="sm" className="delete-button">X</Button>
          </div>
        );
      default: // PENDING
        return (
          <div className="request-status">
            <span>대기중</span>
          </div>
        );
    }
  };

  return (
    <Container className="mt-4">
      {/* 받은 매칭 신청 카드 */}
      <Card className="mb-4">
        <CardHeader><h4>받은 매칭 신청</h4></CardHeader>
        <CardBody>
          <ListGroup flush>
            {matchRequests.length > 0 ? (
              matchRequests.map(m => (
                <ListGroupItem key={m.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{m.requester?.name ?? '알 수 없음'}</strong> 님이&nbsp;
                    <strong>{m.schedule?.placeName ?? ''}</strong> 일정에 신청했습니다.
                  </div>
                  {m.status === 'PENDING' ? (
                    <div>
                      {/* ✅ [수정] onClick 핸들러를 onAccept, onReject 함수로 연결합니다. */}
                      <Button color="success" size="sm" onClick={() => onAccept(m.id)} className="me-2">수락</Button>
                      <Button color="danger" size="sm" onClick={() => onReject(m.id)}>거절</Button>
                    </div>
                  ) : ( // ACCEPTED 상태일 때
                    <Button color="primary" size="sm" onClick={() => handleChat(m)}>채팅</Button>
                  )}
                </ListGroupItem>
              ))
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
  );
};

export default MatchRequestsPage;