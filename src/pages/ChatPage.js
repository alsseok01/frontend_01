import React from 'react';
import { useParams } from 'react-router-dom';

const ChatPage = () => {
    const { matchId } = useParams();

    return (
        <div style={{ padding: '20px' }}>
            <h2>채팅방</h2>
            <p>이곳에서 상대방과 대화를 나눌 수 있습니다. (Match ID: {matchId})</p>
            
            <div className="chat-window" style={{ border: '1px solid #ccc', height: '400px', marginBottom: '10px', overflowY: 'auto', padding: '10px' }}>
                {/* 메시지들이 여기에 표시됩니다. */}
            </div>

            <div className="chat-input" style={{ display: 'flex' }}>
                <input type="text" placeholder="메시지를 입력하세요..." style={{ flex: 1, padding: '10px' }} />
                <button style={{ padding: '10px 20px' }}>전송</button>
            </div>
            
            <p style={{ marginTop: '20px', color: '#888' }}>
                <strong>참고:</strong> 현재 UI만 구현된 상태입니다. 실제 채팅 기능을 완성하려면 WebSocket을 사용한 백엔드와의 실시간 연동 개발이 추가로 필요합니다.
            </p>
        </div>
    );
};

export default ChatPage;