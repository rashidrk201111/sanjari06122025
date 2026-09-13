import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { AdminUser } from "../context/AdminContext";
import { User } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: AdminUser | null;
  onSave: (user: AdminUser) => Promise<{ success: boolean; error?: string }>;
}

export function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isActive, setIsActive] = useState(user?.isActive ?? true);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      setIsActive(user.isActive);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setIsActive(true);
    }
  }, [user, open]);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const updatedUser: AdminUser = {
      id: user?.id || `user_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      isActive,
      joinedDate: user?.joinedDate || new Date().toISOString().split('T')[0],
    };

    const result = await onSave(updatedUser);
    if (result.success) {
      toast.success(user ? "User updated!" : "User added!");
      onOpenChange(false);
      return;
    }

    toast.error(result.error || (user ? "Failed to update user" : "Failed to add user"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {user ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription>
            {user ? "Update user information" : "Add a new user to the system"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="userName">Full Name *</Label>
            <Input
              id="userName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userEmail">Email *</Label>
            <Input
              id="userEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userPhone">Phone Number</Label>
            <Input
              id="userPhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="userActive" className="cursor-pointer">
              Account Active
            </Label>
            <Switch
              id="userActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            {user ? "Update User" : "Add User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
