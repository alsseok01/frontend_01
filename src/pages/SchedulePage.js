import React, { useState, useCallback, useEffect } from 'react';
import { Container, Card, CardBody, CardHeader, Row, Col, ListGroup, ListGroupItem, Badge, Button } from 'reactstrap';
import MapComponent from '../components/Map';
import CalendarComponent from '../components/Calendar';
import '../css/HomePage.css';
import { useAuth } from '../contexts/AuthContext';



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

const NearbyPlacesList = ({ places, userLocation, onPlaceClick }) => {
    const { isAuthenticated, onNavigate } = useAuth();
    const [sortedPlaces, setSortedPlaces] = useState([]);

  useEffect(() => {
    if (places.length > 0 && userLocation) {
      const placesWithDistance = places.map(place => ({
        ...place,
        distance: getDistanceInMeters(userLocation.lat, userLocation.lng, place.y, place.x)
      }));
      placesWithDistance.sort((a, b) => a.distance - b.distance);
      setSortedPlaces(placesWithDistance);
    } else {
      setSortedPlaces([]);
    }
  }, [places, userLocation]);

  const handlePlaceClick = (place) => {
    if (!isAuthenticated) {
      alert("로그인 후 이용 가능합니다!");
      onNavigate("login");
      return;
    }
    onPlaceClick(place);
  };

  return (
    <Card style={{ height: '480px' }}>
      <CardHeader><h4>가까운 음식점 목록</h4></CardHeader>
      <CardBody style={{ overflowY: 'auto' }}>
        {sortedPlaces.length > 0 ? (
          <ListGroup flush>
            {sortedPlaces.map(place => (
              <ListGroupItem
                key={place.id}
                className="d-flex justify-content-between align-items-center"
                action
                style={{ cursor: 'pointer' }}
                onClick={() => handlePlaceClick(place)}
              >
                <div>
                  <strong>{place.place_name}</strong>
                  <div className="text-muted small">{place.category_name}</div>
                </div>
                <Badge color="primary" pill>{Math.round(place.distance)}m</Badge>
              </ListGroupItem>
            ))}
          </ListGroup>
        ) : (
          <p className="text-center text-muted mt-3">지도에서 음식점 종류를 선택하여 검색하세요.</p>
        )}
      </CardBody>
    </Card>
  );
};

const SchedulePage = () => {
  // ✅ [수정] AuthContext에서 전역으로 관리되는 events와 setEvents를 가져옵니다.
  const { events, fetchMySchedules, setEvents } = useAuth();

  // 이 페이지에서 자체적으로 관리해야 할 상태들만 남겨둡니다.
  const [activeFoodFilters, setActiveFoodFilters] = useState({
      '한식': true, '중식': true, '일식': true, '양식': true, '분식': true, '카페': true,
  });
  const [activeDistance, setActiveDistance] = useState(500);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);
  const [selectedTime, setSelectedTime] = useState(() => new Date().getHours());
  const [scheduleModalData, setScheduleModalData] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mobileView, setMobileView] = useState('map');

  useEffect(() => {
    
    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMapPinClick = useCallback((data) => {
    setScheduleModalData(data);
    if (!isDesktop) {
        setMobileView('calendar');
    }
  }, [isDesktop]);

  return (
    <>
      {/* ... 이하 JSX 코드는 기존과 동일합니다 ... */}
      <div className="d-flex flex-column text-white text-center position-relative">
        {isDesktop ? (
          <>
            <div className="flex-grow-1 d-flex align-items-start justify-content-center pt-0 mt-0">
              <Container>
                <div style={{ backgroundColor: 'rgba(78, 172, 209, 0)', padding: '1%', borderRadius: '3rem' }} className="fade-in-up-text">
                  <h1 className="display-3 mt-0" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>일정 만들기</h1>
                  <p className="lead mt-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>내 주변 음식점 찾아 약속을 잡아보세요!</p>
                </div>
              </Container>
            </div>
            <Row>
              <Col xs={12} className="mb-4">
                <Card>
                  <CardBody>
                    <MapComponent
                      setScheduleModalData={handleMapPinClick}
                      activeFoodFilters={activeFoodFilters}
                      setActiveFoodFilters={setActiveFoodFilters}
                      activeDistance={activeDistance}
                      setActiveDistance={setActiveDistance}
                      selectedTime={selectedTime}
                      setSelectedTime={setSelectedTime}
                      setNearbyPlaces={setNearbyPlaces}
                      userLocation={userLocation}
                      setUserLocation={setUserLocation}
                      selectedPlace={selectedPlace}
                    />
                  </CardBody>
                </Card>
              </Col>
              <Col xs={12} lg={4} className="mb-4 order-lg-2">
                <NearbyPlacesList
                  places={nearbyPlaces}
                  userLocation={userLocation}
                  onPlaceClick={setSelectedPlace}
                />
              </Col>
              <Col xs={12} lg={8} className="mb-4 order-lg-1">
                <CalendarComponent
                  events={events}
                  setEvents={setEvents}
                  scheduleModalData={scheduleModalData}
                  setScheduleModalData={setScheduleModalData}
                  selectedTime={selectedTime}
                />
              </Col>
            </Row>
          </>
        ) : (
          <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
             <div className="fade-in-up-text" style={{ marginTop: "100px" }}>
               <Container>
                 <div style={{ backgroundColor: 'rgba(78, 172, 209, 0)', padding: '1%', borderRadius: '3rem' }}>
                   <h1 className="display-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>일정 만들기</h1>
                   <p className="lead mt-3" style={{ whiteSpace: 'nowrap', fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>내 주변 음식점 찾아 약속을 잡아보세요!</p>
                 </div>
               </Container>
             </div>
            <Row className="w-100">
                {mobileView === 'map' && (
                    <>
                        <Col xs={12} className="mb-4">
                            <Card><CardBody>
                                <MapComponent
                                    setScheduleModalData={handleMapPinClick}
                                    activeFoodFilters={activeFoodFilters} setActiveFoodFilters={setActiveFoodFilters}
                                    activeDistance={activeDistance} setActiveDistance={setActiveDistance}
                                    selectedTime={selectedTime} setSelectedTime={setSelectedTime}
                                    setNearbyPlaces={setNearbyPlaces} userLocation={userLocation} setUserLocation={setUserLocation}
                                    selectedPlace={selectedPlace}
                                />
                            </CardBody></Card>
                        </Col>
                        <Col xs={12} className="mb-4">
                            <NearbyPlacesList places={nearbyPlaces} userLocation={userLocation} onPlaceClick={setSelectedPlace} />
                        </Col>
                    </>
                )}
                {mobileView === 'calendar' && (
                    <Col xs={12} className="mb-4">
                        <Button color="secondary" block onClick={() => setMobileView('map')} className="mb-3">지도로 돌아가기</Button>
                        <CalendarComponent
                            events={events} setEvents={setEvents}
                            scheduleModalData={scheduleModalData} setScheduleModalData={setScheduleModalData}
                            selectedTime={selectedTime}
                        />
                    </Col>
                )}
            </Row>
          </div>
        )}
      </div>
    </>
  );
};

export default SchedulePage;