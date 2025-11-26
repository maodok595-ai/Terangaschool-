import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { loginSchema } from "@shared/schema";
import { GraduationCap, LogIn, Eye, EyeOff } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | "admin">("student");

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${user.firstName || ""}!`,
      });
      
      let targetPath = "/";
      if (user.role === "admin") {
        targetPath = "/admin";
      } else if (user.role === "teacher") {
        targetPath = "/teacher";
      }
      
      window.location.replace(targetPath);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TERANGA SCHOOL</span>
          </Link>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>Connectez-vous à votre compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-medium">Sélectionner votre rôle</Label>
            <RadioGroup 
              value={selectedRole} 
              onValueChange={(v) => setSelectedRole(v as "student" | "teacher" | "admin")}
              className="space-y-2"
            >
              <div 
                className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedRole === "student" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}
                onClick={() => setSelectedRole("student")}
              >
                <RadioGroupItem value="student" id="student" data-testid="radio-student" />
                <Label htmlFor="student" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="text-xl">👨‍🎓</span>
                  <span className="font-medium">Étudiant</span>
                </Label>
              </div>
              <div 
                className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedRole === "teacher" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}
                onClick={() => setSelectedRole("teacher")}
              >
                <RadioGroupItem value="teacher" id="teacher" data-testid="radio-teacher" />
                <Label htmlFor="teacher" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="text-xl">👨‍🏫</span>
                  <span className="font-medium">Professeur</span>
                </Label>
              </div>
              <div 
                className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedRole === "admin" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}
                onClick={() => setSelectedRole("admin")}
              >
                <RadioGroupItem value="admin" id="admin" data-testid="radio-admin" />
                <Label htmlFor="admin" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="text-xl">👑</span>
                  <span className="font-medium">Administrateur</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="votre@email.com"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          data-testid="input-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  "Connexion..."
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Pas encore de compte ? </span>
            <Link href="/register" className="text-primary hover:underline" data-testid="link-register">
              S'inscrire
            </Link>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:underline" data-testid="link-back-home">
              Retour à l'accueil
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
