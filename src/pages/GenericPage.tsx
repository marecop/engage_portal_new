import { PageTransition } from "../components/PageTransition";
import { LucideIcon } from "lucide-react";

interface GenericPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function GenericPage({ title, description, icon: Icon }: GenericPageProps) {
  return (
    <PageTransition>
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-apple-text">{title}</h1>
          <p className="text-[15px] text-black/50 mt-1">{description}</p>
        </div>

        <div className="h-[50vh] bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.04] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#f5f5f7] flex items-center justify-center mb-5">
            <Icon className="w-8 h-8 text-black/30" />
          </div>
          <h2 className="text-[19px] font-semibold text-apple-text">内容建设中</h2>
          <p className="text-[14px] text-black/50 mt-2 max-w-sm">
            此页面的后端接口尚未连接。一旦 API 准备就绪，这里将展示完整的 {title} 数据。
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
