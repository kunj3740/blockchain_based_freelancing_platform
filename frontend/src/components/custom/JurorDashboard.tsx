import { useState } from "react";
import { Link } from "react-router-dom";

const JurorDashboard = () => {
  // Mock data for disputes
  const [disputes] = useState([
    {
      _id: "1",
      issueDescription: "Late delivery of website redesign project",
      status: "under_review",
      client: "TechCorp Inc.",
      freelancer: "John Designer",
      contractValue: "$2,500",
      dateCreated: "2025-04-01",
      dueDate: "2025-04-15"
    },
    {
      _id: "2",
      issueDescription: "Disagreement on logo design requirements",
      status: "under_review",
      client: "GreenStart Solutions",
      freelancer: "Sarah Artist",
      contractValue: "$800",
      dateCreated: "2025-04-05",
      dueDate: "2025-04-20"
    },
    {
      _id: "3",
      issueDescription: "Mobile app functionality missing key features",
      status: "pending",
      client: "FitTrack",
      freelancer: "Dev Masters LLC",
      contractValue: "$5,000",
      dateCreated: "2025-04-08",
      dueDate: "2025-04-22"
    }
  ]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Your Assigned Disputes</h2>
      
      {disputes.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg border">
          <p className="text-gray-600">No disputes have been assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div key={dispute._id} className="border p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{dispute.issueDescription}</h3>
                  <div className="mt-2 text-sm text-gray-600">
                    <p><span className="font-medium">Client:</span> {dispute.client}</p>
                    <p><span className="font-medium">Freelancer:</span> {dispute.freelancer}</p>
                    <p><span className="font-medium">Contract Value:</span> {dispute.contractValue}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm 
                    ${dispute.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                     dispute.status === "under_review" ? "bg-blue-100 text-blue-800" : 
                     "bg-green-100 text-green-800"}`}>
                    {dispute.status === "pending" ? "Pending" : 
                     dispute.status === "under_review" ? "Under Review" : "Resolved"}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">Due: {dispute.dueDate}</p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <Link
                  to={`/juror/dispute/${dispute._id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Link>
                
                {dispute.status === "under_review" && (
                  <div className="flex space-x-2">
                    <Link
                      to={`/juror/dispute/${dispute._id}`}
                      className="px-3 py-1 border border-green-600 text-green-600 rounded hover:bg-green-50 transition-colors"
                    >
                      Cast Vote
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JurorDashboard;