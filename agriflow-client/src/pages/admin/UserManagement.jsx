import { useState } from "react";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useResetPassword,
} from "../../hooks/useUsers";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, resetPasswordSchema } from "../../validations";
import { Plus, Edit, Trash2, Key, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const ROLES = ["ADMIN", "SALES", "ACCOUNTANT", "TECHNICIAN"];

const ROLE_VARIANT = {
  ADMIN: "destructive",
  SALES: "default",
  ACCOUNTANT: "secondary",
  TECHNICIAN: "outline",
};

export default function UserManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [resetOpen, setResetOpen] = useState(null);

  const { register: reg, handleSubmit: handleUserSubmit, reset: resetUser, formState: { errors: userErrors } } = useForm({
    resolver: zodResolver(userSchema),
  });

  const { register: resetReg, handleSubmit: handleResetSubmit, reset: resetPwd, formState: { errors: resetErrors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const { data, isLoading } = useUsers({ page, limit: 10, search, role: roleFilter });
  const createMut = useCreateUser();
  const updateMut = useUpdateUser();
  const deleteMut = useDeleteUser();
  const resetMut = useResetPassword();

  const onSubmitUser = (formData) => {
    if (editing) {
      const { password, ...updates } = formData;
      updateMut.mutate(
        { id: editing._id, data: updates },
        { onSuccess: () => { setOpen(false); setEditing(null); resetUser(); } }
      );
    } else {
      createMut.mutate(formData, {
        onSuccess: () => { setOpen(false); resetUser(); },
      });
    }
  };

  const onSubmitReset = (formData) => {
    resetMut.mutate(
      { id: resetOpen._id, data: formData },
      { onSuccess: () => { setResetOpen(null); resetPwd(); } }
    );
  };

  const handleEdit = (u) => {
    setEditing(u);
    resetUser({ name: u.name, email: u.email, password: "", role: u.role });
    setOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Deactivate this user?")) deleteMut.mutate(id);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-sm text-muted-foreground">Manage team members and their roles</p>
        </div>
        <Button onClick={() => { setEditing(null); resetUser(); setOpen(true); }}>
          <Plus className="size-4" /> Add User
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          className="pl-9"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant={roleFilter === "" ? "default" : "outline"}
          size="sm"
          onClick={() => { setRoleFilter(""); setPage(1); }}
        >
          All Roles
        </Button>
        {ROLES.map((r) => (
          <Button
            key={r}
            variant={roleFilter === r ? "default" : "outline"}
            size="sm"
            onClick={() => { setRoleFilter(r); setPage(1); }}
          >
            {r}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : data?.users?.length ? (
              data.users.map((u, i) => (
                <TableRow key={u._id} className={!u.isActive ? "opacity-50" : ""}>
                  <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_VARIANT[u.role] || "secondary"}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? "secondary" : "destructive"}>
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(u)}>
                        <Edit className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => { setResetOpen(u); resetPwd(); }} title="Reset Password">
                        <Key className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(u._id)} disabled={!u.isActive} className="text-destructive hover:text-destructive">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No users found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data?.total > 10 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(data.total / 10)}</span>
          <Button variant="outline" size="sm" disabled={page * 10 >= data.total} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit User" : "Create User"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUserSubmit(onSubmitUser)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Full Name</label>
              <Input id="name" {...reg("name")} />
              {userErrors.name && <p className="text-sm text-destructive">{userErrors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" type="email" {...reg("email")} />
              {userErrors.email && <p className="text-sm text-destructive">{userErrors.email.message}</p>}
            </div>
            {!editing && (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input id="password" type="password" {...reg("password")} />
                {userErrors.password && <p className="text-sm text-destructive">{userErrors.password.message}</p>}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">Role</label>
              <select
                id="role"
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...reg("role")}
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetOpen} onOpenChange={() => setResetOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="size-4" /> Reset Password — {resetOpen?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetSubmit(onSubmitReset)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
              <Input id="newPassword" type="password" placeholder="Minimum 6 characters" {...resetReg("newPassword")} />
              {resetErrors.newPassword && <p className="text-sm text-destructive">{resetErrors.newPassword.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResetOpen(null)}>Cancel</Button>
              <Button type="submit" disabled={resetMut.isPending}>
                {resetMut.isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
