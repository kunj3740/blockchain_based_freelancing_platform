import { Button } from "./ui/button";
import { Menu, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";

const categories = [
  "Graphics & Design",
  "Digital Marketing",
  "Writing & Translation",
  "Video & Animation",
  "Music & Audio",
  "Programming & Tech",
  "Business",
  "Lifestyle",
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [jurorStatus, setJurorStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Get user's first initial if logged in
    if (token) {
      try {
        const userData = localStorage.getItem("user");

        if (userData) {
          const user = JSON.parse(userData);
          console.log("User data:", user);
          setUserRole(user.role);
          checkJurorStatus(user.id);
          setUserId(user.id);
          if (user.firstName && user.firstName.length > 0) {
            setUserInitial(user.firstName.charAt(0).toUpperCase());
          }
        
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUserInitial("U");
      }
    }
  }, []);

  const checkJurorStatus = async (userId : any) => {
    if (userId) {
      try {
        const jurorRes = await axios.get(`http://localhost:8000/api/freelancers/juror/${userId}`);
        if (jurorRes.status === 200) {
          setJurorStatus(jurorRes.data);
        }
        console.log("Juror status:", jurorRes.data);
      } catch (error) {
        console.error("Error checking juror status:", error);
        setJurorStatus(null);
      }
    }
  };

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setJurorStatus(null);
    navigate("/");
  };

  const handleProfileClick = () => {
    if (userRole === "freelancer") {
      navigate("/freelancer/profile");
    } else if (userRole === "client") {
      navigate("/client/profile");
    }
  };

  const handleJurorDashboardClick = () => {
    navigate("/juror/dash");
  };

  return (
    <nav className="border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <div className="flex flex-shrink-0 items-center">
              <Link to="/" className="text-2xl font-bold text-green-600">
                FreeLance
              </Link>
            </div>
            
            {/* Juror Dashboard Button - only show if user is a juror */}
            {/* {isLoggedIn && jurorStatus && jurorStatus.isAvailable && (
              <div className="ml-6">
                <Button 
                  variant="outline" 
                  onClick={handleJurorDashboardClick}
                  className="flex items-center"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="mr-2 h-4 w-4" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="m22 12-4 4-1.3-1.3"/>
                    <path d="m22 12-4-4-1.3 1.3"/>
                    <path d="M12 20a8 8 0 1 1 0-16"/>
                    <path d="M12 16v-4l3-2"/>
                  </svg>
                  Juror Dashboard
                </Button>
              </div>
            )} */}
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarFallback className="bg-green-600 text-white">
                        {userInitial || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleProfileClick}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer hover:bg-red-700"
                  >
                    <LogOut className="mr-2 h-4 w-4 hover:bg-red-700" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/freelancer/auth" state={{ role: "freelancer" }}>
                  <Button className="cursor-pointer">
                    Become a Freelancer
                  </Button>
                </Link>
                <Link to="/client/auth">
                  <Button className="cursor-pointer" variant="outline">
                    Sign in
                  </Button>
                </Link>
                <Link to="/client/auth">
                  <Button className="cursor-pointer">Join</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/categories/${category
                  .toLowerCase()
                  .replace(/ & /g, "-")}`}
                className="block px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              >
                {category}
              </Link>
            ))}
            <div className="mt-4 space-y-2 px-3">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <Button
                    className="w-full flex items-center justify-center gap-2"
                    variant="outline"
                    onClick={handleProfileClick}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                  
                  {/* Mobile Juror Dashboard button - only show if user is a juror */}
                  {/* {jurorStatus && jurorStatus.isAvailable && (
                    <Button
                      className="w-full flex items-center justify-center gap-2"
                      variant="outline"
                      onClick={handleJurorDashboardClick}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="m22 12-4 4-1.3-1.3"/>
                        <path d="m22 12-4-4-1.3 1.3"/>
                        <path d="M12 20a8 8 0 1 1 0-16"/>
                        <path d="M12 16v-4l3-2"/>
                      </svg>
                      Juror Dashboard
                    </Button>
                  )} */}
                  
                  <Button
                    className="w-full flex items-center justify-center gap-2"
                    variant="outline"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button className="w-full" variant="outline">
                    Sign in
                  </Button>
                  <Button className="w-full">Join</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}