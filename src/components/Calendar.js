import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Badge, ListGroup, Card, CardBody, CardHeader, ListGroupItem } from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const CalendarComponent = ({ events = {}, setEvents, scheduleModalData, setScheduleModalData, selectedTime }) => {
  // ✅ [수정] AuthContext에서 "내 일정 다시 불러오기" 함수를 가져옵니다.
  const { isAuthenticated, onNavigate, fetchMySchedules } = useAuth();

  // --- 기존의 모든 상태와 UI 로직은 그대로 유지됩니다 ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editedEventText, setEditedEventText] = useState('');
  const [newEventText, setNewEventText] = useState('');

  const [numberOfParticipants, setNumberOfParticipants] = useState(2);
  const [editedParticipants, setEditedParticipants] = useState(2);
  const categoryColors = {
    '한식': '#0d6efd',
    '중식': '#dc3545',
    '일식': '#ffc107',
    '양식': '#198754',
    '분식': '#0dcaf0',
    '카페': '#343a40',
    '기타': '#6c757d',
  };

  const [pendingEvent, setPendingEvent] = useState(null);
  const [today] = useState(new Date());

  useEffect(() => {
    if (scheduleModalData && scheduleModalData.poi) {
      if (!isAuthenticated) {
        alert("일정을 추가하려면 로그인이 필요합니다.");
        onNavigate("login");
        setScheduleModalData(null);
        return;
      }
      
      const { name, category } = scheduleModalData.poi;
      const eventText = `${name}에서 ${selectedTime}:00 약속`;
      
      setPendingEvent({ text: eventText, category: category });
      
      alert('음식점이 선택되었습니다. 달력에서 원하시는 날짜를 클릭하여 일정을 추가하세요.');
      setScheduleModalData(null);
    }
  }, [scheduleModalData, setScheduleModalData, isAuthenticated, onNavigate, selectedTime]);

  const handleDayClick = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (!isAuthenticated) {
      alert("로그인 후 이용해주세요");
      if (onNavigate) onNavigate("login");
      return;
    }

    setSelectedDate(dateStr);

    if (pendingEvent) {
      setNewEventText(pendingEvent.text);
      setAddModalOpen(true);
    } else {
      setNewEventText('');
      setAddModalOpen(true);
    }
  };

  const addEvent = async () => {
    if (!isAuthenticated || newEventText.trim() === '' || !selectedDate) return;
    try {
        const token = localStorage.getItem('token');
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
        const newScheduleData = {
            date: selectedDate,
            time: selectedTime,
            text: newEventText,
            placeName: newEventText.split('에서')[0],
            placeCategory: pendingEvent ? pendingEvent.category : '기타',
            participants: numberOfParticipants
        };
        
        const response = await axios.post(`${API_URL}/api/schedules`, newScheduleData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const savedSchedule = response.data; 

        const newEventForState = {
          id: savedSchedule.id,
          text: savedSchedule.text,
          time: savedSchedule.time,
          participants: savedSchedule.participants,
          currentParticipants: savedSchedule.currentParticipants,
          placeCategory: savedSchedule.placeCategory, 
        };

        setEvents(prevEvents => {
            const dateEvents = prevEvents[savedSchedule.date] || [];
            return {
                ...prevEvents,
                [savedSchedule.date]: [...dateEvents, newEventForState] // 
            };
        });

        setAddModalOpen(false);
        setPendingEvent(null);
        setNewEventText('');
    } catch (error) {
        console.error("일정 추가 실패:", error);
        alert("일정 추가에 실패했습니다.");
    }
  };

  const editEvent = () => {
    if (!isAuthenticated) { return; }
    if (editedEventText.trim() === '') return;
    if (!selectedDate || !events[selectedDate]) return;

    const updatedEvents = events[selectedDate].map(event => {
      if (event.id === selectedEvent.id) {
        const currentP = event.currentParticipants || 1;
        const newTotalP = Math.max(currentP, editedParticipants);

        return { 
          ...event, 
          text: editedEventText, 
          participants: newTotalP 
        };
      }
      return event;
    });
    setEvents(prev => ({ ...(prev || {}), [selectedDate]: updatedEvents }));
    setEditModalOpen(false);
  };
  
  const handleEventClick = (event, date) => {
    setSelectedEvent(event);
    setSelectedDate(date);
    setEditedEventText(event.text);
    setEditedParticipants(event.participants || 2);
    setEditModalOpen(true);
  };

  const deleteEvent = async () => {
    if (!isAuthenticated || !selectedEvent) return;

    if (window.confirm("정말로 이 일정을 삭제하시겠습니까?")) {
        try {
            const token = localStorage.getItem('token');
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
            
            await axios.delete(`${API_URL}/api/schedules/${selectedEvent.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            alert("일정이 삭제되었습니다.");
            setEditModalOpen(false); 
            await fetchMySchedules(); 

        } catch (error) {
            console.error("일정 삭제 실패:", error);
            alert("일정 삭제에 실패했습니다. 본인이 만든 일정만 삭제할 수 있습니다.");
        }
    }
  };
  
  const renderCalendar = () => {
    const calendarDays = [];
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    const limitDate = new Date();
    limitDate.setDate(today.getDate() + 21);

    for (let i = 0; i < startDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="border p-2" style={{ minHeight: '100px', backgroundColor: '#f8f9fa' }}></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events[dateStr] || [];
      
      const isPast = date < new Date(today.toDateString());
      const isFutureLimit = date > limitDate;
      const isDisabled = isPast || isFutureLimit;

      const mySchedules = events[dateStr] || [];
      const isSelected  = dateStr === selectedDate;

      calendarDays.push(
        <div 
          key={day} 
          className="border p-2 position-relative" 
          style={{ 
            minHeight: '100px', 
            cursor: isDisabled ? 'not-allowed' : 'pointer', 
            backgroundColor: isDisabled ? '#e9ecef' : '#fff' 
          }}
          onClick={() => !isDisabled && handleDayClick(day)}
        >
          <strong style={{ color: isDisabled ? '#706c7dff' : '#000' }}>{day}</strong>
          <div className="d-flex flex-wrap mt-1">
            {dayEvents.map((event) => (
                // ✅ Reactstrap Badge의 기본 color(secondary)를 피하기 위해 순수 span.badge 사용
                <span
                  key={event.id}
                  className="badge"
                  style={{
                    backgroundColor:
                      categoryColors[event.placeCategory] || categoryColors['기타'],
                    marginRight: '4px',
                    marginBottom: '4px',
                    cursor: 'pointer',
                    color: '#fff'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDisabled) handleEventClick(event, dateStr);
                  }}
                >
                  {`${event.currentParticipants || 1}/${event.participants}`}
                </span>
              )
            )}
          </div>
        </div>
      );
    }
    return calendarDays;
  };
  
  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  return (
    <>
      <Card style={{ height: '490px' }}>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <Button onClick={() => changeMonth(-1)}>이전 달</Button>
          <h5 className="font-weight-bold mb-0">{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</h5>
          <Button onClick={() => changeMonth(1)}>다음 달</Button>
        </CardHeader>
        <CardBody className="p-0">
          <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {['일', '월', '화', '수', '목', '금', '토'].map(day => <div key={day} className="text-center font-weight-bold border p-2">{day}</div>)}
            {renderCalendar()}
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={addModalOpen} toggle={() => setAddModalOpen(false)}>
        <ModalHeader toggle={() => setAddModalOpen(false)}>{selectedDate} 일정 추가</ModalHeader>
        <ModalBody>
          <Input type="text" value={newEventText} onChange={(e) => setNewEventText(e.target.value)} placeholder="일정 내용 입력" />
          
          <div className="d-flex align-items-center justify-content-center mt-3">
            <Button 
              color="secondary" 
              onClick={() => setNumberOfParticipants(p => Math.max(2, p - 1))}
            >
              -
            </Button>
            <strong className="mx-3" style={{ fontSize: '1.2rem', minWidth: '80px', textAlign: 'center' }}>
              {numberOfParticipants}명
            </strong>
            <Button 
              color="secondary" 
              onClick={() => setNumberOfParticipants(p => Math.min(8, p + 1))}
            >
              +
            </Button>
          </div>
          <p className="text-center text-muted mt-2 small">참여 인원을 선택하세요 (2~8명)</p>

        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={addEvent}>추가</Button>
          <Button color="secondary" onClick={() => setAddModalOpen(false)}>취소</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={editModalOpen} toggle={() => setEditModalOpen(false)}>
        <ModalHeader toggle={() => setEditModalOpen(false)}>{selectedDate} 일정 수정/삭제</ModalHeader>
        <ModalBody>
          <Input type="text" value={editedEventText} onChange={(e) => setEditedEventText(e.target.value)} />

          <div className="d-flex align-items-center justify-content-center mt-3">
            <Button 
              color="secondary" 
              onClick={() => setEditedParticipants(p => Math.max(2, p - 1))}
            >
              -
            </Button>
            <strong className="mx-3" style={{ fontSize: '1.2rem', minWidth: '80px', textAlign: 'center' }}>
              {editedParticipants}명
            </strong>
            <Button 
              color="secondary" 
              onClick={() => setEditedParticipants(p => Math.min(8, p + 1))}
            >
              +
            </Button>
          </div>
          <p className="text-center text-muted mt-2 small">참여 인원을 수정하세요 (2~8명)</p>

        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={deleteEvent}>삭제</Button>
          <Button color="primary" onClick={editEvent}>수정</Button>
          <Button color="secondary" onClick={() => setEditModalOpen(false)}>취소</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={viewModalOpen} toggle={() => setViewModalOpen(false)}>
        <ModalHeader toggle={() => setViewModalOpen(false)}>{selectedDate} 일정 목록</ModalHeader>
        <ModalBody>
          <ListGroup>
            {(events[selectedDate] || []).map(event => (
              <ListGroupItem key={event.id} className="d-flex justify-content-between align-items-center">
                <div>
                  {/* ✅ 색상칩도 span.badge로 변경하여 bg-secondary 회피 */}
                  <span
                    className="badge"
                    style={{
                      backgroundColor: categoryColors[event.placeCategory] || categoryColors['기타'],
                      marginRight: '10px'
                    }}
                  >
                    &nbsp;
                  </span>
                  {event.text}
                </div>
                <Badge color="dark" pill>{`${event.currentParticipants || 1} / ${event.participants} 명`}</Badge>
              </ListGroupItem>
            ))}
          </ListGroup>
        </ModalBody>
      </Modal>
    </>
  );
};

export default CalendarComponent;
