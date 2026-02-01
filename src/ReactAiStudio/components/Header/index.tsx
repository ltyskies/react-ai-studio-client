import styles from './index.module.scss'
import copy from 'copy-to-clipboard';
import logoSvg from './icons/logo.svg';
import { useContext } from 'react';
import { AIStudioContext } from '../../AIStudioContext';
import { 
  DownloadOutlined, 
  ShareAltOutlined, 
  LogoutOutlined 
} from '@ant-design/icons';
import { message, Popconfirm } from 'antd';
import { downloadFiles } from '../../utils';

export default function Header() {
  const { isShow, setIsShow, files } = useContext(AIStudioContext);
  

  const handleLogout = () => {
    localStorage.removeItem('token');
    message.success('已退出登录');
    window.location.reload(); 
  };

  return (
    <div className={styles.header}>
      <div className={styles.logo}>
        <img alt='logo' src={logoSvg}/>
        <span>React AI Studio</span>
        <span 
          onClick={() => setIsShow(!isShow)}
          style={{ 
            cursor: 'pointer', 
            fontWeight: 500,
            color: isShow ? '#1677ff' : 'inherit',
            padding: '2px 8px',
            borderRadius: '4px',
            marginLeft: '50px',
            transition: 'all 0.2s',
            userSelect: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
          className={styles.aiButton}
        >
          AI 帮助
        </span>
      </div>

      <div className={styles.links} style={{ display: 'flex', alignItems: 'center' }}>
        {/* 1. AI 帮助 (文字按钮) */}
        


        
        {/* 3. 分享链接 */}
        <ShareAltOutlined
          title='分享'
          style={{ marginLeft: '16px', fontSize: '18px', cursor: 'pointer' }}
          onClick={() => {
            copy(window.location.href)
            message.success('分享链接已复制')
          }} 
        />
        
        {/* 4. 下载代码 */}
        <DownloadOutlined 
          title='下载代码'
          style={{ marginLeft: '16px', fontSize: '18px', cursor: 'pointer' }}
          onClick={async () => {
            await downloadFiles(files);
            message.success('下载完成')
          }}
        />

        {/* 5. 退出登录 */}
        <Popconfirm
          title="退出登录"
          description="确定要退出吗？"
          onConfirm={handleLogout}
          okText="确定"
          cancelText="取消"
          placement="bottomRight"
        >
          <LogoutOutlined 
            title='退出登录'
            style={{ marginLeft: '16px', fontSize: '18px', cursor: 'pointer' }} 
          />
        </Popconfirm>
      </div>
    </div>
  )
}