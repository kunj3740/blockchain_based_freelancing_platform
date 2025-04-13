import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { ClientUser } from "../types/index";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Edit, Save, Plus, Star, ShoppingBag, CreditCard, Heart } from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from "../config";

interface PaymentMethod {
    type: 'credit_card' | 'paypal' | 'bank_account';
    details: {
        last4?: string;
        email?: string;
        cardType?: string;
        expiryDate?: string;
    };
    isDefault: boolean;
}

export function ClientProfile() {
    const [user, setUser] = useState<ClientUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [walletAddressInput, setWalletAddressInput] = useState("");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        
        country: "",
        city: "",
        address: ""
    });
    const [activeTab, setActiveTab] = useState("profile");
    const [orders, setOrders] = useState<{ _id: string; gigTitle: string; createdAt: string; amount: number; status: string }[]>([]);
    const [favorites, setFavorites] = useState<{ _id: string; title: string; rating?: number; packages: { price: number }[] }[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState<PaymentMethod>({
        type: 'credit_card',
        details: {
            last4: '',
            cardType: '',
            expiryDate: '',
        },
        isDefault: false,
    });

    useEffect(() => {
        // Load initial data from localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsedUserData = JSON.parse(userData);
            setUser(parsedUserData);
            setFormData({
                firstName: parsedUserData.firstName || "",
                lastName: parsedUserData.lastName || "",
                email: parsedUserData.email || "",
                phoneNumber: parsedUserData.phoneNumber || "",
                country: parsedUserData.country || "",
                city: parsedUserData.city || "",
                address: parsedUserData.address || ""
            });
        }

        // Fetch complete user data from API
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }

                const response = await axios.get(`${BACKEND_URL}/api/buyers/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setUser(response.data);
                
                // Fetch orders if available    
                if (response.data.orders && response.data.orders.length > 0) {
                    const ordersResponse = await axios.get(`${BACKEND_URL}/api/buyers/orders`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setOrders(ordersResponse.data);
                }

                // Fetch favorites if available
                if (response.data.favorites && response.data.favorites.length > 0) {
                    const favoritesResponse = await axios.get(`${BACKEND_URL}/api/buyers/favorites`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setFavorites(favoritesResponse.data);
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching user data:", error);
                toast.error("Failed to load profile data. Please try again later.");
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleConnectWallet = () => {
        setWalletAddressInput("");
        setShowWalletModal(true);
      };

      const handleWalletSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          console.log(user.data)
          // Call your API to update the user's MetaMask address
          const response = await axios.post(`${BACKEND_URL}/api/buyers/wallet`, {
            metamaskId : walletAddressInput,
            userId: user?.data._id
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
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await axios.put(`${BACKEND_URL}/api/client/profile`, formData, {
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

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    const handleAddPaymentMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");
        
            const response = await axios.post(`${BACKEND_URL}/api/client/payment-methods`, paymentForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
        
            setUser(prev => ({
                ...prev!,
                paymentMethods: response.data
            }));
        
            setShowPaymentModal(false);
            setPaymentForm({
                type: 'credit_card',
                details: {
                    last4: '',
                    cardType: '',
                    expiryDate: '',
                },
                isDefault: false,
            });
        
            toast.success('Payment method added successfully');
        } catch (error) {
            toast.error('Failed to add payment method');
            console.error('Error adding payment method:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-pulse text-center">
                    <div className="h-12 w-12 mx-auto rounded-full bg-gray-200 mb-4"></div>
                    <div className="h-4 w-32 mx-auto bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left sidebar with avatar and user info */}
                <div className="w-full md:w-1/4">
                    <Card className="mb-6 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center">
                                <Avatar className="h-24 w-24 mb-4 border-4 border-white shadow-lg">
                                    <AvatarImage src={user?.avatar ? `${BACKEND_URL}/uploads/avatars/${user.avatar}` : undefined} alt={user?.firstName} />
                                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-700 text-white text-xl">
                                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="text-xl font-semibold">
                                    {user?.firstName} {user?.lastName}
                                </h2>
                                <p className="text-gray-500">{user?.email}</p>
                                <p className="text-gray-500 mt-1">{user?.phoneNumber}</p>
                                <p className="text-gray-500 mt-1">{user?.country}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>Account Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <ShoppingBag className="h-5 w-5 mr-3 text-green-600" />
                                    <span>Orders: <span className="font-medium">{user?.orders?.length || 0}</span></span>
                                </div>
                                <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <Heart className="h-5 w-5 mr-3 text-red-500" />
                                    <span>Favorites: <span className="font-medium">{user?.favorites?.length || 0}</span></span>
                                </div>
                                <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <CreditCard className="h-5 w-5 mr-3 text-blue-500" />
                                    <span>Payment Methods: <span className="font-medium">{user?.paymentMethods?.length || 0}</span></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main content area */}
                <div className="w-full md:w-3/4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="mb-6 w-full justify-start overflow-x-auto p-0.5 bg-gray-50 rounded-lg">
                            <TabsTrigger value="profile" className="py-2 px-4">Profile</TabsTrigger>
                            <TabsTrigger value="orders" className="py-2 px-4">Orders</TabsTrigger>
                            <TabsTrigger value="favorites" className="py-2 px-4">Favorites</TabsTrigger>
                            <TabsTrigger value="payment" className="py-2 px-4">Payment Methods</TabsTrigger>
                        </TabsList>
                        <div className="flex gap-4">
    <button
      onClick={handleConnectWallet}
      disabled={loading || !!user?.metamaskid}
      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50"
    >
      {user?.metamaskid ? 'Wallet Connected' : 'Connect Wallet'}
    </button>
    
  </div>
                        {/* Profile Tab */}
                        <TabsContent value="profile">
                            <Card className="shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Personal Information</CardTitle>
                                        <CardDescription>Manage your personal details</CardDescription>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        onClick={toggleEditMode}
                                        className="transition-all hover:bg-green-50"
                                    >
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
                                                    className="mt-1"
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
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    disabled={true} // Email typically cannot be changed
                                                    className="mt-1 bg-gray-50"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                                <Input
                                                    id="phoneNumber"
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleInputChange}
                                                    disabled={!editMode}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="country">Country</Label>
                                                <Input
                                                    id="country"
                                                    name="country"
                                                    value={formData.country}
                                                    onChange={handleInputChange}
                                                    disabled={!editMode}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="city">City</Label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    disabled={!editMode}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label htmlFor="address">Address</Label>
                                                <Textarea
                                                    id="address"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    disabled={!editMode}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        {editMode && (
                                            <Button 
                                                type="submit"
                                                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </Button>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Orders Tab */}
                        <TabsContent value="orders">
                            <Card className="shadow-md">
                                <CardHeader>
                                    <CardTitle>My Orders</CardTitle>
                                    <CardDescription>Track and manage your purchases</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {orders.length > 0 ? (
                                        <div className="space-y-4">
                                            {orders.map((order) => (
                                                <Card key={order._id} className="overflow-hidden hover:shadow-md transition-shadow">
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h3 className="font-medium">{order.gigTitle}</h3>
                                                                <p className="text-sm text-gray-500">Order #{order._id.substring(0, 8)}</p>
                                                                <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold">${order.amount.toFixed(2)}</p>
                                                                <span className={`inline-block px-2 py-1 rounded text-xs ${
                                                                    order.status === "completed" ? "bg-green-100 text-green-800" :
                                                                    order.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                                                                    "bg-yellow-100 text-yellow-800"
                                                                }`}>
                                                                    {order.status.replace("_", " ").toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                                            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-600 mb-2">You haven't placed any orders yet.</p>
                                            <p className="text-gray-500 mb-6">Start exploring services to find what you need.</p>
                                            <Button className="bg-green-600 hover:bg-green-700 text-white">
                                                Browse Services
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Favorites Tab */}
                        <TabsContent value="favorites">
                            <Card className="shadow-md">
                                <CardHeader>
                                    <CardTitle>My Favorites</CardTitle>
                                    <CardDescription>Services you've saved</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {favorites.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {favorites.map((gig) => (
                                                <Card key={gig._id} className="overflow-hidden hover:shadow-md transition-all hover:translate-y-px">
                                                    <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                                                        <ShoppingBag className="h-12 w-12 text-gray-400" />
                                                    </div>
                                                    <CardContent className="p-4">
                                                        <div>
                                                            <h3 className="font-medium line-clamp-1">{gig.title}</h3>
                                                            <div className="flex items-center mt-2">
                                                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                                                <span>{gig.rating || "New"}</span>
                                                            </div>
                                                            <p className="font-bold text-green-600 mt-2">Starting at ${gig.packages[0]?.price.toFixed(2)}</p>
                                                            <Button className="mt-3 w-full text-sm h-8" variant="outline">View Details</Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                                            <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-600 mb-2">You don't have any favorite services yet.</p>
                                            <p className="text-gray-500 mb-6">Save services you like to find them easily later.</p>
                                            <Button className="bg-green-600 hover:bg-green-700 text-white">
                                                Browse Services
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Payment Methods Tab */}
                        <TabsContent value="payment">
                            <Card className="shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Payment Methods</CardTitle>
                                        <CardDescription>Manage your payment information</CardDescription>
                                    </div>
                                    <Button 
                                        variant="outline"
                                        onClick={() => setShowPaymentModal(true)}
                                        className="transition-all hover:bg-green-50"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Method
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {user?.paymentMethods && user.paymentMethods.length > 0 ? (
                                        <div className="space-y-4">
                                            {user.paymentMethods.map((method, index) => (
                                                <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                                                    <CardContent className="p-4 flex justify-between items-center">
                                                        <div className="flex items-center">
                                                            <div className="mr-4 bg-blue-50 p-3 rounded-full">
                                                                {method.type === "credit_card" && (
                                                                    <CreditCard className="h-6 w-6 text-blue-500" />
                                                                )}
                                                                {/* Icons for other payment types can be added here */}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-medium capitalize">{method.type.replace("_", " ")}</h3>
                                                                <p className="text-sm text-gray-500">
                                                                    {method.type === "credit_card" ? `**** **** **** ${method.details.last4}` :
                                                                    method.type === "paypal" ? method.details.email :
                                                                    "Account ending in " + method.details.last4}
                                                                </p>
                                                                {method.details.expiryDate && (
                                                                    <p className="text-xs text-gray-400">Expires: {method.details.expiryDate}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            {method.isDefault && (
                                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded mr-2">
                                                                    Default
                                                                </span>
                                                            )}
                                                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                                            <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-600 mb-2">You don't have any payment methods yet.</p>
                                            <p className="text-gray-500 mb-6">Add a payment method to make purchases.</p>
                                            <Button 
                                                variant="outline" 
                                                onClick={() => setShowPaymentModal(true)}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Payment Method
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Payment Method Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-lg mx-4 shadow-xl">
                        <CardHeader className="border-b">
                            <CardTitle>Add Payment Method</CardTitle>
                            <CardDescription>Securely add a new payment method to your account</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleAddPaymentMethod}>
                                <div className="space-y-6">
                                    <div>
                                        <Label htmlFor="paymentType" className="text-sm font-medium">Payment Type</Label>
                                        <select
                                            id="paymentType"
                                            className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            value={paymentForm.type}
                                            onChange={(e) => setPaymentForm(prev => ({
                                                ...prev,
                                                type: e.target.value as PaymentMethod['type']
                                            }))}
                                        >
                                            <option value="credit_card">Credit Card</option>
                                            <option value="paypal">PayPal</option>
                                            <option value="bank_account">Bank Account</option>
                                        </select>
                                    </div>

                                    {paymentForm.type === 'credit_card' && (
                                        <>
                                            <div>
                                                <Label htmlFor="cardNumber" className="text-sm font-medium">Card Number</Label>
                                                <Input
                                                    id="cardNumber"
                                                    placeholder="**** **** **** ****"
                                                    className="mt-1"
                                                    onChange={(e) => setPaymentForm(prev => ({
                                                        ...prev,
                                                        details: {
                                                            ...prev.details,
                                                            last4: e.target.value.slice(-4)
                                                        }
                                                    }))}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="expiryDate" className="text-sm font-medium">Expiry Date</Label>
                                                    <Input
                                                        id="expiryDate"
                                                        placeholder="MM/YY"
                                                        className="mt-1"
                                                        onChange={(e) => setPaymentForm(prev => ({
                                                            ...prev,
                                                            details: {
                                                                ...prev.details,
                                                                expiryDate: e.target.value
                                                            }
                                                        }))}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="cvv" className="text-sm font-medium">CVV</Label>
                                                    <Input
                                                        id="cvv"
                                                        type="password"
                                                        maxLength={4}
                                                        placeholder="***"
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {paymentForm.type === 'paypal' && (
                                        <div>
                                            <Label htmlFor="paypalEmail" className="text-sm font-medium">PayPal Email</Label>
                                            <Input
                                                id="paypalEmail"
                                                type="email"
                                                className="mt-1"
                                                onChange={(e) => setPaymentForm(prev => ({
                                                    ...prev,
                                                    details: {
                                                        email: e.target.value
                                                    }
                                                }))}
                                            />
                                        </div>
                                    )}

                                    {paymentForm.type === 'bank_account' && (
                                        <>
                                            <div>
                                                <Label htmlFor="accountNumber" className="text-sm font-medium">Account Number</Label>
                                                <Input
                                                    id="accountNumber"
                                                    className="mt-1"
                                                    onChange={(e) => setPaymentForm(prev => ({
                                                        ...prev,
                                                        details: {
                                                            ...prev.details,
                                                            last4: e.target.value.slice(-4)
                                                        }
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="routingNumber" className="text-sm font-medium">Routing Number</Label>
                                                <Input id="routingNumber" className="mt-1" />
                                            </div>
                                        </>
                                    )}

                                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                        <input
                                            type="checkbox"
                                            id="isDefault"
                                            checked={paymentForm.isDefault}
                                            onChange={(e) => setPaymentForm(prev => ({
                                                ...prev,
                                                isDefault: e.target.checked
                                            }))}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <Label htmlFor="isDefault" className="text-sm">Set as default payment method</Label>
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-6">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => setShowPaymentModal(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit"
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            Add Payment Method
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
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
        </div>
    );
}