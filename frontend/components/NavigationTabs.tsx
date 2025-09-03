import { Search, Users, MessageSquare } from "lucide-react";

interface NavigationTabsProps {
  activeTab: 'lost-found' | 'collaboration' | 'messages';
  onTabChange: (tab: 'lost-found' | 'collaboration' | 'messages') => void;
}

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  const tabs = [
    {
      id: 'lost-found' as const,
      label: 'Lost & Found',
      icon: Search,
      description: 'Find and report lost items'
    },
    {
      id: 'collaboration' as const,
      label: 'Collaborate',
      icon: Users,
      description: 'Connect with like-minded people'
    },
    {
      id: 'messages' as const,
      label: 'Messages',
      icon: MessageSquare,
      description: 'Your conversations'
    },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon 
                size={20} 
                className={`transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} 
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}