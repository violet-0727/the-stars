import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProjectData, Contact, Announcement, AppSettings, defaultSettings } from './types';
import Toolbar from './components/Toolbar';
import ContactsPanel from './components/ContactsPanel';
import ChatPanel from './components/ChatPanel';
import CharacterPanel from './components/CharacterPanel';
import PreviewPanel from './components/PreviewPanel';
import ScreenshotPanel from './components/ScreenshotPanel';
import SettingsPanel from './components/SettingsPanel';
import Modals from './components/Modals';

declare global {
  interface Window {
    electronAPI?: {
      saveProject: (data: ProjectData) => Promise<string | null>;
      loadProject: () => Promise<{ path: string, data: ProjectData } | null>;
      windowMinimize: () => Promise<void>;
      windowMaximize: () => Promise<void>;
      windowClose: () => Promise<void>;
      onBeforeClose?: (callback: () => void) => void;
      confirmClose?: (shouldClose: boolean) => void;
      selectDirectory?: () => Promise<string | null>;
      saveScreenshot?: (dirPath: string, fileName: string, content: string) => Promise<string>;
    }
  }
}

const initialData: ProjectData = {
  contacts: [],
  chats: {}
};

// Hardcoded announcements - read-only, published by software authors
const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'announce_1',
    title: '欢迎使用',
    content: `欢迎大家使用 Heart Link！
本软件为《星塔旅人》聊天系统主题二创工具，仅用于同人创作与兴趣交流。

📜 使用公约

1. 文明交流，友善互动，尊重游戏原作与角色。
2. 禁止引战、人身攻击、恶意玩梗及违规内容。
3. 尊重原创，禁止抄袭、盗用他人二创成果。
4. 内容遵守平台规范，共同维护良好创作氛围。
5. 本软件为同人二创，非官方应用，仅供兴趣使用。

愿以心意相连，共创属于我们的星塔故事。`,
    avatar: '/avatars/琥珀.png',
    avatarName: '琥珀',
    pinned: true,
  },
  {
    id: 'announce_2',
    title: '联系我们',
    content: `- 邮箱：1343807478@qq.com / 2799902706@qq.com
- Bilibili：https://space.bilibili.com/699093611?spm_id_from=333.1007.0.0

愿以心意相连，共创属于我们的星塔故事。`,
    avatar: '/avatars/鸢尾.png',
    avatarName: '鸢尾',
    pinned: false,
  },
];

