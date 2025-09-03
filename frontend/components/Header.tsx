import { LogOut, Search, User, Bell } from "lucide-react";
import { User as UserType } from "@/types/LostFound";

interface HeaderProps {
  user: UserType | null;
  onLogin: () => void;
  onLogout: () => void;
}

export function Header({ user, onLogin, onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Search className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Lost & Found</h1>
              <p className="text-sm text-gray-600">Reuniting people with their belongings</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {user.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User size={16} className="text-gray-600" />
                      </div>
                    )}
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-gray-800">
                        {user.full_name || user.username}
                      </p>
                      <p className="text-xs text-gray-600">
                        {user.reputation_score} points
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={onLogout}
                    className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onLogin}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
