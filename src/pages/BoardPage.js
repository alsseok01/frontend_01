import React, { useState, useMemo, useEffect } from 'react';
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
  ListGroupItem
} from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';
import '../css/BoardPage.css';
import '../css/HomePage.css'; // HomePage의 스타일을 재사용합니다.

// 초기 게시물 데이터 (예시) - 댓글 추가
const initialPosts = [
  {
    id: 1,
    author: '김민준',
    title: '오늘 점심 같이 드실 분?',
    content: '구내식당에서 혼밥하기 싫어서 글 올려봐요. 12시 30분에 식당 앞에서 만나요!',
    tags: ['점심', '일상'],
    timestamp: '2023-10-27T12:00:00Z',
    comments: [
        { id: 1, author: '이서아', text: '좋아요! 저도 같이 먹고 싶어요.' },
        { id: 2, author: '박준서', text: '저도 갑니다!' },
    ]
  },
  {
    id: 2,
    author: '이서아',
    title: '주말에 한강에서 치맥하실 분 구합니다!',
    content: '이번 주 토요일 저녁에 날씨도 좋을 것 같은데, 한강에서 치맥 어떠세요? 시간 되시는 분 댓글 남겨주세요. 제가 살게요!',
    tags: ['주말', '한강', '모임'],
    timestamp: '2023-10-26T18:30:00Z',
    comments: []
  },
  {
    id: 3,
    author: '박준서',
    title: '맛집 탐방 동아리 만드실 분?',
    content: '새로운 맛집 찾아다니는 걸 좋아하는데, 같이 동아리 만들어서 활동하실 분 계신가요? 특히 중식, 양식 좋아합니다. 정기적으로 모여서 같이 맛있는거 먹으러 다녀요!',
    tags: ['맛집', '모임', '중식', '양식'],
    timestamp: '2023-10-25T09:15:00Z',
    comments: [
        { id: 1, author: '김민준', text: '오 좋은 생각이네요. 관심 있습니다.' },
    ]
  },
];

const availableTags = ['점심', '저녁', '모임', '맛집', '일상', '주말', '중식', '양식', '카페'];

