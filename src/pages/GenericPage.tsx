import { PageTransition } from "../components/PageTransition";
import { LucideIcon } from "lucide-react";

interface GenericPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function GenericPage({ title, description, icon: Icon }: GenericPageProps) {
  return (
    <PageTransition className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
          <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>
      
      <div className="p-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
        <Icon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">即将推出</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          此功能正在开发中。我们正在努力为您带来更好的体验，敬请期待。
        </p>
      </div>
    </PageTransition>
  );
}
