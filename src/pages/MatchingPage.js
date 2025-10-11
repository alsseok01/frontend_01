import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
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


// --- 유틸리티 및 하위 컴포넌트 (변경 없음) ---
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

const MatchingCalendar = ({ schedules, onDateSelect, selectedDate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [today] = useState(new Date());
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

        const limitDate = new Date();
        limitDate.setDate(today.getDate() + 21);

        for (let i = 0; i < startDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="border p-2" style={{ minHeight: '80px', backgroundColor: '#f8f9fa' }}></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daySchedules = schedulesByDate[dateStr] || [];
            const isSelected = dateStr === selectedDate;
            
            const isPast = date < new Date(today.toDateString());
            const isFutureLimit = date > limitDate;
            const isDisabled = isPast || isFutureLimit;

            calendarDays.push(
                <div
                    key={day}
                    className={`border p-2 position-relative ${isSelected ? 'bg-primary text-white' : ''}`}
                    style={{ 
                        minHeight: '80px',
                        cursor: isDisabled ? 'not-allowed' : 'pointer', 
                        backgroundColor: isDisabled ? '#e9ecef' : (isSelected ? undefined : '#fff'),
                        color: isDisabled ? '#adb5bd' : (isSelected ? '#fff' : '#000'),
                        transition: 'background-color 0.2s, opacity 0.2s',
                        opacity: isDisabled ? 0.6 : 1,
                    }}
                    onClick={isDisabled ? null : () => onDateSelect(isSelected ? null : dateStr)}
                >
                    <strong>{day}</strong>
                    {!isPast && daySchedules.length > 0 && <Badge color="info" pill className="position-absolute top-0 end-0 mt-1 me-1">{daySchedules.length}</Badge>}
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

const ScheduleList = ({ schedules, onScheduleSelect, selectedSchedule, selectedDate, onViewProfile }) => {
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
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{schedule.placeName}</strong> ({schedule.time}:00)
                                        <div
                                            className="small text-muted d-flex align-items-center mt-1"
                                            style={{ cursor: 'pointer' }}
                                            onClick={(e) => { 
                                                e.stopPropagation();
                                                onViewProfile(schedule); 
                                            }}
                                        >
                                            <img
                                                src={schedule.user.profileImage || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'}
                                                alt={schedule.user.name}
                                                style={{ width: '24px', height: '24px', borderRadius: '50%', marginRight: '8px', objectFit: 'cover' }}
                                            />
                                            {schedule.user.name}
                                        </div>
                                    </div>
                                    <Badge color="dark" pill>{schedule.currentParticipants || 1} / {schedule.participants}</Badge>
                                </div>
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

// ✅ [수정] ProfileModal 컴포넌트를 아래와 같이 변경합니다.
const ProfileModal = ({ isOpen, toggle, schedule }) => {
    if (!schedule || !schedule.user) return null;

    const userPreferences = schedule.user.preferences ?
        Object.keys(schedule.user.preferences).filter(key => schedule.user.preferences[key]) :
        [];

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered>
            <ModalHeader toggle={toggle} className="d-flex align-items-center">
                <img
                    src={schedule.user.profileImage || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'}
                    alt={schedule.user.name}
                    style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }}
                />
                {schedule.user.name}님의 프로필
            </ModalHeader>
            <ModalBody>
                <div className="text-center">
                    <img
                        src={schedule.user.profileImage || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'}
                        alt={schedule.user.name}
                        className="img-fluid rounded-circle mb-3"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                    <h5 className="mt-2">{schedule.user.name}</h5>
                </div>
                <hr />
                <Row className="text-center">
                    <Col>
                        <h5>음식 취향</h5>
                        <div className="d-flex flex-wrap justify-content-center mt-3" style={{ gap: '8px', minHeight: '10px' }}>
                            {userPreferences.length > 0 ? (
                                userPreferences.map(pref => (
                                    <Badge key={pref} color="info" pill style={{ fontSize: '0.9rem', padding: '8px 12px' }}>
                                        {pref}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-muted">설정된 취향이 없습니다.</p>
                            )}
                        </div>
                    </Col>
                    <Col>
                        <h5>평점</h5>
                        <div className="d-flex align-items-center justify-content-center mt-3" style={{ minHeight: '50px' }}>
                            <h4 className="font-weight-bold mb-0">N/A</h4>
                        </div>
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>닫기</Button>
            </ModalFooter>
        </Modal>
    );
}

// --- 메인 페이지 컴포넌트 ---
const MatchingPage = () => {
  const { user, isAuthenticated, onNavigate } = useAuth();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);
  
  const [schedules, setSchedules] = useState([]);
  const [originalSchedules, setOriginalSchedules] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState(null);
  
  const [appliedFilters, setAppliedFilters] = useState({
    food: {'한식': true, '중식': true, '일식': true, '양식': true, '분식': true, '카페': true},
    distance: 5000,
  });

  useEffect(() => {
    const fetchAllSchedules = async () => {
        if (!isAuthenticated) {
            setSchedules([]);
            setOriginalSchedules([]);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
            const response = await axios.get(`${API_URL}/api/schedules`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const allSchedules = response.data;

            const today = new Date();
            const limitDate = new Date();
            limitDate.setDate(today.getDate() + 21);

            const filtered = allSchedules.filter((s) => {
                const dateObj = new Date(s.date);
                return (
                dateObj >= new Date(today.toDateString()) && dateObj <= limitDate
                );
            });

            setSchedules(filtered);
            setOriginalSchedules(filtered);

        } catch (error) {
            console.error("매칭 일정을 불러오는데 실패했습니다:", error);
            setSchedules([]);
            setOriginalSchedules([]);
        }
    };

    fetchAllSchedules();

    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener('resize', handleResize);

    navigator.geolocation.getCurrentPosition(
      (position) => { setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); },
      () => { setUserLocation({ lat: 37.4980, lng: 127.0276 }); }
    );
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isAuthenticated]);

  const handleViewProfile = (schedule) => {
    setViewingSchedule(schedule);
    setProfileModalOpen(true);
  };

  const handleApplyFilter = (filters) => {
    setAppliedFilters(filters);
    const { food, distance } = filters;
    
     let tempSchedules = originalSchedules;

    const activeFoodFilters = Object.keys(food).filter(key => food[key]);
    if (activeFoodFilters.length > 0) {
        tempSchedules = tempSchedules.filter(s => activeFoodFilters.includes(s.placeCategory));
    }
    setSchedules(tempSchedules);
  };
  
  const handleMatchRequest = async () => {
    if (!isAuthenticated) {
        alert('매칭을 신청하려면 로그인이 필요합니다.');
        onNavigate('login');
        return;
    }
    if (!selectedSchedule) {
        alert('매칭을 신청할 일정을 선택해주세요.');
        return;
    }
    if (selectedSchedule.user.id === user?.id) {
        alert('자신이 만든 일정에는 매칭을 신청할 수 없습니다.');
        return;
    }

    if (!window.confirm(`'${selectedSchedule.user.name}'님의 '${selectedSchedule.placeName}' 일정에 매칭을 신청하시겠습니까?`)) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
        
        const response = await axios.post(
            `${API_URL}/api/matches`, 
            { scheduleId: selectedSchedule.id },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        alert(response.data);

    } catch (error) {
        console.error("매칭 신청 실패:", error);
        if (error.response && error.response.data) {
            alert(`매칭 신청 실패: ${error.response.data}`);
        } else {
            alert("매칭 신청 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    }
  };

  const handleRandomMatch = async () => {
     if (!isAuthenticated) {
        alert('매칭을 신청하려면 로그인이 필요합니다.');
        onNavigate('login');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
        
        const response = await axios.get(`${API_URL}/api/schedules/random`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const randomSchedule = response.data;

        if (window.confirm(`[랜덤 매칭]\n\n'${randomSchedule.user.name}'님의 '${randomSchedule.placeName}'(${randomSchedule.date}) 일정에 매칭을 신청하시겠습니까?`)) {
            const matchResponse = await axios.post(
                `${API_URL}/api/matches`,
                { scheduleId: randomSchedule.id },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert(matchResponse.data);
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            alert('현재 매칭 가능한 상대가 없습니다.');
        } else if (error.response && error.response.data) {
            alert(`매칭 신청 실패: ${error.response.data}`);
        } else {
            console.error("랜덤 매칭 실패:", error);
            alert("랜덤 매칭 중 오류가 발생했습니다.");
        }
    }
  };

  const schedulesForSelectedDate = useMemo(() => {
    if (!selectedDate) {
        return schedules;
    }
    return schedules.filter(s => s.date === selectedDate);
  }, [selectedDate, schedules]);

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
          <ScheduleList 
            schedules={schedulesForSelectedDate} 
            onScheduleSelect={setSelectedSchedule} 
            selectedSchedule={selectedSchedule} 
            selectedDate={selectedDate}
            onViewProfile={handleViewProfile} 
          />
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
      
      <ProfileModal 
        isOpen={isProfileModalOpen}
        toggle={() => setProfileModalOpen(false)}
        schedule={viewingSchedule}
      />
    </>
  );
};

export default MatchingPage;