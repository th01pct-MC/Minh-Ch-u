import React, { useState } from 'react';
import { 
  ArrowLeft, Download, Eye, File, Calendar, User, Database, 
  Layers, HardDrive, Edit, Trash2, Tag, Play, CheckCircle, ExternalLink, RefreshCw
} from 'lucide-react';
import { Resource, Grade, ResourceType, UserProfile } from '../types';
import { GRADES, RESOURCE_TYPES, TOPICS, LESSONS } from '../data';
import { DynamicIcon } from './DynamicIcon';
import { motion, AnimatePresence } from 'motion/react';

interface DetailViewProps {
  resource: Resource;
  currentUser: UserProfile;
  onBack: () => void;
  onEdit: (res: Resource) => void;
  onDelete: (id: string) => void;
  onStatsChange: (resId: string, views: number, downloads: number) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ 
  resource, 
  currentUser,
  onBack, 
  onEdit, 
  onDelete,
  onStatsChange
}) => {
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Custom interactive preview simulators state
  const [activeSlide, setActiveSlide] = useState(0);
  const [simulatedCodeRan, setSimulatedCodeRan] = useState(false);
  const [interactiveQuizScore, setInteractiveQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const typeInfo = RESOURCE_TYPES.find(t => t.id === resource.resource_type_id);
  const gradeInfo = GRADES.find(g => g.id === resource.grade_id);
  const topicInfo = TOPICS.find(t => t.id === resource.topic_id);
  const lessonInfo = LESSONS.find(l => l.id === resource.lesson_id);
  const TypeIconName = typeInfo?.iconName || 'File';

  // Increment view stats on load
  React.useEffect(() => {
    // Increment view count exactly once when viewed
    onStatsChange(resource.id, resource.view_count + 1, resource.download_count);
  }, [resource.id]);

  const handleDownload = () => {
    setIsDownloading(true);
    
    setTimeout(() => {
      setIsDownloading(false);
      onStatsChange(resource.id, resource.view_count, resource.download_count + 1);
      
      // Simulate physical download trigger
      const dummyLink = document.createElement('a');
      dummyLink.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`EduResource file content simulator for ${resource.title}`);
      dummyLink.setAttribute('download', resource.file_name);
      dummyLink.style.display = 'none';
      document.body.appendChild(dummyLink);
      dummyLink.click();
      document.body.removeChild(dummyLink);
    }, 1200);
  };

  const handleDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa học liệu "${resource.title}"?`)) {
      onDelete(resource.id);
    }
  };

  // PowerPoint slider contents based on lesson
  const powerPointSlides = [
    { title: "Giới thiệu Tổng Quan", bullet1: "Định nghĩa và bối cảnh lý thuyết liên quan.", bullet2: "Các câu hỏi mở dẫn dắt bài tập mở rộng.", bullet3: "Giải quyết bài toán cơ bản trong đời sống." },
    { title: "Kiến Thức Cốt Lõi", bullet1: "Phương pháp tư duy logic và thuật toán tin học mới.", bullet2: "Sơ đồ luồng xử lý dữ liệu và hệ thống thông tin.", bullet3: "Ví dụ chi tiết thực hành trên máy tính phòng lab." },
    { title: "Thực Hành Hướng Dẫn", bullet1: "Các bước thao tác tuần tự trên phần mềm.", bullet2: "Lỗi phổ biến cần tránh khi thực hiện các thiết lập.", bullet3: "Thảo luận nhóm để nâng cao tốc độ tối ưu." },
    { title: "Tổng kết & Giao bài về nhà", bullet1: "Tóm tắt 3 ý chính cần ghi nhớ trong chương.", bullet2: "Phiếu ôn thi lý thuyết và bài tập về nhà trên lớp.", bullet3: "Chuẩn bị cho tiết thực hành tiếp theo." }
  ];

  // Python simulated program code
  const pythonCodeSample = `# Chương trình minh họa: ${resource.title}
# Ngôn ngữ: Python 3

def handle_data_process(data_list):
    print("Khởi động hệ thống xử lý học liệu Tin học...")
    processed_results = []
    for item in data_list:
        # Thực hiện phép tính biến đổi logic học sinh
        val = item * 2.5 + 10
        processed_results.append(val)
        print(f"-> Đã xử lý cụm dữ liệu {item} -> {val}")
    return processed_results

# Chạy bản thử nghiệm
source_data = [12, 45, 78]
result = handle_data_process(source_data)
print("Kết quả hoàn tất chương trình:", result)
`;

  // Test question sample
  const testQuizQuestions = [
    {
      q: "Thiết bị thông minh nào dưới đây thực hiện chức năng xử lý thông tin tự động tương tự máy tính?",
      options: ["Robot hút bụi tự động", "Bóng đèn sợi đốt", "Ổ cắm điện truyền thống", "Quạt gió cơ học"],
      correct: 0
    },
    {
      q: "Trong ngôn ngữ Python, kiểu dữ liệu nào dưới đây dùng để biểu diễn một danh sách có thứ tự?",
      options: ["integer", "boolean", "list", "string"],
      correct: 2
    }
  ];

  const handleQuizAnswer = (qIndex: number, optIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const checkQuizScores = () => {
    let score = 0;
    testQuizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) score++;
    });
    setInteractiveQuizScore(score);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Action Header bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="text-sm font-semibold text-slate-505 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>

        {currentUser.role === 'teacher' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(resource)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200/45 dark:border-slate-700/50 transition-colors cursor-pointer"
            >
              <Edit size={14} /> Chỉnh sửa
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/40 transition-colors cursor-pointer"
            >
              <Trash2 size={14} /> Xóa học liệu
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden">
        
        {/* Dynamic Simulated Preview Dashboard Window */}
        <div className="bg-slate-900 dark:bg-slate-950 p-6 md:p-8 flex flex-col justify-center items-center border-b border-slate-150/40 dark:border-slate-700/50 text-white min-h-[300px] relative">
          
          <AnimatePresence mode="wait">
            {!isPreviewActive ? (
              <motion.div 
                key="summary-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4 max-w-md"
              >
                <div className={`mx-auto w-16 h-16 rounded-2xl ${typeInfo?.bg || 'bg-slate-800'} border border-white/5 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform`}>
                  <DynamicIcon name={TypeIconName} className={typeInfo?.color || 'text-slate-400'} size={32} />
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-slate-100">{resource.file_name}</h3>
                  <p className="text-xs text-slate-400 font-medium">Định dạng file: {resource.file_name.split('.').pop()?.toUpperCase()} • Dung lượng: {resource.file_size}</p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button 
                    onClick={() => setIsPreviewActive(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    <Eye size={14} /> Xem trước học liệu trực tiếp
                  </button>
                  <button 
                    disabled={isDownloading}
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-755 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isDownloading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                    {isDownloading ? 'Đang chuẩn bị...' : 'Tải xuống tệp tin bản đầy đủ'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="interactive-pane"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full h-full min-h-[320px] flex flex-col justify-between"
              >
                {/* Header of previewer */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs">
                  <span className="font-semibold text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Trình xem trước học liệu tương tác số ({typeInfo?.name})
                  </span>
                  <button 
                    onClick={() => setIsPreviewActive(false)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors font-bold text-slate-350 cursor-pointer"
                  >
                    Thoát Xem trước
                  </button>
                </div>

                {/* Simulated File Contents - PowerPoint slides */}
                {resource.resource_type_id === 'rt_ppt' && (
                  <div className="flex-1 flex flex-col justify-between max-w-2xl mx-auto w-full text-center py-4 space-y-6">
                    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl min-h-[160px] flex flex-col justify-center space-y-3">
                      <div className="text-xs text-blue-400 font-bold uppercase tracking-wider">Slide {activeSlide + 1} / 4</div>
                      <h4 className="text-lg font-bold text-white tracking-tight">{powerPointSlides[activeSlide].title}</h4>
                      <ul className="text-left text-xs text-slate-300 space-y-1.5 max-w-md mx-auto list-disc pl-4">
                        <li>{powerPointSlides[activeSlide].bullet1}</li>
                        <li>{powerPointSlides[activeSlide].bullet2}</li>
                        <li>{powerPointSlides[activeSlide].bullet3}</li>
                      </ul>
                    </div>

                    <div className="flex justify-between items-center px-4">
                      <button 
                        disabled={activeSlide === 0}
                        onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        &larr; Slide trước
                      </button>
                      <button 
                        disabled={activeSlide === 3}
                        onClick={() => setActiveSlide(prev => Math.min(3, prev + 1))}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Slide kế tiếp &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* Simulated File Contents - Practice code Python */}
                {resource.resource_type_id === 'rt_prac' && (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    {/* Code screen */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left font-mono text-xs overflow-auto max-h-[220px]">
                      <pre className="text-emerald-400 select-text">{pythonCodeSample}</pre>
                    </div>
                    {/* Shell screen */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-left flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Terminal output:</span>
                        <div className="font-mono text-xs text-slate-300 space-y-1">
                          {simulatedCodeRan ? (
                            <>
                              <p className="text-slate-450">&gt;&gt;&gt; Chạy chương trình {resource.file_name}...</p>
                              <p className="text-emerald-400">Khởi động hệ thống xử lý học liệu Tin học...</p>
                              <p className="text-slate-200">-&gt; Đã xử lý cụm dữ liệu 12 -&gt; 40.0</p>
                              <p className="text-slate-200">-&gt; Đã xử lý cụm dữ liệu 45 -&gt; 122.5</p>
                              <p className="text-slate-200">-&gt; Đã xử lý cụm dữ liệu 78 -&gt; 205.0</p>
                              <p className="text-emerald-400 font-bold">Chương trình biên dịch thành công! (Exit code 0)</p>
                            </>
                          ) : (
                            <p className="text-slate-500 italic">Nhấn nút bên dưới để bắt đầu chương trình Python đính kèm...</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setSimulatedCodeRan(true)}
                        className="mt-4 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Play size={12} /> Khởi chạy chương trình (Python Run)
                      </button>
                    </div>
                  </div>
                )}

                {/* Simulated File Contents - Test / Exam paper */}
                {resource.resource_type_id === 'rt_test' && (
                  <div className="flex-1 space-y-4 max-w-2xl mx-auto w-full text-left overflow-auto max-h-[230px] pr-2">
                    {interactiveQuizScore === null ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-950/20 text-blue-400 font-medium text-xs rounded-xl border border-blue-900/40">
                          Bạn đang mở phiên bản làm thử trắc nghiệm nhanh bổ trợ cho tài liệu kiểm tra này.
                        </div>
                        {testQuizQuestions.map((question, qIdx) => (
                          <div key={qIdx} className="space-y-2">
                            <h5 className="text-xs font-bold text-slate-100">{qIdx + 1}. {question.q}</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {question.options.map((opt, oIdx) => (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() => handleQuizAnswer(qIdx, oIdx)}
                                  className={`p-2 rounded-xl text-xs text-left transition-colors border text-slate-300 font-semibold cursor-pointer ${
                                    selectedAnswers[qIdx] === oIdx 
                                      ? 'bg-blue-600/30 border-blue-500 text-white' 
                                      : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={checkQuizScores}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Nộp bài & Kiểm tra đáp án
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-6 space-y-4">
                        <CheckCircle size={36} className="text-emerald-500 mx-auto" />
                        <div>
                          <h4 className="text-base font-bold text-white">Kết quả bài làm trắc nghiệm nhanh</h4>
                          <p className="text-xs text-slate-400 mt-1">Bạn trả lời đúng {interactiveQuizScore} / {testQuizQuestions.length} câu hỏi trắc nghiệm kiến thức.</p>
                        </div>
                        <button
                          onClick={() => { setInteractiveQuizScore(null); setSelectedAnswers({}); }}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold cursor-pointer text-blue-400"
                        >
                          Làm lại bài trắc nghiệm
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Simulated File Contents - General document / PDF / Sheets reader */}
                {(resource.resource_type_id === 'rt_doc' || resource.resource_type_id === 'rt_img' || resource.resource_type_id === 'rt_mind' || resource.resource_type_id === 'rt_vid') && (
                  <div className="flex-1 flex flex-col justify-center items-center text-center max-w-xl mx-auto py-2">
                    <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-2xl space-y-3.5 max-w-md">
                      <div className="bg-slate-900 p-3.5 rounded-xl inline-block text-blue-400 border border-slate-800">
                        <Database size={24} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">{resource.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Hệ thống đã tải hoàn chỉnh chế độ biên tập và xem nhanh. Bản cập nhật chứa các bảng phân phối đặc tả, đề mục nội dung chi tiết bám sát chương trình Tin học phổ thông Khối {gradeInfo?.name || 'mới'}.
                        </p>
                      </div>
                      <div className="pt-2 text-xs text-slate-500 font-semibold italic">
                        Được cung cấp và đăng tải chính thức bởi {resource.uploaded_by}
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Info panel */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            
            {/* Badges indicators row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-xl border ${typeInfo?.bg} ${typeInfo?.color}`}>
                {typeInfo?.name}
              </span>
              <span className="px-3 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-350 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                {gradeInfo?.name || 'Khối phổ thông'}
              </span>
              {(topicInfo || lessonInfo) && (
                <span className="px-3 py-1 text-xs font-semibold bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-105/20 truncate max-w-[280px]">
                  {lessonInfo?.name || topicInfo?.name.split(':')[0]}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                {resource.title}
              </h1>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {resource.description || 'Chưa có thông tin mô tả đầy đủ từ tác giả tải lên.'}
              </p>
            </div>

          </div>

          {/* Metadata Grid Info blocks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-t border-b border-slate-150/40 dark:border-slate-700/50">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider flex items-center gap-1">
                <Database size={11} /> Tên tập tin
              </p>
              <p className="font-semibold text-slate-900 dark:text-slate-200 text-xs truncate" title={resource.file_name}>
                {resource.file_name}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider flex items-center gap-1">
                <HardDrive size={11} /> Dung lượng
              </p>
              <p className="font-semibold text-slate-900 dark:text-slate-200 text-xs">
                {resource.file_size}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider flex items-center gap-1">
                <User size={11} /> Người tải lên
              </p>
              <p className="font-semibold text-slate-900 dark:text-slate-200 text-xs truncate">
                {resource.uploaded_by}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={11} /> Ngày đăng
              </p>
              <p className="font-semibold text-slate-900 dark:text-slate-200 text-xs">
                {new Date(resource.created_at).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            
            {/* Download/View details stats counter indicators */}
            <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold">
              <span className="bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-200/40 dark:border-slate-700/40">
                {resource.view_count} lượt xem
              </span>
              <span className="bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-200/40 dark:border-slate-700/40">
                {resource.download_count} lượt tải xuống
              </span>
            </div>

            {/* Direct primary download execution */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              {isDownloading ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />}
              {isDownloading ? 'Đang tải xuống...' : 'Tải xuống tập tin gốc'}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
