import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import './ChatModal.css';

interface Message {
  _id: string;
  sender: { _id: string; name: string; avatar: string };
  receiver: { _id: string; name: string; avatar: string };
  content: string;
  createdAt: string;
}

interface ChatModalProps {
  receiverId: string;
  receiverName: string;
  appointmentId?: string;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ receiverId, receiverName, appointmentId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchMessages();

    // Socket listener for real-time messages
    if (socket) {
      socket.on('receive_message', handleReceiveMessage);
    }

    // Poll every 3 seconds as fallback (when socket is disconnected)
    pollRef.current = setInterval(fetchMessages, 3000);

    return () => {
      if (socket) socket.off('receive_message', handleReceiveMessage);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [socket, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleReceiveMessage = (msg: Message) => {
    if (
      msg.sender._id === receiverId ||
      msg.receiver._id === receiverId ||
      msg.sender._id === user?._id ||
      msg.receiver._id === user?._id
    ) {
      setMessages(prev => {
        if (!prev.find(m => m._id === msg._id)) return [...prev, msg];
        return prev;
      });
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/${receiverId}`);
      setMessages(res.data);
    } catch (e) {
      console.error('Failed to load messages', e);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Try socket first (real-time)
      if (socket && socket.connected) {
        socket.emit('send_message', { receiverId, content, appointmentId });
        // Optimistically fetch after short delay
        setTimeout(fetchMessages, 500);
      } else {
        // HTTP fallback when socket is not connected
        const res = await api.post('/chat/send', { receiverId, content, appointmentId });
        setMessages(prev => {
          if (!prev.find(m => m._id === res.data._id)) return [...prev, res.data];
          return prev;
        });
      }
    } catch (err) {
      console.error('Send message failed:', err);
      setNewMessage(content); // restore message if failed
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal animate-slide-down">
        <div className="chat-header">
          <h3>Chat with {receiverName}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: socket?.connected ? '#22c55e' : '#f59e0b',
              display: 'inline-block'
            }} title={socket?.connected ? 'Live' : 'Polling mode'} />
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="chat-body">
          {loading ? (
            <div className="chat-loading">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">Start the conversation...</div>
          ) : (
            messages.map((msg, idx) => (
              <div key={msg._id || idx} className={`chat-message ${msg.sender._id === user?._id ? 'sent' : 'received'}`}>
                <div className="chat-bubble">
                  {msg.content}
                </div>
                <div className="chat-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <form className="chat-footer" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            disabled={sending}
          />
          <button type="submit" disabled={!newMessage.trim() || sending}>
            {sending ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
