'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Segmented, Alert } from 'antd';
import type { FormProps } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { IconSprite } from '@/components/icon-sprite';
import styles from './login.module.css';

type Mode = 'login' | 'signup';

type Fields = {
  email: string;
  password: string;
  confirm?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [form] = Form.useForm<Fields>();

  /**
   * 提交：真实后端未接入，这里模拟「成功」。
   * 接入时把这段换成真实请求，失败时 setServerError 即可，表单结构不用动。
   */
  const onFinish: FormProps<Fields>['onFinish'] = async (values) => {
    setSubmitting(true);
    setServerError('');
    try {
      await new Promise((r) => setTimeout(r, 700));
      // 模拟一个服务端错误，方便验证错误展示
      if (values.email === 'taken@example.com') {
        setServerError('这个邮箱已经注册过了，直接登录吧');
        return;
      }
      router.push('/learn');
    } catch {
      setServerError('网络不太好，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next: string) => {
    setMode(next as Mode);
    setServerError('');
    form.resetFields();
  };

  return (
    <div className={styles.page}>
      <IconSprite />

      <header className={styles.head}>
        <Link href="/" className={styles.brand}>
          AotuEnglish
        </Link>
        <Link href="/trial" className={styles.trialLink}>
          先体验一节课
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>
            {mode === 'login' ? '欢迎回来' : '创建账号'}
          </h1>
          <p className={styles.subtitle}>
            {mode === 'login'
              ? '登录后继续孩子的学习进度'
              : '注册后孩子的学习记录会自动保存'}
          </p>

          <Segmented
            block
            className={styles.switch}
            value={mode}
            onChange={switchMode}
            options={[
              { label: '登录', value: 'login' },
              { label: '注册', value: 'signup' },
            ]}
          />

          {serverError && (
            <Alert
              type="error"
              message={serverError}
              showIcon
              className={styles.alert}
              closable
              onClose={() => setServerError('')}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            size="large"
            requiredMark={false}
            onFinish={onFinish}
            className={styles.form}
            disabled={submitting}
          >
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请填写邮箱' },
                { type: 'email', message: '邮箱格式看起来不对' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="you@example.com"
                autoComplete="email"
                inputMode="email"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请填写密码' },
                { min: 8, message: '密码至少 8 位' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="至少 8 位"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </Form.Item>

            {mode === 'signup' && (
              <Form.Item
                label="确认密码"
                name="confirm"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请再输入一次密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="再输入一次"
                  autoComplete="new-password"
                />
              </Form.Item>
            )}

            {mode === 'login' && (
              <div className={styles.forgotRow}>
                <Link href="/help" className={styles.forgot}>
                  忘记密码？
                </Link>
              </div>
            )}

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={submitting}
              className={styles.submit}
            >
              {mode === 'login' ? '登录' : '注册并开始'}
            </Button>
          </Form>

          <p className={styles.footNote}>
            {mode === 'login' ? '还没有账号？' : '已经有账号？'}
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? '免费注册' : '去登录'}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
