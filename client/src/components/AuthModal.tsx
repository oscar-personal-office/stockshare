import React, { useState, useEffect } from 'react';
import { X, User, Lock, LogIn, UserPlus } from 'lucide-react';
import { authApi } from '../services/api';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // 当 initialMode 变化时更新 mode
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证
    if (!name.trim()) {
      setError('请输入昵称');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }
    if (password.length < 6) {
      setError('密码至少6位');
      return;
    }

    setLoading(true);
    try {
      let user: UserType;
      if (mode === 'login') {
        user = await authApi.login(name.trim(), password);
      } else {
        user = await authApi.register(name.trim(), password);
      }

      // 存储用户ID到 localStorage
      localStorage.setItem('userId', user.id);

      onLoginSuccess(user);
      onClose();

      // 重置表单
      setName('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || (mode === 'login' ? '登录失败' : '注册失败'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {mode === 'login' ? (
              <>
                <LogIn size={20} className="text-indigo-600" />
                登录
              </>
            ) : (
              <>
                <UserPlus size={20} className="text-indigo-600" />
                注册
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">昵称</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="输入您的昵称"
                  maxLength={20}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="至少6位密码"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
          </button>

          <div className="mt-4 text-center text-sm text-slate-500">
            {mode === 'login' ? (
              <>
                还没有账号？
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-indigo-600 hover:underline ml-1"
                >
                  立即注册
                </button>
              </>
            ) : (
              <>
                已有账号？
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-indigo-600 hover:underline ml-1"
                >
                  去登录
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
