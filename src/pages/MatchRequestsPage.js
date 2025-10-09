import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader, ListGroup, ListGroupItem, Container } from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';
import '../css/BoardPage.css'; // 간단한 스타일을 위해 BoardPage CSS 재활용

const MatchRequestsPage = () => {
  const {
    matchRequests,
    fetchMatchRequests,
    acceptMatch,
    rejectMatch,
    sentMatchRequests,
    fetchSentMatchRequests,
    deleteMatch, // AuthContext에서 deleteMatch 가져오기
  } = useAuth();
  
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수

  useEffect(() => {
    fetchMatchRequests();
    fetchSentMatchRequests();
  }, [fetchMatchRequests, fetchSentMatchRequests]);

  const handleDelete = async (matchId) => {
    if (window.confirm("정말로 이 신청을 삭제하시겠습니까?")) {
      const success = await deleteMatch(matchId);
      if (success) {
        // 삭제 성공 시, 목록을 다시 불러와 화면을 갱신합니다.
        fetchSentMatchRequests(); 
      } else {
        alert("삭제에 실패했습니다.");
      }
    }
  };

  const handleChat = (matchId) => {
    // 채팅 페이지로 이동합니다. (matchId를 URL 파라미터로 전달)
    navigate(`/chat/${matchId}`);
  };

  // "보낸 신청"의 상태에 따라 다른 UI를 렌더링하는 함수
  const renderSentRequestStatus = (request) => {
    switch (request.status) {
      case 'ACCEPTED':
        return (
          <div className="request-status">
            <span className="status-accepted">수락됨</span>
            <Button onClick={() => handleChat(request.id)} color="primary" size="sm">채팅</Button>
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
                    {m.schedule?.date ?? ''} {m.schedule?.time ?? ''}시&nbsp;
                    <strong>{m.schedule?.placeName ?? ''}</strong> 일정에 신청했습니다.
                  </div>
                  <div>
                    <Button color="success" size="sm" onClick={() => acceptMatch(m.id)} className="me-2">수락</Button>
                    <Button color="danger" size="sm" onClick={() => rejectMatch(m.id)}>거절</Button>
                  </div>
                </ListGroupItem>
              ))
            ) : (
              <p className="text-muted">대기 중인 매칭 신청이 없습니다.</p>
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