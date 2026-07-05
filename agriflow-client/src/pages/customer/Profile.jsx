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
    <div className="shop-page">
      <div className="page-hero page-hero-green">
        <div className="page-hero-inner">
          <div className="page-hero-content">
            <div className="profile-avatar-lg">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h1>{user?.name || "My Account"}</h1>
              <p>{user?.email || ""}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <nav className="profile-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`profile-nav-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
            <button className="profile-nav-item logout" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </aside>

        <main className="profile-main">
          {activeTab === "profile" && (
            <div className="profile-card">
              <div className="profile-card-header">
                <User className="h-5 w-5" />
                <div>
                  <h2>Personal Information</h2>
                  <p>Update your personal details</p>
                </div>
              </div>
              <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <div className="input-wrap">
                      <User className="input-icon" />
                      <input autoComplete="name" {...profileForm.register("name")} />
                    </div>
                    {profileForm.formState.errors.name && <span className="form-error">{profileForm.formState.errors.name.message}</span>}
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <div className="input-wrap">
                      <Mail className="input-icon" />
                      <input type="email" autoComplete="email" {...profileForm.register("email")} />
                    </div>
                    {profileForm.formState.errors.email && <span className="form-error">{profileForm.formState.errors.email.message}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <div className="input-wrap">
                    <Phone className="input-icon" />
                    <input autoComplete="tel" {...profileForm.register("phone")} />
                  </div>
                  {profileForm.formState.errors.phone && <span className="form-error">{profileForm.formState.errors.phone.message}</span>}
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={profileForm.formState.isSubmitting}>
                    <Save className="h-4 w-4" />
                    {profileForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "password" && (
            <div className="profile-card">
              <div className="profile-card-header">
                <Shield className="h-5 w-5" />
                <div>
                  <h2>Change Password</h2>
                  <p>Ensure your account stays secure</p>
                </div>
              </div>
              <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="profile-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="input-wrap">
                    <Lock className="input-icon" />
                    <input type="password" autoComplete="current-password" {...passwordForm.register("currentPassword")} />
                  </div>
                  {passwordForm.formState.errors.currentPassword && <span className="form-error">{passwordForm.formState.errors.currentPassword.message}</span>}
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-wrap">
                    <Lock className="input-icon" />
                    <input type="password" autoComplete="new-password" {...passwordForm.register("newPassword")} />
                  </div>
                  {passwordForm.formState.errors.newPassword && <span className="form-error">{passwordForm.formState.errors.newPassword.message}</span>}
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="input-wrap">
                    <Lock className="input-icon" />
                    <input type="password" autoComplete="new-password" {...passwordForm.register("confirmPassword")} />
                  </div>
                  {passwordForm.formState.errors.confirmPassword && <span className="form-error">{passwordForm.formState.errors.confirmPassword.message}</span>}
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={passwordForm.formState.isSubmitting}>
                    <Shield className="h-4 w-4" />
                    {passwordForm.formState.isSubmitting ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="profile-card">
              <div className="profile-card-header">
                <MapPin className="h-5 w-5" />
                <div>
                  <h2>Saved Addresses</h2>
                  <p>Manage your delivery addresses</p>
                </div>
                <button className="btn-primary btn-sm" onClick={() => { setAddressEditingId(null); addressForm.reset(); setShowAddressForm(true); }}>
                  <Plus className="h-4 w-4" /> Add New
                </button>
              </div>

              {!showAddressForm ? (
                <div className="address-list">
                  {loadingAddresses ? (
                    <div className="address-skeleton">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="address-skeleton-item">
                          <div className="skeleton-line short"></div>
                          <div className="skeleton-line"></div>
                          <div className="skeleton-line medium"></div>
                        </div>
                      ))}
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="address-empty">
                      <MapPin className="h-10 w-10" />
                      <p>No saved addresses yet.</p>
                      <button className="btn-outline" onClick={() => { setAddressEditingId(null); addressForm.reset(); setShowAddressForm(true); }}>
                        <Plus className="h-4 w-4" /> Add Your First Address
                      </button>
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <div key={addr._id} className="address-card">
                        <div className="address-card-body">
                          <div className="address-card-top">
                            <span className="address-name">{addr.fullName}</span>
                            {addr.isDefault && <span className="address-badge">Default</span>}
                          </div>
                          <p className="address-text">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="address-phone">Phone: {addr.phone}</p>
                        </div>
                        <div className="address-card-actions">
                          <button className="address-action-btn" onClick={() => {
                            setAddressEditingId(addr._id);
                            addressForm.reset({ fullName: addr.fullName, phone: addr.phone, addressLine1: addr.addressLine1, city: addr.city, state: addr.state, pincode: addr.pincode, country: addr.country || "India", isDefault: addr.isDefault || false });
                            setShowAddressForm(true);
                          }}>
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                          <button className="address-action-btn danger" onClick={() => handleDeleteAddress(addr._id)}>
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="address-form-wrap">
                  <form onSubmit={addressForm.handleSubmit(handleSaveAddress)} className="profile-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input autoComplete="name" {...addressForm.register("fullName")} />
                        {addressForm.formState.errors.fullName && <span className="form-error">{addressForm.formState.errors.fullName.message}</span>}
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input autoComplete="tel" {...addressForm.register("phone")} />
                        {addressForm.formState.errors.phone && <span className="form-error">{addressForm.formState.errors.phone.message}</span>}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input placeholder="Street address, apartment, etc." autoComplete="street-address" {...addressForm.register("addressLine1")} />
                      {addressForm.formState.errors.addressLine1 && <span className="form-error">{addressForm.formState.errors.addressLine1.message}</span>}
                    </div>
                    <div className="form-row form-row-3">
                      <div className="form-group">
                        <label>City</label>
                        <input autoComplete="address-level2" {...addressForm.register("city")} />
                        {addressForm.formState.errors.city && <span className="form-error">{addressForm.formState.errors.city.message}</span>}
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input autoComplete="address-level1" {...addressForm.register("state")} />
                        {addressForm.formState.errors.state && <span className="form-error">{addressForm.formState.errors.state.message}</span>}
                      </div>
                      <div className="form-group">
                        <label>Pincode</label>
                        <input autoComplete="postal-code" {...addressForm.register("pincode")} />
                        {addressForm.formState.errors.pincode && <span className="form-error">{addressForm.formState.errors.pincode.message}</span>}
                      </div>
                    </div>
                    <label className="checkbox-label">
                      <input type="checkbox" {...addressForm.register("isDefault")} />
                      Set as default address
                    </label>
                    <div className="form-actions">
                      <button type="button" className="btn-outline" onClick={() => { setShowAddressForm(false); setAddressEditingId(null); }}>Cancel</button>
                      <button type="submit" className="btn-primary" disabled={createAddress.isPending || updateAddress.isPending}>
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
  );
}
