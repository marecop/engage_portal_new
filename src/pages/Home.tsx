import { PageTransition } from "../components/PageTransition";
import { Calendar, BookOpen, Activity, Clock, MapPin, ChevronRight, Loader2, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const enrolledCourses = [
  { id: 1, name: "高等数学", code: "MATH101", time: "周一 08:00", location: "教学楼A 101" },
  { id: 2, name: "大学物理", code: "PHYS101", time: "周四 08:00", location: "实验楼B 203" },
  { id: 3, name: "计算机科学导论", code: "CS101", time: "周三 10:00", location: "机房C 405" },
];

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

export default function Home() {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [activitiesError, setActivitiesError] = useState("");

  const [todayClasses, setTodayClasses] = useState<Lesson[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [classesError, setClassesError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const cached = sessionStorage.getItem("activitiesData");
        if (cached) {
          const parsedCached = JSON.parse(cached);
          setActivities(parsedCached.slice(0, 5));
          setIsLoadingActivities(false);
          return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
          setActivitiesError("未登录");
          setIsLoadingActivities(false);
          return;
        }

        const response = await fetch("/api/activities", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          localStorage.removeItem("authToken");
          setActivitiesError("登录已过期，请重新登录");
          setIsLoadingActivities(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }

        const data = await response.json();
        let parsedData = data;
        if (data && data.d) {
          try {
            parsedData = JSON.parse(data.d);
          } catch (e) {
            parsedData = data.d;
          }
        }
        
        let finalActivities = [];
        if (Array.isArray(parsedData)) {
          finalActivities = parsedData;
        } else if (parsedData && Array.isArray(parsedData.Data)) {
          finalActivities = parsedData.Data;
        } else if (parsedData && Array.isArray(parsedData.schedules)) {
          finalActivities = parsedData.schedules;
        }
        
        sessionStorage.setItem("activitiesData", JSON.stringify(finalActivities));
        setActivities(finalActivities.slice(0, 5));
      } catch (error) {
        console.error("Error fetching activities:", error);
        setActivitiesError("无法加载活动");
      } finally {
        setIsLoadingActivities(false);
      }
    };

    const fetchTimetable = async () => {
      try {
        const cached = sessionStorage.getItem("timetableData");
        if (cached) {
          const data = JSON.parse(cached);
          const allLessons: Lesson[] = data.lessons || [];
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const todayName = days[new Date().getDay()];
          const todays = allLessons.filter(l => l.day === todayName);
          setTodayClasses(todays);
          setIsLoadingClasses(false);
          return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
          setClassesError("未登录");
          setIsLoadingClasses(false);
          return;
        }

        const response = await fetch("/api/timetable", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch timetable");

        const data = await response.json();
        sessionStorage.setItem("timetableData", JSON.stringify(data));
        
        const allLessons: Lesson[] = data.lessons || [];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[new Date().getDay()];
        const todays = allLessons.filter(l => l.day === todayName);
        setTodayClasses(todays);
      } catch (error) {
        console.error("Error fetching timetable:", error);
        setClassesError("无法加载课程表");
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchActivities();
    fetchTimetable();
  }, []);

  return (
    <PageTransition>
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-apple-text">主页</h1>
          <p className="text-[15px] text-black/50 mt-1">欢迎回来，这是您今天的概览</p>
        </div>

        {/* Courses Section */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[19px] font-semibold text-apple-text">我的选课科目</h2>
            <Link to="/grades" className="text-[14px] font-medium text-apple-blue hover:text-apple-blue-hover flex items-center">
              全部课程 <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {enrolledCourses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.04] hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] flex items-center justify-center mb-4 text-apple-blue">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-[17px] font-semibold text-apple-text">{course.name}</h3>
                <p className="text-[13px] text-black/50 mb-4">{course.code}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-[13px] text-black/60">
                    <Clock className="w-4 h-4 text-black/40" /> {course.time}
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px] text-black/60">
                    <MapPin className="w-4 h-4 text-black/40" /> {course.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Schedule Section */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-[19px] font-semibold text-apple-text">今日日程</h2>
              <Link to="/schedule" className="text-[14px] font-medium text-apple-blue hover:text-apple-blue-hover flex items-center">
                完整课表 <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.04] overflow-hidden min-h-[200px] relative">
              {isLoadingClasses ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-apple-blue animate-spin" />
                </div>
              ) : classesError ? (
                <div className="absolute inset-0 flex items-center justify-center text-[13px] text-red-500">
                  {classesError}
                </div>
              ) : todayClasses.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-black/40">
                  <BookOpen className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-[13px]">今天没有课程安排</p>
                </div>
              ) : (
                <div className="flex flex-col p-2">
                  {todayClasses.map((lesson, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 rounded-xl hover:bg-[#f9f9f9] transition-colors">
                      <div className="flex flex-col items-center min-w-[60px] pt-1">
                        <span className="text-[14px] font-semibold text-apple-text">{lesson.startTime}</span>
                        <span className="text-[11px] font-medium text-black/40">{lesson.endTime}</span>
                      </div>
                      <div className="w-0.5 h-10 bg-black/5 rounded-full mt-1"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-[15px] font-medium text-apple-text">{lesson.subject}</h4>
                          {lesson.period && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/5 text-black/50">
                              {lesson.period}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[12px] text-black/50">
                          {lesson.room && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {lesson.room}
                            </span>
                          )}
                          {lesson.teacher && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" /> {lesson.teacher}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Activities Section */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-[19px] font-semibold text-apple-text">近期活动</h2>
              <Link to="/activities" className="text-[14px] font-medium text-apple-blue hover:text-apple-blue-hover flex items-center">
                更多活动 <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.04] overflow-hidden min-h-[150px] relative">
              {isLoadingActivities ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-apple-blue animate-spin" />
                </div>
              ) : activitiesError ? (
                <div className="absolute inset-0 flex items-center justify-center text-[13px] text-red-500">
                  {activitiesError}
                </div>
              ) : activities.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-[13px] text-black/40">
                  暂无近期活动
                </div>
              ) : (
                <div className="flex flex-col">
                  {activities.map((activity, index) => {
                    let dateStr = "时间待定";
                    if (activity.ScheduleDate?.StartDate) {
                      dateStr = activity.ScheduleDate.StartDate.split("T")[0];
                    } else if (activity.StartDate || activity.Date) {
                      dateStr = activity.StartDate || activity.Date;
                    }

                    return (
                      <div key={activity.ID || activity.ActivityID || index} className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04] last:border-0 hover:bg-[#f9f9f9] transition-colors cursor-pointer">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-black/5 text-[10px] font-medium text-black/50">
                              #{activity.ID || activity.ActivityID || "N/A"}
                            </span>
                            <h4 className="text-[15px] font-medium text-apple-text">{activity.Name || activity.ActivityName || activity.Title || "未知活动"}</h4>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[12px] font-medium text-black/50">{activity.Category || activity.Type || "活动日程"}</span>
                            <span className="text-[12px] text-black/40 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> 
                              {dateStr}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-black/20" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
