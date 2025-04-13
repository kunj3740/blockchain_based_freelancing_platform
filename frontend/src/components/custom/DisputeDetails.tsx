import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const JurorDisputeDetail = () => {
  const { id } = useParams();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vote, setVote] = useState("");
  const [comment, setComment] = useState("");

  // Mock data for a single dispute with all related details
  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      // Find the dispute that matches the ID from URL params
      const mockDispute = getMockDispute(id);
      setDispute(mockDispute);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  const handleVoteSubmit = (e) => {
    e.preventDefault();
    if (!vote) {
      alert("Please select who you're voting for");
      return;
    }

    // In a real app, this would send the vote to your API
    console.log("Vote submitted:", { vote, comment });
    
    // Update local state to show the vote was recorded
    setDispute(prev => ({
      ...prev,
      votes: [
        ...prev.votes,
        {
          jurorId: "current-juror-id", // In a real app, this would be the logged-in juror's ID
          votedFor: vote,
          comment
        }
      ]
    }));

    alert("Your vote has been recorded");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-300">
          <h2 className="text-lg font-medium">Dispute Not Found</h2>
          <p className="mt-2">The dispute you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/juror/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const hasVoted = dispute.votes.some(v => v.jurorId === "current-juror-id");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/juror/dashboard" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Dashboard
      </Link>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{dispute.issueDescription}</h1>
              <p className="text-gray-600 mt-1">Dispute #{id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              dispute.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
              dispute.status === "under_review" ? "bg-blue-100 text-blue-800" : 
              "bg-green-100 text-green-800"
            }`}>
              {dispute.status === "pending" ? "Pending" : 
               dispute.status === "under_review" ? "Under Review" : 
               "Resolved"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Parties Involved</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">Client</h3>
                <p>{dispute.client.firstName} {dispute.client.lastName}</p>
                <p className="text-sm text-gray-600">{dispute.client.email}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">Freelancer</h3>
                <p>{dispute.freelancer.firstName} {dispute.freelancer.lastName}</p>
                <p className="text-sm text-gray-600">{dispute.freelancer.email}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Contract Details</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p><span className="font-medium">Description:</span> {dispute.contract.description}</p>
              <p className="mt-2"><span className="font-medium">Amount:</span> ${dispute.contract.amount}</p>
              <p className="mt-2"><span className="font-medium">Created:</span> {new Date(dispute.contract.createdAt).toLocaleDateString()}</p>
              <p className="mt-2">
                <span className="font-medium">Status:</span>{" "}
                {dispute.contract.isApproved ? 
                  (dispute.contract.isCompleted ? "Completed" : "Approved") : 
                  "Pending Approval"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Communication History</h2>
          <p className="text-gray-600 text-sm">Review the messages between the client and freelancer</p>
        </div>
        
        <div className="p-6">
          {dispute.messages.length === 0 ? (
            <p className="text-gray-500 italic">No messages available for this dispute.</p>
          ) : (
            <div className="space-y-4">
              {dispute.messages.map((message) => (
                <div 
                  key={message._id} 
                  className={`p-4 rounded-lg max-w-3xl ${
                    message.sender === dispute.client._id ? 
                    "bg-blue-50 ml-auto" : 
                    "bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">
                      {message.sender === dispute.client._id ? 
                        `${dispute.client.firstName} (Client)` : 
                        `${dispute.freelancer.firstName} (Freelancer)`}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p>{message.content}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Attachments:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {message.attachments.map((attachment, idx) => (
                          <div key={idx} className="px-3 py-1 bg-gray-200 rounded text-sm">
                            {attachment.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Juror voting section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Cast Your Vote</h2>
          <p className="text-gray-600 text-sm">Based on the evidence, who should win this dispute?</p>
        </div>
        
        <div className="p-6">
          {hasVoted ? (
            <div className="bg-green-50 p-4 rounded-lg text-green-800 border border-green-200">
              <p className="font-medium">You have already voted on this dispute.</p>
              <p className="mt-1">Your vote: {dispute.votes.find(v => v.jurorId === "current-juror-id").votedFor === "client" ? "In favor of the Client" : "In favor of the Freelancer"}</p>
              {dispute.votes.find(v => v.jurorId === "current-juror-id").comment && (
                <p className="mt-2 text-sm">
                  <span className="font-medium">Your comment:</span> {dispute.votes.find(v => v.jurorId === "current-juror-id").comment}
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleVoteSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Your Decision:</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="voteClient" 
                      name="vote" 
                      value="client"
                      onChange={(e) => setVote(e.target.value)}
                      className="mr-2"
                    />
                    <label htmlFor="voteClient" className="cursor-pointer">Vote for Client ({dispute.client.firstName})</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="voteFreelancer" 
                      name="vote" 
                      value="freelancer"
                      onChange={(e) => setVote(e.target.value)}
                      className="mr-2"
                    />
                    <label htmlFor="voteFreelancer" className="cursor-pointer">Vote for Freelancer ({dispute.freelancer.firstName})</label>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">Explanation (Optional):</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Explain your decision..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Submit Vote
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Function to get mock dispute data based on ID
function getMockDispute(id) {
  // This would be the data your API would return
  const mockDisputes = {
    "1": {
      _id: "1",
      contract: {
        _id: "contract1",
        description: "Website redesign for TechCorp's e-commerce platform including responsive layouts, SEO optimization, and integration with their existing CMS.",
        amount: 2500,
        freelancer: "freelancer1",
        client: "client1",
        isApproved: true,
        isCompleted: false,
        createdAt: "2025-03-15T10:30:00Z",
        updatedAt: "2025-03-20T14:45:00Z"
      },
      client: {
        _id: "client1",
        firstName: "Michael",
        lastName: "Johnson",
        email: "michael@techcorp.com",
        profilePicture: "/api/placeholder/50/50"
      },
      freelancer: {
        _id: "freelancer1",
        firstName: "John",
        lastName: "Designer",
        email: "john@designstudio.com",
        profilePicture: "/api/placeholder/50/50"
      },
      issueDescription: "Late delivery of website redesign project",
      messages: [
        {
          _id: "msg1",
          sender: "client1",
          receiver: "freelancer1",
          content: "Hi John, I'm concerned about the project timeline. We agreed on delivery by March 30th, but it's now April 5th and the project is still incomplete.",
          createdAt: "2025-04-05T09:15:00Z",
          attachments: []
        },
        {
          _id: "msg2",
          sender: "freelancer1",
          receiver: "client1",
          content: "Hello Michael, I apologize for the delay. I've been dealing with some technical issues with the CMS integration. I've completed 80% of the work and need about 5 more days to finish everything properly.",
          createdAt: "2025-04-05T10:22:00Z",
          attachments: []
        },
        {
          _id: "msg3",
          sender: "client1",
          receiver: "freelancer1",
          content: "This delay is causing us significant problems with our marketing campaign launch. We specifically discussed the timeline and you assured me it would be done by March 30th.",
          createdAt: "2025-04-05T11:05:00Z",
          attachments: []
        },
        {
          _id: "msg4",
          sender: "freelancer1",
          receiver: "client1",
          content: "I understand your concern. The scope of the CMS integration turned out to be more complex than initially discussed. Here's what I've completed so far.",
          createdAt: "2025-04-05T14:30:00Z",
          attachments: [
            { name: "progress-report.pdf", url: "#" },
            { name: "completed-pages-screenshots.zip", url: "#" }
          ]
        },
        {
          _id: "msg5",
          sender: "client1",
          receiver: "freelancer1",
          content: "I'm filing a dispute as this delay is unacceptable and is costing us money. We need to resolve this immediately.",
          createdAt: "2025-04-06T08:45:00Z",
          attachments: []
        }
      ],
      status: "under_review",
      jurors: ["juror1", "juror2", "juror3"],
      votes: [],
      resolution: {
        winner: "none",
        resolvedAt: null
      },
      createdAt: "2025-04-06T09:00:00Z",
      updatedAt: "2025-04-06T09:00:00Z"
    },
    "2": {
      _id: "2",
      contract: {
        _id: "contract2",
        description: "Logo design package including main logo, variations, style guide, and all source files in multiple formats.",
        amount: 800,
        freelancer: "freelancer2",
        client: "client2",
        isApproved: true,
        isCompleted: false,
        createdAt: "2025-03-20T15:30:00Z",
        updatedAt: "2025-03-21T10:15:00Z"
      },
      client: {
        _id: "client2",
        firstName: "Emma",
        lastName: "Wilson",
        email: "emma@greenstart.com",
        profilePicture: "/api/placeholder/50/50"
      },
      freelancer: {
        _id: "freelancer2",
        firstName: "Sarah",
        lastName: "Artist",
        email: "sarah@creativedesigns.com",
        profilePicture: "/api/placeholder/50/50"
      },
      issueDescription: "Disagreement on logo design requirements",
      messages: [
        {
          _id: "msg6",
          sender: "freelancer2",
          receiver: "client2",
          content: "Hi Emma, I've completed the logo design as per our agreement. Here are the files for your review.",
          createdAt: "2025-04-02T13:20:00Z",
          attachments: [
            { name: "logo-package.zip", url: "#" }
          ]
        },
        {
          _id: "msg7",
          sender: "client2",
          receiver: "freelancer2",
          content: "Hi Sarah, I've reviewed the files but these don't meet our requirements. We specifically asked for an eco-friendly design with green elements. This looks completely different from what we discussed.",
          createdAt: "2025-04-03T09:10:00Z",
          attachments: []
        },
        {
          _id: "msg8",
          sender: "freelancer2",
          receiver: "client2",
          content: "I believe there's a misunderstanding. The brief we agreed on mentioned a 'modern, minimalist design' with no specific color requirements. I have all our communications documented.",
          createdAt: "2025-04-03T10:25:00Z",
          attachments: [
            { name: "project-brief.pdf", url: "#" },
            { name: "communication-history.pdf", url: "#" }
          ]
        },
        {
          _id: "msg9",
          sender: "client2",
          receiver: "freelancer2",
          content: "We definitely discussed the eco-friendly aspect in our video call. I need a logo that represents our company's environmental mission. I'm not willing to pay for something that doesn't meet our core needs.",
          createdAt: "2025-04-03T11:40:00Z",
          attachments: []
        },
        {
          _id: "msg10",
          sender: "freelancer2",
          receiver: "client2",
          content: "I don't have any record of those specific requirements from our call. I followed the written brief that we both agreed to. I'm willing to make revisions, but that would be additional work beyond our original contract.",
          createdAt: "2025-04-03T14:15:00Z",
          attachments: []
        }
      ],
      status: "under_review",
      jurors: ["juror1", "juror3", "juror4"],
      votes: [],
      resolution: {
        winner: "none",
        resolvedAt: null
      },
      createdAt: "2025-04-04T10:00:00Z",
      updatedAt: "2025-04-04T10:00:00Z"
    },
    "3": {
      _id: "3",
      contract: {
        _id: "contract3",
        description: "Fitness tracking mobile app with workout planning, progress tracking, and social features.",
        amount: 5000,
        freelancer: "freelancer3",
        client: "client3",
        isApproved: true,
        isCompleted: false,
        createdAt: "2025-02-10T09:45:00Z",
        updatedAt: "2025-02-12T14:30:00Z"
      },
      client: {
        _id: "client3",
        firstName: "Alex",
        lastName: "Thompson",
        email: "alex@fittrack.com",
        profilePicture: "/api/placeholder/50/50"
      },
      freelancer: {
        _id: "freelancer3",
        firstName: "David",
        lastName: "Developer",
        email: "david@devmasters.com",
        profilePicture: "/api/placeholder/50/50"
      },
      issueDescription: "Mobile app functionality missing key features",
      messages: [
        {
          _id: "msg11",
          sender: "freelancer3",
          receiver: "client3",
          content: "Hi Alex, I've completed the fitness app as per our contract. All features have been implemented and tested. Please review and let me know your thoughts.",
          createdAt: "2025-04-01T15:30:00Z",
          attachments: [
            { name: "app-release.apk", url: "#" },
            { name: "ios-build.zip", url: "#" }
          ]
        },
        {
          _id: "msg12",
          sender: "client3",
          receiver: "freelancer3",
          content: "David, I've tested the app and there are several key features missing. The social sharing functionality isn't working and the workout planning calendar is very basic, not the advanced version we discussed.",
          createdAt: "2025-04-03T11:20:00Z",
          attachments: []
        },
        {
          _id: "msg13",
          sender: "freelancer3",
          receiver: "client3",
          content: "The social sharing is implemented as specified in the contract - basic sharing to Facebook and Twitter. The advanced calendar features you're mentioning weren't part of our original agreement.",
          createdAt: "2025-04-03T13:45:00Z",
          attachments: [
            { name: "original-requirements.pdf", url: "#" }
          ]
        },
        {
          _id: "msg14",
          sender: "client3",
          receiver: "freelancer3",
          content: "We specifically discussed these features during our planning meetings. The app is unusable without these key components. I'm requesting a dispute resolution as I can't accept the app in its current state.",
          createdAt: "2025-04-05T09:10:00Z",
          attachments: [
            { name: "meeting-notes.pdf", url: "#" }
          ]
        }
      ],
      status: "pending",
      jurors: ["juror2", "juror4", "juror5"],
      votes: [],
      resolution: {
        winner: "none",
        resolvedAt: null
      },
      createdAt: "2025-04-06T10:30:00Z",
      updatedAt: "2025-04-06T10:30:00Z"
    }
  };

  return mockDisputes[id];
}

export default JurorDisputeDetail;