import React from 'react';
import { AppSettings } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
}

const FONT_OPTIONS = [
  { value: 'MiSans', label: 'MiSans (默认)' },
  { value: 'Microsoft YaHei', label: '微软雅黑' },
  { value: 'PingFang SC', label: '苹方' },
  { value: 'SimHei', label: '黑体' },
  { value: 'SimSun', label: '宋体' },
  { value: 'KaiTi', label: '楷体' },
];

export default function SettingsPanel({ settings, setSettings }: SettingsPanelProps) {
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSelectDirectory = async () => {
    if (window.electronAPI?.selectDirectory) {
      const dir = await window.electronAPI.selectDirectory();
      if (dir) {
        updateSetting('downloadPath', dir);
      }
    } else {
      // Browser fallback: let user type the path
      const path = prompt('输入下载路径:', settings.downloadPath || '');
      if (path !== null) {
        updateSetting('downloadPath', path);
      }
    }
  };

  return (
    <div className="settings-panel">
      <div className="settings-content">
        <div className="settings-header">
          <h2>
            <span className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </span>
            系统设置
          </h2>
        </div>

        <div className="settings-body">
          {/* ===== 外观 ===== */}
          <div className="settings-group">
            <div className="settings-group-title">外观</div>

            <div className="settings-item">
              <div className="settings-item-label">
                <span className="settings-item-name">背景图片</span>
                <span className="settings-item-desc">设置软件背景图片路径</span>
              </div>
              <div className="settings-item-control">
                <input
                  type="text"
                  className="settings-input"
                  value={settings.backgroundImage}
                  onChange={e => updateSetting('backgroundImage', e.target.value)}
                  placeholder="/background/LandMark_001.png"
                />
              </div>
            </div>

            {/* 明暗模式 */}
            <div className="settings-item">
              <div className="settings-item-label">
                <span className="settings-item-name">明暗模式</span>
                <span className="settings-item-desc">切换软件的明暗主题</span>
              </div>
              <div className="settings-item-control">
                <div className="settings-toggle-group">
                  <button
                    className={`settings-toggle-btn ${settings.theme === 'dark' ? 'active' : ''}`}
                    onClick={() => updateSetting('theme', 'dark')}
                  >
                    暗色
                  </button>
                  <button
                    className={`settings-toggle-btn ${settings.theme === 'light' ? 'active' : ''}`}
                    onClick={() => updateSetting('theme', 'light')}
                  >
                    亮色
                  </button>
                </div>
              </div>
            </div>

            {/* 对比度 */}
            <div className="settings-item">
              <div className="settings-item-label">
                <span className="settings-item-name">对比度</span>
                <span className="settings-item-desc">调整界面对比度 ({settings.contrast.toFixed(1)})</span>
              </div>
              <div className="settings-item-control">
                <input
                  type="range"
                  className="settings-slider"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.contrast}
                  onChange={e => updateSetting('contrast', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* ===== 消息 ===== */}
          <div className="settings-group">
            <div className="settings-group-title">聊天</div>

            {/* 时间显示 */}
            <div className="settings-item">
              <div className="settings-item-label">
                <span className="settings-item-name">时间显示</span>
                <span className="settings-item-desc">是否在聊天消息下方显示发送时间</span>
              </div>
              <div className="settings-item-control">
                <div className="settings-toggle-group">
                  <button
                    className={`settings-toggle-btn ${settings.showTimestamp ? 'active' : ''}`}
                    onClick={() => updateSetting('showTimestamp', true)}
                  >
                    显示
                  </button>
                  <button
                    className={`settings-toggle-btn ${!settings.showTimestamp ? 'active' : ''}`}
                    onClick={() => updateSetting('showTimestamp', false)}
                  >
                    隐藏
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ===== 播放 ===== */}
          <div className="settings-group">
            <div className="settings-group-title">播放</div>

            <div className="settings-item">
              <div className="settings-item-label">
                <span className="settings-item-name">预览播放间隔</span>
                <span className="settings-item-desc">每条消息之间的播放间隔时间</span>
              </div>
              <div className="settings-item-control">
                <select
                  className="settings-select"
                  value={settings.previewInterval}
                  onChange={e => updateSetting('previewInterval', parseInt(e.target.value))}
                >
                  <option value={500}>0.5 秒</option>
                  <option value={1000}>1.0 秒</option>
                  <option value={1500}>1.5 秒</option>
                  <option value={2000}>2.0 秒</option>
                  <option value={2500}>2.5 秒</option>
                  <option value={3000}>3.0 秒</option>
                </select>
              </div>
            </div>
          </div>

          {/* ===== 字体 ===== */}
          <div className="settings-group">
            <div className="settings-group-title">字体</div>

            <div className="settings-item">
              <div className="settings-item-label">
                <span className="settings-item-name">软件字体</span>
                <span className="settings-item-desc">更改软件全局字体</span>
              </div>
              <div className="settings-item-control">
                <select
                  className="settings-select"
                  value={settings.fontFamily}
                  onChange={e => updateSetting('fontFamily', e.target.value)}
                >
                  {FONT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <span className="settings-item-name">软件字号</span>
                <span className="settings-item-desc">调整全局字体大小 ({settings.fontSize}px)</span>
              </div>
              <div className="settings-item-control">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>10</span>
                  <input
                    type="range"
                    className="settings-slider"
                    min="10"
                    max="24"
                    step="1"
                    value={settings.fontSize}
                    onChange={e => updateSetting('fontSize', parseInt(e.target.value))}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>24</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== 存储 ===== */}
          <div className="settings-group">
            <div className="settings-group-title">存储</div>

            <div className="settings-item">
              <div className="settings-item-label">
                <span className="settings-item-name">下载路径</span>
                <span className="settings-item-desc">
                  {settings.downloadPath
                    ? `当前路径: ${settings.downloadPath}`
                    : '聊天截取的保存位置（默认为浏览器下载目录）'
                  }
                </span>
              </div>
              <div className="settings-item-control" style={{ display: 'flex', gap: '6px' }}>
                <button className="screenshot-ctrl-btn" onClick={handleSelectDirectory}>
                  选择目录
                </button>
                {settings.downloadPath && (
                  <button
                    className="screenshot-ctrl-btn"
                    onClick={() => updateSetting('downloadPath', '')}
                    title="恢复默认路径"
                  >
                    重置
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
