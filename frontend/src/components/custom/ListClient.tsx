import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../config";
import { Link } from "react-router-dom";

// Define the TypeScript interface for a Client
interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  country?: string;
  city?: string;
}

const ListClient = () => {
  const [clients, setClients] = useState<Client[]>([]);

  const fetchAllClient = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get<{ data: Client[] }>(
        `${BACKEND_URL}/api/buyers/getAllClients`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setClients(response.data.data);
    } catch (error) {
      console.log("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    fetchAllClient();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Client List</h2>
      {clients.length === 0 ? (
        <p>No clients found.</p>
      ) : (
        <ul className="space-y-4">
          {clients.map((client) => (
            <li
              key={client._id}
              className="border p-4 rounded-lg shadow-md flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  {client.firstName} {client.lastName}
                </p>
                <p className="text-sm text-gray-600">{client.email}</p>
              </div>
              <Link
                to={`/chat/${client._id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Chat
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListClient;
