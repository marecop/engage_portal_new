import { PageTransition } from "../components/PageTransition";
import { User, Mail, Phone, MapPin, Calendar, BookOpen } from "lucide-react";

export default function StudentDetails() {
  return (
    <PageTransition>
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-apple-text">学生详情</h1>
          <p className="text-[15px] text-black/50 mt-1">查看您的个人信息和学术概况</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="col-span-1 md:col-span-3 bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.04] flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-28 h-28 rounded-full bg-[#f5f5f7] flex items-center justify-center shrink-0">
              <User className="w-10 h-10 text-black/30" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-semibold text-apple-text">张三 (Zhang San)</h2>
              <p className="text-[15px] text-black/50 mt-1">计算机科学与技术 | 2024级</p>
              
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex items-center gap-3 text-[14px] text-black/70">
                  <Mail className="w-4 h-4 text-black/40" />
                  zhangsan@student.edu.cn
                </div>
                <div className="flex items-center gap-3 text-[14px] text-black/70">
                  <Phone className="w-4 h-4 text-black/40" />
                  +86 138 0000 0000
                </div>
                <div className="flex items-center gap-3 text-[14px] text-black/70">
                  <MapPin className="w-4 h-4 text-black/40" />
                  南校区 1号宿舍楼 402
                </div>
                <div className="flex items-center gap-3 text-[14px] text-black/70">
                  <Calendar className="w-4 h-4 text-black/40" />
                  出生日期: 2005-08-15
                </div>
              </div>
            </div>
          </div>

          {/* Academic Status */}
          <div className="col-span-1 md:col-span-2 bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.04]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-[#f5f5f7] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-apple-blue" />
              </div>
              <h3 className="text-[17px] font-semibold text-apple-text">学术概况</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[12px] font-medium text-black/40 uppercase tracking-wider mb-1">当前 GPA</p>
                <p className="text-3xl font-semibold text-apple-text">3.85</p>
              </div>
              <div>
                <p className="text-[12px] font-medium text-black/40 uppercase tracking-wider mb-1">已修学分</p>
                <p className="text-3xl font-semibold text-apple-text">64<span className="text-lg text-black/30 font-medium ml-1">/120</span></p>
              </div>
              <div>
                <p className="text-[12px] font-medium text-black/40 uppercase tracking-wider mb-1">学术状态</p>
                <p className="text-[17px] font-medium text-apple-text mt-1">良好 (Good Standing)</p>
              </div>
              <div>
                <p className="text-[12px] font-medium text-black/40 uppercase tracking-wider mb-1">导师</p>
                <p className="text-[17px] font-medium text-apple-text mt-1">李四 教授</p>
              </div>
            </div>
          </div>

          {/* Quick Actions / Alerts */}
          <div className="col-span-1 bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.04]">
            <h3 className="text-[17px] font-semibold text-apple-text mb-6">近期提醒</h3>
            <div className="space-y-4">
              <div className="pb-4 border-b border-black/[0.04] last:border-0 last:pb-0">
                <p className="text-[14px] font-medium text-apple-text">选课即将截止</p>
                <p className="text-[13px] text-black/50 mt-1">请在周五前完成下学期选课。</p>
              </div>
              <div className="pb-4 border-b border-black/[0.04] last:border-0 last:pb-0">
                <p className="text-[14px] font-medium text-apple-text">期中成绩已发布</p>
                <p className="text-[13px] text-black/50 mt-1">高等数学期中成绩已更新。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
