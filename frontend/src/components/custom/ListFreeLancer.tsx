import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Star, User2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface Freelancer {
  _id: string;
  firstName: string;
  lastName: string;
  professionalTitle: string;
  description: string;
  hourlyRate: number;
  skills: string[];
  avatar: string;
}

export function ListFreeLancer() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const fetchFreelancers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get<{ data: Freelancer[] }>(
        `${BACKEND_URL}/api/freelancers/getAllFreelancer`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setFreelancers(response.data.data);
      setFilteredFreelancers(response.data.data);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, []);

  // Filter freelancers based on search query and selected skill
  useEffect(() => {
    let result = freelancers;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (freelancer) =>
          freelancer.firstName.toLowerCase().includes(query) ||
          freelancer.lastName.toLowerCase().includes(query) ||
          freelancer.professionalTitle.toLowerCase().includes(query) ||
          freelancer.description.toLowerCase().includes(query) ||
          freelancer.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    if (selectedSkill) {
      result = result.filter((freelancer) =>
        freelancer.skills.some((skill) => skill === selectedSkill)
      );
    }

    setFilteredFreelancers(result);
  }, [searchQuery, selectedSkill, freelancers]);

  // Get unique skills from all freelancers
  const allSkills = Array.from(
    new Set(freelancers.flatMap((freelancer) => freelancer.skills))
  ).slice(0, 4); // Limit to 4 popular skills

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-green-50 via-white to-white">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-green-300 blur-3xl" />
        <div className="absolute top-1/2 -left-24 h-64 w-64 rounded-full bg-green-200 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 mb-5">
            <Star className="mr-1 h-3.5 w-3.5" />
            <span>Exceptional Talent Pool</span>
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Browse Our{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Trusted Freelancers
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Connect with skilled professionals ready to bring your projects to
            life with blockchain-secured contracts and transparent workflows.
          </p>

          <div className="mt-8 flex w-full max-w-2xl items-center">
            <div className="relative flex-1">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, title, or skills"
                className="w-full rounded-l-md border border-r-0 border-gray-300 py-6 pl-10 pr-3 focus-visible:ring-green-500"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            <Button
              onClick={() => setSearchQuery(searchQuery)}
              className="inline-flex h-12 items-center justify-center rounded-r-md bg-gradient-to-r from-green-600 to-emerald-600 px-6 font-medium text-white transition-all hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Search
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Freelancer Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredFreelancers.map((freelancer) => (
            <div
              key={freelancer._id}
              className="group flex flex-col bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all hover:shadow-lg hover:border-green-100 hover:translate-y-[-4px]"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {freelancer.avatar ? (
                    <img
                      src={freelancer.avatar}
                      alt={`${freelancer.firstName} ${freelancer.lastName}`}
                      className="h-16 w-16 rounded-full object-cover border-2 border-green-100"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-50 border-2 border-green-100">
                      <User2 className="h-8 w-8 text-green-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {freelancer.firstName} {freelancer.lastName}
                    </h3>
                    <p className="text-green-700 font-medium">
                      {freelancer.professionalTitle}
                    </p>
                    <p className="mt-1 text-sm text-green-600 font-semibold">
                      ${freelancer.hourlyRate}/hr
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-gray-600 line-clamp-3">
                  {freelancer.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {freelancer.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-auto p-4 pt-2 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {freelancer.skills.length} skills listed
                </span>
                <Link
                  to={`/chat/${freelancer._id}`}
                  className="group inline-flex items-center justify-center rounded-md bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 font-medium text-white transition-all hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Contact
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredFreelancers.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-800">
              No freelancers found
            </h3>
            <p className="text-gray-600 mt-2">
              Try adjusting your search criteria
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedSkill(null);
              }}
              className="mt-4 bg-green-100 text-green-700 hover:bg-green-200"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