export default function App() {
  const [projectData, setProjectData] = useState<ProjectData>(initialData);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'messages' | 'groups' | 'channels'>('groups');
  const [activeTool, setActiveTool] = useState<string>('chat');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Modal states
  const [addContactModal, setAddContactModal] = useState(false);
  const [choiceModal, setChoiceModal] = useState(false);
  
  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{show: boolean, x: number, y: number, target: any} | null>(null);

  // Edit/Delete modal triggers (passed to ChatPanel via callback)
  const [editModalTrigger, setEditModalTrigger] = useState<{ idx: number; content: string } | null>(null);
  const [deleteModalTrigger, setDeleteModalTrigger] = useState<{ idx: number } | null>(null);

  // Toast state for export and save feedback
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const projectDataRef = useRef(projectData);

  // Panel transition state
  const [panelTransition, setPanelTransition] = useState<'chat' | 'characters' | 'preview' | 'screenshot' | 'settings'>('chat');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Save close confirmation modal
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Keep ref up to date
  useEffect(() => {
    projectDataRef.current = projectData;
  }, [projectData]);

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [projectData]);

  useEffect(() => {
    // Load initial sample data
    let contactIdCounter = 0;
    const addContact = (name: string, avatarName: string, options: any = {}) => {
      const id = 'contact_' + (++contactIdCounter);
      const c: Contact = {
        id, name,
        avatar: '/avatars/' + avatarName + '.png',
        avatarName,
        type: options.type || 'message',
        pinned: Boolean(options.pinned),
        status: 'online',
        isDefault: true,
      };
      if (options.members) c.members = options.members;
      return c;
    };

    const c1 = addContact('苍兰', '苍兰', { type: 'message', pinned: true });
    const c2 = addContact('希娅', '希娅', { type: 'message' });
    const c3 = addContact('璟麟', '璟麟', { type: 'message' });
    const c4 = addContact('星塔作战组', '卡西米拉', { type: 'group' });
    const c5 = addContact('公告频道', '琥珀', { type: 'channel', pinned: true });

    // 为消息组设置初始成员
    c4.members = [c1.id, c2.id, c3.id];

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
    setHasUnsavedChanges(false);
  }, []);

  // ===== Save functionality =====
  const saveProject = useCallback(() => {
    if (window.electronAPI) {
      window.electronAPI.saveProject(projectDataRef.current).then((result: string | null) => {
        if (result) {
          setHasUnsavedChanges(false);
          showToast('项目已保存');
        }
      });
    } else {
      const data = JSON.stringify(projectDataRef.current, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'heart_link.ssp';
      a.click();
      URL.revokeObjectURL(url);
      setHasUnsavedChanges(false);
      showToast('项目已保存');
    }
  }, []);

  // ===== Auto-save every 3 minutes =====
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (projectDataRef.current.contacts.length > 0) {
        // Auto-save to localStorage as backup
        try {
          localStorage.setItem('heartLink_autosave', JSON.stringify(projectDataRef.current));
          localStorage.setItem('heartLink_autosave_time', new Date().toISOString());
          console.log('[AutoSave] 自动保存完成', new Date().toLocaleTimeString());
        } catch (e) {
          console.error('[AutoSave] 保存失败:', e);
        }
      }
    }, 3 * 60 * 1000); // 3 minutes

    return () => clearInterval(autoSaveInterval);
  }, []);

  // ===== Exit save check =====
  useEffect(() => {
    // Browser beforeunload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '你有未保存的更改，确定要离开吗？';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Electron close check
    if (window.electronAPI?.onBeforeClose) {
      window.electronAPI.onBeforeClose(() => {
        if (hasUnsavedChanges) {
          setShowCloseConfirm(true);
        } else {
          window.electronAPI?.confirmClose?.(true);
        }
      });
    }

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // ===== Keyboard shortcuts =====
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveProject();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saveProject]);

  // ===== Hide context menu on click =====
  useEffect(() => {
    const hideMenu = () => setContextMenu(null);
    document.addEventListener('click', hideMenu);
    return () => document.removeEventListener('click', hideMenu);
  }, []);

  // ===== Toast utility =====
  const showToast = (message: string, duration: number = 1000) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), duration);
  };

  // ===== Tool switching with animations =====
  const handleSwitchTool = (tool: string) => {
    // Export: show toast only
    if (tool === 'export') {
      showToast('暂未制作，敬请等待', 1000);
      return;
    }

    // Save: trigger save
    if (tool === 'save') {
      saveProject();
      return;
    }

    // Determine panel type from tool
    let targetPanel: 'chat' | 'characters' | 'preview' | 'screenshot' | 'settings';
    if (tool === 'characters') targetPanel = 'characters';
    else if (tool === 'preview') targetPanel = 'preview';
    else if (tool === 'screenshot') targetPanel = 'screenshot';
    else if (tool === 'settings') targetPanel = 'settings';
    else targetPanel = 'chat';

    if (targetPanel === panelTransition) return; // already on this panel

    // Animate transition
    setIsTransitioning(true);
    setActiveTool(tool);
    setTimeout(() => {
      setPanelTransition(targetPanel);
      setIsTransitioning(false);
    }, 250); // half of transition duration
  };

  const windowAction = (action: 'minimize' | 'maximize' | 'close') => {
    if (window.electronAPI) {
      if (action === 'minimize') window.electronAPI.windowMinimize();
      else if (action === 'maximize') window.electronAPI.windowMaximize();
      else if (action === 'close') {
        if (hasUnsavedChanges) {
          setShowCloseConfirm(true);
        } else {
          window.electronAPI.windowClose();
        }
      }
    }
  };

  // ===== Apply settings to document =====
  useEffect(() => {
    const root = document.documentElement;
    const fontStack = `'${settings.fontFamily}', 'Microsoft YaHei', 'PingFang SC', sans-serif`;

    // Font
    root.style.setProperty('--app-font-family', fontStack);
    root.style.setProperty('--app-font-size', `${settings.fontSize}px`);
    document.body.style.fontFamily = fontStack;
    document.body.style.fontSize = `${settings.fontSize}px`;

    // Apply font-size to all key elements via CSS variable
    root.style.fontSize = `${settings.fontSize}px`;

    // Contrast
    document.body.style.filter = `contrast(${settings.contrast})`;
  }, [settings.fontFamily, settings.fontSize, settings.contrast]);

  // ===== Apply light/dark theme =====
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark');
    } else {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
    }
  }, [settings.theme]);

  // ===== Render panels based on active tool =====
  const renderPanels = () => {
    const transitionClass = isTransitioning ? 'panel-exit' : 'panel-enter';

    switch (panelTransition) {
      case 'characters':
        return (
          <div className={`panel-container ${transitionClass}`}>
            <CharacterPanel
              projectData={projectData}
              setProjectData={setProjectData}
            />
          </div>
        );
      case 'preview':
        return (
          <div className={`panel-container ${transitionClass}`}>
            <PreviewPanel
              projectData={projectData}
              activeContactId={activeContactId}
              settings={settings}
            />
          </div>
        );
      case 'screenshot':
        return (
          <div className={`panel-container ${transitionClass}`}>
            <ScreenshotPanel
              projectData={projectData}
              activeContactId={activeContactId}
              downloadPath={settings.downloadPath}
            />
          </div>
        );
      case 'settings':
        return (
          <div className={`panel-container ${transitionClass}`}>
            <SettingsPanel
              settings={settings}
              setSettings={setSettings}
            />
          </div>
        );
      case 'chat':
      default:
        return (
          <div className={`panel-container ${transitionClass}`}>
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
              setChoiceModal={setChoiceModal}
              setContextMenu={setContextMenu}
              setActiveContactId={setActiveContactId}
              editModalTrigger={editModalTrigger}
              setEditModalTrigger={setEditModalTrigger}
              deleteModalTrigger={deleteModalTrigger}
              setDeleteModalTrigger={setDeleteModalTrigger}
              showTimestamp={settings.showTimestamp}
              announcements={ANNOUNCEMENTS}
            />
          </div>
        );
    }
  };

  return (
    <>
      <div
        className="app-background"
        style={settings.backgroundImage !== defaultSettings.backgroundImage
          ? { backgroundImage: `url('${settings.backgroundImage}')` }
          : undefined
        }
      ></div>
      <div className="titlebar">
        <div className="titlebar-title">
          <span>&#9734;</span> 心链 Heart Link
          {hasUnsavedChanges && <span className="unsaved-dot" title="有未保存的更改">●</span>}
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
          switchTool={handleSwitchTool} 
          saveProject={saveProject} 
        />
        {renderPanels()}
      </div>

      <Modals 
        projectData={projectData}
        setProjectData={setProjectData}
        addContactModal={addContactModal}
        setAddContactModal={setAddContactModal}
        choiceModal={choiceModal}
        setChoiceModal={setChoiceModal}
        activeContactId={activeContactId}
        setActiveContactId={setActiveContactId}
        setCurrentTab={setCurrentTab}
        currentTab={currentTab}
      />

      {/* Context Menu */}
      {contextMenu && contextMenu.show && (
        <div className="context-menu show" style={{ left: contextMenu.x, top: contextMenu.y }}>
          {contextMenu.target.type === 'message' ? (
            <>
              <button className="ctx-item" onClick={() => {
                const msg = projectData.chats[activeContactId!][contextMenu.target.idx];
                setEditModalTrigger({ idx: contextMenu.target.idx, content: msg.content || '' });
                setContextMenu(null);
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                编辑消息
              </button>
              <div className="ctx-divider"></div>
              <button className="ctx-item danger" onClick={() => {
                setDeleteModalTrigger({ idx: contextMenu.target.idx });
                setContextMenu(null);
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                删除消息
              </button>
            </>
          ) : (() => {
            const ctxContact = projectData.contacts.find((c: any) => c.id === contextMenu.target.id);
            const isGroupCtx = ctxContact?.type === 'group';
            const isChannelCtx = ctxContact?.type === 'channel';

            // Channel contacts are read-only, no context menu actions
            if (isChannelCtx) {
              return (
                <div className="ctx-item" style={{ color: 'var(--text-muted)', cursor: 'default', pointerEvents: 'none', fontSize: '12px' }}>
                  公告频道不可编辑
                </div>
              );
            }

            return (
              <>
                <button className="ctx-item" onClick={() => {
                  const newProjectData = { ...projectData };
                  const c = newProjectData.contacts.find((c: any) => c.id === contextMenu.target.id);
                  if (c) { c.pinned = !c.pinned; setProjectData(newProjectData); }
                  setContextMenu(null);
                }}>
                  {ctxContact?.pinned ? '取消置顶' : '置顶'}
                </button>
                {isGroupCtx ? (
                  <button className="ctx-item" onClick={() => {
                    // Open group settings modal (which includes name editing + member management)
                    setActiveContactId(contextMenu.target.id);
                    setContextMenu(null);
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('openGroupSettings', { detail: { groupId: contextMenu.target.id } }));
                    }, 100);
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    编辑消息组
                  </button>
                ) : (
                  <button className="ctx-item" onClick={() => {
                    const c = projectData.contacts.find((c: any) => c.id === contextMenu.target.id);
                    if (!c) return;
                    const newName = prompt('编辑角色名称:', c.name);
                    if (newName !== null && newName.trim()) {
                      const newProjectData = { ...projectData };
                      const target = newProjectData.contacts.find((cc: any) => cc.id === contextMenu.target.id);
                      if (target) target.name = newName.trim();
                      setProjectData(newProjectData);
                    }
                    setContextMenu(null);
                  }}>编辑角色</button>
                )}
                <div className="ctx-divider"></div>
                <button className="ctx-item danger" onClick={() => {
                  if (!window.confirm(isGroupCtx ? '确定要删除这个消息组吗？所有聊天记录将被清除。' : '确定要删除这个角色对话吗？所有聊天记录将被清除。')) return;
                  const newProjectData = { ...projectData };
                  newProjectData.contacts = newProjectData.contacts.filter((c: any) => c.id !== contextMenu.target.id);
                  delete newProjectData.chats[contextMenu.target.id];
                  if (activeContactId === contextMenu.target.id) setActiveContactId(null);
                  setProjectData(newProjectData);
                  setContextMenu(null);
                }}>{isGroupCtx ? '删除消息组' : '删除对话'}</button>
              </>
            );
          })()}
        </div>
      )}

      {/* Toast notification */}
      <div className={`toast-notification ${toast.show ? 'show' : ''}`}>
        {toast.message}
      </div>

      {/* Close confirmation modal */}
      {showCloseConfirm && (
        <div className="modal-overlay show" onClick={(e) => e.target === e.currentTarget && setShowCloseConfirm(false)}>
          <div className="modal">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2" width="22" height="22">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              未保存的更改
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
              你有未保存的更改。是否在退出前保存？
            </p>
            <div className="modal-actions" style={{ gap: '8px' }}>
              <button className="modal-btn cancel" onClick={() => {
                setShowCloseConfirm(false);
                setHasUnsavedChanges(false);
                if (window.electronAPI) {
                  window.electronAPI.windowClose();
                }
              }}>不保存</button>
              <button className="modal-btn cancel" onClick={() => setShowCloseConfirm(false)}>取消</button>
              <button className="modal-btn confirm" onClick={() => {
                saveProject();
                setShowCloseConfirm(false);
                setTimeout(() => {
                  if (window.electronAPI) {
                    window.electronAPI.windowClose();
                  }
                }, 500);
              }}>保存并退出</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
