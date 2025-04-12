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
            console.log(userData);
            const parsedUserData = JSON.parse(userData);
            console.log(parsedUserData);
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

                const response = await axios.get("/api/client/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });



                // Fetch orders if available    
                if (response.data.orders && response.data.orders.length > 0) {
                    const ordersResponse = await axios.get("/api/client/orders", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setOrders(ordersResponse.data);
                }

                // Fetch favorites if available
                if (response.data.favorites && response.data.favorites.length > 0) {
                    const favoritesResponse = await axios.get("/api/client/favorites", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setFavorites(favoritesResponse.data);
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching user data:", error);
                toast("Failed to load profile data. Please try again later.",
                );
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await axios.put("/api/client/profile", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(response.data);
            localStorage.setItem("user", JSON.stringify(response.data));

            setEditMode(false);
            toast("Profile updated successfully",
            );
        } catch (error) {
            console.error("Error updating profile:", error);
            toast("Failed to update profile. Please try again.",
            );
        }
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    // Add these handlers
    const handleAddPaymentMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No authentication token found");
      
          const response = await axios.post('/api/buyer/payment-methods', paymentForm, {

            headers: { Authorization: `Bearer ${token}` }
          });
      
          setUser(prev => ({
            ...prev!,
            paymentMethods: response.data // ✅ updated correctly
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
      

    const handleDeletePaymentMethod = async (index: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");

            await axios.delete(`/api/client/payment-methods/${index}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(prev => ({
                ...prev!,
                paymentMethods: prev!.paymentMethods.filter((_, i) => i !== index)
            }));

            toast.success('Payment method removed successfully');
        } catch (error) {
            toast.error('Failed to remove payment method');
        }
    };

    const handleSetDefaultPaymentMethod = async (index: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");

            await axios.put(`/api/client/payment-methods/${index}/default`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(prev => ({
                ...prev!,
                paymentMethods: prev!.paymentMethods.map((method, i) => ({
                    ...method,
                    isDefault: i === index
                }))
            }));

            toast.success('Default payment method updated');
        } catch (error) {
            toast.error('Failed to update default payment method');
        }
    };
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading profile...</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left sidebar with avatar and user info */}
                <div className="w-full md:w-1/4">
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center">
                                <Avatar className="h-24 w-24 mb-4">
                                    <AvatarImage src={user?.avatar ? `/uploads/avatars/${user.avatar}` : undefined} alt={user?.firstName} />
                                    <AvatarFallback className="bg-green-600 text-white text-xl">
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <ShoppingBag className="h-5 w-5 mr-2 text-green-600" />
                                    <span>Orders: {user?.orders?.length || 0}</span>
                                </div>
                                <div className="flex items-center">
                                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                                    <span>Favorites: {user?.favorites?.length || 0}</span>
                                </div>
                                <div className="flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                                    <span>Payment Methods: {user?.paymentMethods?.length || 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main content area */}
                <div className="w-full md:w-3/4">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="orders">Orders</TabsTrigger>
                            <TabsTrigger value="favorites">Favorites</TabsTrigger>
                            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Personal Information</CardTitle>
                                        <CardDescription>Manage your personal details</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={toggleEditMode}>
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
                                                    onChange={handleInputChange}
                                                    disabled={true} // Email typically cannot be changed
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
                                                />
                                            </div>
                                        </div>
                                        {editMode && (
                                            <Button type="submit">
                                                Save Changes
                                            </Button>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Orders Tab */}
                        <TabsContent value="orders">
                            <Card>
                                <CardHeader>
                                    <CardTitle>My Orders</CardTitle>
                                    <CardDescription>Track and manage your purchases</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {orders.length > 0 ? (
                                        <div className="space-y-4">
                                            {orders.map((order) => (
                                                <Card key={order._id}>
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h3 className="font-medium">{order.gigTitle}</h3>
                                                                <p className="text-sm text-gray-500">Order #{order._id.substring(0, 8)}</p>
                                                                <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold">${order.amount}</p>
                                                                <span className={`inline-block px-2 py-1 rounded text-xs ${order.status === "completed" ? "bg-green-100 text-green-800" :
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
                                        <div className="text-center py-10">
                                            <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-500">You haven't placed any orders yet.</p>
                                            <Button className="mt-4" variant="outline">
                                                Browse Services
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Favorites Tab */}
                        <TabsContent value="favorites">
                            <Card>
                                <CardHeader>
                                    <CardTitle>My Favorites</CardTitle>
                                    <CardDescription>Services you've saved</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {favorites.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {favorites.map((gig) => (
                                                <Card key={gig._id} className="overflow-hidden">
                                                    <div className="h-40 bg-gray-200">
                                                        {/* Gig image would go here */}
                                                    </div>
                                                    <CardContent className="p-4">
                                                        <div>
                                                            <h3 className="font-medium line-clamp-1">{gig.title}</h3>
                                                            <div className="flex items-center mt-1">
                                                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                                                <span>{gig.rating || "New"}</span>
                                                            </div>
                                                            <p className="font-bold mt-2">Starting at ${gig.packages[0]?.price}</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-500">You don't have any favorite services yet.</p>
                                            <Button className="mt-4" variant="outline">
                                                Browse Services
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Payment Methods Tab */}
                        <TabsContent value="payment">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Payment Methods</CardTitle>
                                        <CardDescription>Manage your payment information</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={() => setShowPaymentModal(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Method
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {user?.paymentMethods && user.paymentMethods.length > 0 ? (
                                        <div className="space-y-4">
                                            {user.paymentMethods.map((method, index) => (
                                                <Card key={index}>
                                                    <CardContent className="p-4 flex justify-between items-center">
                                                        <div className="flex items-center">
                                                            <div className="mr-4">
                                                                {method.type === "credit_card" && (
                                                                    <CreditCard className="h-8 w-8 text-blue-500" />
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
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            {method.isDefault && (
                                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded mr-2">
                                                                    Default
                                                                </span>
                                                            )}
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-500">You don't have any payment methods yet.</p>
                                            <Button variant="outline" onClick={() => setShowPaymentModal(true)}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Method
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
                    <Card className="w-full max-w-lg mx-4">
                        <CardHeader>
                            <CardTitle>Add Payment Method</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddPaymentMethod}>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="paymentType">Payment Type</Label>
                                        <select
                                            id="paymentType"
                                            className="w-full p-2 border rounded"
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
                                                <Label htmlFor="cardNumber">Card Number</Label>
                                                <Input
                                                    id="cardNumber"
                                                    placeholder="**** **** **** ****"
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
                                                    <Label htmlFor="expiryDate">Expiry Date</Label>
                                                    <Input
                                                        id="expiryDate"
                                                        placeholder="MM/YY"
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
                                                    <Label htmlFor="cvv">CVV</Label>
                                                    <Input
                                                        id="cvv"
                                                        type="password"
                                                        maxLength={4}
                                                        placeholder="***"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {paymentForm.type === 'paypal' && (
                                        <div>
                                            <Label htmlFor="paypalEmail">PayPal Email</Label>
                                            <Input
                                                id="paypalEmail"
                                                type="email"
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
                                                <Label htmlFor="accountNumber">Account Number</Label>
                                                <Input
                                                    id="accountNumber"
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
                                                <Label htmlFor="routingNumber">Routing Number</Label>
                                                <Input id="routingNumber" />
                                            </div>
                                        </>
                                    )}

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="isDefault"
                                            checked={paymentForm.isDefault}
                                            onChange={(e) => setPaymentForm(prev => ({
                                                ...prev,
                                                isDefault: e.target.checked
                                            }))}
                                        />
                                        <Label htmlFor="isDefault">Set as default payment method</Label>
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">Add Payment Method</Button>
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