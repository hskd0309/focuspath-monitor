import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LogOut, User, Settings, Menu } from 'lucide-react';

interface NavigationProps {
  userType: 'student' | 'staff' | 'admin' | 'counsellor';
  userName: string;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ userType, userName, currentPage, onPageChange }) => {
  const { signOut, profile } = useAuth();

  const getMenuItems = () => {
    switch (userType) {
      case 'student':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'assignments', label: 'Assignments' },
          { id: 'tests', label: 'Tests' },
          { id: 'chat', label: 'Group Chat' },
          { id: 'feedback', label: 'Feedback' },
          { id: 'profile', label: 'Profile' }
        ];
      case 'staff':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'cse-k', label: 'CSE-K Analytics' },
          { id: 'cse-d', label: 'CSE-D Analytics' },
          { id: 'students', label: 'Student Monitor' },
          { id: 'reports', label: 'Reports' }
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'students', label: 'Student Management' },
          { id: 'staff', label: 'Data Management' },
          { id: 'settings', label: 'ML Settings' },
          { id: 'reports', label: 'Reports' }
        ];
      case 'counsellor':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'referrals', label: 'Student Referrals' },
          { id: 'sessions', label: 'Counselling Sessions' },
          { id: 'reports', label: 'Wellness Reports' }
        ];
      default:
        return [];
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const menuItems = getMenuItems();
  const displayName = profile?.full_name || userName;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">ERP</span>
              <span className="ml-1 text-sm text-gray-500 capitalize">{userType}</span>
            </div>

            {/* Desktop Navigation Menu */}
            <div className="hidden md:flex space-x-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Menu and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <div className="flex flex-col space-y-4 mt-8">
                    <div className="px-4 py-2">
                      <h3 className="font-semibold text-gray-800 capitalize">{userType} Menu</h3>
                    </div>
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onPageChange(item.id)}
                        className={`text-left px-4 py-3 rounded-lg transition-colors ${
                          currentPage === item.id 
                            ? 'bg-blue-100 text-blue-800 font-medium' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* User Info - Hidden on mobile */}
            <span className="hidden sm:block text-sm text-gray-700">
              Welcome, <span className="font-medium">{displayName}</span>
            </span>
            
            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="px-2 py-1.5 text-sm font-medium">
                  {displayName}
                </div>
                <div className="px-2 py-1.5 text-xs text-gray-500 capitalize">
                  {userType} Account
                </div>
                <DropdownMenuItem className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;