import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, MapPin, Plus, Pencil, Trash2, Save, LogOut, Shield, Phone, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import customerAuthService from "@/services/customer-auth.service";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "@/hooks/useQueries";
import {
  profileUpdateSchema,
  passwordChangeSchema,
  addressSchema,
} from "@/utils/validators";

export default function Profile() {
  const { user, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressEditingId, setAddressEditingId] = useState(null);

  const { data: addressesData, isLoading: loadingAddresses } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const addresses = addressesData?.addresses || [];

  const profileForm = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "", phone: "", addressLine1: "", city: "", state: "",
      pincode: "", country: "India", isDefault: false,
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
    }
  }, [user, profileForm]);

  const handleUpdateProfile = async (data) => {
    try {
      await customerAuthService.updateProfile(data);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async (data) => {
    try {
      await customerAuthService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success("Password changed successfully");
      passwordForm.reset();
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    }
  };

  const handleSaveAddress = (data) => {
    if (addressEditingId) {
      updateAddress.mutate({ id: addressEditingId, data }, {
        onSuccess: () => { toast.success("Address updated"); setShowAddressForm(false); setAddressEditingId(null); addressForm.reset(); },
        onError: () => toast.error("Failed to save address"),
      });
    } else {
      createAddress.mutate(data, {
        onSuccess: () => { toast.success("Address added"); setShowAddressForm(false); setAddressEditingId(null); addressForm.reset(); },
        onError: () => toast.error("Failed to save address"),
      });
    }
  };

  const handleDeleteAddress = (id) => {
    deleteAddress.mutate(id, { onSuccess: () => toast.success("Address deleted"), onError: () => toast.error("Failed to delete address") });
  };

  const handleLogout = async () => { await logout(); navigate("/"); };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Shield },
    { id: "addresses", label: "Addresses", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner */}
      <div className="bg-green-600 text-white rounded-2xl p-6 mb-6 shadow-lg shadow-green-600/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-2xl font-bold ring-4 ring-green-500/30">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name || "My Account"}</h1>
            <p className="text-green-100">{user?.email || ""}</p>
          </div>
        </div>
      </div>

      {/* Profile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="bg-white rounded-xl border p-4 shadow-sm">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm ${
                  activeTab === tab.id
                    ? "bg-green-50 text-green-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
            <button
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 p-5 border-b">
                <User className="h-5 w-5 text-green-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-500">Update your personal details</p>
                </div>
              </div>
              <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        autoComplete="name"
                        {...profileForm.register("name")}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none pl-10"
                      />
                    </div>
                    {profileForm.formState.errors.name && (
                      <span className="text-red-500 text-xs">{profileForm.formState.errors.name.message}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        autoComplete="email"
                        value={user?.email || ""}
                        readOnly
                        className="w-full border rounded-lg px-3 py-2.5 text-sm bg-gray-50 cursor-not-allowed pl-10"
                      />
                    </div>
                    {profileForm.formState.errors.email && (
                      <span className="text-red-500 text-xs">{profileForm.formState.errors.email.message}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      autoComplete="tel"
                      {...profileForm.register("phone")}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none pl-10"
                    />
                  </div>
                  {profileForm.formState.errors.phone && (
                    <span className="text-red-500 text-xs">{profileForm.formState.errors.phone.message}</span>
                  )}
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={profileForm.formState.isSubmitting}
                  >
                    <Save className="h-4 w-4" />
                    {profileForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 p-5 border-b">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                  <p className="text-sm text-gray-500">Ensure your account stays secure</p>
                </div>
              </div>
              <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      autoComplete="current-password"
                      {...passwordForm.register("currentPassword")}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none pl-10"
                    />
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <span className="text-red-500 text-xs">{passwordForm.formState.errors.currentPassword.message}</span>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      autoComplete="new-password"
                      {...passwordForm.register("newPassword")}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none pl-10"
                    />
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <span className="text-red-500 text-xs">{passwordForm.formState.errors.newPassword.message}</span>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      autoComplete="new-password"
                      {...passwordForm.register("confirmPassword")}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none pl-10"
                    />
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <span className="text-red-500 text-xs">{passwordForm.formState.errors.confirmPassword.message}</span>
                  )}
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={passwordForm.formState.isSubmitting}
                  >
                    <Shield className="h-4 w-4" />
                    {passwordForm.formState.isSubmitting ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 p-5 border-b">
                <MapPin className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
                  <p className="text-sm text-gray-500">Manage your delivery addresses</p>
                </div>
                <button
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  onClick={() => { setAddressEditingId(null); addressForm.reset(); setShowAddressForm(true); }}
                >
                  <Plus className="h-4 w-4" /> Add New
                </button>
              </div>

              {!showAddressForm ? (
                <div className="p-5 space-y-4">
                  {loadingAddresses ? (
                    <div className="space-y-3">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="border rounded-xl p-4 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No saved addresses yet.</p>
                      <button
                        className="flex items-center gap-2 border border-green-600 text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors mx-auto"
                        onClick={() => { setAddressEditingId(null); addressForm.reset(); setShowAddressForm(true); }}
                      >
                        <Plus className="h-4 w-4" /> Add Your First Address
                      </button>
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <div key={addr._id} className="border rounded-xl p-4 hover:border-green-200 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-gray-900">{addr.fullName}</span>
                          {addr.isDefault && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-sm text-gray-500 mb-3">Phone: {addr.phone}</p>
                        <div className="flex items-center gap-2">
                          <button
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                            onClick={() => {
                              setAddressEditingId(addr._id);
                              addressForm.reset({
                                fullName: addr.fullName, phone: addr.phone, addressLine1: addr.addressLine1,
                                city: addr.city, state: addr.state, pincode: addr.pincode,
                                country: addr.country || "India", isDefault: addr.isDefault || false,
                              });
                              setShowAddressForm(true);
                            }}
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                          <button
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                            onClick={() => handleDeleteAddress(addr._id)}
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="p-5">
                  <form onSubmit={addressForm.handleSubmit(handleSaveAddress)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                          autoComplete="name"
                          {...addressForm.register("fullName")}
                          className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                        {addressForm.formState.errors.fullName && (
                          <span className="text-red-500 text-xs">{addressForm.formState.errors.fullName.message}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          autoComplete="tel"
                          {...addressForm.register("phone")}
                          className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                        {addressForm.formState.errors.phone && (
                          <span className="text-red-500 text-xs">{addressForm.formState.errors.phone.message}</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        placeholder="Street address, apartment, etc."
                        autoComplete="street-address"
                        {...addressForm.register("addressLine1")}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      />
                      {addressForm.formState.errors.addressLine1 && (
                        <span className="text-red-500 text-xs">{addressForm.formState.errors.addressLine1.message}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                          autoComplete="address-level2"
                          {...addressForm.register("city")}
                          className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                        {addressForm.formState.errors.city && (
                          <span className="text-red-500 text-xs">{addressForm.formState.errors.city.message}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                          autoComplete="address-level1"
                          {...addressForm.register("state")}
                          className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                        {addressForm.formState.errors.state && (
                          <span className="text-red-500 text-xs">{addressForm.formState.errors.state.message}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Pincode</label>
                        <input
                          autoComplete="postal-code"
                          {...addressForm.register("pincode")}
                          className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                        {addressForm.formState.errors.pincode && (
                          <span className="text-red-500 text-xs">{addressForm.formState.errors.pincode.message}</span>
                        )}
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        {...addressForm.register("isDefault")}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      Set as default address
                    </label>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        onClick={() => { setShowAddressForm(false); setAddressEditingId(null); }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        disabled={createAddress.isPending || updateAddress.isPending}
                      >
                        <Save className="h-4 w-4" />
                        {addressEditingId ? "Update" : "Save"} Address
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      </div>
    </div>
  );
}
