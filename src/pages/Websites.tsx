import { PageTransition } from "../components/PageTransition";
import { ExternalLink, Building2, Layout } from "lucide-react";

const websites = [
  {
    id: 1,
    title: "学校官方网站",
    description: "ULink College 官方主页，获取最新学校资讯与公告",
    url: "https://www.ulinkcollege.com",
    icon: Building2,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50"
  },
  {
    id: 2,
    title: "学校 Landing Page",
    description: "SharePoint 学生专属门户入口",
    url: "https://guischina.sharepoint.com/sites/ulcstudentportal",
    icon: Layout,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-50"
  }
];

export default function Websites() {
  return (
    <PageTransition>
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-apple-text">网站</h1>
          <p className="text-[15px] text-black/50 mt-1">常用学术与校园资源链接</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.04] overflow-hidden">
          <div className="flex flex-col">
            {websites.map((site) => (
              <a
                key={site.id}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-6 py-5 border-b border-black/[0.04] last:border-0 hover:bg-[#f9f9f9] transition-colors group"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-xl ${site.bgColor} flex items-center justify-center shrink-0`}>
                    <site.icon className={`w-6 h-6 ${site.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-medium text-apple-text group-hover:text-apple-blue transition-colors">
                      {site.title}
                    </h3>
                    <p className="text-[13px] text-black/50 mt-0.5">{site.description}</p>
                    <p className="text-[12px] text-black/30 mt-1.5 font-mono truncate max-w-[200px] sm:max-w-md md:max-w-lg">
                      {site.url}
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center group-hover:bg-apple-blue group-hover:text-white transition-colors text-black/30 shrink-0 ml-4">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
