import React, { useState } from 'react';
import { ProjectData } from '../types';

export default function ContactsPanel({ projectData, activeContactId, selectContact, currentTab, switchTab, showAddContactModal, setContextMenu }: any) {
  const [searchVal, setSearchVal] = useState('');

  let filteredContacts = [...projectData.contacts];
  if (searchVal) {
    filteredContacts = filteredContacts.filter((c: any) => c.name.toLowerCase().includes(searchVal.toLowerCase()));
  }
  if (currentTab === 'messages') filteredContacts = filteredContacts.filter((c: any) => (c.type || 'message') === 'message');
  if (currentTab === 'groups') filteredContacts = filteredContacts.filter((c: any) => (c.type || 'message') === 'group');
  if (currentTab === 'channels') filteredContacts = filteredContacts.filter((c: any) => (c.type || 'message') === 'channel');

  filteredContacts.sort((a: any, b: any) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="contacts-panel">
      <div className="contacts-bg"></div>
      <div className="contacts-content">
        <div className="contacts-header">
          <h2>
            <span className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            信笺
          </h2>
          <div className="contacts-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="搜索联系人..." value={searchVal} onChange={(e) => setSearchVal(e.target.value)} />
          </div>
        </div>

        <div className="contacts-tabs">
          <button className={`contacts-tab ${currentTab === 'groups' ? 'active' : ''}`} onClick={() => switchTab('groups')}>消息</button>
          <button className={`contacts-tab ${currentTab === 'messages' ? 'active' : ''}`} onClick={() => switchTab('messages')}>邀约</button>
          <button className={`contacts-tab ${currentTab === 'channels' ? 'active' : ''}`} onClick={() => switchTab('channels')}>频道</button>
        </div>

        <div className="contacts-list" id="contactsList">
          {filteredContacts.map(c => {
            const chat = projectData.chats[c.id] || [];
            const msgs = chat.filter((m: any) => m.type === 'message');
            const lastMsg = msgs[msgs.length - 1];
            const preview = lastMsg ? lastMsg.content : '暂无消息';
            const time = lastMsg ? lastMsg.time : '';
            const isActive = c.id === activeContactId;

            return (
              <div key={c.id} className={`contact-item ${isActive ? 'active' : ''}`}
                   onClick={() => selectContact(c.id)}
                   onContextMenu={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     setContextMenu({ show: true, x: e.clientX, y: e.clientY, target: { type: 'contact', id: c.id } });
                   }}>
                <div className="contact-avatar">
                  <img src={c.avatar} alt={c.name} />
                  <div className={`status-dot ${c.status}`}></div>
                </div>
                <div className="contact-info">
                  <div className="contact-name">
                    {c.name}
                    {c.pinned && <img className="pin-icon" src="/icons/icon_phone_pinned.png" alt="pinned" />}
                  </div>
                  <div className="contact-preview" dangerouslySetInnerHTML={{ __html: typeof preview === 'string' ? preview : '' }}></div>
                </div>
                <div className="contact-meta">
                  <span className="contact-time">{time}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button className="contacts-add-btn" onClick={showAddContactModal}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          添加角色对话
        </button>
      </div>
    </div>
  );
}
