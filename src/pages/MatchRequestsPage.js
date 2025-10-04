import React, { useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, ListGroup, ListGroupItem } from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';

const MatchRequestsPage = () => {
  const { matchRequests, fetchMatchRequests, acceptMatch, rejectMatch } = useAuth();

  useEffect(() => {
    fetchMatchRequests();
  }, [fetchMatchRequests]);

  return (
    <Card className="mt-4">
      <CardHeader><h4>매칭 신청 목록</h4></CardHeader>
      <CardBody>
        <ListGroup flush>
          {matchRequests.length > 0 ? (
            matchRequests.map((m) => (
              <ListGroupItem key={m.id} className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{m.requester.name}</strong> 님이 {m.schedule.date} {m.schedule.time}시 <strong>{m.schedule.placeName}</strong> 일정에 신청했습니다.
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
  );
};

export default MatchRequestsPage;
