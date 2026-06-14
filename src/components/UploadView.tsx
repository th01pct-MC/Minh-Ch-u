import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UploadCloud, X, ArrowLeft, CheckCircle, Info, FileText, FileSpreadsheet, FileCode, Film, Paperclip } from 'lucide-react';
import { Resource, Grade, ResourceType, Topic, Lesson } from '../types';
import { GRADES, RESOURCE_TYPES, TOPICS, LESSONS } from '../data';
import { motion } from 'motion/react';

interface UploadViewProps {
  onUpload: (newRes: Resource) => void;
  onCancel: () => void;
  resourceToEdit?: Resource | null; // Optional prop to turn this into an Edit form
  onEditSave?: (updatedRes: Resource) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ 
  onUpload, 
  onCancel, 
  resourceToEdit = null,
  onEditSave
}) => {
  const isEditMode = !!resourceToEdit;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gradeId, setGradeId] = useState('g10');
  const [resourceTypeId, setResourceTypeId] = useState('rt_ppt');
  const [topicId, setTopicId] = useState<string>('all');
  const [lessonId, setLessonId] = useState<string>('all');
  
  // File upload state info
  const [selectedFile, setSelectedFile] = useState<{ name: string; sizeStr: string; rawSize: number } | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Initialize with edit data if applicable
  useEffect(() => {
    if (isEditMode && resourceToEdit) {
      setTitle(resourceToEdit.title);
      setDescription(resourceToEdit.description);
      setGradeId(resourceToEdit.grade_id);
      setResourceTypeId(resourceToEdit.resource_type_id);
      setTopicId(resourceToEdit.topic_id || 'all');
      setLessonId(resourceToEdit.lesson_id || 'all');
      setSelectedFile({
        name: resourceToEdit.file_name,
        sizeStr: resourceToEdit.file_size,
        rawSize: 0
      });
    }
  }, [isEditMode, resourceToEdit]);

  // Dynamic cascading cascades
  const filteredTopics = useMemo(() => {
    return TOPICS.filter(t => t.grade_id === gradeId);
  }, [gradeId]);

  const filteredLessons = useMemo(() => {
    if (topicId === 'all') return [];
    return LESSONS.filter(l => l.topic_id === topicId);
  }, [topicId]);

  // Reset topic & lesson when grade levels alter
  const handleGradeChange = (newGradeId: string) => {
    setGradeId(newGradeId);
    setTopicId('all');
    setLessonId('all');
  };

  // Reset lesson when topic alters
  const handleTopicChange = (newTopicId: string) => {
    setTopicId(newTopicId);
    setLessonId('all');
  };

  // Drag-and-drop mechanics
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const megabytes = file.size / (1024 * 1024);
    const sizeStr = megabytes >= 1 ? `${megabytes.toFixed(2)} MB` : `${(file.size / 1024).toFixed(1)} KB`;
    
    setSelectedFile({
      name: file.name,
      sizeStr,
      rawSize: file.size
    });

    // Auto-fill title to file name base without extension if title is blank
    if (!title) {
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setTitle(baseName);
    }

    // Auto-detect resource types from file suffixes
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension) {
      if (['pptx', 'ppt', 'pps'].includes(extension)) {
        setResourceTypeId('rt_ppt');
      } else if (['docx', 'doc', 'pdf', 'txt'].includes(extension)) {
        setResourceTypeId('rt_doc');
      } else if (['mp4', 'mkv', 'avi', 'mov'].includes(extension)) {
        setResourceTypeId('rt_vid');
      } else if (['png', 'jpg', 'jpeg', 'svg', 'gif'].includes(extension)) {
        setResourceTypeId('rt_img');
      } else if (['zip', 'rar', '7z', 'py', 'sql', 'html', 'css', 'js'].includes(extension)) {
        setResourceTypeId('rt_prac');
      }
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit trigger
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert("Vui lòng điền tiêu đề học liệu.");
      return;
    }
    if (!selectedFile) {
      alert("Vui lòng chọn hoặc kéo thả một tệp tin tài liệu đính kèm.");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    
    // Simulate interactive staging uploads
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            
            const compiledResource: Resource = {
              id: isEditMode && resourceToEdit ? resourceToEdit.id : `res_generated_${Date.now()}`,
              title: title,
              description: description || 'Tài liệu học tập Tin học phổ thông.',
              grade_id: gradeId,
              topic_id: topicId === 'all' ? null : topicId,
              lesson_id: lessonId === 'all' ? null : lessonId,
              resource_type_id: resourceTypeId,
              file_name: selectedFile.name,
              file_size: selectedFile.sizeStr,
              uploaded_by: isEditMode && resourceToEdit ? resourceToEdit.uploaded_by : 'GV. Nguyễn Văn An',
              view_count: isEditMode && resourceToEdit ? resourceToEdit.view_count : Math.floor(Math.random() * 5),
              download_count: isEditMode && resourceToEdit ? resourceToEdit.download_count : 0,
              created_at: isEditMode && resourceToEdit ? resourceToEdit.created_at : new Date().toISOString()
            };

            if (isEditMode && onEditSave) {
              onEditSave(compiledResource);
            } else {
              onUpload(compiledResource);
            }
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto"
    >
      {/* Upper back action context */}
      <button 
        onClick={onCancel}
        className="text-sm font-semibold text-slate-505 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 mb-5"
      >
        <ArrowLeft size={16} /> Quay lại kho học liệu
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-905 dark:text-white">
          {isEditMode ? 'Chỉnh sửa thông tin học liệu' : 'Đăng tải học liệu mới'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {isEditMode 
            ? 'Thay đổi các trường phân loại chương trình học hoặc tài liệu đính kèm.' 
            : 'Đóng góp tài liệu học tập, bài tập thực hành vào hệ thống dữ liệu số dùng chung.'}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 p-6 md:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* File Drop and selection stage */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/10' 
                : 'border-slate-300 dark:border-slate-700 bg-slate-50/55 dark:bg-slate-900/30 hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden"
              onChange={handleFileInputChange}
            />
            
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center text-slate-400 shadow-xs">
                <UploadCloud size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              
              {selectedFile ? (
                <div className="space-y-1">
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400 truncate max-w-lg mx-auto flex items-center justify-center gap-1.5">
                    <Paperclip size={14} className="shrink-0" />
                    <span>{selectedFile.name}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-2">
                    <span>Dung lượng: {selectedFile.sizeStr}</span>
                    <span>•</span>
                    <button 
                      type="button" 
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:underline hover:text-red-600 px-1.5 py-0.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 font-bold"
                    >
                      Bỏ tệp khác
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Kéo thả file học liệu vào đây hoặc <span className="text-blue-600 dark:text-blue-400">chọn từ máy tính</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Hỗ trợ PPTX, DOCX, ZIP, PDF, MP4, PNG (Tự động phát hiện định dạng, tối đa 100MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Title */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                Tiêu đề học liệu <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" required
                placeholder="VD: Bài giảng Bài 16 - Ngôn ngữ lập trình bậc cao Python (Chuẩn GDPT mới)"
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={title} 
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* Grade levels Filter selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                Khối lớp giảng dạy
              </label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
                value={gradeId} 
                onChange={e => handleGradeChange(e.target.value)}
              >
                {GRADES.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Resource Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                Loại định dạng học liệu
              </label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
                value={resourceTypeId} 
                onChange={e => setResourceTypeId(e.target.value)}
              >
                {RESOURCE_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* CASCADING: Topic ID (Filtered based on Grade) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                Chương / Chủ đề lý thuyết
              </label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
                value={topicId} 
                onChange={e => handleTopicChange(e.target.value)}
              >
                <option value="all">-- Không phân theo chủ đề cụ thể --</option>
                {filteredTopics.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
            </div>

            {/* CASCADING: Lesson ID (Filtered based on Topic) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                Bài học cụ thểtrong sách giáo khoa
              </label>
              <select 
                disabled={topicId === 'all'}
                className="disabled:opacity-60 disabled:cursor-not-allowed w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
                value={lessonId} 
                onChange={e => setLessonId(e.target.value)}
              >
                <option value="all">-- Không phân theo bài học cụ thể --</option>
                {filteredLessons.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>{lesson.name}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                Mô tả sơ lược và hướng dẫn sử dụng
              </label>
              <textarea 
                rows={3}
                placeholder="Ví dụ: Tài liệu này bổ trợ cho quá trình học sinh rèn luyện lập trình vòng lặp Python, hướng dẫn thực hành và chấm điểm tự động."
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                value={description} 
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Staging simulated loader */}
          {isUploading && (
            <div className="space-y-2 bg-blue-50/50 dark:bg-blue-950/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Đang xử lý và lưu trữ dữ liệu tệp tin lên hệ thống...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit/Cancel footer actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-700/50">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-5 py-2.5 text-slate-605 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-2xl font-semibold text-sm transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={isUploading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-2xl font-semibold text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UploadCloud size={16} /> 
              {isUploading ? 'Đang cập nhật...' : isEditMode ? 'Xác nhận thay đổi' : 'Đóng góp làm tài liệu chung'}
            </button>
          </div>

        </form>
      </div>
    </motion.div>
  );
};
