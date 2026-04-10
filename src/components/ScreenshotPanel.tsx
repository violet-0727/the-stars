import React, { useState } from 'react';
import { ProjectData, ChatMessage, AppSettings } from '../types';

interface ScreenshotPanelProps {
  projectData: ProjectData;
  activeContactId: string | null;
  downloadPath?: string;
}

export default function ScreenshotPanel({ projectData, activeContactId, downloadPath }: ScreenshotPanelProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState(false);

  const contact = activeContactId ? projectData.contacts.find(c => c.id === activeContactId) : null;
  const messages: ChatMessage[] = activeContactId ? (projectData.chats[activeContactId] || []) : [];

  if (!activeContactId || !contact) {
    return (
      <div className="screenshot-panel">
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <p>请先在「对话编辑」中选择一个对话</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>然后点击「聊天截取」进行截取</p>
        </div>
      </div>
    );
  }

  const toggleSelect = (idx: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setSelectedIndices(newSet);
  };

  const selectAll = () => {
    const newSet = new Set<number>();
    messages.forEach((_, i) => newSet.add(i));
    setSelectedIndices(newSet);
  };

  const selectNone = () => {
    setSelectedIndices(new Set());
  };

  const selectRange = () => {
    if (selectedIndices.size < 2) return;
    const sorted = Array.from(selectedIndices).sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const newSet = new Set<number>();
    for (let i = min; i <= max; i++) {
      newSet.add(i);
    }
    setSelectedIndices(newSet);
  };

  const handleSave = async () => {
    if (selectedIndices.size === 0) return;
    const sorted = Array.from(selectedIndices).sort((a, b) => a - b);
    const selectedMessages = sorted.map(i => messages[i]);
    const exportData = {
      contact: { name: contact.name, avatar: contact.avatar },
      messages: selectedMessages,
      exportTime: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const fileName = `chat_screenshot_${contact.name}_${Date.now()}.json`;

    // If Electron and downloadPath is set, save directly to that path
    if (downloadPath && (window as any).electronAPI?.saveScreenshot) {
      try {
        await (window as any).electronAPI.saveScreenshot(downloadPath, fileName, jsonStr);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        return;
      } catch (e) {
        console.error('保存到指定路径失败:', e);
      }
    }

    // Fallback: browser download
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="screenshot-panel">
      {/* Header */}
      <div className="screenshot-header">
        <div className="chat-header-left">
          <div className="chat-header-avatar">
            <img src={contact.avatar} alt="" />
          </div>
          <div className="chat-header-info">
            <h3>{contact.name}</h3>
            <p>已选择 {selectedIndices.size} / {messages.length} 条消息</p>
          </div>
        </div>
        <div className="screenshot-controls">
          <button className="screenshot-ctrl-btn" onClick={selectAll} title="全选">全选</button>
          <button className="screenshot-ctrl-btn" onClick={selectNone} title="取消全选">清除</button>
          <button className="screenshot-ctrl-btn" onClick={selectRange} title="补全范围" disabled={selectedIndices.size < 2}>范围</button>
          <button
            className="screenshot-ctrl-btn save"
            onClick={handleSave}
            disabled={selectedIndices.size === 0}
            title="保存截取"
          >
            {saved ? '已保存' : '保存'}
          </button>
        </div>
      </div>

      {/* Messages with checkboxes */}
      <div className="screenshot-messages">
        {messages.map((msg, idx) => {
          const isSelected = selectedIndices.has(idx);
          return (
            <div
              key={idx}
              className={`screenshot-msg-row ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleSelect(idx)}
            >
              <div className={`screenshot-checkbox ${isSelected ? 'checked' : ''}`}>
                {isSelected && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
              <div className="screenshot-msg-content">
                {msg.type === 'system' && (
                  <div className="system-message">
                    <span className="sys-content">{msg.content}</span>
                  </div>
                )}
                {msg.type === 'choice' && (
                  <div className="choice-message">
                    <div className="choice-container" style={{ padding: '8px 12px' }}>
                      <div className="choice-title" style={{ fontSize: '11px', marginBottom: '4px' }}>{msg.title || '请选择'}</div>
                      <div className="choice-options" style={{ gap: '4px' }}>
                        {msg.options?.map((opt, i) => (
                          <button key={i} className="choice-option" style={{ padding: '4px 8px', fontSize: '11px' }}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {msg.type === 'message' && (
                  <div className={`message-row ${msg.sender === 'self' ? 'self' : ''}`} style={{ animation: 'none', maxWidth: '100%' }}>
                    {msg.sender !== 'self' && (
                      <div className="msg-avatar" style={{ width: '28px', height: '28px' }}>
                        <img src={msg.avatar || ''} alt="" />
                      </div>
                    )}
                    <div className="msg-content">
                      {msg.sender !== 'self' && <span className="msg-sender" style={{ fontSize: '10px' }}>{msg.senderName || ''}</span>}
                      <div className="msg-bubble" style={{ fontSize: '12px', padding: '6px 10px' }} dangerouslySetInnerHTML={{ __html: msg.content || '' }}></div>
                      <span className="msg-time">{msg.time || ''}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
