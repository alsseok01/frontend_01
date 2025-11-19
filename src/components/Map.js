import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, CardBody, CardHeader, Row, Col, Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';
import myLocationIcon from '../images/map_logo.png';

const MapComponent = ({ setScheduleModalData, activeFoodFilters, setActiveFoodFilters, activeDistance, setActiveDistance, selectedTime, setSelectedTime, setNearbyPlaces, userLocation, setUserLocation, selectedPlace, setMobileView }) => {
  const { isAuthenticated, onNavigate } = useAuth();
  const mapContainerRef = useRef(null);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const toggleFilterModal = () => setFilterModalOpen(!isFilterModalOpen);
  
  const [map, setMap] = useState(null);
  const [placeMarkers, setPlaceMarkers] = useState([]); 
  
  const [pendingFoodFilters, setPendingFoodFilters] = useState(activeFoodFilters);
  const [pendingDistance, setPendingDistance] = useState(activeDistance);
  const [pendingTime, setPendingTime] = useState(selectedTime);
  
  const openInfoWindowRef = useRef(null);
  const userLocationRef = useRef(userLocation);

  const [mapHeight, setMapHeight] = useState('400px');

  const foodCategories = [
    { key: '한식', label: '🍚 한식', color: '#0d6efd' },
    { key: '중식', label: '🍜 중식', color: '#dc3545' },
    { key: '일식', label: '🍣 일식', color: '#ffc107' },
    { key: '양식', label: '🍕 양식', color: '#28a745' },
    { key: '분식', label: '🌭 분식', color: '#17a2b8' },
    { key: '카페', label: '☕️ 카페', color: '#343a40' },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setMapHeight('300px');
      } else {
        setMapHeight('400px');
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  const parseCategory = (categoryName) => {
    if (!categoryName) return '기타';
    if (categoryName.includes('한식')) return '한식';
    if (categoryName.includes('중식')) return '중식';
    if (categoryName.includes('일식')) return '일식';
    if (categoryName.includes('양식')) return '양식';
    if (categoryName.includes('분식')) return '분식';
    if (categoryName.includes('카페') || categoryName.includes('커피')) return '카페';
    return '기타';
  };

  const attachInfoWindowHandler = (place) => {
    setTimeout(() => {
      const btn = document.getElementById(`schedule-btn-${place.id}`);
      if (btn) {
        btn.onclick = () => {
          if (!isAuthenticated) {
            alert("로그인 후 이용해주세요");
            onNavigate("login");
            return;
          }
          const category = parseCategory(place.category_name);
          setScheduleModalData({ 
            poi: { 
              name: place.place_name,
              category: category 
            } 
          });
          // ✅ 모바일 뷰 전환 함수 호출
          if (setMobileView) {
            setMobileView('calendar');
          }
        };
      }
    }, 0);
  };

  useEffect(() => {
    if (window.kakao && window.kakao.maps && mapContainerRef.current && !map) {
      const options = { center: new window.kakao.maps.LatLng(37.5665, 126.9780), level: 5 };
      const kakaoMap = new window.kakao.maps.Map(mapContainerRef.current, options);
      setMap(kakaoMap);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(location);
          const moveLatLng = new window.kakao.maps.LatLng(location.lat, location.lng);
          kakaoMap.setCenter(moveLatLng);
          const imageSrc = myLocationIcon;
          const imageSize = new window.kakao.maps.Size(36, 36);
          const imageOption = { offset: new window.kakao.maps.Point(18, 36) };
          const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
          new window.kakao.maps.Marker({ position: moveLatLng, map: kakaoMap, image: markerImage });
        },
        () => {
          console.error("Geolocation access denied. Defaulting to Seoul.");
          const seoulLocation = { lat: 37.5665, lng: 126.9780 };
          setUserLocation(seoulLocation);
        }
      );
    }
  }, [map, setUserLocation]);

  useEffect(() => {
    if (!map || !userLocationRef.current) return;

    placeMarkers.forEach(item => item.marker.setMap(null));
    setPlaceMarkers([]);
    if (openInfoWindowRef.current) {
        openInfoWindowRef.current.close();
        openInfoWindowRef.current = null;
    }

    if (activeDistance !== null) {
      let level;
      if (activeDistance <= 300) level = 5;
      else if (activeDistance <= 500) level = 6;
      else if (activeDistance <= 1000) level = 7;
      else level = 8;
      map.setLevel(level);
    }

    const ps = new window.kakao.maps.services.Places();
    const activeFilters = Object.keys(activeFoodFilters).filter(key => activeFoodFilters[key]);

    if (activeFilters.length === 0) {
        setNearbyPlaces([]);
        return;
    }

    const searchPlaces = (keyword) => {
      return new Promise((resolve) => {
        ps.keywordSearch(keyword, (data, status) => {
          if (status === window.kakao.maps.services.Status.OK) resolve(data);
          else resolve([]);
        }, { location: new window.kakao.maps.LatLng(userLocationRef.current.lat, userLocationRef.current.lng), radius: activeDistance || 2000 });
      });
    };
    
    const fetchAllPlaces = async () => {
        const promises = activeFilters.map(filterKeyword => searchPlaces(filterKeyword));
        const results = await Promise.all(promises);
        const allPlaces = results.flat().filter((place, index, self) => 
            index === self.findIndex((p) => (p.id === place.id))
        );
        setNearbyPlaces(allPlaces);

        const newMarkerData = allPlaces.map(place => {
            const marker = new window.kakao.maps.Marker({ map: map, position: new window.kakao.maps.LatLng(place.y, place.x) });
            // ✅ [수정] 인포윈도우 스타일에 max-width와 word-wrap을 추가하여 가로 길이 문제를 해결합니다.
            const content = `<div style="padding:5px; font-size:12px; min-width: 200px; max-width: 250px; word-wrap: break-word;"><strong>${place.place_name}</strong><br><span style="color:gray;">${place.road_address_name || place.address_name}</span><br><span style="color:blue;">${place.phone || '전화번호 정보 없음'}</span><a href="${place.place_url}" target="_blank" style="color:green; display:block; margin-top:5px;">상세보기</a><button id="schedule-btn-${place.id}" class="btn btn-primary btn-sm mt-2 w-100">일정 추가</button></div>`;
            const infowindow = new window.kakao.maps.InfoWindow({ content, removable: true });

            window.kakao.maps.event.addListener(marker, 'click', () => {
              if (openInfoWindowRef.current) openInfoWindowRef.current.close();
              infowindow.open(map, marker);
              openInfoWindowRef.current = infowindow;
              attachInfoWindowHandler(place);
            });
            return { id: place.id, marker, infowindow };
        });
        setPlaceMarkers(newMarkerData);
    };

    fetchAllPlaces();
  }, [activeFoodFilters, activeDistance, map, setScheduleModalData, setNearbyPlaces, isAuthenticated, onNavigate, setMobileView]);

  useEffect(() => {
    if (!selectedPlace || !map || placeMarkers.length === 0) return;

    const target = placeMarkers.find(pm => pm.id === selectedPlace.id);
    if (target) {
        if (openInfoWindowRef.current) {
            openInfoWindowRef.current.close();
        }
        const position = target.marker.getPosition();
        map.panTo(position);
        setTimeout(() => { map.setLevel(3); }, 300);
        target.infowindow.open(map, target.marker);
        openInfoWindowRef.current = target.infowindow;
        attachInfoWindowHandler(selectedPlace);
    }
  }, [selectedPlace, map, placeMarkers]);

  const toggleFoodFilter = (type) => { setPendingFoodFilters(prev => ({ ...prev, [type]: !prev[type] })); };
  const handleDistanceClick = (radius) => { setPendingDistance(prev => prev === radius ? null : radius); };
  
  const applyFilters = () => {
    if (!isAuthenticated) {
      alert("로그인 후 이용해주세요");
      onNavigate('login');
      return;
    }
    setActiveFoodFilters(pendingFoodFilters);
    setActiveDistance(pendingDistance);
    setSelectedTime(pendingTime);
    if(isFilterModalOpen) toggleFilterModal();
  };

  const resetFilters = () => {
    if (!isAuthenticated) {
      alert("로그인 후 이용해주세요");
      onNavigate('login');
      return;
    }
    setPendingFoodFilters({});
    setPendingDistance(null);
    setActiveFoodFilters({});
    setActiveDistance(null);
  };

  const FilterButtons = () => {
      const currentHour = new Date().getHours();
      return (
        <>
          <div className="mb-3">
            <strong>음식점</strong>
            <div className="d-flex flex-wrap mt-2">
              {foodCategories.map(({ key, label, color }) => (
                <Button 
                  key={key}
                  outline={!pendingFoodFilters[key]} 
                  style={{ backgroundColor: pendingFoodFilters[key] ? color : 'transparent', color: pendingFoodFilters[key] ? '#fff' : undefined }}
                  size="sm" 
                  className="m-1" 
                  onClick={() => toggleFoodFilter(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <strong>거리</strong>
            <div className="d-flex flex-wrap mt-2">
              <Button outline={pendingDistance !== 300} color="secondary" size="sm" className="m-1" onClick={() => handleDistanceClick(300)} >300m</Button>
              <Button outline={pendingDistance !== 500} color="secondary" size="sm" className="m-1" onClick={() => handleDistanceClick(500)} >500m</Button>
              <Button outline={pendingDistance !== 1000} color="secondary" size="sm" className="m-1" onClick={() => handleDistanceClick(1000)} >1km</Button>
              <Button outline={pendingDistance !== 2000} color="secondary" size="sm" className="m-1" onClick={() => handleDistanceClick(2000)} >2km</Button>
            </div>
          </div>
          <hr />
          <div className="d-flex">
            <Button color="info" className="flex-grow-1 mr-1" onClick={resetFilters}>🔄 초기화</Button>
            <Button color="primary" className="flex-grow-1 ml-1" onClick={applyFilters}>적용하기</Button>
          </div>
        </>
      )
  };

  return (
    <>
      <Row>
        <Col lg="8" md="12">
            <div ref={mapContainerRef} style={{ height: mapHeight, width: '100%', borderRadius: '0.5rem' }} />
        </Col>
        <Col lg="4" className="d-none d-lg-block">
            <Card style={{height: '400px'}}>
                <CardHeader>지도 필터</CardHeader>
                <CardBody><FilterButtons /></CardBody>
            </Card>
        </Col>
      </Row>
      <div className="d-block d-lg-none text-center mt-3">
        <Button color="primary" onClick={toggleFilterModal}>지도 필터 열기</Button>
      </div>
      <Modal isOpen={isFilterModalOpen} toggle={toggleFilterModal}>
        <ModalHeader toggle={toggleFilterModal}>지도 필터</ModalHeader>
        <ModalBody><FilterButtons /></ModalBody>
      </Modal>
    </>
  );
};

export default MapComponent;
