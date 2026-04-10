import React, { useState, useRef } from 'react';
import { Contact, ProjectData } from '../types';

const AVATARS_PATH = '/avatars/';
const AVAILABLE_AVATARS = [
  '苍兰', '尘沙', '赤霞', '冬香', '多娜', '翡冷翠', '风影', '格芮',
  '琥珀', '花原', '焦糖', '璟麟', '卡娜丝', '卡西米拉', '珂赛特',
  '科洛妮丝', '菈露', '岭川', '密涅瓦', '千都世', '师渺', '特丽莎',
  '缇莉娅', '雾语', '希娅', '夏花', '小禾', '杏子', '鸢尾', '紫槿'
];

interface CharacterPanelProps {
  projectData: ProjectData;
  setProjectData: (data: ProjectData) => void;
}

export default function CharacterPanel({ projectData, setProjectData }: CharacterPanelProps) {
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // New contact form state
  const [newName, setNewName] = useState('');
  const [newStatus, setNewStatus] = useState<string>('online');
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);
  const [newAliasInput, setNewAliasInput] = useState('');
  const [newAliases, setNewAliases] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<string>('online');
  const [editAliases, setEditAliases] = useState<string[]>([]);
  const [editAliasInput, setEditAliasInput] = useState('');
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Only show type='message' contacts (groups/channels are not "联系人")
  const characterContacts = projectData.contacts.filter(c => c.type === 'message');
  const selectedChar = projectData.contacts.find(c => c.id === selectedCharId) || null;

  const handleSelectChar = (contact: Contact) => {
    setSelectedCharId(contact.id);
    setIsCreating(false);
    setEditName(contact.name);
    setEditStatus(contact.status || 'online');
    setEditAliases(contact.aliases ? [...contact.aliases] : []);
    setEditAliasInput('');
    setEditAvatarPreview(null);
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setSelectedCharId(null);
    setNewName('');
    setNewStatus('online');
    setNewAvatarPreview(null);
    setNewAliasInput('');
    setNewAliases([]);
  };

  // Upload avatar for new contact
  const handleNewAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewAvatarPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload avatar for editing custom contact
  const handleEditAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditAvatarPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewAlias = () => {
    const alias = newAliasInput.trim();
    if (!alias || newAliases.includes(alias)) return;
    setNewAliases([...newAliases, alias]);
    setNewAliasInput('');
  };

  const handleRemoveNewAlias = (idx: number) => {
    setNewAliases(newAliases.filter((_, i) => i !== idx));
  };

  const handleAddEditAlias = () => {
    const alias = editAliasInput.trim();
    if (!alias || editAliases.includes(alias)) return;
    setEditAliases([...editAliases, alias]);
    setEditAliasInput('');
  };

  const handleRemoveEditAlias = (idx: number) => {
    setEditAliases(editAliases.filter((_, i) => i !== idx));
  };

  const handleSaveNew = () => {
    if (!newAvatarPreview || !newName.trim()) return;
    const name = newName.trim();
    const id = 'contact_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const newContact: Contact = {
      id,
      name,
      avatar: newAvatarPreview, // data URL for custom avatar
      type: 'message',
      pinned: false,
      status: newStatus,
      isDefault: false,
      isCustomAvatar: true,
      aliases: newAliases.length > 0 ? [...newAliases] : undefined,
    };
    const newProjectData = { ...projectData };
    newProjectData.contacts = [...newProjectData.contacts, newContact];
    if (!newProjectData.chats[id]) newProjectData.chats[id] = [];
    setProjectData(newProjectData);
    setIsCreating(false);
    setSelectedCharId(id);
    setEditName(name);
    setEditStatus(newStatus);
    setEditAliases(newAliases.length > 0 ? [...newAliases] : []);
    setEditAliasInput('');
    setEditAvatarPreview(null);
  };

  const handleSaveEdit = () => {
    if (!selectedCharId) return;
    const newProjectData = { ...projectData };
    const contact = newProjectData.contacts.find(c => c.id === selectedCharId);
    if (!contact) return;
    // System default: name NOT editable; custom: name editable
    if (!contact.isDefault) {
      contact.name = editName.trim() || contact.name;
    }
    contact.status = editStatus;
    contact.aliases = editAliases.length > 0 ? [...editAliases] : undefined;
    // Custom avatar upload for non-default contacts
    if (!contact.isDefault && editAvatarPreview) {
      contact.avatar = editAvatarPreview;
      contact.isCustomAvatar = true;
    }
    setProjectData(newProjectData);
    setEditAvatarPreview(null);
  };

  const handleDeleteChar = () => {
    if (!selectedCharId) return;
    const contact = projectData.contacts.find(c => c.id === selectedCharId);
    if (contact?.isDefault) return;
    if (!window.confirm(`确定要删除角色「${contact?.name}」吗？相关对话记录也将一并删除。`)) return;
    const newProjectData = { ...projectData };
    newProjectData.contacts = newProjectData.contacts.filter(c => c.id !== selectedCharId);
    delete newProjectData.chats[selectedCharId];
    setProjectData(newProjectData);
    setSelectedCharId(null);
  };

  return (
    <>
      {/* 联系人总览 - Left panel */}
      <div className="character-overview">
        <div className="contacts-bg"></div>
        <div className="character-overview-content">
          <div className="character-overview-header">
            <h2>
              <span className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              角色总览
            </h2>
            <p className="character-count">{characterContacts.length} 位角色</p>
          </div>
          <div className="character-list">
            {characterContacts.map(contact => (
              <div
                key={contact.id}
                className={`character-item ${selectedCharId === contact.id && !isCreating ? 'active' : ''}`}
                onClick={() => handleSelectChar(contact)}
              >
                <div className="character-item-avatar">
                  <img src={contact.avatar} alt={contact.name} />
                  <div className={`status-dot ${contact.status || 'online'}`}></div>
                </div>
                <div className="character-item-info">
                  <div className="character-item-name">
                    {contact.name}
                    {contact.isDefault && <span className="default-badge">默认</span>}
                  </div>
                  {contact.aliases && contact.aliases.length > 0 && (
                    <div className="character-item-aliases">
                      {contact.aliases.map((alias, i) => (
                        <span key={i} className="alias-tag">{alias}</span>
                      ))}
                    </div>
                  )}
                  <div className="character-item-type">
                    {(projectData.chats[contact.id] || []).length} 条消息
                  </div>
                </div>
              </div>
            ))}
            {/* 新建联系人按钮 */}
            <div
              className={`character-item new-character ${isCreating ? 'active' : ''}`}
              onClick={handleStartCreate}
            >
              <div className="character-item-avatar new-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <div className="character-item-info">
                <div className="character-item-name">新建联系人</div>
                <div className="character-item-type">添加新的角色</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 联系人编辑 - Right panel */}
      <div className="character-editor">
        {!selectedCharId && !isCreating ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p>选择一个角色查看详情</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>或点击「新建联系人」创建新角色</p>
          </div>
        ) : isCreating ? (
          /* 新建联系人表单 */
          <div className="character-editor-form">
            <div className="character-editor-header">
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2" width="22" height="22">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                新建联系人
              </h3>
            </div>
            <div className="editor-form-body">
              <div className="modal-field">
                <label>角色名称 *</label>
                <input
                  type="text"
                  placeholder="输入角色名称..."
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
              </div>
              <div className="modal-field">
                <label>状态</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  <option value="online">在线</option>
                  <option value="away">离开</option>
                  <option value="offline">离线</option>
                </select>
              </div>
              {/* 上传头像 */}
              <div className="modal-field">
                <label>上传头像 *</label>
                <div className="avatar-upload-area" onClick={() => fileInputRef.current?.click()}>
                  {newAvatarPreview ? (
                    <img src={newAvatarPreview} alt="预览" className="avatar-upload-preview" />
                  ) : (
                    <div className="avatar-upload-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>点击上传头像图片</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleNewAvatarUpload}
                  />
                </div>
              </div>
              {/* 角色备注 */}
              <div className="modal-field">
                <label>角色备注（别名）</label>
                <div className="alias-input-row">
                  <input
                    type="text"
                    placeholder="输入备注后按回车添加..."
                    value={newAliasInput}
                    onChange={e => setNewAliasInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewAlias(); } }}
                  />
                  <button className="alias-add-btn" onClick={handleAddNewAlias} type="button">添加</button>
                </div>
                {newAliases.length > 0 && (
                  <div className="alias-tags">
                    {newAliases.map((alias, i) => (
                      <span key={i} className="alias-tag removable" onClick={() => handleRemoveNewAlias(i)}>
                        {alias} <span className="alias-remove">&times;</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="editor-actions">
                <button className="modal-btn cancel" onClick={() => setIsCreating(false)}>取消</button>
                <button
                  className="modal-btn confirm"
                  onClick={handleSaveNew}
                  disabled={!newAvatarPreview || !newName.trim()}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        ) : selectedChar ? (
          /* 编辑现有联系人 */
          <div className="character-editor-form">
            <div className="character-editor-header">
              <div className="editor-header-avatar">
                <img src={editAvatarPreview || selectedChar.avatar} alt={selectedChar.name} />
              </div>
              <div className="editor-header-info">
                <h3>{selectedChar.name}</h3>
                <p>
                  {selectedChar.isDefault ? '系统默认角色' : '用户创建角色'}
                </p>
              </div>
            </div>
            <div className="editor-form-body">
              {/* 角色名称：系统默认不可修改 */}
              <div className="modal-field">
                <label>角色名称 {selectedChar.isDefault && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>（默认角色不可修改）</span>}</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  disabled={selectedChar.isDefault}
                  style={selectedChar.isDefault ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                />
              </div>
              {/* 状态 */}
              <div className="modal-field">
                <label>状态</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                  <option value="online">在线</option>
                  <option value="away">离开</option>
                  <option value="offline">离线</option>
                </select>
              </div>
              {/* 头像：系统默认不可修改 */}
              {!selectedChar.isDefault && (
                <div className="modal-field">
                  <label>更换头像</label>
                  <div className="avatar-upload-area small" onClick={() => editFileInputRef.current?.click()}>
                    {editAvatarPreview ? (
                      <img src={editAvatarPreview} alt="预览" className="avatar-upload-preview" />
                    ) : (
                      <div className="avatar-upload-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span>点击上传新头像</span>
                      </div>
                    )}
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleEditAvatarUpload}
                    />
                  </div>
                </div>
              )}
              {/* 角色备注 */}
              <div className="modal-field">
                <label>角色备注（别名）</label>
                <div className="alias-input-row">
                  <input
                    type="text"
                    placeholder="输入备注后按回车添加..."
                    value={editAliasInput}
                    onChange={e => setEditAliasInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddEditAlias(); } }}
                  />
                  <button className="alias-add-btn" onClick={handleAddEditAlias} type="button">添加</button>
                </div>
                {editAliases.length > 0 && (
                  <div className="alias-tags">
                    {editAliases.map((alias, i) => (
                      <span key={i} className="alias-tag removable" onClick={() => handleRemoveEditAlias(i)}>
                        {alias} <span className="alias-remove">&times;</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="editor-actions">
                {!selectedChar.isDefault && (
                  <button className="modal-btn cancel danger-btn" onClick={handleDeleteChar}>
                    删除角色
                  </button>
                )}
                <div style={{ flex: 1 }}></div>
                <button className="modal-btn confirm" onClick={handleSaveEdit}>保存修改</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
