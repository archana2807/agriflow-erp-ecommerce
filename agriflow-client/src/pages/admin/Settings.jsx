import { useEffect } from "react";
import { Loader2, User, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import authService from "@/services/auth.service";
import { toast } from "sonner";
import { adminProfileUpdateSchema, passwordChangeSchema } from "@/utils/validators";

export default function Settings() {
  const { user } = useAuth();

  const profileForm = useForm({
    resolver: zodResolver(adminProfileUpdateSchema),
    defaultValues: { name: "", email: "" },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user, profileForm]);

  const handleProfileUpdate = async (data) => {
    try {
      const res = await authService.updateProfile(data);
      if (res.success) {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (data) => {
    try {
      const res = await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (res.success) {
        toast.success("Password changed successfully");
        passwordForm.reset();
      }
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your account settings</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-5 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" autoComplete="name" className="border-slate-200 focus-visible:ring-slate-400/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Your email" autoComplete="email" className="border-slate-200 focus-visible:ring-slate-400/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={profileForm.formState.isSubmitting} className="bg-slate-900 hover:bg-slate-800 text-white">
                {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-5 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter current password" autoComplete="current-password" className="border-slate-200 focus-visible:ring-slate-400/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" autoComplete="new-password" className="border-slate-200 focus-visible:ring-slate-400/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" autoComplete="new-password" className="border-slate-200 focus-visible:ring-slate-400/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={passwordForm.formState.isSubmitting} className="bg-slate-900 hover:bg-slate-800 text-white">
                {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
