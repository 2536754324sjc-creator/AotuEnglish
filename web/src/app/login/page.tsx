'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Form, Input, Button, Segmented, Alert } from 'antd';
import type { FormProps } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { IconSprite } from '@/components/icon-sprite';
import { PageLoading } from '@/components/page-states';
import { ApiError, api } from '@/lib/api';
import { saveSession } from '@/lib/auth';
import styles from './login.module.css';

type Mode = 'login' | 'signup';

type Fields = {
  email: string;
  password: string;
  confirm?: string;
};

/**
 * 外层只负责 Suspense 边界。
 *
 * 为什么必须包：内层用了 `useSearchParams()` 读 `?next=`，
 * 而 /login 是静态预渲染页面 —— 构建时没有真实 URL，
 * 不加边界会直接构建失败（prerender-error）。
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.page}><PageLoading label="正在打开登录…" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  // 登录成功后回到用户原本想去的页面（路由守卫会带 ?next= 过来）
  const next = search.get('next');
  // 价格页等外部入口用 ?mode=signup 直达注册；非法值一律回落到登录
  const [mode, setMode] = useState<Mode>(search.get('mode') === 'signup' ? 'signup' : 'login');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [form] = Form.useForm<Fields>();

  const onFinish: FormProps<Fields>['onFinish'] = async (values) => {
    setSubmitting(true);
    setServerError('');
    try {
      const session = await api.login({
        email: values.email,
        password: values.password,
        mode,
      });
      saveSession(session);
      // 只允许站内相对路径，防止 ?next=https://evil.com 这种开放重定向
      const target = next && next.startsWith('/') && !next.startsWith('//') ? next : '/learn';
      router.push(target);
    } catch (e) {
      if (e instanceof ApiError) {
        // 401 用登录页自己的文案，其余用服务端返回的
        setServerError(
          e.status === 401 ? '邮箱或密码不对，再试一次' : e.message || '登录失败，请稍后再试',
        );
      } else {
        setServerError('网络不太好，请稍后再试');
      }
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
