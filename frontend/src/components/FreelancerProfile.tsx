import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FreelancerUser } from "../types/index";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Edit, Save, Plus, Star, Briefcase, GraduationCap, Award, Clock } from "lucide-react";
import axios from "axios";

interface FreelancerFormData {
    firstName: string;
    lastName: string;
    email: string;
    professionalTitle: string;
    description: string;
    metamaskid : string;
    skills: string[];
    hourlyRate: number;
    country: string;
    timezone: string;
    availability: {
        status: 'Available' | 'Partially Available' | 'Not Available';
        hoursPerWeek: number;
    };
}

interface PortfolioItem {
    title: string;
    description: string;
    images: string[];
    link: string;
    category: string;
}

interface EducationItem {
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
}

interface ExperienceItem {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}


export function FreelancerProfile() {
    const [user, setUser] = useState<FreelancerUser | null>(null);
    const [jurorStatus, setJurorStatus] = useState<{ isAvailable: boolean } | null>(null); // Explicitly define type


    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<FreelancerFormData>({
        firstName: "",
        lastName: "",
        email: "",
        professionalTitle: "",
        description: "",
        metamaskid: "",
        skills: [],
        hourlyRate: 0,
        country: "",
        timezone: "",
        availability: {
            status: "Available",
            hoursPerWeek: 40
        }
    });
    const [activeTab, setActiveTab] = useState("profile");
    const [showPortfolioModal, setShowPortfolioModal] = useState(false);
    const [showEducationModal, setShowEducationModal] = useState(false);
    const [showExperienceModal, setShowExperienceModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showWalletModal, setShowWalletModal] = useState(false);
const [walletAddressInput, setWalletAddressInput] = useState("");



    const [portfolioForm, setPortfolioForm] = useState<PortfolioItem>({
        title: '',
        description: '',
        images: [],
        link: '',
        category: ''
    });

    const [educationForm, setEducationForm] = useState<EducationItem>({
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false
    });

    const [experienceForm, setExperienceForm] = useState<ExperienceItem>({
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
        current: false
    });

    // Add these handlers

    

    const handleAddPortfolio = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch('http://localhost:8000/api/freelancers/portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(portfolioForm)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            setUser(prev => ({
                ...prev!,
                portfolio: [...(prev?.portfolio || []), data]
            }));

            setShowPortfolioModal(false);
            setPortfolioForm({
                title: '',
                description: '',
                images: [],
                link: '',
                category: ''
            });
            toast.success('Portfolio item added successfully');
        } catch (error) {
            toast.error('Failed to add portfolio item');
        }
    };
    const handleConnectWallet = () => {
        setWalletAddressInput("");
        setShowWalletModal(true);
      };

      const handleWalletSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          
          // Call your API to update the user's MetaMask address
          const response = await axios.post("http://localhost:8000/api/freelancers/wallet", {
            metamaskId : walletAddressInput,
            userId: user?._id
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.status === 200) {
            // Update the user state with the new wallet address
            setUser(prev => ({
              ...prev!,
              metamaskId: walletAddressInput
            }));
            toast.success('Wallet connected successfully!');
            setShowWalletModal(false);
          } else {
            toast.error('Failed to connect wallet.');
          }
        } catch (error) {
          console.error("Error connecting wallet:", error);
          toast.error('Failed to connect wallet. Please try again.');
        } finally {
          setLoading(false);
        }
      };

    const handleAddEducation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch('http://localhost:8000/api/freelancers/education', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(educationForm)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            setUser(prev => ({
                ...prev!,
                education: [...(prev?.education || []), data]
            }));

            setShowEducationModal(false);
            setEducationForm({
                institution: '',
                degree: '',
                field: '',
                startDate: '',
                endDate: '',
                current: false
            });
            toast.success('Education added successfully');
        } catch (error) {
            toast.error('Failed to add education');
        }
    };

    const handleAddExperience = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch('http://localhost:8000/api/freelancers/experience', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(experienceForm)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            setUser(prev => ({
                ...prev!,
                experience: [...(prev?.experience || []), data]
            }));

            setShowExperienceModal(false);
            setExperienceForm({
                title: '',
                company: '',
                location: '',
                startDate: '',
                endDate: '',
                description: '',
                current: false
            });
            toast.success('Experience added successfully');
        } catch (error) {
            toast.error('Failed to add experience');
        }
    };
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No authentication token found");

                const response = await fetch('http://localhost:8000/api/freelancers/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                console.log('Fetched user data:', data.data);
                const jurorRes = await axios.get(`http://localhost:8000/api/freelancers/juror/${data.data._id}`);
                if (jurorRes.status === 200) {
                    setJurorStatus(jurorRes.data); // set full juror object
                }
                console.log('Juror status:', jurorRes.data);
                console.log(jurorRes.data)
                setUser(data.data); // Assuming the response structure has a data field
                setFormData({
                    firstName: data.data.firstName || "",
                    lastName: data.data.lastName || "",
                    email: data.data.email || "",
                    professionalTitle: data.data.professionalTitle || "",
                    description: data.data.description || "",
                    skills: data.data.skills || [],
                    metamaskid : data.data.metamaskid || "",
                    hourlyRate: data.data.hourlyRate || 0,
                    country: data.data.country || "",
                    timezone: data.data.timezone || "",
                    availability: data.data.availability || {
                        status: "Available",
                        hoursPerWeek: 40
                    }
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user data:", error);
                toast.error("Failed to load profile data. Please try again later.");
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");

            const response = await axios.put<FreelancerUser>("/api/freelancer/profile", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(response.data);
            localStorage.setItem("user", JSON.stringify(response.data));

            setEditMode(false);
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile. Please try again.");
        }
    };
    const handleBecomeJuror = async () => {
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:8000/api/freelancers/juror", {
                userId: user?._id
            });
            console.log(res);
            if (res.status === 200) {
                toast.success('You are now a juror!');
                setShowModal(false);
                // update UI if needed
            } else {
                toast.error('Something went wrong.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Server error. Try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading profile...</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left sidebar */}
                <div className="w-full md:w-1/4">
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center">
                                <Avatar className="h-24 w-24 mb-4">
                                    <AvatarFallback className=" text-black text-xl">
                                        {user?.firstName}
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="text-xl font-semibold">
                                    {user?.firstName} {user?.lastName}
                                </h2>
                                <p className="text-gray-500">{user?.professionalTitle}</p>
                                <div className="flex items-center mt-2">
                                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                    <span>{user?.rating?.average || "New"}</span>
                                    <span className="text-gray-500 ml-1">
                                        ({user?.rating?.totalReviews || 0} reviews)
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                                    <span>Completed Projects: {user?.completedProjects || 0}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-5 w-5 mr-2 text-green-600" />
                                    <span>Availability: {user?.availability?.status}</span>
                                </div>
                                <div className="flex items-center">
                                    <Award className="h-5 w-5 mr-2 text-purple-600" />
                                    <span>Level: {user?.accountLevel}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main content area */}
                <div className="w-full md:w-3/4">

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="mb-4 flex items-center justify-between">
  <TabsList className="mb-6">
    <TabsTrigger value="profile">Profile</TabsTrigger>
    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
    <TabsTrigger value="education">Education</TabsTrigger>
    <TabsTrigger value="experience">Experience</TabsTrigger>
  </TabsList>

  <div className="flex gap-4">
    <button
      onClick={handleConnectWallet}
      disabled={loading || !!user?.metamaskid}
      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50"
    >
      {user?.metamaskid ? 'Wallet Connected' : 'Connect Wallet'}
    </button>
    
    {jurorStatus?.isAvailable ? 
    (
        <p className="mt-4 text-green-600 font-semibold">You're already a juror.</p>
      )
   :(
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Become a Juror
      </button>
    ) }
  </div>
</div>


                        {/* Profile Tab */}
                        <TabsContent value="profile">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Professional Information</CardTitle>
                                        <CardDescription>Manage your professional details</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={() => setEditMode(!editMode)}>
                                        {editMode ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                                        {editMode ? "Save" : "Edit"}
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input
                                                    id="firstName"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    disabled={!editMode}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input
                                                    id="lastName"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    disabled={!editMode}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    disabled={true}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="professionalTitle">Professional Title</Label>
                                                <Input
                                                    id="professionalTitle"
                                                    name="professionalTitle"
                                                    value={formData.professionalTitle}
                                                    onChange={handleInputChange}
                                                    disabled={!editMode}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label htmlFor="description">Professional Description</Label>
                                                <Textarea
                                                    id="description"
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    disabled={!editMode}
                                                    rows={4}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                                                <Input
                                                    id="hourlyRate"
                                                    name="hourlyRate"
                                                    type="number"
                                                    value={formData.hourlyRate}
                                                    onChange={handleInputChange}
                                                    disabled={!editMode}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="availability">Availability Status</Label>
                                                <select
                                                    id="availability"
                                                    name="availability.status"
                                                    value={formData.availability.status}
                                                    onChange={handleInputChange}
                                                    disabled={!editMode}
                                                    className="w-full p-2 border rounded"
                                                >
                                                    <option value="Available">Available</option>
                                                    <option value="Partially Available">Partially Available</option>
                                                    <option value="Not Available">Not Available</option>
                                                </select>
                                            </div>
                                        </div>
                                        {editMode && (
                                            <Button type="submit">Save Changes</Button>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="portfolio">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Portfolio</CardTitle>
                                        <CardDescription>Showcase your best work</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={() => setShowPortfolioModal(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Project
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {user?.portfolio && user.portfolio.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {user.portfolio.map((project, index) => (
                                                <Card key={index}>
                                                    <CardContent className="p-4">
                                                        {/* <div className="aspect-video bg-gray-100 rounded-lg mb-4">
                                                            {project.images[0] && (
                                                                <img
                                                                    src={project.images[0]}
                                                                    alt={project.title}
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                            )}
                                                        </div> */}
                                                        <h3 className="font-semibold mb-2">{project.title}</h3>
                                                        <p className="text-sm text-gray-500 mb-2">{project.description}</p>
                                                        {project.link && (
                                                            <a
                                                                href={project.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-500 text-sm hover:underline"
                                                            >
                                                                View Project
                                                            </a>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-gray-500">No portfolio items yet.</p>
                                            <Button variant="outline" onClick={() => setShowPortfolioModal(true)}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Project
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="education">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Education</CardTitle>
                                        <CardDescription>Your academic background</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={() => setShowEducationModal(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Education
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {user?.education && user.education.length > 0 ? (
                                        <div className="space-y-4">
                                            {user.education.map((edu, index) => (
                                                <Card key={index}>
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-semibold">{edu.degree}</h3>
                                                                <p className="text-gray-500">{edu.institution}</p>
                                                                <p className="text-sm text-gray-500">{edu.field}</p>
                                                            </div>
                                                            <div className="text-right text-sm text-gray-500">
                                                                {new Date(edu.startDate).getFullYear()} - {
                                                                    edu.current ? 'Present' : new Date(edu.endDate).getFullYear()
                                                                }
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-gray-500">No education history added.</p>
                                            <Button variant="outline" onClick={() => setShowEducationModal(true)}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Education
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="experience">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Work Experience</CardTitle>
                                        <CardDescription>Your professional journey</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={() => setShowExperienceModal(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Experience
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {user?.experience && user.experience.length > 0 ? (
                                        <div className="space-y-4">
                                            {user.experience.map((exp, index) => (
                                                <Card key={index}>
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-semibold">{exp.title}</h3>
                                                                <p className="text-gray-500">{exp.company}</p>
                                                                <p className="text-sm text-gray-500">{exp.location}</p>
                                                                <p className="text-sm mt-2">{exp.description}</p>
                                                            </div>
                                                            <div className="text-right text-sm text-gray-500">
                                                                {new Date(exp.startDate).getFullYear()} - {
                                                                    exp.current ? 'Present' : new Date(exp.endDate).getFullYear()
                                                                }
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <Button variant="outline" onClick={() => setShowExperienceModal(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Experience
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Add other tab contents for Portfolio, Education, and Experience */}
                    </Tabs>
                </div>
            </div>
            {/* Portfolio Modal */}
            {showPortfolioModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-lg mx-4">
                        <CardHeader>
                            <CardTitle>Add Portfolio Item</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddPortfolio}>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={portfolioForm.title}
                                            onChange={(e) => setPortfolioForm(prev => ({ ...prev, title: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={portfolioForm.description}
                                            onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="link">Project Link</Label>
                                        <Input
                                            id="link"
                                            value={portfolioForm.link}
                                            onChange={(e) => setPortfolioForm(prev => ({ ...prev, link: e.target.value }))}
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button variant="outline" onClick={() => setShowPortfolioModal(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">Add Portfolio Item</Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Education Modal */}
            {showEducationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-lg mx-4">
                        <CardHeader>
                            <CardTitle>Add Education</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddEducation}>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="institution">Institution</Label>
                                        <Input
                                            id="institution"
                                            value={educationForm.institution}
                                            onChange={(e) => setEducationForm(prev => ({ ...prev, institution: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="degree">Degree</Label>
                                        <Input
                                            id="degree"
                                            value={educationForm.degree}
                                            onChange={(e) => setEducationForm(prev => ({ ...prev, degree: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="field">Field of Study</Label>
                                        <Input
                                            id="field"
                                            value={educationForm.field}
                                            onChange={(e) => setEducationForm(prev => ({ ...prev, field: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="startDate">Start Date</Label>
                                            <Input
                                                id="startDate"
                                                type="date"
                                                value={educationForm.startDate}
                                                onChange={(e) => setEducationForm(prev => ({ ...prev, startDate: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="endDate">End Date</Label>
                                            <Input
                                                id="endDate"
                                                type="date"
                                                value={educationForm.endDate}
                                                onChange={(e) => setEducationForm(prev => ({ ...prev, endDate: e.target.value }))}
                                                disabled={educationForm.current}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="current"
                                            checked={educationForm.current}
                                            onChange={(e) => setEducationForm(prev => ({ ...prev, current: e.target.checked }))}
                                        />
                                        <Label htmlFor="current">Currently Studying</Label>
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button variant="outline" onClick={() => setShowEducationModal(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">Add Education</Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Experience Modal */}
            {showExperienceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-lg mx-4">
                        <CardHeader>
                            <CardTitle>Add Experience</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddExperience}>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Job Title</Label>
                                        <Input
                                            id="title"
                                            value={experienceForm.title}
                                            onChange={(e) => setExperienceForm(prev => ({ ...prev, title: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="company">Company</Label>
                                        <Input
                                            id="company"
                                            value={experienceForm.company}
                                            onChange={(e) => setExperienceForm(prev => ({ ...prev, company: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={experienceForm.location}
                                            onChange={(e) => setExperienceForm(prev => ({ ...prev, location: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="startDate">Start Date</Label>
                                            <Input
                                                id="startDate"
                                                type="date"
                                                value={experienceForm.startDate}
                                                onChange={(e) => setExperienceForm(prev => ({ ...prev, startDate: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="endDate">End Date</Label>
                                            <Input
                                                id="endDate"
                                                type="date"
                                                value={experienceForm.endDate}
                                                onChange={(e) => setExperienceForm(prev => ({ ...prev, endDate: e.target.value }))}
                                                disabled={experienceForm.current}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="current"
                                            checked={experienceForm.current}
                                            onChange={(e) => setExperienceForm(prev => ({ ...prev, current: e.target.checked }))}
                                        />
                                        <Label htmlFor="current">Currently Working Here</Label>
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={experienceForm.description}
                                            onChange={(e) => setExperienceForm(prev => ({ ...prev, description: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button variant="outline" onClick={() => setShowExperienceModal(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">Add Experience</Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Wallet Connection Modal */}
{showWalletModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <Card className="w-full max-w-lg mx-4">
      <CardHeader>
        <CardTitle>Connect MetaMask Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleWalletSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="walletAddress">MetaMask Wallet Address</Label>
              <Input
                id="walletAddress"
                value={walletAddressInput}
                onChange={(e) => setWalletAddressInput(e.target.value)}
                placeholder="0x..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter your MetaMask wallet address to connect it to your account.
              </p>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowWalletModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Connecting..." : "Connect Wallet"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
)}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <h2 className="text-lg font-semibold mb-4">Become a Juror</h2>
                        <p className="text-gray-700 mb-4">
                            As a juror, you'll be randomly selected to help resolve disputes between freelancers and clients by reviewing evidence and casting your vote. You can earn a side income for your participation.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBecomeJuror}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Agree & Join
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}