import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Auth = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <p className="font-arabic text-xl text-primary mb-2">﷽</p>
          <CardTitle className="text-2xl font-bold">Welcome to Hasanat</CardTitle>
          <CardDescription>Sign in to continue your spiritual journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="your@email.com" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full" asChild>
            <Link to="/dashboard">Sign In</Link>
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/auth" className="text-primary font-medium hover:underline">Sign up</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
