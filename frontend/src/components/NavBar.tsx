//navbar
import { Button } from "./ui/button";
import { Menu, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

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

  return (
    <nav className="border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link to="/" className="text-2xl font-bold text-green-600">
                FreeLance
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for services"
                className="w-96 rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <Link to="/freelancer/auth" state={{ role: "freelancer" }}>
                <Button>Become a Freelancer</Button>
                </Link>
                <Link to="/client/auth" >
                <Button variant="outline">Sign in</Button>
                </Link>
                <Link to="/client/auth">
                <Button>Join</Button>
                </Link>

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

      <div className="hidden border-t sm:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center space-x-8">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/categories/${category
                  .toLowerCase()
                  .replace(/ & /g, "-")}`}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                {category}
              </Link>
            ))}
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
              <Button className="w-full" variant="outline">
                Sign in
              </Button>
              <Button className="w-full">Join</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}