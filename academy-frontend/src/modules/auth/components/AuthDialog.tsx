import { useState, type FormEvent } from "react";
import { useAuth } from "@/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Mode = "login" | "signup";

export const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      setPending(true);

      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }

      setName("");
      setEmail("");
      setPassword("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "login" ? "Login" : "Create account"}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === "login" ? "default" : "outline"}
            onClick={() => setMode("login")}
          >
            Login
          </Button>
          <Button
            type="button"
            variant={mode === "signup" ? "default" : "outline"}
            onClick={() => setMode("signup")}
          >
            Sign up
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="auth-name">Name</Label>
              <Input
                id="auth-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error ? <p className="text-sm text-rose-500">{error}</p> : null}

          <Button type="submit" disabled={pending} className="w-full">
            {pending
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
