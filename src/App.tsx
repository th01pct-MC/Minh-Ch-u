import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, BookOpen, UploadCloud, Folder, FileText, Video, Image as ImageIcon, 
  MonitorPlay, Code, GitBranch, Search, Filter, Download, Eye, MoreVertical, 
  LogOut, User, CheckCircle, Clock, BarChart3, Settings, Plus, File, Trash2, 
  ChevronRight, Sun, Moon, Sparkles, Menu, X, CheckSquare, MessageSquare, BookOpenCheck
} from 'lucide-react';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './components/DashboardView';
import { LibraryView } from './components/LibraryView';
import { UploadView } from './components/UploadView';
import { DetailView } from './components/DetailView';
import { GRADES, INITIAL_RESOURCES, RESOURCE_TYPES } from './data';
import { Resource, UserProfile } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('edu_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState<string>('dashboard'); // dashboard, library, upload, detail
  const [activeGradeFilter, setActiveGradeFilter] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [resourceToEdit, setResourceToEdit] = useState<Resource | null>(null);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('edu_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  // Resources state loaded from localStorage or hardcoded base
  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem('edu_resources');
    return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
  });

  // Mobile sidebar visibility
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'danger' } | null>(null);

  // Sync theme to DOM
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('edu_theme', theme);
  }, [theme]);

  // Sync resources to storage
  useEffect(() => {
    localStorage.setItem('edu_resources', JSON.stringify(resources));
  }, [resources]);

  // Sync user state
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('edu_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('edu_user');
    }
  }, [currentUser]);

  // Show a slide Toast
  const triggerToast = (message: string, type: 'success' | 'info' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Login handler
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    triggerToast(`Đăng nhập thành công với vai trò ${user.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}!`, 'success');
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
    setSelectedResource(null);
    setResourceToEdit(null);
    setMobileMenuOpen(false);
    triggerToast('Đã đăng xuất khỏi hệ thống lưu trữ.', 'info');
  };

  // Add resource
  const handleUploadResource = (newRes: Resource) => {
    setResources(prev => [newRes, ...prev]);
    triggerToast(`Đã đóng góp học liệu "${newRes.title}" thành công!`, 'success');
    setCurrentView('library');
  };

  // Save changes to edited resource
  const handleEditResourceSave = (updatedRes: Resource) => {
    setResources(prev => prev.map(r => r.id === updatedRes.id ? updatedRes : r));
    setSelectedResource(updatedRes);
    setResourceToEdit(null);
    triggerToast(`Đã lưu thay đổi cho tài liệu "${updatedRes.title}"!`, 'success');
    setCurrentView('detail');
  };

  // Start editing mode
  const handleStartEdit = (res: Resource) => {
    setResourceToEdit(res);
    setCurrentView('upload');
  };

  // Delete resource
  const handleDeleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
    if (selectedResource && selectedResource.id === id) {
      setSelectedResource(null);
      setCurrentView('library');
    }
    triggerToast('Đã xóa bỏ tài liệu học liệu khỏi thư viện.', 'danger');
  };

  // Stats increment (View / Download)
  const handleStatsChange = (id: string, views: number, downloads: number) => {
    setResources(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, view_count: views, download_count: downloads };
      }
      return r;
    }));
    
    // Update local selected target context too to reflect counters
    setSelectedResource(prev => {
      if (prev && prev.id === id) {
        return { ...prev, view_count: views, download_count: downloads };
      }
      return prev;
    });

    if (downloads > (selectedResource?.download_count || 0)) {
      triggerToast('Bắt đầu tải xuống tệp học liệu...', 'success');
    }
  };

  // Navigation controller with page parameters clearing
  const navigateTo = (view: string, resource: Resource | null = null) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    if (resource) {
      setSelectedResource(resource);
    } else if (view !== 'upload') {
      // Keep edit resource if we are currently clicking upload
      setResourceToEdit(null);
    }
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-150 transition-colors">
      
      {/* Visual slide-in dynamic toast notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4"
          >
            <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 ${
              toast.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/90 dark:border-emerald-800 text-emerald-800 dark:text-emerald-350' 
                : toast.type === 'danger'
                ? 'bg-red-50 border-red-100 dark:bg-red-950/90 dark:border-red-800 text-red-800 dark:text-red-350'
                : 'bg-blue-50 border-blue-105 dark:bg-blue-950/90 dark:border-blue-800 text-blue-850 dark:text-blue-300'
            }`}>
              <Sparkles size={18} className="shrink-0" />
              <p className="text-xs font-bold leading-snug">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Sidebar Desktop */}
      <aside className="w-64 bg-white dark:bg-slate-850 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex shrink-0 transition-colors">
        <div className="p-6 flex items-center gap-3 select-none">
          <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-xl text-white">
            <BookOpen size={22} />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">EduResource</h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Tin học phổ thông</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <NavItem 
            icon={Home} 
            label="Tổng quan học liệu" 
            active={currentView === 'dashboard'} 
            onClick={() => navigateTo('dashboard')} 
          />
          
          <div className="pt-4 pb-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">Kho học liệu</p>
          </div>
          
          <NavItem 
            icon={Folder} 
            label="Tất cả tài nguyên" 
            active={currentView === 'library' && activeGradeFilter === 'all'} 
            onClick={() => { setActiveGradeFilter('all'); navigateTo('library'); }} 
          />

          {GRADES.map(grade => (
            <NavItem 
              key={grade.id} 
              icon={Folder} 
              label={grade.name} 
              active={currentView === 'library' && activeGradeFilter === grade.id} 
              onClick={() => { setActiveGradeFilter(grade.id); navigateTo('library'); }} 
            />
          ))}

          {currentUser.role === 'teacher' && (
            <>
              <div className="pt-4 pb-1">
                <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">Giảng dạy</p>
              </div>
              <NavItem 
                icon={Plus} 
                label="Tải học liệu lên" 
                active={currentView === 'upload' && !resourceToEdit} 
                onClick={() => { setResourceToEdit(null); navigateTo('upload'); }} 
              />
            </>
          )}
        </nav>

        {/* Profiles / Dark Mode togglers in bottom panel */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 p-2 rounded-2xl border border-slate-150/40 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <img 
                src={currentUser.avatar} 
                alt="Avatar" 
                draggable={false} 
                className="w-8 h-8 rounded-full bg-slate-200 ring-2 ring-blue-500/10 object-cover" 
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={currentUser.name}>
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-550 tracking-wide capitalize">
                  {currentUser.role === 'teacher' ? 'Giáo viên Tin học' : 'Học sinh'}
                </p>
              </div>
            </div>

            {/* Dark mode switch */}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-amber-400 transition-colors cursor-pointer"
              title={theme === 'light' ? 'Bật Chế độ tối' : 'Bật Chế độ sáng'}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
          </div>

          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center w-full gap-2 px-3 py-2.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-955/20 dark:hover:bg-red-955/40 rounded-2xl transition-colors cursor-pointer"
          >
            <LogOut size={14} /> Đăng xuất tài khoản
          </button>
        </div>
      </aside>

      {/* Main Core Screen Containers */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Universal Top Header */}
        <header className="h-16 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 transition-colors">
          
          {/* Leftside: Menu Mobile toggles and Context descriptions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden cursor-pointer"
              aria-label="Mở menu"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold select-none">
              <span>Hệ thống thư viện số</span>
              <ChevronRight size={12} className="text-slate-350" />
              <span className="text-slate-900 dark:text-slate-300 font-bold">
                {currentView === 'dashboard' && 'Bảng Tổng quan'}
                {currentView === 'library' && 'Kho học liệu'}
                {currentView === 'upload' && (resourceToEdit ? 'Chỉnh sửa tài nguyên' : 'Đăng tải mới')}
                {currentView === 'detail' && 'Chi tiết tài liệu'}
              </span>
            </div>
          </div>

          {/* Rightside actions: Dynamic indicators & Theme */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100/10 hidden sm:inline-block">
              {currentUser.role === 'teacher' ? 'GV Chuyên môn' : 'Thành viên Học sinh'}
            </span>
            
            {/* Dark mode toggle header button for mobile */}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-400 hover:text-slate-700 dark:hover:text-amber-400 rounded-xl md:hidden transition-colors cursor-pointer"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>

        </header>

        {/* Responsive Content Container */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-slate-50 dark:bg-slate-900/60 transition-colors">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && (
              <DashboardView 
                key="dashboard"
                resources={resources} 
                currentUser={currentUser}
                onNavigate={navigateTo} 
                onFilterGrade={setActiveGradeFilter}
              />
            )}
            
            {currentView === 'library' && (
              <LibraryView 
                key="library"
                resources={resources} 
                gradeFilter={activeGradeFilter} 
                currentUser={currentUser}
                onNavigate={navigateTo} 
                onSelectGrade={setActiveGradeFilter}
                onDeleteResource={handleDeleteResource}
              />
            )}
            
            {currentView === 'upload' && (
              <UploadView 
                key="upload"
                onUpload={handleUploadResource} 
                onCancel={() => navigateTo(resourceToEdit ? 'detail' : 'dashboard')} 
                resourceToEdit={resourceToEdit}
                onEditSave={handleEditResourceSave}
              />
            )}
            
            {currentView === 'detail' && selectedResource && (
              <DetailView 
                key="detail"
                resource={selectedResource} 
                currentUser={currentUser}
                onBack={() => navigateTo('library')} 
                onEdit={handleStartEdit}
                onDelete={handleDeleteResource}
                onStatsChange={handleStatsChange}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Responsive Mobile Drawer menu panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />

            {/* Sidebar drawer body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-850 z-50 p-6 flex flex-col justify-between md:hidden shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-blue-600 p-2 rounded-xl text-white">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-905 dark:text-white leading-none">EduResource</h4>
                      <p className="text-[9px] text-slate-400 mt-1">Tin học phổ thông</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-50"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1 px-3">Danh mục</p>
                  <NavItem 
                    icon={Home} 
                    label="Tổng quan" 
                    active={currentView === 'dashboard'} 
                    onClick={() => navigateTo('dashboard')} 
                  />
                  <NavItem 
                    icon={Folder} 
                    label="Tất cả học liệu" 
                    active={currentView === 'library' && activeGradeFilter === 'all'} 
                    onClick={() => { setActiveGradeFilter('all'); navigateTo('library'); }} 
                  />
                  
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-4 mb-1 px-3">Khối lớp THPT</p>
                  {GRADES.map(grade => (
                    <NavItem 
                      key={grade.id} 
                      icon={Folder} 
                      label={grade.name} 
                      active={currentView === 'library' && activeGradeFilter === grade.id} 
                      onClick={() => { setActiveGradeFilter(grade.id); navigateTo('library'); }} 
                    />
                  ))}

                  {currentUser.role === 'teacher' && (
                    <>
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-4 mb-1 px-3">Đóng góp</p>
                      <NavItem 
                        icon={Plus} 
                        label="Tải tài liệu lên" 
                        active={currentView === 'upload' && !resourceToEdit} 
                        onClick={() => { setResourceToEdit(null); navigateTo('upload'); }} 
                      />
                    </>
                  )}
                </nav>
              </div>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/30 p-2 rounded-2xl">
                  <img src={currentUser.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{currentUser.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-955/20 text-red-600 rounded-xl text-xs font-bold font-sans transition-colors cursor-pointer"
                >
                  Đăng xuất hệ thống
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

// --- UNIVERSAL NAVIGATION BUTTON ITEM ---

interface NavItemProps {
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-start gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer select-none ${
        active 
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <Icon size={16} className={active ? 'text-white' : 'text-slate-400 dark:text-slate-500'} />
      <span className="truncate">{label}</span>
    </button>
  );
};
