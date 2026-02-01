import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router';
import styles from './index.module.scss'; 

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.notFoundPage}>
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在或已被移除。"
        extra={
          <Button 
            type="primary" 
            size="large" 
            onClick={() => navigate('/index')}
            className={styles.backBtn} 
          >
            返回首页
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;