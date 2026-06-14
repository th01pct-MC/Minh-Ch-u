import React, { useState } from 'react';
import { BookOpen, User, Lock, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('giaovien.nguyen@edu.vn');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState<'teacher' | 'student'>('teacher');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    if (role === 'teacher') {
      onLogin({
        id: 'u_teacher_1',
        name: 'GV. Nguyễn Văn An',
        role: 'teacher',
        avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&fit=crop&q=80',
        email: email
      });
    } else {
      onLogin({
        id: 'u_student_1',
        name: 'HS. Lê Minh Khoa',
        role: 'student',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80',
        email: email
      });
    }
  };

  const handleQuickSelect = (selectedRole: 'teacher' | 'student') => {
    setRole(selectedRole);
    if (selectedRole === 'teacher') {
      setEmail('giaovien.nguyen@edu.vn');
    } else {
      setEmail('leminhkhoa.hs@edu.vn');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
          <BookOpen size={36} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">EduResource</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Thư viện học liệu Tin học số Trung học Phổ thông
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-black/25 sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-700/50">
          
          {/* Role selector tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => handleQuickSelect('teacher')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                role === 'teacher'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <ShieldCheck size={14} />
              Giáo viên (Demo)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect('student')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                role === 'student'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <User size={14} />
              Học sinh (Demo)
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email tài khoản
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="giaovien@truong.edu.vn"
                  className="appearance-none block w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transitions-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Mật khẩu
                </label>
                <span className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  Quên mật khẩu?
                </span>
              </div>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="appearance-none block w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transitions-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 dark:text-slate-400">
                  Duy trì đăng nhập
                </label>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <HelpCircle size={12} />
                ID: {role === 'teacher' ? 'GV.An' : 'HS.Khoa'}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
              >
                Đăng nhập hệ thống <ArrowRight size={16} />
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-4">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hệ thống dùng thử (Demo Mode):
            </p>
            <p>Không cần đăng ký. Click chọn vai trò ở trên và nhấn Đăng nhập.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
