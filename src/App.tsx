import React, { useState, useEffect } from 'react';
import { ProjectData, Contact } from './types';
import Toolbar from './components/Toolbar';
import ContactsPanel from './components/ContactsPanel';
import ChatPanel from './components/ChatPanel';
import Modals from './components/Modals';

declare global {
  interface Window {
    electronAPI?: {
      saveProject: (data: ProjectData) => Promise<string | null>;
      loadProject: () => Promise<{ path: string, data: ProjectData } | null>;
      windowMinimize: () => Promise<void>;
      windowMaximize: () => Promise<void>;
      windowClose: () => Promise<void>;
    }
  }
}

const AVATARS_PATH = '/avatars/';

const initialData: ProjectData = {
  contacts: [],
  chats: {}
};

export default function App() {
  const [projectData, setProjectData] = useState<ProjectData>(initialData);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'messages' | 'groups' | 'channels'>('messages');
  const [activeTool, setActiveTool] = useState<string>('chat');

  // Modal states
  const [addContactModal, setAddContactModal] = useState(false);
  const [systemMsgModal, setSystemMsgModal] = useState(false);
  const [choiceModal, setChoiceModal] = useState(false);
  
  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{show: boolean, x: number, y: number, target: any} | null>(null);

  useEffect(() => {
    // Load initial sample data
    let contactIdCounter = 0;
    const addContact = (name: string, avatarName: string, options: any = {}) => {
      const id = 'contact_' + (++contactIdCounter);
      return {
        id, name,
        avatar: '/avatars/' + avatarName + '.png',
        avatarName,
        type: options.type || 'message',
        pinned: Boolean(options.pinned),
        status: 'online'
      } as Contact;
    };

    const c1 = addContact('苍兰', '苍兰', { type: 'message', pinned: true });
    const c2 = addContact('希娅', '希娅', { type: 'message' });
    const c3 = addContact('璟麟', '璟麟', { type: 'message' });
    const c4 = addContact('星塔作战组', '卡西米拉', { type: 'group' });
    const c5 = addContact('公告频道', '密涅瓦', { type: 'channel' });

    setProjectData({
      contacts: [c1, c2, c3, c4, c5],
      chats: {
        [c1.id]: [
          { type: 'system', content: '剧情开始 - 第一章：相遇' },
          { type: 'message', sender: c1.id, senderName: c1.name, content: '你好，旅行者。欢迎来到星塔。', time: '10:30', avatar: c1.avatar },
          { type: 'message', sender: 'self', content: '你好，请问这里是...？', time: '10:31' },
          { type: 'message', sender: c1.id, senderName: c1.name, content: '这里是星塔的中心大厅，所有旅人都会经过这里。', time: '10:31', avatar: c1.avatar },
          { type: 'message', sender: c1.id, senderName: c1.name, content: '你看起来不像是本地人呢，从远处来的吗？', time: '10:32', avatar: c1.avatar },
          { type: 'choice', title: '选择回答方式', options: ['坦诚相告', '含糊其辞', '反问对方'] },
        ],
        [c2.id]: [],
        [c3.id]: [],
        [c4.id]: [],
        [c5.id]: []
      }
    });
  }, []);

  const windowAction = (action: 'minimize' | 'maximize' | 'close') => {
    if (window.electronAPI) {
      if (action === 'minimize') window.electronAPI.windowMinimize();
      else if (action === 'maximize') window.electronAPI.windowMaximize();
      else if (action === 'close') window.electronAPI.windowClose();
    }
  };

  const saveProject = () => {
    if (window.electronAPI) {
      window.electronAPI.saveProject(projectData);
    } else {
      const data = JSON.stringify(projectData, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'story_project.ssp';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveProject();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [projectData]);

  useEffect(() => {
    const hideMenu = () => setContextMenu(null);
    document.addEventListener('click', hideMenu);
    return () => document.removeEventListener('click', hideMenu);
  }, []);

  return (
    <>
      <div className="app-background"></div>
      <div className="titlebar">
        <div className="titlebar-title">
          <span>&#9734;</span> 星途剧情编辑器
        </div>
        <div className="titlebar-controls">
          <button className="titlebar-btn" onClick={() => windowAction('minimize')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button className="titlebar-btn" onClick={() => windowAction('maximize')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>
          </button>
          <button className="titlebar-btn close" onClick={() => windowAction('close')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div className="app-container">
        <Toolbar 
          activeTool={activeTool} 
          switchTool={setActiveTool} 
          saveProject={saveProject} 
        />
        <ContactsPanel 
          projectData={projectData} 
          activeContactId={activeContactId}
          selectContact={setActiveContactId}
          currentTab={currentTab}
          switchTab={setCurrentTab}
          showAddContactModal={() => setAddContactModal(true)}
          setContextMenu={setContextMenu}
        />
        <ChatPanel 
          projectData={projectData}
          setProjectData={setProjectData}
          activeContactId={activeContactId}
          setSystemMsgModal={setSystemMsgModal}
          setChoiceModal={setChoiceModal}
          setContextMenu={setContextMenu}
          setActiveContactId={setActiveContactId}
        />
      </div>

      <Modals 
        projectData={projectData}
        setProjectData={setProjectData}
        addContactModal={addContactModal}
        setAddContactModal={setAddContactModal}
        systemMsgModal={systemMsgModal}
        setSystemMsgModal={setSystemMsgModal}
        choiceModal={choiceModal}
        setChoiceModal={setChoiceModal}
        activeContactId={activeContactId}
        setActiveContactId={setActiveContactId}
        setCurrentTab={setCurrentTab}
      />

      {contextMenu && contextMenu.show && (
        <div className="context-menu show" style={{ left: contextMenu.x, top: contextMenu.y }}>
          {contextMenu.target.type === 'message' ? (
            <>
              <button className="ctx-item" onClick={() => {
                const msg = projectData.chats[activeContactId!][contextMenu.target.idx];
                const newContent = prompt('编辑消息内容:', msg.content);
                if (newContent !== null) {
                  const newProjectData = { ...projectData };
                  newProjectData.chats[activeContactId!][contextMenu.target.idx].content = newContent;
                  setProjectData(newProjectData);
                }
              }}>编辑消息</button>
              <div className="ctx-divider"></div>
              <button className="ctx-item danger" onClick={() => {
                const newProjectData = { ...projectData };
                newProjectData.chats[activeContactId!].splice(contextMenu.target.idx, 1);
                setProjectData(newProjectData);
              }}>删除消息</button>
            </>
          ) : (
            <>
              <button className="ctx-item" onClick={() => {
                const newProjectData = { ...projectData };
                const contact = newProjectData.contacts.find((c: any) => c.id === contextMenu.target.id);
                if (contact) {
                  contact.pinned = !contact.pinned;
                  setProjectData(newProjectData);
                }
              }}>
                {projectData.contacts.find((c: any) => c.id === contextMenu.target.id)?.pinned ? '取消置顶' : '置顶'}
              </button>
              <button className="ctx-item" onClick={() => {
                const newProjectData = { ...projectData };
                const contact = newProjectData.contacts.find((c: any) => c.id === contextMenu.target.id);
                if (!contact) return;
                const newName = prompt('编辑角色名称:', contact.name);
                if (newName !== null && newName.trim()) {
                  contact.name = newName.trim();
                  setProjectData(newProjectData);
                }
              }}>编辑角色</button>
              <div className="ctx-divider"></div>
              <button className="ctx-item danger" onClick={() => {
                if (!window.confirm('确定要删除这个角色对话吗？所有聊天记录将被清除。')) return;
                const newProjectData = { ...projectData };
                newProjectData.contacts = newProjectData.contacts.filter((c: any) => c.id !== contextMenu.target.id);
                delete newProjectData.chats[contextMenu.target.id];
                if (activeContactId === contextMenu.target.id) setActiveContactId(null);
                setProjectData(newProjectData);
              }}>删除对话</button>
            </>
          )}
        </div>
      )}
    </>
  );
}
