import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, LayoutGrid, List, SlidersHorizontal, Trash2, 
  Eye, Download, RefreshCw, X, FolderOpen, Calendar, BookOpen
} from 'lucide-react';
import { Resource, Grade, ResourceType, Topic, UserProfile } from '../types';
import { GRADES, RESOURCE_TYPES, TOPICS } from '../data';
import { DynamicIcon } from './DynamicIcon';
import { motion, AnimatePresence } from 'motion/react';

interface LibraryViewProps {
  resources: Resource[];
  gradeFilter: string;
  currentUser: UserProfile;
  onNavigate: (view: string, resource?: Resource | null) => void;
  onSelectGrade: (gradeId: string) => void;
  onDeleteResource: (id: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ 
  resources, 
  gradeFilter, 
  currentUser,
  onNavigate, 
  onSelectGrade,
  onDeleteResource
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'views' | 'downloads'>('newest');

  // Filter topics based on grade path
  const availableTopics = useMemo(() => {
    if (gradeFilter === 'all') return [];
    return TOPICS.filter(t => t.grade_id === gradeFilter);
  }, [gradeFilter]);

  // Handle resetting topic filter if the grade filter shifts
  React.useEffect(() => {
    setTopicFilter('all');
  }, [gradeFilter]);

  // Core filter logic
  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchGrade = gradeFilter === 'all' || res.grade_id === gradeFilter;
      const matchType = typeFilter === 'all' || res.resource_type_id === typeFilter;
      const matchTopic = topicFilter === 'all' || res.topic_id === topicFilter;
      
      const text = searchTerm.toLowerCase();
      const matchSearch = 
        res.title.toLowerCase().includes(text) || 
        res.description.toLowerCase().includes(text) ||
        (res.file_name && res.file_name.toLowerCase().includes(text)) ||
        (res.uploaded_by && res.uploaded_by.toLowerCase().includes(text));

      return matchGrade && matchType && matchTopic && matchSearch;
    });
  }, [resources, gradeFilter, typeFilter, topicFilter, searchTerm]);

  // Sort logic
  const sortedResources = useMemo(() => {
    return [...filteredResources].sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortOrder === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortOrder === 'views') {
        return b.view_count - a.view_count;
      }
      if (sortOrder === 'downloads') {
        return b.download_count - a.download_count;
      }
      return 0;
    });
  }, [filteredResources, sortOrder]);

  const activeGradeName = gradeFilter === 'all' ? 'Tất cả học liệu' : GRADES.find(g => g.id === gradeFilter)?.name;

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setTopicFilter('all');
    onSelectGrade('all');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-6 pb-12"
    >
      {/* Header section with page descriptive details and buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{activeGradeName}</span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-400 rounded-full border border-slate-200/40 dark:border-slate-700/40">
              {filteredResources.length} tài nguyên
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tra cứu kho tài liệu giảng dạy, bài giảng trình chiếu, tài liệu thực hành và chuẩn bị đề bài kiểm tra Tin học.
          </p>
        </div>

        {currentUser.role === 'teacher' && (
          <button 
            onClick={() => onNavigate('upload')}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-semibold text-sm transition-colors shadow-sm shadow-blue-500/10 cursor-pointer text-center"
          >
            <Plus size={18} /> Thêm tài liệu mới
          </button>
        )}
      </div>

      {/* Modern Filter Board */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm space-y-4">
        
        {/* Search Input and Select Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          
          {/* Search bar */}
          <div className="relative md:col-span-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tiêu đề, tác giả, tên file..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:bg-slate-900 transition-all outline-none"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Grade Selector (Visible if coming from general 'all' library) */}
          <div className="md:col-span-2">
            <select
              value={gradeFilter}
              onChange={(e) => onSelectGrade(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
            >
              <option value="all">Tất cả Khối Học</option>
              {GRADES.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Resource Type filter */}
          <div className="md:col-span-2">
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
            >
              <option value="all">Tất cả Loại Học Liệu</option>
              {RESOURCE_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Sorters selection */}
          <div className="md:col-span-3">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
            >
              <option value="newest">Ngày tải lên: Mới nhất</option>
              <option value="oldest">Ngày tải lên: Cũ nhất</option>
              <option value="views">Lượt xem: Cao nhất</option>
              <option value="downloads">Lượt tải: Nhiều nhất</option>
            </select>
          </div>

        </div>

        {/* Dynamic Topic Filters - Only shown for specific Grades */}
        {gradeFilter !== 'all' && availableTopics.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row items-start md:items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider md:shrink-0 pt-1">
              Chủ đề chuyên môn:
            </span>
            <div className="flex flex-wrap gap-1.5 w-full">
              <button
                type="button"
                onClick={() => setTopicFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  topicFilter === 'all'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-200/55 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Tất cả chủ đề
              </button>
              {availableTopics.map(topic => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setTopicFilter(topic.id)}
                  title={topic.name}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer max-w-[220px] md:max-w-[320px] truncate ${
                    topicFilter === topic.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-200/55 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Layout toggle view state and active chips indicator */}
        <div className="pt-3.5 border-t border-slate-150/40 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Đang áp dụng:</span>
            {gradeFilter !== 'all' && (
              <span className="bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-350 py-1 px-2.5 rounded-full font-medium border border-slate-200/40 dark:border-slate-750 flex items-center gap-1">
                Khối: {GRADES.find(g => g.id === gradeFilter)?.name}
                <X size={12} className="cursor-pointer font-bold hover:text-red-500" onClick={() => onSelectGrade('all')} />
              </span>
            )}
            {typeFilter !== 'all' && (
              <span className="bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-350 py-1 px-2.5 rounded-full font-medium border border-slate-200/40 dark:border-slate-750 flex items-center gap-1">
                Loại: {RESOURCE_TYPES.find(t => t.id === typeFilter)?.name}
                <X size={12} className="cursor-pointer font-bold hover:text-red-500" onClick={() => setTypeFilter('all')} />
              </span>
            )}
            {topicFilter !== 'all' && (
              <span className="bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-350 py-1 px-2.5 rounded-full font-medium border border-slate-200/40 dark:border-slate-750 flex items-center gap-1">
                Chủ đề: {TOPICS.find(t => t.id === topicFilter)?.name.split(':')[0]}
                <X size={12} className="cursor-pointer font-bold hover:text-red-500" onClick={() => setTopicFilter('all')} />
              </span>
            )}
            {searchTerm && (
              <span className="bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-350 py-1 px-2.5 rounded-full font-medium border border-slate-200/40 dark:border-slate-750 flex items-center gap-1">
                Từ khóa: "{searchTerm}"
                <X size={12} className="cursor-pointer font-bold hover:text-red-500" onClick={() => setSearchTerm('')} />
              </span>
            )}
            {(gradeFilter !== 'all' || typeFilter !== 'all' || topicFilter !== 'all' || searchTerm) && (
              <button 
                onClick={handleClearFilters}
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 ml-1 font-semibold cursor-pointer"
              >
                Xóa tất cả lọc
              </button>
            )}
          </div>

          {/* Grid/List Layout Mode buttons */}
          <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : ''
              }`}
              title="Xem dạng Lưới"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 ${
                viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : ''
              }`}
              title="Xem dạng Danh sách"
            >
              <List size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Catalog Render Panel */}
      <AnimatePresence mode="popLayout">
        {sortedResources.length > 0 ? (
          viewMode === 'grid' ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {sortedResources.map(res => (
                <ResourceCard 
                  key={res.id} 
                  resource={res} 
                  currentUser={currentUser}
                  onNavigate={onNavigate} 
                  onDelete={onDeleteResource}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm divide-y divide-slate-100 dark:divide-slate-750 overflow-hidden"
            >
              {sortedResources.map(res => (
                <ResourceListItem 
                  key={res.id} 
                  resource={res} 
                  currentUser={currentUser}
                  onNavigate={onNavigate} 
                  onDelete={onDeleteResource}
                />
              ))}
            </motion.div>
          )
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-8 space-y-4 shadow-xs"
          >
            <div className="mx-auto w-20 h-20 bg-slate-50 dark:bg-slate-900/60 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-700/40 text-slate-400">
              <FolderOpen size={36} />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Không có học liệu nào khớp</h3>
              <p className="text-sm text-slate-500">
                Không tìm thấy dữ liệu học liệu thỏa mãn các điều kiện tìm kiếm và bộ lọc hiện tại của bạn.
              </p>
            </div>
            <button 
              type="button" 
              onClick={handleClearFilters}
              className="px-5 py-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-semibold text-sm rounded-xl hover:bg-blue-100 transition-colors"
            >
              Khôi phục thiết lập lọc
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- GRID RESOURCE CARD COMPONENT ---

interface ResourceCardProps {
  resource: Resource;
  currentUser: UserProfile;
  onNavigate: (view: string, resource?: Resource | null) => void;
  onDelete: (id: string) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, currentUser, onNavigate, onDelete }) => {
  const typeInfo = RESOURCE_TYPES.find(t => t.id === resource.resource_type_id);
  const TypeIconName = typeInfo?.iconName || 'File';
  const gradeName = GRADES.find(g => g.id === resource.grade_id)?.name || 'Chung';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc chắn muốn xóa học liệu "${resource.title}"?`)) {
      onDelete(resource.id);
    }
  };

  return (
    <div 
      onClick={() => onNavigate('detail', resource)}
      className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer group flex flex-col h-full overflow-hidden relative"
    >
      <div className="p-5 flex-1 space-y-3.5">
        <div className="flex items-start justify-between">
          <div className={`w-11 h-11 rounded-xl border ${typeInfo?.bg || 'bg-slate-50'} flex items-center justify-center group-hover:scale-105 transition-transform shrink-0`}>
            <DynamicIcon name={TypeIconName} className={typeInfo?.color || 'text-slate-500'} size={20} />
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wide bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-full">
              {gradeName}
            </span>
            {currentUser.role === 'teacher' && (
              <button 
                onClick={handleDelete}
                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                title="Xóa học liệu"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 select-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {resource.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {resource.description || 'Chưa cung cấp mô tả chi tiết cho học liệu này.'}
          </p>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1">
            <Eye size={12} /> {resource.view_count}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Download size={12} /> {resource.download_count}
          </span>
        </div>
        <div className="font-semibold text-slate-700 dark:text-slate-300">
          {resource.file_name?.split('.').pop()?.toUpperCase()} • {resource.file_size}
        </div>
      </div>
    </div>
  );
};

// --- LIST ITEM COMPONENT ---

const ResourceListItem: React.FC<ResourceCardProps> = ({ resource, currentUser, onNavigate, onDelete }) => {
  const typeInfo = RESOURCE_TYPES.find(t => t.id === resource.resource_type_id);
  const TypeIconName = typeInfo?.iconName || 'File';
  const gradeName = GRADES.find(g => g.id === resource.grade_id)?.name || 'Chung';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc chắn muốn xóa học liệu "${resource.title}"?`)) {
      onDelete(resource.id);
    }
  };

  return (
    <div 
      onClick={() => onNavigate('detail', resource)}
      className="p-4 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-900/10 cursor-pointer group transition-all"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className={`w-10 h-10 rounded-xl border ${typeInfo?.bg || 'bg-slate-50'} flex items-center justify-center shrink-0`}>
          <DynamicIcon name={TypeIconName} className={typeInfo?.color || 'text-slate-500'} size={18} />
        </div>

        <div className="min-w-0 flex-1 pr-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-505 bg-slate-100 dark:bg-slate-750 px-2 py-0.5 rounded-md shrink-0">
              {gradeName}
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {resource.title}
            </h4>
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
            <span>Tác giả: <span className="font-medium text-slate-600 dark:text-slate-300">{resource.uploaded_by}</span></span>
            <span>•</span>
            <span className="hidden sm:inline">Dung lượng: {resource.file_size}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(resource.created_at).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-3 text-xs text-slate-400 select-none">
          <span className="flex items-center gap-0.5"><Eye size={12} /> {resource.view_count}</span>
          <span className="flex items-center gap-0.5"><Download size={12} /> {resource.download_count}</span>
        </div>

        {currentUser.role === 'teacher' && (
          <button 
            type="button"
            onClick={handleDelete}
            className="p-1 px-2 rounded-lg text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
            title="Xóa học liệu"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
};
