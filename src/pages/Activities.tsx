import { useState, useEffect } from "react";
import { PageTransition } from "../components/PageTransition";
import { Activity, Clock, ChevronRight, Loader2, Hash } from "lucide-react";

export default function Activities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const cached = sessionStorage.getItem("activitiesData");
        if (cached) {
          setActivities(JSON.parse(cached));
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("未登录");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/activities", {
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
        setActivities(finalActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
        setError("无法加载活动");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-apple-text flex items-center gap-3">
            <Activity className="w-8 h-8 text-apple-blue" />
            活动
          </h1>
          <p className="text-[15px] text-black/50 mt-1">校园活动与社团参与记录</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.04] overflow-hidden min-h-[300px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center text-[15px] text-red-500">
              {error}
            </div>
          ) : activities.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-black/40">
              <Activity className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-[15px]">暂无活动记录</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {activities.map((activity, index) => {
                let dateStr = "时间待定";
                if (activity.ScheduleDate?.StartDate) {
                  dateStr = activity.ScheduleDate.StartDate.split("T")[0];
                  if (activity.ScheduleDate.EndDate) {
                    dateStr += ` 至 ${activity.ScheduleDate.EndDate.split("T")[0]}`;
                  }
                } else if (activity.StartDate || activity.Date) {
                  dateStr = activity.StartDate || activity.Date;
                }

                const activityId = activity.ID || activity.ActivityID || "N/A";
                const activityName = activity.Name || activity.ActivityName || activity.Title || "未知活动";

                return (
                  <div key={activityId !== "N/A" ? activityId : index} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-black/[0.04] last:border-0 hover:bg-[#f9f9f9] transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/5 text-[11px] font-medium text-black/60">
                          <Hash className="w-3 h-3" />
                          {activityId}
                        </span>
                        <h4 className="text-[16px] font-medium text-apple-text">{activityName}</h4>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <span className="text-[13px] text-black/50 flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> 
                          {dateStr}
                        </span>
                        {activity.phaseType !== undefined && (
                          <span className="text-[13px] text-black/50">
                            阶段: {activity.phaseType}
                          </span>
                        )}
                        {activity.BookingCompletePercentage !== undefined && (
                          <span className="text-[13px] text-black/50">
                            完成度: {activity.BookingCompletePercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center">
                      <button className="px-4 py-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-apple-blue text-[13px] font-medium rounded-full transition-colors">
                        查看详情
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
