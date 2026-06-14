import React, { useMemo } from 'react';
import { 
  Folder, MonitorPlay, CheckCircle, Video, UploadCloud, Search, 
  BookOpen, Clock, ArrowRight, UserCheck, Eye, Download, Info
} from 'lucide-react';
import { Resource, Grade, ResourceType } from '../types';
import { GRADES, RESOURCE_TYPES } from '../data';
import { DynamicIcon } from './DynamicIcon';
import { motion } from 'motion/react';

interface DashboardViewProps {
  resources: Resource[];
  currentUser: any;
  onNavigate: (view: string, resource?: Resource | null) => void;
  onFilterGrade: (gradeId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  resources, 
  currentUser,
  onNavigate, 
  onFilterGrade 
}) => {
  
  // Dynamic aggregations
  const stats = useMemo(() => {
    return {
      total: resources.length,
      ppt: resources.filter(r => r.resource_type_id === 'rt_ppt').length,
      test: resources.filter(r => r.resource_type_id === 'rt_test').length,
      video: resources.filter(r => r.resource_type_id === 'rt_vid').length,
      other: resources.filter(r => !['rt_ppt', 'rt_test', 'rt_vid'].includes(r.resource_type_id)).length,
      totalDownloads: resources.reduce((sum, r) => sum + r.download_count, 0),
      totalViews: resources.reduce((sum, r) => sum + r.view_count, 0)
    };
  }, [resources]);

  // Sort resources by date descending, take top 4
  const recentResources = useMemo(() => {
    return [...resources]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4);
  }, [resources]);

  // Select a grade and jump to catalog
  const handleGradeQuickJump = (gradeId: string) => {
    onFilterGrade(gradeId);
    onNavigate('library');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      {/* Banner / Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-8 translate-x-8">
          <BookOpen size={280} />
        </div>
        
        <div className="space-y-2 relative z-10">
          <span className="bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border border-white/10">
            Học kỳ II • Năm học 2025-2026
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Xin chào, {currentUser.name}!
          </h2>
          <p className="text-blue-100 text-sm max-w-xl font-normal leading-relaxed">
            Hệ thống quản lý và chia sẻ học liệu Tin học 10, 11, 12 theo chương trình GDPT mới. Đóng góp bài giảng và tài liệu học tập dễ dàng.
          </p>
        </div>

        {currentUser.role === 'teacher' && (
          <button 
            onClick={() => onNavigate('upload')}
            className="shrink-0 bg-white hover:bg-slate-50 text-blue-700 px-5 py-3 rounded-2xl font-semibold text-sm transition-all focus:ring-4 focus:ring-white/20 shadow-md flex items-center gap-2 cursor-pointer relative z-10 group"
          >
            <UploadCloud size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
            Tải học liệu lên ngay
          </button>
        )}
      </div>

      {/* Grid thống kê lớn */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Tổng số học liệu" 
          value={stats.total} 
          subtitle="Tài liệu lưu trữ"
          iconName="Folder" 
          colorClass="bg-blue-600 dark:bg-blue-500 text-white" 
          bgClass="bg-blue-50 dark:bg-blue-950/20"
        />
        <StatCard 
          title="Bài giảng PPT" 
          value={stats.ppt} 
          subtitle="Thiết kế slide hay"
          iconName="MonitorPlay" 
          colorClass="bg-orange-500 text-white" 
          bgClass="bg-orange-50 dark:bg-orange-950/20"
        />
        <StatCard 
          title="Đề kiểm tra" 
          value={stats.test} 
          subtitle="Có ma trận & đáp án"
          iconName="CheckCircle" 
          colorClass="bg-rose-500 text-white" 
          bgClass="bg-rose-50 dark:bg-rose-950/20"
        />
        <StatCard 
          title="Video minh họa" 
          value={stats.video} 
          subtitle="Bài giảng trực quan"
          iconName="Video" 
          colorClass="bg-purple-500 text-white" 
          bgClass="bg-purple-50 dark:bg-purple-950/20"
        />
      </section>

      {/* Grid Nội dung chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột Trái: Đóng góp gần đây */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                Mới cập nhật gần đây
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tài liệu học liệu mới nhất do các giáo viên tải lên</p>
            </div>
            <button 
              onClick={() => { onFilterGrade('all'); onNavigate('library'); }}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group cursor-pointer"
            >
              Xem tất cả <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {recentResources.map((res) => (
                <ResourceRowItem 
                  key={res.id} 
                  resource={res} 
                  onClick={() => onNavigate('detail', res)} 
                />
              ))}
            </div>
          </div>

          {/* Lớp Học Tổng Quan Widget */}
          <div className="bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 p-5 rounded-3xl space-y-3">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Phân bổ chương trình giáo khoa mới
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-700/40">
                <div className="text-xs font-semibold text-slate-500 mb-1">Tin 10 - Python</div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white">Lập trình cơ bản</div>
                <p className="text-[11px] text-slate-450 mt-1">Gồm 17 bài học chủ chốt về biến, rẽ nhánh, vòng lặp...</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-700/40">
                <div className="text-xs font-semibold text-slate-500 mb-1">Tin 11 - CSDL</div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white">HeidiSQL & Access</div>
                <p className="text-[11px] text-slate-450 mt-1">Truy vấn SQL, thiết kế bảng và mối quan hệ khóa ngoại.</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-700/40">
                <div className="text-xs font-semibold text-slate-500 mb-1">Tin 12 - Web & AI</div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white">HTML, CSS & AI</div>
                <p className="text-[11px] text-slate-450 mt-1">Xây dựng trang web hoàn chỉnh, tìm hiểu lịch sử và vai trò AI.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cột Phải: Thao tác nhanh & Lọc */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Menu Thao tác nhanh</h3>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm space-y-4">
            
            {currentUser.role === 'teacher' && (
              <button 
                onClick={() => onNavigate('upload')}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3.5 px-4 rounded-2xl font-semibold text-sm transition-colors shadow-sm shadow-blue-500/10 cursor-pointer"
              >
                <UploadCloud size={18} /> Đăng tải tài liệu học liệu mới
              </button>
            )}

            <button 
              onClick={() => { onFilterGrade('all'); onNavigate('library'); }}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3.5 px-4 rounded-2xl font-semibold text-sm transition-colors cursor-pointer"
            >
              <Search size={18} /> Tra cứu kho tài nguyên
            </button>

            {/* Quick Grade Filter */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 space-y-3">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Truy cập nhanh khối lớp
              </p>
              <div className="flex flex-col gap-2">
                {GRADES.map(g => (
                  <button
                    key={g.id}
                    onClick={() => handleGradeQuickJump(g.id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-blue-50 dark:bg-slate-900/35 dark:hover:bg-blue-950/20 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 font-semibold text-sm rounded-xl border border-slate-200/40 dark:border-slate-700/40 transition-colors text-left cursor-pointer"
                  >
                    <span>{g.name}</span>
                    <ArrowRight size={14} className="opacity-60" />
                  </button>
                ))}
              </div>
            </div>

            {/* Thống kê đợt tương tác */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 space-y-2.5">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Thống kê tương tác
              </p>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-50 dark:bg-slate-900/35 p-2.5 rounded-xl border border-slate-150/40 dark:border-slate-700/40">
                  <div className="flex justify-center text-blue-600 dark:text-blue-400 mb-1">
                    <Eye size={16} />
                  </div>
                  <div className="font-extrabold text-slate-950 dark:text-white text-sm">{stats.totalViews}</div>
                  <div className="text-[10px] text-slate-500">Lượt Xem học liệu</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/35 p-2.5 rounded-xl border border-slate-150/40 dark:border-slate-700/40">
                  <div className="flex justify-center text-emerald-600 dark:text-emerald-400 mb-1">
                    <Download size={16} />
                  </div>
                  <div className="font-extrabold text-slate-950 dark:text-white text-sm">{stats.totalDownloads}</div>
                  <div className="text-[10px] text-slate-500">Lượt Tải về</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </motion.div>
  );
};

// --- SUB-COMPONENTS FOR DASHBOARD ---

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  iconName: string;
  colorClass: string;
  bgClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, iconName, colorClass, bgClass }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center gap-4 transition-all hover:translate-y-[-2px] hover:shadow-md">
      <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center shrink-0 shadow-sm`}>
        <DynamicIcon name={iconName} size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider truncate">{title}</p>
        <p className="text-2xl font-extrabold text-slate-950 dark:text-white my-0.5 leading-none">{value}</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{subtitle}</p>
      </div>
    </div>
  );
};

interface ResourceRowItemProps {
  resource: Resource;
  onClick: () => void;
}

const ResourceRowItem: React.FC<ResourceRowItemProps> = ({ resource, onClick }) => {
  const typeInfo = RESOURCE_TYPES.find(t => t.id === resource.resource_type_id);
  const gradeLabel = GRADES.find(g => g.id === resource.grade_id)?.name || 'Học liệu chung';

  return (
    <div 
      onClick={onClick} 
      className="p-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-755 cursor-pointer group transition-all"
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Visual Icon Badge */}
        <div className={`w-11 h-11 rounded-xl border ${typeInfo?.bg || 'bg-slate-50'} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
          <DynamicIcon 
            name={typeInfo?.iconName || 'File'} 
            className={typeInfo?.color || 'text-slate-500'} 
            size={20} 
          />
        </div>
        
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate pr-4">
            {resource.title}
          </h4>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{gradeLabel}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span>Tải bởi {resource.uploaded_by}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {new Date(resource.created_at).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 shrink-0 select-none">
        <span className="text-xs bg-slate-100 dark:bg-slate-750 px-2.5 py-1 rounded-full font-medium text-slate-600 dark:text-slate-400 hidden sm:inline-block">
          {resource.file_size}
        </span>
        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};
