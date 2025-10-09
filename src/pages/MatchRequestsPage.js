import React, { useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, ListGroup, ListGroupItem, Badge } from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';

const MatchRequestsPage = () => {
const {
  matchRequests,
  fetchMatchRequests,
  acceptMatch,
  rejectMatch,
  sentMatchRequests,
  fetchSentMatchRequests
} = useAuth();

  useEffect(() => {
  fetchMatchRequests();
  fetchSentMatchRequests();
}, [fetchMatchRequests, fetchSentMatchRequests]);

  return (
    <Card className="mt-4">
      <CardHeader><h4>받은 매칭 신청</h4></CardHeader>
      <CardBody>
        <ListGroup flush>
          {matchRequests.length > 0 ? (
            matchRequests.map(m => (
              <ListGroupItem key={m.id} className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{m.requester?.name ?? '알 수 없음'}</strong> 님이&nbsp;
                  {m.schedule?.date ?? ''} {m.schedule?.time ?? ''}시&nbsp;
                  <strong>{m.schedule?.placeName ?? ''}</strong>
                  일정에 신청했습니다.
                </div>
                <div>
                  <Button color="success" size="sm" onClick={() => acceptMatch(m.id)} className="me-2">
                    수락
                  </Button>
                  <Button color="danger" size="sm" onClick={() => rejectMatch(m.id)}>
                    거절
                  </Button>
                </div>
              </ListGroupItem>
            ))
          ) : (
            <p className="text-muted">대기 중인 매칭 신청이 없습니다.</p>
          )}
        </ListGroup>
      </CardBody>

      <CardHeader><h4>내가 보낸 신청</h4></CardHeader>
      <CardBody>
        <ListGroup flush>
          {sentMatchRequests.length > 0 ? (
            sentMatchRequests.map(m => (
              <ListGroupItem key={m.id}>
                <div>
                  <strong>{m.schedule?.member?.name ?? '알 수 없음'}</strong> 님의&nbsp;
                  {m.schedule?.date ?? ''} {m.schedule?.time ?? ''}시&nbsp;
                  <strong>{m.schedule?.placeName ?? ''}</strong>
                  일정에 신청했습니다.
                  {/* 상태 배지로 ACCEPTED/PENDING/REJECTED 표시 */}
                  <Badge color="secondary" className="ms-2">{m.status}</Badge>
                </div>
              </ListGroupItem>
            ))
          ) : (
            <p className="text-muted">보낸 신청이 없습니다.</p>
          )}
        </ListGroup>
      </CardBody>
    </Card>
  );
};

export default MatchRequestsPage;
