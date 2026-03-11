import { useState, useEffect } from "react";
import { PageTransition } from "../components/PageTransition";
import { Loader2, Calendar, MapPin, User, Clock, BookOpen } from "lucide-react";

interface Lesson {
  day: string;
  startTime: string;
  endTime: string;
  time: string;
  subject: string;
  room: string;
  teacher: string;
  period: string;
}

const getSubjectColor = (subject: string) => {
  const colors = [
    'bg-blue-50 text-blue-700 ring-blue-600/20',
    'bg-purple-50 text-purple-700 ring-purple-600/20',
    'bg-pink-50 text-pink-700 ring-pink-600/20',
    'bg-green-50 text-green-700 ring-green-600/20',
    'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
    'bg-orange-50 text-orange-700 ring-orange-600/20',
    'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  ];
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function Schedule() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const todayIndex = new Date().getDay() - 1;
  const initialDay = todayIndex >= 0 && todayIndex < 5 ? days[todayIndex] : 'Monday';
  const [selectedDay, setSelectedDay] = useState(initialDay);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const cached = sessionStorage.getItem("timetableData");
        if (cached) {
          const data = JSON.parse(cached);
          setLessons(data.lessons || []);
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("未登录");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/timetable", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          localStorage.removeItem("authToken");
          setError("登录已过期，请重新登录");
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch timetable");
        }

        const data = await response.json();
        sessionStorage.setItem("timetableData", JSON.stringify(data));
        setLessons(data.lessons || []);
      } catch (error) {
        console.error("Error fetching timetable:", error);
        setError("无法加载课程表");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  const dayLessons = lessons.filter(l => l.day === selectedDay);

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-apple-text flex items-center gap-3">
            <Calendar className="w-8 h-8 text-apple-blue" />
            周时间表
          </h1>
          <p className="text-[15px] text-black/50 mt-1">查看您本周的课程安排</p>
        </div>

        {/* Day Selector */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
          <div className="flex space-x-2 bg-black/5 p-1 rounded-xl">
            {days.map(day => {
              const dayMap: Record<string, string> = {
                'Monday': '周一',
                'Tuesday': '周二',
                'Wednesday': '周三',
                'Thursday': '周四',
                'Friday': '周五'
              };
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-5 py-2 rounded-lg text-[14px] font-medium transition-all whitespace-nowrap ${
                    selectedDay === day 
                      ? 'bg-white text-apple-text shadow-sm ring-1 ring-black/5' 
                      : 'text-black/50 hover:text-black/80 hover:bg-black/5'
                  }`}
                >
                  {dayMap[day]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-[400px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center text-[15px] text-red-500">
              {error}
            </div>
          ) : dayLessons.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-black/40">
              <BookOpen className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-[15px]">今天没有课程安排</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dayLessons.map((lesson, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.04] flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:shadow-md transition-shadow"
                >
                  {/* Time Column */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end sm:w-24 shrink-0 gap-2 sm:gap-0">
                    <span className="text-lg font-semibold text-apple-text tracking-tight">{lesson.startTime}</span>
                    <span className="text-black/30 hidden sm:block h-3 border-l-2 border-dashed border-black/10 my-1 mr-4"></span>
                    <span className="text-sm font-medium text-black/40">{lesson.endTime}</span>
                  </div>

                  {/* Vertical Divider (Desktop) */}
                  <div className="hidden sm:block w-px h-16 bg-black/[0.04]"></div>

                  {/* Content Column */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${getSubjectColor(lesson.subject)}`}>
                        {lesson.subject}
                      </span>
                      {lesson.period && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-black/5 text-black/60">
                          {lesson.period}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                      {lesson.room && (
                        <div className="flex items-center gap-1.5 text-[13px] text-black/60">
                          <MapPin className="w-4 h-4 text-black/40" />
                          {lesson.room}
                        </div>
                      )}
                      {lesson.teacher && (
                        <div className="flex items-center gap-1.5 text-[13px] text-black/60">
                          <User className="w-4 h-4 text-black/40" />
                          {lesson.teacher}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
