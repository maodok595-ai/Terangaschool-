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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { loginSchema } from "@shared/schema";
import { GraduationCap, LogIn, Eye, EyeOff, Shield, BookOpen, Users } from "lucide-react";

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
      
      // Force page reload to ensure proper redirect in production
      let targetPath = "/";
      if (user.role === "admin") {
        targetPath = "/admin";
      } else if (user.role === "teacher") {
        targetPath = "/teacher";
      }
      
      // Use window.location for reliable redirect in production
      setTimeout(() => {
        window.location.href = targetPath;
      }, 500);
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

  const roleInfo = {
    student: {
      icon: Users,
      title: "Élève",
      description: "Accédez à tous les cours et sessions en direct",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    teacher: {
      icon: BookOpen,
      title: "Enseignant",
      description: "Gérez vos cours et sessions en direct",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    admin: {
      icon: Shield,
      title: "Administrateur",
      description: "Gérez la plateforme et les utilisateurs",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TERANGASCHOOL</span>
          </Link>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>Choisissez votre type de compte pour vous connecter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as any)} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="student" className="flex items-center gap-1" data-testid="tab-student">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Élève</span>
              </TabsTrigger>
              <TabsTrigger value="teacher" className="flex items-center gap-1" data-testid="tab-teacher">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Prof</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-1" data-testid="tab-admin">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </TabsTrigger>
            </TabsList>

            {(["student", "teacher", "admin"] as const).map((role) => (
              <TabsContent key={role} value={role} className="mt-4">
                <div className={`p-3 rounded-lg ${roleInfo[role].bgColor} mb-4`}>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = roleInfo[role].icon;
                      return <Icon className={`w-5 h-5 ${roleInfo[role].color}`} />;
                    })()}
                    <span className={`font-medium ${roleInfo[role].color}`}>{roleInfo[role].title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{roleInfo[role].description}</p>
                </div>
              </TabsContent>
            ))}
          </Tabs>

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
