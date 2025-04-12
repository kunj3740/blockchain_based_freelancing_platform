import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../config";
import { Link } from "react-router-dom";

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

export const ListFreeLancer = () => {
  const [freelancer, setFreelancer] = useState<Freelancer[]>([]);

  const fetchFreelancer = async () => {
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

      setFreelancer(response.data.data);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
    }
  };

  useEffect(() => {
    fetchFreelancer();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Freelancers</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {freelancer.map((user) => (
          <div
            key={user._id}
            className="border rounded-lg shadow-md p-4 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-gray-600">{user.professionalTitle}</p>
              <p className="mt-2 text-sm">{user.description}</p>
              <p className="mt-2 text-sm text-blue-600">
                Hourly Rate: ${user.hourlyRate}/hr
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 px-2 py-1 rounded text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <Link
              to={`/chat/${user._id}`}
              className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center"
            >
              Chat
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
