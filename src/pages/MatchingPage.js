import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Button,
  ListGroup,
  ListGroupItem,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  FormGroup
} from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';
import '../css/HomePage.css';

// --- 가상 데이터 ---
// TODO: 백엔드 연동 시 이 부분은 삭제하고, API를 통해 데이터를 받아옵니다.
const allSchedules = [
  {
    id: 101,
    userId: 'user1',
    userName: '김민준',
    date: '2025-09-15',
    time: '19:00',
    place: {
      name: '강남불백',
      category: '한식',
      lat: 37.4980, // 강남역 근처
      lng: 127.0276
    },
    userProfile: {
        age: 28,
        gender: '남성',
        preferences: {'한식': true, '매운맛': true}
    }
  },
  {
    id: 102,
    userId: 'user2',
    userName: '이서아',
    date: '2025-09-15',
    time: '13:00',
    place: {
      name: '호랑이식당',
      category: '일식',
      lat: 37.4995, // 강남역 근처
      lng: 127.0265
    },
    userProfile: {
        age: 25,
        gender: '여성',
        preferences: {'일식': true, '분식': true}
    }
  },
  {
    id: 103,
    userId: 'user3',
    userName: '박준서',
    date: '2025-09-18',
    time: '20:00',
    place: {
      name: '브루클린 더 버거 조인트',
      category: '양식',
      lat: 37.5228, // 가로수길 근처
      lng: 127.0221
    },
    userProfile: {
        age: 31,
        gender: '남성',
        preferences: {'양식': true, '치맥': true}
    }
  },
];

// --- 유틸리티 함수: 거리 계산 ---
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
    if ((lat1 === lat2) && (lon1 === lon2)) return 0;
    const radlat1 = Math.PI * lat1 / 180;
    const radlat2 = Math.PI * lat2 / 180;
    const theta = lon1 - lon2;
    const radtheta = Math.PI * theta / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) dist = 1;
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515 * 1.609344 * 1000;
    return dist;
};

