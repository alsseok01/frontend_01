import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, CardBody, Button, Spinner, Alert, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axios from 'axios';
import myLocationIcon from '../images/map_logo.png';
import '../css/Restaurant.css'; 

import DOMPurify from 'dompurify';
import 'react-quill/dist/quill.snow.css'; 

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const KAKAO_MAP_APP_KEY = process.env.REACT_APP_KAKAO_MAP_KEY;

const loadKakaoMapScript = () => {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_APP_KEY}&autoload=false&libraries=services`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        resolve();
      });
    };
    script.onerror = () => {
      reject(new Error('Kakao Map 스크립트 로드 실패'));
    };
    document.head.appendChild(script);
  });
};

const RestaurantRecPage = () => {
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const mapContainerRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await Promise.all([
            loadKakaoMapScript(),
            (async () => {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/api/recommendations`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (Array.isArray(response.data)) {
                    setRecommendations(response.data);
                } else {
                    console.warn("API 응답이 배열이 아닙니다:", response.data);
                    setRecommendations([]);
                }
            })()
        ]);
        setIsScriptLoaded(true);
      } catch (err) {
        setError("데이터를 불러오거나 지도 스크립트를 로드하는 데 실패했습니다.");
        console.error(err);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (!loading && isScriptLoaded && mapContainerRef.current && !map) {
      try {
        const mapOption = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 5,
        };
        const kakaoMap = new window.kakao.maps.Map(mapContainerRef.current, mapOption);
        setMap(kakaoMap);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = new window.kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
            setUserLocation(loc);
            kakaoMap.setCenter(loc);
            new window.kakao.maps.Marker({
              position: loc,
              map: kakaoMap,
              image: new window.kakao.maps.MarkerImage(myLocationIcon, new window.kakao.maps.Size(36, 36), { offset: new window.kakao.maps.Point(18, 36) })
            });
          },
          () => {
            console.warn("위치 정보를 가져올 수 없습니다. 기본 위치(서울)를 사용합니다.");
            const defaultLoc = new window.kakao.maps.LatLng(37.5665, 126.9780);
            setUserLocation(defaultLoc);
            kakaoMap.setCenter(defaultLoc);
          }
        );
      } catch (mapInitError) {
          console.error("지도 생성 중 오류 발생:", mapInitError);
          setError("지도를 초기화하는 데 실패했습니다.");
      }
    }
  }, [loading, isScriptLoaded, map]);

  useEffect(() => {
    if (!map || recommendations.length === 0) return;
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    const newMarkers = recommendations.map((rec, index) => {
      if (typeof rec.latitude !== 'number' || typeof rec.longitude !== 'number') {
          console.warn(`Invalid coordinates for recommendation ID ${rec.id}:`, rec.latitude, rec.longitude);
          return null;
      }
      const position = new window.kakao.maps.LatLng(rec.latitude, rec.longitude);
      const marker = new window.kakao.maps.Marker({ position, map, clickable: true });
      window.kakao.maps.event.addListener(marker, 'click', () => { setCurrentIndex(index); });
      return marker;
    }).filter(marker => marker !== null);
    markersRef.current = newMarkers;
    if (newMarkers.length > 0 && map.getCenter) {
      try {
        map.panTo(newMarkers[0].getPosition());
        newMarkers[0].setZIndex(100);
      } catch (mapError) { console.error("Error panning map:", mapError); }
    }
  }, [map, recommendations]);

  useEffect(() => {
    if (!map || !map.getCenter || markersRef.current.length === 0 || currentIndex >= markersRef.current.length) return;
    const marker = markersRef.current[currentIndex];
    if (marker) {
      try {
        map.panTo(marker.getPosition());
        markersRef.current.forEach(m => m.setZIndex(0));
        marker.setZIndex(100);
      } catch (mapError) { console.error("Error panning map during carousel change:", mapError); }
    }
  }, [currentIndex, map]);

  const handlePrev = () => { setCurrentIndex(prev => (prev === 0 ? recommendations.length - 1 : prev - 1)); };
  const handleNext = () => { setCurrentIndex(prev => (prev === recommendations.length - 1 ? 0 : prev + 1)); };
  const toggleModal = (post = null) => { setSelectedPost(post); setModalOpen(!modalOpen); };

  if (loading) {
    return <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}><Spinner /> <h4 className="ms-3">맛집 추천 정보를 불러오는 중...</h4></Container>;
  }
  if (error) {
    return <Container className="mt-5"><Alert color="danger">{error}</Alert></Container>;
  }


  return (
    <>
      <Container className="rec-page-container">

        <div className="text-center mb-4 fade-in-up-text">
            <h1 className="display-3" style={{ fontWeight: "bold", color: "rgb(0, 0, 0)" }}>맛집 추천</h1>
            <p className="lead mt-2" style={{ whiteSpace: "nowrap", fontWeight: "bold", color: "rgb(0, 0, 0)" }}>사용자들이 추천하는 인기 맛집을 만나보세요!</p>
        </div>

        <Card className="map-card fade-in-up-map">
          <CardBody className="p-0">
            <div id="map" ref={mapContainerRef} />
          </CardBody>
        </Card>

        {recommendations.length > 0 && (
          <div className="carousel-container fade-in-up-carousel">
            <div className="carousel-track" style={{ width: `${recommendations.length * 100}%`, transform: `translateX(-${(currentIndex / recommendations.length) * 100}%)` }}>
              {recommendations.map((rec, index) => (
                <div key={rec.id || index} className="carousel-card-wrapper" style={{ width: `${100 / recommendations.length}%` }}>
                  <Card className="carousel-card">
                    <CardBody>
                      <div>
                        <h5 className="mb-2">{rec.title}</h5>
                        <p className="text-muted mb-1" style={{fontSize: '0.9rem'}}>📍 {rec.address || '주소 정보 없음'}</p>
                        <p className="text-muted mb-1" style={{fontSize: '0.9rem'}}>작성자: {rec.author.name}</p>
                        <p className="mb-2">❤️ {rec.likes} 👀 {rec.views}</p>
                      </div>
                      <Button color="primary" block className="mt-3" onClick={() => toggleModal(rec)}>자세히 보기</Button>
                    </CardBody>
                  </Card>
                </div>
              ))}
            </div>
            {recommendations.length > 1 && (
              <>
                <Button className="carousel-nav-btn prev" onClick={handlePrev}>‹</Button>
                <Button className="carousel-nav-btn next" onClick={handleNext}>›</Button>
              </>
            )}
          </div>
        )}

        {recommendations.length === 0 && !loading && (
           <div className="carousel-container fade-in-up-carousel">
               <Card className="carousel-card">
                   <CardBody className="text-center"><p className="mb-0 text-muted">추천할 맛집이 아직 없습니다. (10점 이상)</p></CardBody>
               </Card>
           </div>
        )}

      </Container>

      <Modal isOpen={modalOpen} toggle={() => toggleModal()} centered size="lg">
        {selectedPost && (
          <>
            <ModalHeader toggle={() => toggleModal()}>{selectedPost.title}</ModalHeader>
            <ModalBody className="modal-body-scrollable">
              <p><strong>📍 주소:</strong> {selectedPost.address || '주소 정보 없음'}</p>
              <p><strong>✍️ 작성자:</strong> {selectedPost.author.name}</p>
              <p><strong>❤️ 좋아요:</strong> {selectedPost.likes} &nbsp;&nbsp; <strong>👀 조회수:</strong> {selectedPost.views}</p>
              <p><strong>#️⃣ 태그:</strong> {selectedPost.tags && selectedPost.tags.length > 0 ? selectedPost.tags.join(', ') : '없음'}</p>
              <hr />
              
              <div
                className="post-content-body my-4 ql-editor"
                style={{ minHeight: '150px' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedPost.content || '') }}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => toggleModal()}>닫기</Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </>
  );
};

export default RestaurantRecPage;