import axios from "axios";
import { useEffect } from "react";
import { BACKEND_URL } from "../../config";

const ListClient = () => {
  const fetchAllClient = async () => {
    try {
      const token = localStorage.getItem("token"); // get token from localStorage

      const response = await axios.get(
        `${BACKEND_URL}/api/buyers/getAllClients`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);
    } catch (error) {
      console.log("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    fetchAllClient();
  }, []);

  return <div>ListClient</div>;
};

export default ListClient;

