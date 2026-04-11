import React, { useState } from 'react';

const AVATARS_PATH = '/avatars/';
const AVAILABLE_AVATARS = [
  '苍兰', '尘沙', '赤霞', '冬香', '多娜', '翡冷翠', '风影', '格芮',
  '琥珀', '花原', '焦糖', '璟麟', '卡娜丝', '卡西米拉', '珂赛特',
  '科洛妮丝', '菈露', '岭川', '密涅瓦', '千都世', '师渺', '特丽莎',
  '缇莉娅', '雾语', '希娅', '夏花', '小禾', '杏子', '鸢尾', '紫槿',
  '埃利诺', '奥尔贝德', '贝缇丽', '贝修丽娜', '波西亚', '达尔茜娅',
  '枫', '红宝石', '花玲', '火垂', '蓝宝石', '蓝锥', '米娜', '珀尔娜',
  '青叶', '维嘉尔', '星雁', '优叶'
];

export default function Modals({ projectData, setProjectData, addContactModal, setAddContactModal, choiceModal, setChoiceModal, activeContactId, setActiveContactId, setCurrentTab, currentTab }: any) {
  
  // Add Contact State
  const [contactName, setContactName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  // Choice Msg State
  const [choiceTitle, setChoiceTitle] = useState('');
  const [choiceOptions, setChoiceOptions] = useState<string[]>(['', '']);

  let contactIdCounter = projectData.contacts.length;

  const handleAddContact = () => {
    if (!selectedAvatar) return;
    const name = contactName.trim() || selectedAvatar;
    const isGroupMode = currentTab === 'groups';

    if (isGroupMode) {
      // Create a new group
      const groupId = 'contact_' + (++contactIdCounter);
      const newGroup = {
        id: groupId,
        name: name,
        avatar: AVATARS_PATH + selectedAvatar + '.png',
        avatarName: selectedAvatar,
        type: 'group',
        pinned: false,
        status: 'online',
        members: [] as string[],
      };

      const newProjectData = { ...projectData };
      newProjectData.contacts.push(newGroup);
      if (!newProjectData.chats[groupId]) newProjectData.chats[groupId] = [];

      setProjectData(newProjectData);
      setAddContactModal(false);
      setActiveContactId(groupId);
      setCurrentTab('groups');
    } else {
      // Create a regular message contact
      const id = 'contact_' + (++contactIdCounter);
      const newContact = {
        id, name,
        avatar: AVATARS_PATH + selectedAvatar + '.png',
        avatarName: selectedAvatar,
        type: 'message',
        pinned: false,
        status: 'online'
      };

      const newProjectData = { ...projectData };
      newProjectData.contacts.push(newContact);
      if (!newProjectData.chats[id]) newProjectData.chats[id] = [];

      setProjectData(newProjectData);
      setAddContactModal(false);
      setActiveContactId(id);
      setCurrentTab('messages');
    }
    setContactName('');
    setSelectedAvatar(null);
  };

  const handleAddChoice = () => {
    const validOptions = choiceOptions.filter(o => o.trim());
    if (validOptions.length < 2 || !activeContactId) return;
    const newProjectData = { ...projectData };
    newProjectData.chats[activeContactId].push({ type: 'choice', title: choiceTitle.trim() || '请选择', options: validOptions });
    setProjectData(newProjectData);
    setChoiceModal(false);
    setChoiceTitle('');
    setChoiceOptions(['', '']);
  };

  return (
    <>
      <div className={`modal-overlay ${addContactModal ? 'show' : ''}`} onClick={(e) => e.target === e.currentTarget && setAddContactModal(false)}>
        <div className="modal">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2" width="22" height="22"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            {currentTab === 'groups' ? '添加消息组' : '添加角色对话'}
          </h3>
          <div className="modal-field">
            <label>{currentTab === 'groups' ? '消息组名称' : '角色名称'}</label>
            <input type="text" placeholder={currentTab === 'groups' ? '输入消息组名称...' : '输入角色名称...'} value={contactName} onChange={e => setContactName(e.target.value)} />
          </div>
          <div className="modal-field">
            <label>{currentTab === 'groups' ? '选择消息组头像' : '选择头像'}</label>
            <div className="modal-avatar-pick">
              {AVAILABLE_AVATARS.map(name => (
                <div key={name} className={`avatar-option ${selectedAvatar === name ? 'selected' : ''}`} onClick={() => setSelectedAvatar(name)}>
                  <img src={`${AVATARS_PATH}${name}.png`} alt={name} />
                </div>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button className="modal-btn cancel" onClick={() => setAddContactModal(false)}>取消</button>
            <button className="modal-btn confirm" onClick={handleAddContact}>确认添加</button>
          </div>
        </div>
      </div>

      <div className={`modal-overlay ${choiceModal ? 'show' : ''}`} onClick={(e) => e.target === e.currentTarget && setChoiceModal(false)}>
        <div className="modal">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2" width="22" height="22"><polyline points="9 18 15 12 9 6"/></svg>
            添加选项分支
          </h3>
          <div className="modal-field">
            <label>提示文本（可选）</label>
            <input type="text" placeholder="例如：你想怎么回答？" value={choiceTitle} onChange={e => setChoiceTitle(e.target.value)} />
          </div>
          <div>
            {choiceOptions.map((opt, i) => (
              <div key={i} className="modal-field">
                <label>选项 {i + 1}</label>
                <input type="text" className="choice-input" placeholder="输入选项文本..." value={opt} onChange={e => {
                  const newOpts = [...choiceOptions];
                  newOpts[i] = e.target.value;
                  setChoiceOptions(newOpts);
                }} />
              </div>
            ))}
          </div>
          <button className="modal-btn cancel" style={{marginBottom:'16px', width:'100%', textAlign:'center', justifyContent:'center', display:'flex'}} onClick={() => setChoiceOptions([...choiceOptions, ''])}>+ 添加选项</button>
          <div className="modal-actions">
            <button className="modal-btn cancel" onClick={() => setChoiceModal(false)}>取消</button>
            <button className="modal-btn confirm" onClick={handleAddChoice}>插入</button>
          </div>
        </div>
      </div>
    </>
  );
}
