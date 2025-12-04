import { Link, useNavigate } from "react-router-dom";
import { Plus, Ticket, Building, X, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onShowUpgrade: () => void;
}

export default function MobileMenu({ isOpen, onClose, onShowUpgrade }: MobileMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onClose();
    logout();
    navigate("/");
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full h-screen max-h-screen m-0 rounded-none sm:rounded-lg flex flex-col p-0 bg-slate-900 border-0 fixed inset-0 sm:inset-auto sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-md">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
              Menu
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* User Profile Section */}
          {user && (
            <div className="mb-6 pb-6 border-b border-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-white truncate">{user.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-2">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base cursor-pointer hover:bg-purple-500/10"
                  onClick={() => {
                    onShowUpgrade();
                    handleLinkClick();
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-3" />
                  Pricing
                </Button>

                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start h-12 text-base cursor-pointer hover:bg-purple-500/10"
                  onClick={handleLinkClick}
                >
                  <Link to="/explore">
                    <Building className="w-5 h-5 mr-3" />
                    Explore
                  </Link>
                </Button>

                <Button
                  asChild
                  className="w-full justify-start h-12 text-base bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 cursor-pointer"
                  onClick={handleLinkClick}
                >
                  <Link to="/create-event">
                    <Plus className="w-5 h-5 mr-3" />
                    Create Event
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start h-12 text-base cursor-pointer hover:bg-purple-500/10"
                  onClick={handleLinkClick}
                >
                  <Link to="/my-tickets">
                    <Ticket className="w-5 h-5 mr-3" />
                    Tickets
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start h-12 text-base cursor-pointer hover:bg-purple-500/10"
                  onClick={handleLinkClick}
                >
                  <Link to="/my-events">
                    <Building className="w-5 h-5 mr-3" />
                    Events
                  </Link>
                </Button>

                <div className="pt-4 mt-4 border-t border-gray-800">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 text-base text-red-400 hover:bg-red-500/10 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start h-12 text-base cursor-pointer hover:bg-purple-500/10"
                  onClick={handleLinkClick}
                >
                  <Link to="/explore">
                    <Building className="w-5 h-5 mr-3" />
                    Explore
                  </Link>
                </Button>

                <Button
                  asChild
                  className="w-full justify-start h-12 text-base bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 cursor-pointer"
                  onClick={handleLinkClick}
                >
                  <Link to="/sign-in">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

