import React from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input, Card, message } from 'antd';
import { loginAPI } from '../apis/user';
import { useNavigate } from 'react-router';
import { setToken } from '../utils/token';
import './index.scss'; 
import useUserStore from '../store/userStore';

type FieldType = {
  email: string;
  password: string;
};

interface LoginResponse {
  code: number;
  data: {
    token: string;
    id: number;
    email: string;
    createdAt: string;
  };
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { setUserId } = useUserStore();

  const onFinish: FormProps<FieldType>['onFinish'] = async (values: FieldType) => {
    try {
      const res: LoginResponse | any = await loginAPI(values);

      if (res.code === 200) {
        message.success('登录成功，正在跳转...');
        console.log('登录成功，返回数据：', res.data);
        setToken(res.data.token);
        setUserId(res.data.id);
        setTimeout(() => {
          navigate('/index');
        }, 800);
      } else {
        message.error(res.data || '登录失败');
      }
    } catch (err) {
      console.error(err);
      message.error('网络错误或服务器异常');
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay">
        <Card className="login-card" bordered={false}>
          <div className="login-header">
            <h1 className="login-title">React AI Studio</h1>
            <p className="login-subtitle">请登录您的账号</p>
          </div>
          
          <Form
            form={form}
            name="login_form"
            layout="vertical" 
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item<FieldType>
              label="邮箱地址"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱!' },
                { type: 'email', message: '请输入有效的邮箱格式!' }
              ]}
            >
              <Input placeholder="admin@email.com" />
            </Form.Item>

            <Form.Item<FieldType>
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block className="login-button">
                立即登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;