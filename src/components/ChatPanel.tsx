import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Contact } from '../types';

export default function ChatPanel({ projectData, setProjectData, activeContactId, setChoiceModal, setContextMenu, setActiveContactId, editModalTrigger, setEditModalTrigger, deleteModalTrigger, setDeleteModalTrigger, showTimestamp = true }: any) {
  const [inputText, setInputText] = useState('');
  const [senderVal, setSenderVal] = useState('self');
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // In-app modals state
  const [editModal, setEditModal] = useState<{ show: boolean; idx: number; content: string }>({ show: false, idx: -1, content: '' });
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; idx: number }>({ show: false, idx: -1 });

  // Group settings modal
  const [groupSettingsOpen, setGroupSettingsOpen] = useState(false);

  // Listen for triggers from parent (context menu -> open modal)
  useEffect(() => {
    if (editModalTrigger) {
      setEditModal({ show: true, idx: editModalTrigger.idx, content: editModalTrigger.content });
      setEditModalTrigger(null);
    }
  }, [editModalTrigger]);

  useEffect(() => {
    if (deleteModalTrigger) {
      setDeleteModal({ show: true, idx: deleteModalTrigger.idx });
      setDeleteModalTrigger(null);
    }
  }, [deleteModalTrigger]);
  const [systemMsgModal, setSystemMsgModal] = useState(false);
  const [systemMsgText, setSystemMsgText] = useState('');

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [projectData, activeContactId]);

  // Reset sender when active contact changes
  useEffect(() => {
    setSenderVal('self');
    setGroupSettingsOpen(false);
  }, [activeContactId]);

  // Listen for openGroupSettings event from context menu
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.groupId === activeContactId) {
        setGroupSettingsOpen(true);
      }
    };
    window.addEventListener('openGroupSettings', handler);
    return () => window.removeEventListener('openGroupSettings', handler);
  }, [activeContactId]);

  // Double-click sender toggle (only for non-group contacts)
  const handleSenderDoubleClick = useCallback(() => {
    if (!activeContactId) return;
    const contact = projectData.contacts.find((c: any) => c.id === activeContactId);
    if (contact?.type === 'group') return; // 消息组不使用双击切换
    setSenderVal(prev => prev === 'self' ? activeContactId : 'self');
  }, [activeContactId, projectData]);

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

  const contact: Contact | undefined = projectData.contacts.find((c: any) => c.id === activeContactId);
  const messages = projectData.chats[activeContactId] || [];
  const isGroup = contact?.type === 'group';

  // Build sender options based on type
  const buildSenderOptions = () => {
    const options = [{ id: 'self', name: '自己' }];
    if (isGroup && contact?.members) {
      // 消息组：自己 + 所有组内成员
      contact.members.forEach((memberId: string) => {
        const member = projectData.contacts.find((c: any) => c.id === memberId);
        if (member) {
          options.push({ id: member.id, name: member.name });
        }
      });
    } else if (contact) {
      // 邀约：自己 + 当前联系人
      options.push({ id: contact.id, name: contact.name });
    }
    return options;
  };

  const senderOptions = buildSenderOptions();

  // ===== Group member management =====
  const allMessageContacts = projectData.contacts.filter((c: any) => c.type === 'message');
  const groupMembers = isGroup && contact?.members
    ? contact.members.map((id: string) => projectData.contacts.find((c: any) => c.id === id)).filter(Boolean) as Contact[]
    : [];
  const availableToAdd = allMessageContacts.filter((c: any) =>
    !contact?.members?.includes(c.id)
  );

  const handleAddMemberToGroup = (memberId: string) => {
    if (!contact || !isGroup) return;
    const newProjectData = { ...projectData };
    const group = newProjectData.contacts.find((c: any) => c.id === activeContactId);
    if (!group) return;
    if (!group.members) group.members = [];
    if (!group.members.includes(memberId)) {
      group.members.push(memberId);
      setProjectData(newProjectData);
    }
  };

  const handleRemoveMemberFromGroup = (memberId: string) => {
    if (!contact || !isGroup) return;
    const newProjectData = { ...projectData };
    const group = newProjectData.contacts.find((c: any) => c.id === activeContactId);
    if (!group || !group.members) return;
    group.members = group.members.filter((id: string) => id !== memberId);
    setProjectData(newProjectData);
    // If current sender was removed, reset to self
    if (senderVal === memberId) setSenderVal('self');
  };

  const handleGroupAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newProjectData = { ...projectData };
      const group = newProjectData.contacts.find((c: any) => c.id === activeContactId);
      if (group) {
        group.avatar = ev.target?.result as string;
        group.isCustomAvatar = true;
        setProjectData(newProjectData);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGroupNameChange = (newName: string) => {
    if (!newName.trim()) return;
    const newProjectData = { ...projectData };
    const group = newProjectData.contacts.find((c: any) => c.id === activeContactId);
    if (group) {
      group.name = newName.trim();
      setProjectData(newProjectData);
    }
  };

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

  const showBubbleContextMenu = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 170;
    const menuHeight = 90;
    let x = e.clientX;
    let y = e.clientY;
    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 8;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 8;
    if (x < 8) x = 8;
    if (y < 8) y = 8;
    setContextMenu({ show: true, x, y, target: { type: 'message', idx } });
  };

  const handleConfirmEdit = () => {
    if (editModal.idx < 0) return;
    const newProjectData = { ...projectData };
    newProjectData.chats[activeContactId][editModal.idx].content = editModal.content;
    setProjectData(newProjectData);
    setEditModal({ show: false, idx: -1, content: '' });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.idx < 0) return;
    const newProjectData = { ...projectData };
    newProjectData.chats[activeContactId].splice(deleteModal.idx, 1);
    setProjectData(newProjectData);
    setDeleteModal({ show: false, idx: -1 });
  };

  const handleConfirmSystemMsg = () => {
    const text = systemMsgText.trim();
    if (!text) return;
    const newProjectData = { ...projectData };
    newProjectData.chats[activeContactId].push({ type: 'system', content: text });
    setProjectData(newProjectData);
    setSystemMsgModal(false);
    setSystemMsgText('');
  };

  const groupAvatarInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="chat-panel" id="chatPanel">
      <div className="chat-header" id="chatHeader">
        <div className="chat-header-left">
          <div className="chat-header-avatar" id="chatHeaderAvatar">
            <img src={contact?.avatar} alt="" />
          </div>
          <div className="chat-header-info">
            <h3 id="chatHeaderName">{contact?.name}</h3>
            <p id="chatHeaderStatus">
              {messages.length} 条消息
              {isGroup && contact?.members && ` · ${contact.members.length} 位成员`}
            </p>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="chat-action-btn" title="添加选项分支" onClick={() => setChoiceModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button className="chat-action-btn" title="清空对话" onClick={() => {
            setDeleteModal({ show: false, idx: -1 });
            if (!window.confirm('确定要清空当前对话的所有消息吗？')) return;
            const newProjectData = { ...projectData };
            newProjectData.chats[activeContactId] = [];
            setProjectData(newProjectData);
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
          {/* 消息组设置按钮 */}
          {isGroup && (
            <button className="chat-action-btn" title="消息设置" onClick={() => setGroupSettingsOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Prevent context menu on empty chat area */}
      <div className="chat-messages" id="chatMessages" ref={chatMessagesRef} onContextMenu={(e) => e.preventDefault()}>
        {messages.map((msg: any, idx: number) => {
          if (msg.type === 'system') {
            return (
              <div key={idx} className="system-message" onContextMenu={(e) => showBubbleContextMenu(e, idx)}>
                <span className="sys-content">{msg.content}</span>
              </div>
            );
          }
          if (msg.type === 'choice') {
            return (
              <div key={idx} className="choice-message" onContextMenu={(e) => showBubbleContextMenu(e, idx)}>
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
              <div key={idx} className={`message-row ${isSelf ? 'self' : ''}`}>
                {!isSelf && <div className="msg-avatar"><img src={avatar} alt="" /></div>}
                <div className="msg-content">
                  {!isSelf && <span className="msg-sender">{msg.senderName || ''}</span>}
                  <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: msg.content }} onContextMenu={(e) => showBubbleContextMenu(e, idx)}></div>
                  {showTimestamp && <span className="msg-time">{msg.time || ''}</span>}
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
          <button className="input-tool-btn" title="插入旁白/系统消息" onClick={() => {
            setSystemMsgText('');
            setSystemMsgModal(true);
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
            <select
              id="senderSelect"
              value={senderVal}
              onChange={(e) => setSenderVal(e.target.value)}
              onDoubleClick={isGroup ? undefined : handleSenderDoubleClick}
            >
              {senderOptions.map((opt) => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
            <textarea
              className="chat-input"
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

      {/* ===== In-app Edit Modal ===== */}
      <div className={`modal-overlay ${editModal.show ? 'show' : ''}`} onClick={(e) => e.target === e.currentTarget && setEditModal({ show: false, idx: -1, content: '' })}>
        <div className="modal">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2" width="22" height="22"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
            编辑消息
          </h3>
          <div className="modal-field">
            <label>消息内容</label>
            <input
              type="text"
              value={editModal.content}
              onChange={(e) => setEditModal({ ...editModal, content: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmEdit(); }}
              autoFocus
            />
          </div>
          <div className="modal-actions">
            <button className="modal-btn cancel" onClick={() => setEditModal({ show: false, idx: -1, content: '' })}>取消</button>
            <button className="modal-btn confirm" onClick={handleConfirmEdit}>确认</button>
          </div>
        </div>
      </div>

      {/* ===== In-app Delete Confirm Modal ===== */}
      <div className={`modal-overlay ${deleteModal.show ? 'show' : ''}`} onClick={(e) => e.target === e.currentTarget && setDeleteModal({ show: false, idx: -1 })}>
        <div className="modal">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="#E04848" strokeWidth="2" width="22" height="22"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            确认删除
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>确定要删除这条消息吗？此操作不可撤销。</p>
          <div className="modal-actions">
            <button className="modal-btn cancel" onClick={() => setDeleteModal({ show: false, idx: -1 })}>取消</button>
            <button className="modal-btn confirm" style={{ background: 'linear-gradient(135deg, #E04848 0%, #c0392b 100%)' }} onClick={handleConfirmDelete}>删除</button>
          </div>
        </div>
      </div>

      {/* ===== In-app System Message / Narration Modal ===== */}
      <div className={`modal-overlay ${systemMsgModal ? 'show' : ''}`} onClick={(e) => e.target === e.currentTarget && setSystemMsgModal(false)}>
        <div className="modal">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2" width="22" height="22"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            插入旁白 / 系统消息
          </h3>
          <div className="modal-field">
            <label>消息内容</label>
            <input
              type="text"
              placeholder="例如：第二天清晨... / 【旁白】沉默了片刻..."
              value={systemMsgText}
              onChange={(e) => setSystemMsgText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmSystemMsg(); }}
              autoFocus
            />
          </div>
          <div className="modal-actions">
            <button className="modal-btn cancel" onClick={() => setSystemMsgModal(false)}>取消</button>
            <button className="modal-btn confirm" onClick={handleConfirmSystemMsg}>插入</button>
          </div>
        </div>
      </div>

      {/* ===== Group Settings Modal ===== */}
      <div className={`modal-overlay ${groupSettingsOpen ? 'show' : ''}`} onClick={(e) => e.target === e.currentTarget && setGroupSettingsOpen(false)}>
        <div className="modal" style={{ minWidth: '480px', maxWidth: '560px' }}>
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2" width="22" height="22">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            消息设置
          </h3>

          {/* 组名编辑 */}
          <div className="modal-field">
            <label>消息组名称</label>
            <input
              type="text"
              value={contact?.name || ''}
              onChange={(e) => handleGroupNameChange(e.target.value)}
            />
          </div>

          {/* 组头像 */}
          <div className="modal-field">
            <label>消息组头像</label>
            <div className="group-avatar-edit" onClick={() => groupAvatarInputRef.current?.click()}>
              <img src={contact?.avatar || ''} alt="" className="group-avatar-img" />
              <div className="group-avatar-overlay">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span>更换</span>
              </div>
              <input
                ref={groupAvatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleGroupAvatarChange}
              />
            </div>
          </div>

          {/* 组内成员列表 */}
          <div className="modal-field">
            <label>组内成员 ({groupMembers.length})</label>
            <div className="group-members-list">
              {groupMembers.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '8px 0' }}>暂无成员，请从下方添加</p>
              )}
              {groupMembers.map((member: Contact) => (
                <div key={member.id} className="group-member-item">
                  <div className="group-member-avatar">
                    <img src={member.avatar} alt="" />
                  </div>
                  <span className="group-member-name">{member.name}</span>
                  <button
                    className="group-member-remove"
                    onClick={() => handleRemoveMemberFromGroup(member.id)}
                    title="移除成员"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 添加成员 */}
          <div className="modal-field">
            <label>添加成员</label>
            <div className="group-add-members">
              {availableToAdd.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '8px 0' }}>所有联系人均已加入该消息组</p>
              ) : (
                availableToAdd.map((c: Contact) => (
                  <div
                    key={c.id}
                    className="group-add-member-item"
                    onClick={() => handleAddMemberToGroup(c.id)}
                  >
                    <div className="group-member-avatar">
                      <img src={c.avatar} alt="" />
                    </div>
                    <span className="group-member-name">{c.name}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2" width="16" height="16" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button className="modal-btn confirm" onClick={() => setGroupSettingsOpen(false)}>完成</button>
          </div>
        </div>
      </div>
    </div>
  );
}
