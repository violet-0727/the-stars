import React, { useState, useRef, useEffect } from 'react';

export default function ChatPanel({ projectData, setProjectData, activeContactId, setSystemMsgModal, setChoiceModal, setContextMenu, setActiveContactId }: any) {
  const [inputText, setInputText] = useState('');
  const [senderVal, setSenderVal] = useState('self');
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [projectData, activeContactId]);

  if (!activeContactId) {
    return (
      <div className="chat-panel" id="chatPanel">
        <div className="empty-state" id="emptyState">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <p>选择一个对话开始编辑剧情</p>
          <p style={{fontSize:'12px', color: 'var(--text-muted)'}}>或点击左侧 "添加角色对话" 创建新对话</p>
        </div>
      </div>
    );
  }

  const contact = projectData.contacts.find((c: any) => c.id === activeContactId);
  const messages = projectData.chats[activeContactId] || [];

  const handleSendMessage = () => {
    const content = inputText.trim();
    if (!content) return;

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;

    const msg: any = { type: 'message', content, time };

    if (senderVal === 'self') {
      msg.sender = 'self';
    } else {
      const c = projectData.contacts.find((c: any) => c.id === senderVal);
      if (c) {
        msg.sender = c.id;
        msg.senderName = c.name;
        msg.avatar = c.avatar;
      }
    }

    const newProjectData = { ...projectData };
    newProjectData.chats[activeContactId].push(msg);
    setProjectData(newProjectData);
    setInputText('');
  };

  const handleInputKeydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-panel" id="chatPanel">
      <div className="chat-header" id="chatHeader">
        <div className="chat-header-left">
          <div className="chat-header-avatar" id="chatHeaderAvatar">
            <img src={contact?.avatar} alt="" />
          </div>
          <div className="chat-header-info">
            <h3 id="chatHeaderName">{contact?.name}</h3>
            <p id="chatHeaderStatus">{messages.length} 条消息</p>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="chat-action-btn" title="添加系统消息" onClick={() => setSystemMsgModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </button>
          <button className="chat-action-btn" title="添加选项分支" onClick={() => setChoiceModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button className="chat-action-btn" title="清空对话" onClick={() => {
            if (!window.confirm('确定要清空当前对话的所有消息吗？')) return;
            const newProjectData = { ...projectData };
            newProjectData.chats[activeContactId] = [];
            setProjectData(newProjectData);
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      <div className="chat-messages" id="chatMessages" ref={chatMessagesRef}>
        {messages.map((msg: any, idx: number) => {
          const onCtxMenu = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setContextMenu({ show: true, x: e.clientX, y: e.clientY, target: { type: 'message', idx } });
          };

          if (msg.type === 'system') {
            return (
              <div key={idx} className="system-message" onContextMenu={onCtxMenu}>
                <span className="sys-content">{msg.content}</span>
              </div>
            );
          }
          if (msg.type === 'choice') {
            return (
              <div key={idx} className="choice-message" onContextMenu={onCtxMenu}>
                <div className="choice-container">
                  <div className="choice-title">{msg.title || '请选择'}</div>
                  <div className="choice-options">
                    {msg.options.map((opt: string, i: number) => <button key={i} className="choice-option">{opt}</button>)}
                  </div>
                </div>
              </div>
            );
          }
          if (msg.type === 'message') {
            const isSelf = msg.sender === 'self';
            const c = projectData.contacts.find((c: any) => c.id === msg.sender);
            const avatar = msg.avatar || (c ? c.avatar : '');
            return (
              <div key={idx} className={`message-row ${isSelf ? 'self' : ''}`} onContextMenu={onCtxMenu}>
                {!isSelf && <div className="msg-avatar"><img src={avatar} alt="" /></div>}
                <div className="msg-content">
                  {!isSelf && <span className="msg-sender">{msg.senderName || ''}</span>}
                  <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: msg.content }}></div>
                  <span className="msg-time">{msg.time || ''}</span>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="chat-input-area" id="chatInputArea">
        <div className="chat-input-toolbar">
          <button className="input-tool-btn" title="插入图片" onClick={() => {
            const url = prompt('输入图片路径或URL:');
            if (url) {
              const msg: any = {
                type: 'message',
                content: `<img src="${url}" style="max-width:200px; border-radius:8px;" alt="image">`,
                sender: senderVal,
                time: new Date().toTimeString().slice(0, 5)
              };
              if (senderVal !== 'self') {
                const c = projectData.contacts.find((c: any) => c.id === senderVal);
                if (c) {
                  msg.senderName = c.name;
                  msg.avatar = c.avatar;
                }
              }
              const newProjectData = { ...projectData };
              newProjectData.chats[activeContactId].push(msg);
              setProjectData(newProjectData);
            }
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <button className="input-tool-btn" title="插入旁白" onClick={() => {
            const text = prompt('输入旁白文本:');
            if (text) {
              const newProjectData = { ...projectData };
              newProjectData.chats[activeContactId].push({ type: 'system', content: '【旁白】' + text });
              setProjectData(newProjectData);
            }
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
          </button>
          <button className="input-tool-btn" title="插入延迟" onClick={() => {
            const newProjectData = { ...projectData };
            newProjectData.chats[activeContactId].push({ type: 'system', content: '⏳ 延迟 1.5 秒' });
            setProjectData(newProjectData);
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </button>
        </div>
        <div className="chat-input-row">
          <div className="chat-input-wrap">
            <select id="senderSelect" value={senderVal} onChange={(e) => setSenderVal(e.target.value)}>
              <option value="self">自己</option>
              {projectData.contacts.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <textarea 
              className="chat-input has-sender" 
              id="messageInput" 
              placeholder="输入对话内容..." 
              rows={1} 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleInputKeydown}
            ></textarea>
          </div>
          <button className="send-btn" id="sendBtn" onClick={handleSendMessage}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
