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
  ListGroupItem,
  Spinner
} from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import '../css/BoardPage.css';
import '../css/HomePage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const availableTags = ['점심', '저녁', '모임', '맛집', '일상', '주말', '중식', '양식', '카페'];

const BoardPage = () => {
  const { user, isAuthenticated, onNavigate } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);

  const fetchPosts = async () => {
    try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/board`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setPosts(response.data);
    } catch (error) {
        console.error("게시글을 불러오는 데 실패했습니다.", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAuthenticated]);

  // --- Modal Toggles ---
  const toggleCreateModal = () => {
    if (!isAuthenticated) {
      alert('글을 작성하려면 로그인이 필요합니다.');
      onNavigate('login');
      return;
    }
    setEditingPost(null);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostSelectedTags([]);
    setCreateModalOpen(!isCreateModalOpen);
  };
  
  const toggleDetailModal = () => {
    setDetailModalOpen(!isDetailModalOpen);
    if(isDetailModalOpen) setSelectedPost(null);
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
  const handleSavePost = async () => {
    if (!newPostTitle || !newPostContent) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    const token = localStorage.getItem('token');
    const payload = {
        title: newPostTitle,
        content: newPostContent,
        tags: newPostSelectedTags
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
        fetchPosts(); // Re-fetch posts to show changes
    } catch (error) {
        console.error("게시글 저장 실패:", error);
        alert("게시글 저장에 실패했습니다.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/board/${postId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchPosts(); // Re-fetch posts after deletion
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
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/api/board/${selectedPost.id}/comments`, 
            { text: newComment },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        // Optimistic update
        setSelectedPost(prev => ({ ...prev, comments: [...prev.comments, response.data] }));
        setNewComment('');
        
        // Also update the main posts list
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
  
  const renderBoardContent = () => {
    if (loading) {
        return <div className="text-center my-5"><Spinner /> <p>게시판을 불러오는 중...</p></div>
    }
    return (
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
                       <small className="text-muted">작성자: {post.author.name}</small>
                     </CardBody>
                     {isAuthenticated && user?.id === post.author.id && (
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

      {selectedPost && (
        <Modal isOpen={isDetailModalOpen} toggle={toggleDetailModal} size="lg">
            <ModalHeader toggle={toggleDetailModal}>{selectedPost.title}</ModalHeader>
            <ModalBody>
                <p><strong>작성자:</strong> {selectedPost.author.name}</p>
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
                            <span><strong>{comment.author.name}:</strong> {comment.text}</span>
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