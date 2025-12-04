import { Link, useNavigate } from "react-router-dom";
import { Plus, Ticket, Building } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import SearchLocationBar from "../SearchLocationBar";
import SearchLocationBarMobile from "../SearchLocationBarMobile";
import MobileMenu from "./MobileMenu";
import { useState, useEffect, useRef } from "react";
import UpgradeModal from "../UpgradeModal";
import AiventImage from "../../assets/Aivent.png";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [fallbackAvatar, setFallbackAvatar] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        openDropdown &&
        dropdownRef.current &&
        avatarRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !avatarRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openDropdown]);

  const handleLogout = () => {
    setOpenDropdown(false);
    logout();
    navigate("/"); // redirect to landing page
  };

  // Toggle dropdown only on **trusted (user) clicks**
  const handleAvatarClick = (e: React.MouseEvent) => {
    // Only toggle when the click is a real user click (not synthetic)
    if (!e.isTrusted) return;
    // On mobile, open mobile menu; on desktop, open dropdown
    if (window.innerWidth < 768) {
      setShowMobileMenu(true);
    } else {
      setOpenDropdown((prev) => !prev);
    }
  };

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 w-full bg-slate-950/80 backdrop-blur-xl z-30 border-b border-white/5 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          
          {/* Logo - Always visible on mobile */}
          <Link to="/" className="flex items-center min-w-0 flex-shrink-0">
            <img src={AiventImage} alt="Aivent" className="h-8 sm:h-10 md:h-11 w-auto" />
          </Link>

          {/* Center Search - Desktop only */}
          <div className="hidden md:flex flex-1 justify-center max-w-2xl mx-4">
            <SearchLocationBar />
          </div>

          {/* Right side - Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4 relative">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setShowUpgradeModal(true)} className="cursor-pointer hidden lg:inline-flex">
                  Pricing
                </Button>

                <Button variant="ghost" size="sm" asChild className="hidden lg:inline-flex">
                  <Link to="/explore">Explore</Link>
                </Button>

                <Button size="sm" asChild>
                  <Link to="/create-event">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Create Event</span>
                  </Link>
                </Button>

                <Button variant="ghost" size="sm" asChild className="hidden lg:inline-flex">
                  <Link to="/my-tickets">
                    <Ticket className="w-4 h-4 mr-1" />
                    Tickets
                  </Link>
                </Button>

                <Button variant="ghost" size="sm" asChild className="hidden lg:inline-flex">
                  <Link to="/my-events">
                    <Building className="w-4 h-4 mr-1" />
                    Events
                  </Link>
                </Button>

                {/* Avatar (image or initials fallback) - Desktop */}
                {!fallbackAvatar ? (
                  <div ref={avatarRef}
                       className="w-9 h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden border border-gray-300 shadow-md cursor-pointer flex-shrink-0"
                       onClick={handleAvatarClick}
                  >
                    <img
                      src={`https://robohash.org/${encodeURIComponent(user.email)}?set=set4&bgset=bg2&size=100x100`}
                      alt="avatar"
                      className="w-full h-full object-cover block"
                      onError={() => setFallbackAvatar(true)}
                    />
                  </div>
                ) : (
                  <div
                    ref={avatarRef}
                    onClick={handleAvatarClick}
                    className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-full cursor-pointer
                    bg-indigo-500 text-white font-bold border border-gray-300 shadow-md flex-shrink-0"
                  >
                    {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                )}

                {/* Dropdown - Desktop only */}
                {openDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-14 right-0 w-80 rounded-xl shadow-xl border border-gray-600 p-4 z-50
                    bg-gray-700 text-white opacity-0 translate-y-[-6px] scale-95 animate-dropdown"
                    role="dialog"
                    aria-label="User menu"
                  >
                    <p className="text-sm font-semibold mb-1">Name: {user?.name}</p>
                    <p className="text-sm font-semibold mb-1 mt-3">Email: {user?.email}</p>
                    <hr className="border-gray-500 my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md cursor-pointer transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden lg:inline-flex">
                  <Link to="/explore">Explore</Link>
                </Button>

                <Button size="sm" asChild>
                  <Link to="/sign-in">Sign In</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile: Avatar only */}
          <div className="md:hidden flex items-center">
            {user ? (
              !fallbackAvatar ? (
                <div
                  className="w-9 h-9 rounded-full overflow-hidden border border-gray-300 shadow-md cursor-pointer flex-shrink-0"
                  onClick={handleAvatarClick}
                >
                  <img
                    src={`https://robohash.org/${encodeURIComponent(user.email)}?set=set4&bgset=bg2&size=100x100`}
                    alt="avatar"
                    className="w-full h-full object-cover block"
                    onError={() => setFallbackAvatar(true)}
                  />
                </div>
              ) : (
                <div
                  onClick={handleAvatarClick}
                  className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer
                  bg-indigo-500 text-white font-bold border border-gray-300 shadow-md flex-shrink-0"
                >
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
              )
            ) : (
              <Button size="sm" asChild>
                <Link to="/sign-in">Sign In</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search Section - Below navbar */}
        <div className="md:hidden border-t border-white/5 px-4 py-4 bg-slate-950/95">
          <SearchLocationBarMobile />
        </div>
      </nav>

      {/* Mobile Menu Modal */}
      <MobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        onShowUpgrade={() => setShowUpgradeModal(true)}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="header"
      />
    </>
  );
}