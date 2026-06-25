import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, MapPin, Plus, Pencil, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import customerAuthService from "@/services/customer-auth.service";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "@/hooks/useQueries";

export default function Profile() {
  const { user, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const { data: addressesData, isLoading: loadingAddresses } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const addresses = addressesData?.addresses || [];

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.email) {
      toast.error("Name and email are required");
      return;
    }
    setLoading(true);
    try {
      await customerAuthService.updateProfile(profileForm);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill all fields");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await customerAuthService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = () => {
    if (!addressForm.fullName || !addressForm.phone || !addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    if (editingAddress) {
      updateAddress.mutate(
        { id: editingAddress, data: addressForm },
        {
          onSuccess: () => {
            toast.success("Address updated");
            setShowAddressDialog(false);
            setEditingAddress(null);
            setAddressForm({ fullName: "", phone: "", addressLine1: "", city: "", state: "", pincode: "", country: "India", isDefault: false });
          },
          onError: () => toast.error("Failed to save address"),
        }
      );
    } else {
      createAddress.mutate(addressForm, {
        onSuccess: () => {
          toast.success("Address added");
          setShowAddressDialog(false);
          setEditingAddress(null);
          setAddressForm({ fullName: "", phone: "", addressLine1: "", city: "", state: "", pincode: "", country: "India", isDefault: false });
        },
        onError: () => toast.error("Failed to save address"),
      });
    }
  };

  const handleDeleteAddress = (id) => {
    deleteAddress.mutate(id, {
      onSuccess: () => toast.success("Address deleted"),
      onError: () => toast.error("Failed to delete address"),
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-2">
            <Lock className="h-4 w-4" />
            Change Password
          </TabsTrigger>
          <TabsTrigger value="addresses" className="gap-2">
            <MapPin className="h-4 w-4" />
            Addresses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                    autoComplete="tel"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Ensure your account stays secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  <Lock className="h-4 w-4 mr-2" />
                  {loading ? "Changing..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Saved Addresses</CardTitle>
                <CardDescription>Manage your delivery addresses</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setEditingAddress(null);
                  setAddressForm({ fullName: "", phone: "", addressLine1: "", city: "", state: "", pincode: "", country: "India", isDefault: false });
                  setShowAddressDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingAddresses ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-64 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No saved addresses yet.
                </p>
              ) : (
                addresses.map((addr) => (
                  <div key={addr._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{addr.fullName}</span>
                          {addr.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Phone: {addr.phone}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingAddress(addr._id);
                            setAddressForm({
                              fullName: addr.fullName,
                              phone: addr.phone,
                              addressLine1: addr.addressLine1,
                              city: addr.city,
                              state: addr.state,
                              pincode: addr.pincode,
                              country: addr.country || "India",
                              isDefault: addr.isDefault || false,
                            });
                            setShowAddressDialog(true);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAddress(addr._id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addr-name">Full Name *</Label>
                <Input
                  id="addr-name"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm((p) => ({ ...p, fullName: e.target.value }))}
                  autoComplete="name"
                />
              </div>
              <div>
                <Label htmlFor="addr-phone">Phone *</Label>
                <Input
                  id="addr-phone"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                  autoComplete="tel"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="addr-address">Address *</Label>
              <Input
                id="addr-address"
                value={addressForm.addressLine1}
                onChange={(e) => setAddressForm((p) => ({ ...p, addressLine1: e.target.value }))}
                placeholder="Street address, apartment, etc."
                autoComplete="street-address"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="addr-city">City *</Label>
                <Input
                  id="addr-city"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                  autoComplete="address-level2"
                />
              </div>
              <div>
                <Label htmlFor="addr-state">State *</Label>
                <Input
                  id="addr-state"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                  autoComplete="address-level1"
                />
              </div>
              <div>
                <Label htmlFor="addr-pincode">Pincode *</Label>
                <Input
                  id="addr-pincode"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm((p) => ({ ...p, pincode: e.target.value }))}
                  autoComplete="postal-code"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddressDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAddress} disabled={createAddress.isPending || updateAddress.isPending}>
              {editingAddress ? "Update" : "Save"} Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
