import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Button,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Row,
  Col,
  ListGroup,
  ListGroupItem,
  Spinner,
  InputGroup
} from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';
import { getToken } from '../utils/tokenStorage';
import axios from 'axios';
import DaumPostcode from 'react-daum-postcode';
import '../css/BoardPage.css';
import '../css/HomePage.css';

// ✅ [추가] react-quill 및 dompurify import
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Quill snow 테마 CSS
import DOMPurify from 'dompurify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const KAKAO_MAP_APP_KEY = process.env.REACT_APP_KAKAO_MAP_KEY;
const availableTags = ['점심', '저녁', '모임', '맛집', '일상', '주말','한식', '중식', '양식','일식', '카페'];

// --- 카카오맵 스크립트 로더 (변경 없음) ---
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


const BoardPage = () => {
  const { user, isAuthenticated, onNavigate } = useAuth();
  const [posts, setPosts] = useState([]); // ✅ [수정] 초기값을 빈 배열로 설정
  const [loading, setLoading] = useState(true);
  const quillRef = useRef(null);
  // --- Modal States ---
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  // --- Filter States ---
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [tempActiveFilters, setTempActiveFilters] = useState([]);

  // --- Form States ---
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState(''); 
  const [newPostSelectedTags, setNewPostSelectedTags] = useState([]);
  const [newComment, setNewComment] = useState('');

  const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(false);
  const [isPostcodeModalOpen, setIsPostcodeModalOpen] = useState(false);
  const [newPostAddress, setNewPostAddress] = useState('');
  const [convertedLat, setConvertedLat] = useState(null);
  const [convertedLon, setConvertedLon] = useState(null);
  
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click(); // 파일 선택창 띄우기

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('image', file); // 'image'는 백엔드 @RequestParam("image")와 일치해야 함

        try {
          const token = getToken();
          const response = await axios.post(`${API_URL}/api/images/upload`, formData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });

          const url = response.data.url;

          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true); // 현재 커서 위치 가져오기
          editor.insertEmbed(range.index, 'image', url); // 커서 위치에 이미지 태그 삽입
          editor.setSelection(range.index + 1); // 커서를 이미지 다음으로 이동

        } catch (error) {
          console.error('이미지 업로드 실패:', error);
          alert('이미지 업로드에 실패했습니다.');
        }
      }
    };
  }, []);

  const quillModules = {
    toolbar: {
      container: [
        [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
        [{size: []}],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, 
         {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'], // 'image' 버튼
        [{ 'align': [] }],
        ['clean']
      ],
      handlers: {
        'image': imageHandler, 
      },
    },
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'align' // ✅ 'image'와 'align' 추가
  ];

  // ✅ [수정] fetchPosts 함수 전체 수정 (안정성 강화)
  const fetchPosts = useCallback(async () => {
    try {
        setLoading(true);
        const token = getToken();
        const response = await axios.get(`${API_URL}/api/board`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // ✅ API 응답이 배열인지 확인합니다.
        if (Array.isArray(response.data)) {
            setPosts(response.data);
        } else {
            console.warn("API 응답이 배열이 아닙니다:", response.data);
            setPosts([]); // ✅ 배열이 아니면 빈 배열로 강제 설정
        }
    } catch (error) {
        console.error("게시글을 불러오는 데 실패했습니다.", error);
        setPosts([]); // ✅ 에러 발생 시에도 빈 배열로 강제 설정
    } finally {
        setLoading(false);
    }
  }, []); // ✅ useCallback으로 감싸고 의존성 배열 비움

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
    loadKakaoMapScript()
      .then(() => setIsMapScriptLoaded(true))
      .catch(err => console.error("맵 스크립트 로드 실패:", err));

    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAuthenticated, fetchPosts]); // ✅ fetchPosts를 의존성 배열에 추가

  // --- Modal Toggles ---
  const toggleCreateModal = () => {
    if (!isAuthenticated) {
      alert('글을 작성하려면 로그인이 필요합니다.');
      onNavigate('login');
      return;
    }
    setEditingPost(null);
    setNewPostTitle('');
    setNewPostContent(''); // ✅ 초기화
    setNewPostSelectedTags([]);
    setNewPostAddress('');
    setConvertedLat(null);
    setConvertedLon(null);
    setCreateModalOpen(!isCreateModalOpen);
  };
  
  const toggleDetailModal = () => {
    setDetailModalOpen(!isDetailModalOpen);
    if(isDetailModalOpen) setSelectedPost(null);
  }

  const handleEditClick = (post) => {
    setEditingPost(post);
    setNewPostTitle(post.title);
    setNewPostContent(post.content); // ✅ 기존 HTML 컨텐츠를 불러옴
    setNewPostSelectedTags(post.tags);
    setNewPostAddress(post.address || '');
    setConvertedLat(post.latitude || null);
    setConvertedLon(post.longitude || null);
    setCreateModalOpen(true);
  };
  
  // 조회수 증가 로직 수정함 (김민기). 작성자 본인의 카운트 안되게 함.
  const handlePostClick = async (post) => {
    try {
        const isAuthorSelfView = user?.id && post?.author?.id && (user.id === post.author.id);

        let updatedPost = post;

        if (!isAuthorSelfView) {
            const token = getToken();
            await axios.put(`${API_URL}/api/board/${post.id}/view`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            updatedPost = { ...post, views: post.views + 1 };
            setPosts(prevPosts => prevPosts.map(p => p.id === post.id ? updatedPost : p));
        }

        setSelectedPost(updatedPost);
    } catch (error) {
        console.warn("조회수 증가 실패:", error);
        setSelectedPost(post);
    }
    setDetailModalOpen(true);
  }

  // --- Filter Logic --- (변경 없음)
  const toggleFilter = () => {
    if (!isFilterOpen) setTempActiveFilters([...activeFilters]);
    setFilterOpen(!isFilterOpen);
  };
  const handleTempTagFilter = (tag) => {
    setTempActiveFilters(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };
  const applyFilters = () => {
    setActiveFilters([...tempActiveFilters]);
    setFilterOpen(false);
  };

  // ✅ [수정] useMemo 의존성 배열에 'posts' 추가
  const filteredPosts = useMemo(() => {
    // ✅ 'posts'가 배열이 아닐 경우를 대비한 방어 코드
    if (!Array.isArray(posts)) {
        return [];
    }
    if (activeFilters.length === 0) return posts;
    return posts.filter(post => activeFilters.every(filterTag => post.tags.includes(filterTag)));
  }, [posts, activeFilters]);
  
  // --- 주소 검색 완료 핸들러 (변경 없음) ---
  const handleAddressComplete = (data) => {
    if (!isMapScriptLoaded) {
        alert("지도 서비스가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
        return;
    }
    setNewPostAddress(data.address);
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(data.address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
            setConvertedLat(result[0].y);
            setConvertedLon(result[0].x);
            alert('주소가 좌표로 변환되었습니다.');
            setIsPostcodeModalOpen(false);
        } else {
            alert('주소로 좌표를 찾는 데 실패했습니다. 주소를 다시 확인해주세요.');
            setConvertedLat(null);
            setConvertedLon(null);
        }
    });
  };
  
  // --- Data Handling Logic (handleSavePost 수정) ---
  const handleSavePost = async () => {
    if (!newPostTitle || !newPostContent) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    if (!convertedLat || !convertedLon) {
        if (!window.confirm("위치 정보(주소)가 없으면 '맛집 추천'에 표시되지 않습니다. 그래도 저장하시겠습니까?")) {
            return;
        }
    }

    const token = getToken();
    // ✅ newPostContent는 이제 ReactQuill의 HTML 문자열입니다.
    const payload = {
        title: newPostTitle,
        content: newPostContent,
        tags: newPostSelectedTags,
        address: newPostAddress,
        latitude: convertedLat,
        longitude: convertedLon
    };

    try {
        if (editingPost) { // Update
            await axios.put(`${API_URL}/api/board/${editingPost.id}`, payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } else { // Create
            await axios.post(`${API_URL}/api/board`, payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
        setCreateModalOpen(false);
        setEditingPost(null);
        fetchPosts();
    } catch (error) {
        console.error("게시글 저장 실패:", error);
        alert("게시글 저장에 실패했습니다.");
    }
  };

  // --- (handleDeletePost, handleAddComment, handleLikePost 변경 없음) ---
  const handleDeletePost = async (postId) => {
    if (window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
        try {
            const token = getToken();
            await axios.delete(`${API_URL}/api/board/${postId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchPosts();
        } catch (error) {
            console.error("게시글 삭제 실패:", error);
            alert("게시글 삭제에 실패했습니다.");
        }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }
    if (!isAuthenticated) {
        alert('댓글을 작성하려면 로그인이 필요합니다.');
        onNavigate('login');
        return;
    }
    
    try {
        const token = getToken();
        const response = await axios.post(`${API_URL}/api/board/${selectedPost.id}/comments`, 
            { text: newComment },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setSelectedPost(prev => ({ ...prev, comments: [...prev.comments, response.data] }));
        setNewComment('');
        
        setPosts(posts.map(p => 
            p.id === selectedPost.id
            ? { ...p, comments: [...p.comments, response.data] }
            : p
        ));

    } catch (error) {
        console.error("댓글 작성 실패:", error);
        alert("댓글 작성에 실패했습니다.");
    }
  };

  // ✅ [수정] handleLikePost: Optional Chaining 추가
  const handleLikePost = async () => {
    if (!selectedPost) return;
    try {
        const token = getToken();
        const response = await axios.post(`${API_URL}/api/board/${selectedPost.id}/like`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const updatedPost = response.data;
        setSelectedPost(updatedPost);
        // ✅ 'posts'가 배열이 아닐 경우를 대비해 방어 코드 추가
        setPosts(prevPosts => 
            Array.isArray(prevPosts) 
            ? prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p)
            : []
        );

    } catch (error) {
        console.error("좋아요 실패:", error);
        alert("좋아요 처리에 실패했습니다.");
    }
  };
  
  const renderBoardContent = () => {
    if (loading) {
        return <div className="text-center my-5"><Spinner /> <p>게시판을 불러오는 중...</p></div>
    }
    return (
        <Container className="board-container py-4">
           {/* --- (게시판 헤더 및 필터 UI 변경 없음) --- */}
           <div className="board-header d-flex justify-content-between align-items-center mb-4">
             <h1 className="board-title d-none d-lg-block"></h1>
             <div className="board-actions">
               <Dropdown isOpen={isFilterOpen} toggle={toggleFilter} className="d-inline-block me-2">
                 <DropdownToggle caret color="secondary">태그 필터</DropdownToggle>
                 <DropdownMenu>
                   <DropdownItem header>필터링할 태그를 선택하세요</DropdownItem>
                   <DropdownItem onClick={() => setTempActiveFilters([])} toggle={false}>
                     <Badge color={tempActiveFilters.length === 0 ? 'primary' : 'light'} pill className="me-1">{tempActiveFilters.length === 0 ? '●' : '○'}</Badge>
                     전체 보기
                   </DropdownItem>
                   <DropdownItem divider />
                   {availableTags.map(tag => (
                     <DropdownItem key={tag} onClick={() => handleTempTagFilter(tag)} toggle={false}>
                        <Badge color={tempActiveFilters.includes(tag) ? 'primary' : 'light'} pill className="me-2">{tempActiveFilters.includes(tag) ? '●' : '○'}</Badge>
                       {tag}
                     </DropdownItem>
                   ))}
                   <DropdownItem divider />
                   <div className="d-flex justify-content-end px-2">
                     <Button color="secondary" size="sm" onClick={toggleFilter} className="me-2">취소</Button>
                     <Button color="primary" size="sm" onClick={applyFilters}>확인</Button>
                   </div>
                 </DropdownMenu>
               </Dropdown>
               <Button color="primary" onClick={toggleCreateModal}>생성하기</Button>
             </div>
           </div>
     
           {activeFilters.length > 0 && (
             <div className="mb-3">
               <strong>활성 필터:</strong>
               {activeFilters.map(tag => (
                 <Badge key={tag} color="primary" pill className="ms-2" onClick={() => setActiveFilters(prev => prev.filter(t => t !== tag))} style={{cursor: 'pointer'}}>
                   {tag} &times;
                 </Badge>
               ))}
             </div>
           )}
     
           <Row>
             {/* ✅ [수정] filteredPosts가 배열임을 확신하고 map 실행 */}
             {filteredPosts.length > 0 ? (
               filteredPosts.map(post => (
                 <Col md="6" lg="4" className="mb-4" key={post.id}>
                   <Card className="h-100 post-card shadow-sm">
                     <CardBody onClick={() => handlePostClick(post)} style={{ cursor: 'pointer' }}>
                       <CardTitle tag="h5">{post.title}</CardTitle>
                       <div className="mb-2">
                         {post.tags.map(tag => (<Badge color="info" className="me-1" key={tag}>{tag}</Badge>))}
                       </div>
                       {/* ✅ [수정] CardText: Optional Chaining (?.) 추가 */}
                       <CardText className="text-muted flex-grow-1">
                         {post.content?.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                       </CardText>
                       <div className="d-flex justify-content-between align-items-center">
                         {/* ✅ [수정] Optional Chaining (?.) 추가 */}
                         <small className="text-muted">작성자: {post.author?.name || '알 수 없음'}</small>
                         <small className="text-muted">❤️ {post.likes} 👀 {post.views}</small>
                       </div>
                     </CardBody>
                     {/* ✅ [수정] Optional Chaining (?.) 추가 */}
                     {isAuthenticated && user?.id === post.author?.id && (
                        <div className="post-actions p-2 text-end">
                            <Button color="link" size="sm" onClick={(e) => {e.stopPropagation(); handleEditClick(post);}}>수정</Button>
                            <Button color="link" size="sm" className="text-danger" onClick={(e) => {e.stopPropagation(); handleDeletePost(post.id);}}>삭제</Button>
                        </div>
                     )}
                   </Card>
                 </Col>
               ))
             ) : (
               <Col>
                 <p className="text-center text-muted">표시할 게시물이 없습니다.</p>
               </Col>
             )}
           </Row>
        </Container>
    );
  }

  return (
    <>
      {/* --- (상단 타이틀 영역 변경 없음) --- */}
      <div className="d-flex flex-column text-center position-relative">
        {isDesktop ? (
          <>
            <div className="flex-grow-1 d-flex align-items-start justify-content-center pt-0 mt-0">
              <Container>
                <div style={{ backgroundColor: 'rgba(78, 172, 209, 0)', padding: '1%', borderRadius: '3rem' }} className="fade-in-up-text">
                  <h1 className="display-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>맛집 소개</h1>
                  <p className="lead mt-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>다른 사용자와 나만의 맛집을 공유해봐요!</p>
                </div>
              </Container>
            </div>
            {renderBoardContent()}
          </>
        ) : (
          <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
            <div className="fade-in-up-text" style={{ marginTop: "100px" }}>
              <Container>
                <div style={{ backgroundColor: 'rgba(78, 172, 209, 0)', padding: '1%', borderRadius: '3rem' }}>
                  <h1 className="display-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>맛집 소개</h1>
                  <p className="lead mt-3" style={{ whiteSpace: 'nowrap', fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>다른 사용자와 나만의 맛집을 공유해봐요!</p>
                </div>
              </Container>
            </div>
            {renderBoardContent()}
          </div>
        )}
      </div>

      <Modal isOpen={isCreateModalOpen} toggle={() => setCreateModalOpen(!isCreateModalOpen)} size="lg">
        <ModalHeader toggle={() => setCreateModalOpen(!isCreateModalOpen)}>{editingPost ? '글 수정' : '새 글 작성'}</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="postTitle">제목</Label>
              <Input id="postTitle" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} />
            </FormGroup>
            
            <FormGroup>
              <Label for="postContent">내용</Label>
              <ReactQuill
                ref={quillRef}
                id="postContent"
                theme="snow"
                value={newPostContent}
                onChange={setNewPostContent} // onChange는 content (HTML 문자열)를 직접 반환
                modules={quillModules}
                formats={quillFormats}
                style={{ height: '300px', marginBottom: '50px' }} // 에디터 높이 지정 및 하단 여백
              />
            </FormGroup>
            
            <FormGroup>
                <Label for="postAddress"></Label>
                <InputGroup>
                    <Input id="postAddress" placeholder="주소 찾기 버튼을 클릭하세요" value={newPostAddress} readOnly />
                    <Button color="secondary" onClick={() => setIsPostcodeModalOpen(true)} disabled={!isMapScriptLoaded}>
                        주소 찾기
                    </Button>
                </InputGroup>
                {!isMapScriptLoaded && <small className="text-muted">지도 서비스를 로드 중입니다...</small>}
                {convertedLat && (
                    <small className="text-success d-block mt-1">
                        좌표가 설정되었습니다. (위도: {convertedLat}, 경도: {convertedLon})
                    </small>
                )}
            </FormGroup>

            <FormGroup>
              <Label for="postTags">태그 (최대 5개)</Label>
              <div className="tag-selection-container">
                {availableTags.map(tag => (
                  <Button key={tag} color="outline-secondary" className={`tag-button ${newPostSelectedTags.includes(tag) ? 'active' : ''}`} onClick={() => setNewPostSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} disabled={!newPostSelectedTags.includes(tag) && newPostSelectedTags.length >= 5}>
                    {tag}
                  </Button>
                ))}
              </div>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSavePost}>{editingPost ? '수정 완료' : '작성 완료'}</Button>{' '}
          <Button color="secondary" onClick={() => setCreateModalOpen(!isCreateModalOpen)}>취소</Button>
        </ModalFooter>
      </Modal>

      {isPostcodeModalOpen && (
          <Modal isOpen={isPostcodeModalOpen} toggle={() => setIsPostcodeModalOpen(false)} size="lg">
              <ModalHeader toggle={() => setIsPostcodeModalOpen(false)}>주소 검색</ModalHeader>
              <ModalBody>
                  <DaumPostcode onComplete={handleAddressComplete} autoClose={false} />
              </ModalBody>
          </Modal>
      )}

      {selectedPost && (
        <Modal isOpen={isDetailModalOpen} toggle={toggleDetailModal} size="lg">
            <ModalHeader toggle={toggleDetailModal}>{selectedPost.title}</ModalHeader>
            <ModalBody>
                <div className="d-flex justify-content-between align-items-center">
                    {/* ✅ [수정] Optional Chaining (?.) 추가 */}
                    <p className="mb-0"><strong>작성자:</strong> {selectedPost.author?.name || '알 수 없음'}</p>
                    <small className="text-muted">❤️ {selectedPost.likes} 👀 {selectedPost.views}</small>
                </div>
                <div className="mb-3">
                    {selectedPost.tags.map(tag => (<Badge color="info" className="me-1" key={tag}>{tag}</Badge>))}
                </div>
                <hr />

                <div 
                  className="post-content-body my-4 ql-editor" 
                  style={{ minHeight: '150px' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedPost.content || '') }} // ✅ [수정] .content가 null일 경우 대비
                />
                
                {isAuthenticated && (
                    <div className="text-center mb-3">
                        {(() => {
                            // ✅ [수정] Optional Chaining (?.) 추가
                            const isLiked = selectedPost.likedMemberIds && 
                                          selectedPost.likedMemberIds.includes(user?.id);
                            
                            return (
                                <Button 
                                    color="danger" 
                                    outline={!isLiked} 
                                    onClick={handleLikePost}
                                >
                                    ❤️ {isLiked ? '좋아요' : '좋아요'} ({selectedPost.likes})
                                </Button>
                            );
                        })()}
                    </div>
                )}
                <hr />
                <h5>댓글</h5>
                <ListGroup flush className="comment-list">
                    {selectedPost.comments.length > 0 ? selectedPost.comments.map(comment => (
                        <ListGroupItem key={comment.id} className="d-flex justify-content-between">
                            {/* ✅ [수정] Optional Chaining (?.) 추가 */}
                            <span><strong>{comment.author?.name || '알 수 없음'}:</strong> {comment.text}</span>
                        </ListGroupItem>
                    )) : <p className="text-muted">아직 댓글이 없습니다.</p>}
                </ListGroup>
                {isAuthenticated && (
                    <div className="mt-4">
                        <FormGroup>
                            <Input type="textarea" rows="3" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="댓글을 입력하세요..." />
                        </FormGroup>
                        <Button color="primary" onClick={handleAddComment}>댓글 작성</Button>
                    </div>
                )}
            </ModalBody>
        </Modal>
      )}
    </>
  );
};

export default BoardPage;
