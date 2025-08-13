import React, { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { HiMenuAlt3 } from "react-icons/hi";
import { ChevronDown } from "lucide-react";

export default function Header() {
  const { user, isAuthed, logout, ready } = useAuth();
  const [open, setOpen] = useState(false);

  const initials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(s => s[0]?.toUpperCase())
      .join("") || "U";

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-white shadow-sm">
      <div className="flex justify-between items-center h-16 px-6 border-b">
        {/* Left: breadcrumb/title */}
        <div className="flex items-center gap-2 text-gray-600">
          <HiMenuAlt3 className="text-xl" />
          <span className="text-sm font-medium">Package</span>
        </div>

        {/* Right: auth area */}
        <div className="flex items-center gap-3 relative">
          {!ready ? (
            // tiny skeleton while auth state loads
            <div className="w-28 h-9 rounded-full bg-gray-100 animate-pulse" />
          ) : !isAuthed ? (
            <a
              href="/login"
              className="text-sm text-blue-600 hover:underline"
            >
              Sign In
            </a>
          ) : (
            <>
              <button
                onClick={() => setOpen(v => !v)}
                onBlur={() => setTimeout(() => setOpen(false), 120)}
                className="flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-gray-50"
                aria-haspopup="menu"
                aria-expanded={open}
              >
                {/* Avatar with initials */}
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-blue-700"
                  style={{ background: "rgba(1,93,224,.12)" }}
                  title={user?.name}
                >
                  {initials(user?.name)}
                </span>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-sm text-gray-800">
                    {user?.name || "User"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user?.email}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-500" />
              </button>

              {/* Dropdown */}
              {open && (
                <div
                  className="absolute right-0 top-12 w-56 bg-white border rounded-md shadow-md py-2"
                  role="menu"
                >
                  <a
                    href="/"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </a>
                  <a
                    href="/admin/users"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    Users
                  </a>
                  <div className="my-1 h-px bg-gray-100" />
                  <button
                    className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    role="menuitem"
                    onClick={async () => {
                      await logout();
                      setOpen(false);
                      // optional: redirect to login
                      window.location.replace("/login");
                    }}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