const BoardPage = () => {
  const { user, isAuthenticated, onNavigate } = useAuth();
  const [posts, setPosts] = useState(initialPosts);

  // --- Modal States ---
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null); // 수정할 게시물 데이터
  const [selectedPost, setSelectedPost] = useState(null); // 상세보기할 게시물 데이터

  // --- Filter States ---
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [tempActiveFilters, setTempActiveFilters] = useState([]);

  // --- Form States ---
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostSelectedTags, setNewPostSelectedTags] = useState([]);
  const [newComment, setNewComment] = useState('');

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Modal Toggles ---
  const toggleCreateModal = () => {
    if (!isAuthenticated) {
      alert('글을 작성하려면 로그인이 필요합니다.');
      onNavigate('login');
      return;
    }
    setEditingPost(null); // 새로 작성하는 것이므로 수정 상태 초기화
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostSelectedTags([]);
    setCreateModalOpen(!isCreateModalOpen);
  };
  
  const toggleDetailModal = () => {
    setDetailModalOpen(!isDetailModalOpen);
    if(isDetailModalOpen) setSelectedPost(null); // 닫힐 때 선택된 포스트 초기화
  }

  const handleEditClick = (post) => {
    setEditingPost(post);
    setNewPostTitle(post.title);
    setNewPostContent(post.content);
    setNewPostSelectedTags(post.tags);
    setCreateModalOpen(true);
  };
  
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setDetailModalOpen(true);
  }

  // --- Filter Logic ---
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

  const filteredPosts = useMemo(() => {
    if (activeFilters.length === 0) return posts;
    return posts.filter(post => activeFilters.every(filterTag => post.tags.includes(filterTag)));
  }, [posts, activeFilters]);
  
  // --- Data Handling Logic ---
  const handleSavePost = () => {
    if (!newPostTitle || !newPostContent) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (editingPost) { // 수정 모드
      const updatedPosts = posts.map(p => 
        p.id === editingPost.id 
          ? { ...p, title: newPostTitle, content: newPostContent, tags: newPostSelectedTags } 
          : p
      );
      setPosts(updatedPosts);
    } else { // 생성 모드
      const newPost = {
        id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
        author: user?.name || '익명',
        title: newPostTitle,
        content: newPostContent,
        tags: newPostSelectedTags,
        timestamp: new Date().toISOString(),
        comments: [],
      };
      setPosts(prevPosts => [newPost, ...prevPosts]);
    }
    
    setCreateModalOpen(false);
    setEditingPost(null);
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
        setPosts(posts.filter(p => p.id !== postId));
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }
    if (!isAuthenticated) {
        alert('댓글을 작성하려면 로그인이 필요합니다.');
        onNavigate('login');
        return;
    }
    const newCommentObject = {
        id: selectedPost.comments.length > 0 ? Math.max(...selectedPost.comments.map(c => c.id)) + 1 : 1,
        author: user?.name || '익명',
        text: newComment,
    };
    const updatedPosts = posts.map(p => 
        p.id === selectedPost.id
            ? { ...p, comments: [...p.comments, newCommentObject] }
            : p
    );
    setPosts(updatedPosts);
    setSelectedPost(prev => ({ ...prev, comments: [...prev.comments, newCommentObject] }));
    setNewComment('');
  };
  
  const renderBoardContent = () => (
    <Container className="board-container py-4">
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
         {filteredPosts.length > 0 ? (
           filteredPosts.map(post => (
             <Col md="6" lg="4" className="mb-4" key={post.id}>
               <Card className="h-100 post-card shadow-sm">
                 <CardBody onClick={() => handlePostClick(post)} style={{ cursor: 'pointer' }}>
                   <CardTitle tag="h5">{post.title}</CardTitle>
                   <div className="mb-2">
                     {post.tags.map(tag => (<Badge color="info" className="me-1" key={tag}>{tag}</Badge>))}
                   </div>
                   <CardText className="text-muted flex-grow-1">{post.content.substring(0, 100)}...</CardText>
                   <small className="text-muted">작성자: {post.author}</small>
                 </CardBody>
                 {isAuthenticated && user?.name === post.author && (
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

  return (
    <>
      <div className="d-flex flex-column text-center position-relative">
        {isDesktop ? (
          <>
            <div className="flex-grow-1 d-flex align-items-start justify-content-center pt-0 mt-0">
              <Container>
                <div style={{ backgroundColor: 'rgba(78, 172, 209, 0)', padding: '1%', borderRadius: '3rem' }} className="fade-in-up-text">
                  <h1 className="display-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>게시판</h1>
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
                  <h1 className="display-3" style={{ fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>게시판</h1>
                  <p className="lead mt-3" style={{ whiteSpace: 'nowrap', fontWeight: "bold", color: 'rgba(0, 0, 0, 1)' }}>다른 사용자와 나만의 맛집을 공유해봐요!</p>
                </div>
              </Container>
            </div>
            {renderBoardContent()}
          </div>
        )}
      </div>

      {/* 새 글 작성 및 수정 모달 */}
      <Modal isOpen={isCreateModalOpen} toggle={() => setCreateModalOpen(!isCreateModalOpen)}>
        <ModalHeader toggle={() => setCreateModalOpen(!isCreateModalOpen)}>{editingPost ? '글 수정' : '새 글 작성'}</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="postTitle">제목</Label>
              <Input id="postTitle" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label for="postContent">내용</Label>
              <Input id="postContent" type="textarea" rows="5" value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} />
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

      {/* 게시물 상세 보기 모달 */}
      {selectedPost && (
        <Modal isOpen={isDetailModalOpen} toggle={toggleDetailModal} size="lg">
            <ModalHeader toggle={toggleDetailModal}>{selectedPost.title}</ModalHeader>
            <ModalBody>
                <p><strong>작성자:</strong> {selectedPost.author}</p>
                <div className="mb-3">
                    {selectedPost.tags.map(tag => (<Badge color="info" className="me-1" key={tag}>{tag}</Badge>))}
                </div>
                <hr />
                <div className="post-content-body my-4" style={{ minHeight: '150px' }}>
                    {selectedPost.content}
                </div>
                <hr />
                <h5>댓글</h5>
                <ListGroup flush className="comment-list">
                    {selectedPost.comments.length > 0 ? selectedPost.comments.map(comment => (
                        <ListGroupItem key={comment.id} className="d-flex justify-content-between">
                            <span><strong>{comment.author}:</strong> {comment.text}</span>
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

