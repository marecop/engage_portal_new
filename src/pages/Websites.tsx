import { PageTransition } from "../components/PageTransition";
import { ExternalLink } from "lucide-react";

export default function Websites() {
  const links = [
    { title: "学校官网", url: "https://www.ulinkcollege.com", description: "ULink College 官方网站" },
    { title: "Engage Portal", url: "https://ulinkcollege.engagehosted.cn", description: "原版 ULC Engage 学生门户" },
    { title: "广州优联国际学校", url: "https://www.guiscn.com", description: "GUIS 官方网站" },
    {title: "Landing Page", url: "https://guischina.sharepoint.com/sites/ulcstudentportal", description: "GUIS 学生着陆页面" },
  ];

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">相关网站</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {link.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {link.description}
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </div>
          </a>
        ))}
      </div>
    </PageTransition>
  );
}
