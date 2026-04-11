export interface Contact {
  id: string;
  name: string;
  avatar: string;
  avatarName?: string;
  type: 'message' | 'group' | 'channel';
  pinned: boolean;
  status?: string;
  isDefault?: boolean;       // 系统默认联系人标记，默认联系人不可删除，名称不可修改
  aliases?: string[];        // 角色备注（别名），可多个，可作为额外名称在消息中使用
  isCustomAvatar?: boolean;  // 是否为用户上传的自定义头像
  members?: string[];        // 组群成员ID列表（仅 type='group' 时使用）
}

export interface ChatMessage {
  type: 'system' | 'message' | 'choice';
  content?: string;
  sender?: string;
  senderName?: string;
  time?: string;
  avatar?: string;
  title?: string;
  options?: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  avatar: string;
  avatarName: string;
  pinned: boolean;
}

export interface ProjectData {
  contacts: Contact[];
  chats: Record<string, ChatMessage[]>;
}

export interface AppSettings {
  backgroundImage: string;       // 背景图片路径
  theme: 'dark' | 'light';      // 明暗模式
  contrast: number;              // 对比度 0.5 - 2.0
  previewInterval: number;       // 预览播放时间间隔(ms)
  fontFamily: string;            // 软件字体
  fontSize: number;              // 软件字号
  showTimestamp: boolean;        // 是否显示消息时间
  downloadPath: string;          // 聊天截取下载路径，空串表示使用默认路径
}

export const defaultSettings: AppSettings = {
  backgroundImage: '/background/LandMark_001.png',
  theme: 'dark',
  contrast: 1.0,
  previewInterval: 1500,
  fontFamily: 'MiSans',
  fontSize: 14,
  showTimestamp: true,
  downloadPath: '',
};
