import React from 'react';

interface LayoutProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  isSidebarCollapsed?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  left,
  center,
  right,
  isSidebarCollapsed = false,
}) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F9FAFB]">
      {/* Left Panel: Context & Sources */}
      <aside
        className={`hidden lg:flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ${isSidebarCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-72 lg:w-80'}`}>
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#0551BA] flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <h1 className="font-semibold text-lg tracking-tight text-[#0551BA]">
            Giya Compass
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          {left}
        </div>
      </aside>

      {/* Center Panel: Thinking Space */}
      <main className="flex-1 flex flex-col bg-white overflow-y-auto no-scrollbar relative">
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col px-6 md:px-12 py-8">
          {center}
        </div>
      </main>

      {/* Right Panel: Insights & Actions */}
      <aside className="hidden xl:flex flex-col w-80 lg:w-96 border-l border-gray-200 bg-[#F9FAFB] overflow-y-auto no-scrollbar">
        <div className="p-6">{right}</div>
      </aside>
    </div>
  );
};