// --- Calendar Component ---
const MatchingCalendar = ({ schedules, onDateSelect, selectedDate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const schedulesByDate = useMemo(() => {
        return schedules.reduce((acc, schedule) => {
            (acc[schedule.date] = acc[schedule.date] || []).push(schedule);
            return acc;
        }, {});
    }, [schedules]);

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const renderCalendar = () => {
        const calendarDays = [];
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDay = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();

        for (let i = 0; i < startDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="border p-2" style={{ minHeight: '80px', backgroundColor: '#f8f9fa' }}></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daySchedules = schedulesByDate[dateStr] || [];
            const isSelected = dateStr === selectedDate;

            calendarDays.push(
                <div
                    key={day}
                    className={`border p-2 position-relative ${isSelected ? 'bg-primary text-white' : ''}`}
                    style={{ minHeight: '80px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onClick={() => onDateSelect(isSelected ? null : dateStr)}
                >
                    <strong>{day}</strong>
                    {daySchedules.length > 0 && <Badge color="danger" pill className="position-absolute top-0 end-0 mt-1 me-1">{daySchedules.length}</Badge>}
                </div>
            );
        }
        return calendarDays;
    };

    return (
        <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
                <Button onClick={() => changeMonth(-1)}>이전 달</Button>
                <h5>{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</h5>
                <Button onClick={() => changeMonth(1)}>다음 달</Button>
            </CardHeader>
            <CardBody className="p-0">
                <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => <div key={day} className="text-center font-weight-bold border p-2">{day}</div>)}
                    {renderCalendar()}
                </div>
            </CardBody>
        </Card>
    );
};

// --- Schedule List Component ---
const ScheduleList = ({ schedules, onScheduleSelect, selectedSchedule, selectedDate }) => {
    return (
        <Card style={{ height: '525px' }}>
            <CardHeader><h4>{selectedDate ? `${selectedDate.split('-')[2]}일 일정 목록` : '일정 목록'}</h4></CardHeader>
            <CardBody style={{ overflowY: 'auto' }}>
                {schedules.length > 0 ? (
                    <ListGroup flush>
                        {schedules.map(schedule => (
                            <ListGroupItem
                                key={schedule.id}
                                action
                                active={selectedSchedule?.id === schedule.id}
                                onClick={() => onScheduleSelect(schedule)}
                                style={{cursor: 'pointer'}}
                            >
                                <strong>{schedule.place.name}</strong> ({schedule.time})
                                <div className="small text-muted">{schedule.userName} | {schedule.distance ? `${Math.round(schedule.distance)}m` : ''}</div>
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                ) : (
                    <p className="text-center text-muted mt-3">선택한 조건의 일정이 없습니다.</p>
                )}
            </CardBody>
        </Card>
    );
};

// --- Filter Modal Component ---
const FilterModal = ({ isOpen, toggle, onApply, initialFilters }) => {
    const foodCategories = ['한식', '중식', '일식', '양식', '분식', '카페'];
    const [foodFilters, setFoodFilters] = useState(initialFilters.food);
    const [distanceFilter, setDistanceFilter] = useState(initialFilters.distance);

    const handleApply = () => {
        onApply({ food: foodFilters, distance: distanceFilter });
        toggle();
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>매칭 필터</ModalHeader>
            <ModalBody>
                <h5>음식 종류</h5>
                {foodCategories.map(cat => (
                    <FormGroup check inline key={cat}>
                        <Input type="checkbox" checked={foodFilters[cat] || false} onChange={() => setFoodFilters(prev => ({...prev, [cat]: !prev[cat]}))} id={`filter-${cat}`} />
                        <Label check for={`filter-${cat}`}>{cat}</Label>
                    </FormGroup>
                ))}
                <hr />
                <h5>거리</h5>
                <Input type="select" value={distanceFilter} onChange={e => setDistanceFilter(Number(e.target.value))}>
                    <option value={500}>500m 이내</option>
                    <option value={1000}>1km 이내</option>
                    <option value={2000}>2km 이내</option>
                    <option value={5000}>5km 이내</option>
                </Input>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>취소</Button>
                <Button color="primary" onClick={handleApply}>필터 적용</Button>
            </ModalFooter>
        </Modal>
    );
};


const MatchingPage = () => {
  const { user, isAuthenticated, onNavigate } = useAuth();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);
  
  // TODO: 백엔드 연동 시 이 useState는 삭제하고, useEffect 내에서 API 호출 결과로 상태를 설정합니다.
  const [schedules, setSchedules] = useState(allSchedules);
  const [userLocation, setUserLocation] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  
  const [appliedFilters, setAppliedFilters] = useState({
    food: {'한식': true, '중식': true, '일식': true, '양식': true, '분식': true, '카페': true},
    distance: 5000,
  });

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener('resize', handleResize);

    navigator.geolocation.getCurrentPosition(
      (position) => { setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); },
      () => { setUserLocation({ lat: 37.4980, lng: 127.0276 }); }
    );
    
    // TODO: 백엔드 연동 시 이 useEffect 내에서 fetch 또는 axios를 사용하여 서버로부터 모든 일정 데이터를 가져옵니다.
    // 예: const fetchSchedules = async () => {
    //      const response = await fetch('/api/schedules');
    //      const data = await response.json();
    //      setSchedules(data);
    //    };
    //    fetchSchedules();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleApplyFilter = (filters) => {
    setAppliedFilters(filters);
    const { food, distance } = filters;
    
    // TODO: 백엔드 연동 시 이 필터링 로직은 서버에 요청을 보내는 방식으로 변경됩니다.
    // 프론트엔드에서 모든 데이터를 받아 필터링하는 대신,
    // 서버에 필터 조건을 보내고 서버가 필터링된 결과를 보내주는 것이 효율적입니다.
    // 예: fetch(`/api/schedules?distance=${distance}&food=${activeFoodFilters.join(',')}`)
    
    let tempSchedules = allSchedules;

    const activeFoodFilters = Object.keys(food).filter(key => food[key]);
    if (activeFoodFilters.length > 0) {
        tempSchedules = tempSchedules.filter(s => activeFoodFilters.includes(s.place.category));
    }
    if (distance && userLocation) {
        tempSchedules = tempSchedules.filter(s => getDistanceInMeters(userLocation.lat, userLocation.lng, s.place.lat, s.place.lng) <= distance);
    }
    setSchedules(tempSchedules);
  };
  
  const handleMatchRequest = () => {
    if (!isAuthenticated) {
        alert('매칭을 신청하려면 로그인이 필요합니다.');
        onNavigate('login');
        return;
    }
    if (!selectedSchedule) {
        alert('매칭을 신청할 일정을 선택해주세요.');
        return;
    }
    if (selectedSchedule.userId === user?.id) {
        alert('자신이 만든 일정에는 매칭을 신청할 수 없습니다.');
        return;
    }

    // TODO: 백엔드 연동 시 이 부분은 서버에 매칭 신청 API를 호출하는 코드로 변경됩니다.
    // (FCM 또는 이메일 알림은 서버에서 처리)
    // 예: await fetch('/api/matches', {
    //      method: 'POST',
    //      body: JSON.stringify({ scheduleId: selectedSchedule.id }),
    //      headers: { 'Content-Type': 'application/json' }
    //    });
    alert(`'${selectedSchedule.userName}'님에게 매칭 신청 알림을 보냈습니다.`);
  };

  const handleRandomMatch = () => {
    if (!isAuthenticated) {
        alert('매칭을 신청하려면 로그인이 필요합니다.');
        onNavigate('login');
        return;
    }
    if (!userLocation) {
        alert('위치 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    // TODO: 백엔드 연동 시, 거리 필터만 적용된 랜덤 일정을 서버에 요청합니다.
    // 프론트엔드에서 모든 데이터를 필터링하는 대신 서버의 부담을 줄일 수 있습니다.
    // 예: const response = await fetch(`/api/schedules/random?distance=${appliedFilters.distance}`);
    //     const randomSchedule = await response.json();
    
    const potentialMatches = allSchedules.filter(s => {
        const dist = getDistanceInMeters(userLocation.lat, userLocation.lng, s.place.lat, s.place.lng);
        return dist <= appliedFilters.distance && s.userId !== user?.id;
    });

    if (potentialMatches.length === 0) {
        alert('현재 조건에 맞는 랜덤 매칭 상대가 없습니다. 필터의 거리를 늘려보세요.');
        return;
    }

    const randomSchedule = potentialMatches[Math.floor(Math.random() * potentialMatches.length)];

    if (window.confirm(`[랜덤 매칭]\n\n'${randomSchedule.userName}'님의 '${randomSchedule.place.name}'(${randomSchedule.date}) 일정에 매칭을 신청하시겠습니까?`)) {
        // TODO: 백엔드 연동 시 이 부분도 실제 매칭 신청 API를 호출하도록 변경됩니다.
        alert(`'${randomSchedule.userName}'님에게 매칭 신청 알림을 보냈습니다.`);
    }
  };

  const schedulesForSelectedDate = useMemo(() => {
    const targetSchedules = selectedDate ? schedules.filter(s => s.date === selectedDate) : schedules;
    
    if (!userLocation) return targetSchedules;
    
    const schedulesWithDistance = targetSchedules.map(s => ({
        ...s,
        distance: getDistanceInMeters(userLocation.lat, userLocation.lng, s.place.lat, s.place.lng)
    }));

    return schedulesWithDistance.sort((a, b) => a.distance - b.distance);
  }, [selectedDate, schedules, userLocation]);

  const renderContent = () => (
    <Container className="mt-4">
      <div className="d-flex justify-content-end mb-3">
        <Button color="secondary" className="me-2" onClick={() => setFilterModalOpen(true)}>필터</Button>
        <Button color="success" className="me-2" onClick={handleRandomMatch}>랜덤 매칭하기</Button>
        <Button color="primary" onClick={handleMatchRequest}>매칭 신청하기</Button>
      </div>
      <Row>
        <Col lg={8} xs={12} className="mb-4">
          <MatchingCalendar schedules={schedules} onDateSelect={setSelectedDate} selectedDate={selectedDate} />
        </Col>
        <Col lg={4} xs={12} className="mb-4">
          <ScheduleList schedules={schedulesForSelectedDate} onScheduleSelect={setSelectedSchedule} selectedSchedule={selectedSchedule} selectedDate={selectedDate} />
        </Col>
      </Row>
    </Container>
  );

  return (
    <>
      <div className="d-flex flex-column text-white text-center position-relative">
        {isDesktop ? (
          <div className="flex-grow-1 d-flex align-items-start justify-content-center pt-0 mt-0">
             <Container>
                <div style={{ backgroundColor: 'rgba(78, 172, 209, 0)', padding: '1%', borderRadius: '3rem' }} className="fade-in-up-text">
                  <h1 className="display-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>매칭하기</h1>
                  <p className="lead mt-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>취향이 맞는 사람들과 매칭해보세요!</p>
                </div>
              </Container>
          </div>
        ) : (
          <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center" style={{paddingTop: '80px'}}>
             <Container>
                <div style={{ backgroundColor: 'rgba(78, 172, 209, 0)', padding: '1%', borderRadius: '5rem' }}>
                  <h1 className="display-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>매칭하기</h1>
                  <p className="lead mt-3" style={{ whiteSpace: 'nowrap', fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>취향이 맞는 사람들과 매칭해보세요!</p>
                </div>
              </Container>
          </div>
        )}
      </div>

      {renderContent()}
      
      <FilterModal 
        isOpen={isFilterModalOpen} 
        toggle={() => setFilterModalOpen(false)} 
        onApply={handleApplyFilter} 
        initialFilters={appliedFilters}
      />
    </>
  );
};

export default MatchingPage;

