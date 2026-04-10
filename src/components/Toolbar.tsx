import React from 'react';

interface ToolbarProps {
  activeTool: string;
  switchTool: (tool: string) => void;
  saveProject: () => void;
}

export default function Toolbar({ activeTool, switchTool, saveProject }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-logo" title="星途">
        <svg viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
      </div>
      <div className="toolbar-divider"></div>

      {/* 对话编辑 */}
      <button className={`toolbar-btn ${activeTool === 'chat' ? 'active' : ''}`} onClick={() => switchTool('chat')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span className="tooltip">对话编辑</span>
      </button>

      {/* 角色管理 */}
      <button className={`toolbar-btn ${activeTool === 'characters' ? 'active' : ''}`} onClick={() => switchTool('characters')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span className="tooltip">角色管理</span>
      </button>

      {/* 预览播放 */}
      <button className={`toolbar-btn ${activeTool === 'preview' ? 'active' : ''}`} onClick={() => switchTool('preview')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span className="tooltip">预览播放</span>
      </button>

      {/* 聊天截取 */}
      <button className={`toolbar-btn ${activeTool === 'screenshot' ? 'active' : ''}`} onClick={() => switchTool('screenshot')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <polyline points="8 12 11 15 16 9"/>
        </svg>
        <span className="tooltip">聊天截取</span>
      </button>

      <div className="toolbar-divider"></div>

      {/* 导出项目 */}
      <button className={`toolbar-btn ${activeTool === 'export' ? 'active' : ''}`} onClick={() => switchTool('export')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span className="tooltip">导出项目</span>
      </button>

      <div className="toolbar-spacer"></div>

      {/* 保存 */}
      <button className="toolbar-btn" onClick={saveProject}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        <span className="tooltip">保存</span>
      </button>

      {/* 设置 */}
      <button className={`toolbar-btn ${activeTool === 'settings' ? 'active' : ''}`} onClick={() => switchTool('settings')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        <span className="tooltip">设置</span>
      </button>
    </div>
  );
}
