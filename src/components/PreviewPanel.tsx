import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProjectData, ChatMessage, AppSettings } from '../types';

interface PreviewPanelProps {
  projectData: ProjectData;
  activeContactId: string | null;
  settings: AppSettings;
}

export default function PreviewPanel({ projectData, activeContactId, settings }: PreviewPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contact = activeContactId ? projectData.contacts.find(c => c.id === activeContactId) : null;
  const messages: ChatMessage[] = activeContactId ? (projectData.chats[activeContactId] || []) : [];

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [visibleCount, scrollToBottom]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startPreview = () => {
    setVisibleCount(0);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const stopPreview = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setVisibleCount(0);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Drive the playback
  useEffect(() => {
    if (!isPlaying || isPaused) return;
    if (visibleCount >= messages.length) {
      setIsPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      setVisibleCount(prev => prev + 1);
    }, settings.previewInterval);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, isPaused, visibleCount, messages.length, settings.previewInterval]);

  if (!activeContactId || !contact) {
    return (
      <div className="preview-panel">
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <p>请先在「对话编辑」中选择一个对话</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>然后点击「预览播放」查看效果</p>
        </div>
      </div>
    );
  }

  const visibleMessages = isPlaying || visibleCount > 0 ? messages.slice(0, visibleCount) : messages;

  return (
    <div className="preview-panel">
      {/* Preview Header */}
      <div className="preview-header">
        <div className="chat-header-left">
          <div className="chat-header-avatar">
            <img src={contact.avatar} alt="" />
          </div>
          <div className="chat-header-info">
            <h3>{contact.name}</h3>
            <p>
              {isPlaying
                ? (isPaused ? '已暂停' : `播放中... ${visibleCount}/${messages.length}`)
                : `预览模式 · ${messages.length} 条消息`
              }
            </p>
          </div>
        </div>
        <div className="preview-controls">
          {!isPlaying ? (
            <button className="preview-control-btn play" onClick={startPreview} title="开始播放">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
          ) : (
            <>
              <button className="preview-control-btn" onClick={togglePause} title={isPaused ? '继续' : '暂停'}>
                {isPaused ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                )}
              </button>
              <button className="preview-control-btn stop" onClick={stopPreview} title="停止">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="6" width="12" height="12"/></svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview Progress Bar */}
      {isPlaying && (
        <div className="preview-progress">
          <div
            className="preview-progress-bar"
            style={{ width: `${messages.length > 0 ? (visibleCount / messages.length) * 100 : 0}%` }}
          ></div>
        </div>
      )}

      {/* Preview Messages */}
      <div className="preview-messages">
        {visibleMessages.map((msg, idx) => {
          if (msg.type === 'system') {
            return (
              <div key={idx} className="system-message preview-msg-enter">
                <span className="sys-content">{msg.content}</span>
              </div>
            );
          }
          if (msg.type === 'choice') {
            return (
              <div key={idx} className="choice-message preview-msg-enter">
                <div className="choice-container">
                  <div className="choice-title">{msg.title || '请选择'}</div>
                  <div className="choice-options">
                    {msg.options?.map((opt, i) => (
                      <button key={i} className="choice-option">{opt}</button>
                    ))}
                  </div>
                </div>
              </div>
            );
          }
          if (msg.type === 'message') {
            const isSelf = msg.sender === 'self';
            const c = projectData.contacts.find(c => c.id === msg.sender);
            const avatar = msg.avatar || (c ? c.avatar : '');
            return (
              <div key={idx} className={`message-row ${isSelf ? 'self' : ''} preview-msg-enter`}>
                {!isSelf && <div className="msg-avatar"><img src={avatar} alt="" /></div>}
                <div className="msg-content">
                  {!isSelf && <span className="msg-sender">{msg.senderName || ''}</span>}
                  <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: msg.content || '' }}></div>
                  <span className="msg-time">{msg.time || ''}</span>
                </div>
              </div>
            );
          }
          return null;
        })}
        <div ref={messagesEndRef}></div>
      </div>
    </div>
  );
}
