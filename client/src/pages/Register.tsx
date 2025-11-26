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
import { registerSchema } from "@shared/schema";
import { GraduationCap, UserPlus, Eye, EyeOff, Shield, BookOpen, Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | "admin">("student");

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: "student",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const { confirmPassword, ...registerData } = data;
      const response = await apiRequest("POST", "/api/auth/register", registerData);
      return response.json();
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Inscription réussie",
        description: user.role === "teacher" 
          ? "Votre demande d'enseignant est en attente d'approbation."
          : `Bienvenue ${user.firstName || ""}!`,
      });
      if (user.role === "admin") {
        setLocation("/admin");
      } else if (user.role === "teacher") {
        setLocation("/teacher");
      } else {
        setLocation("/");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate({ ...data, role: selectedRole });
  };

  const roleInfo = {
    student: {
      icon: Users,
      title: "Élève",
      description: "Accédez à tous les cours et sessions en direct",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      notice: null,
    },
    teacher: {
      icon: BookOpen,
      title: "Enseignant",
      description: "Créez et gérez vos propres cours",
      color: "text-green-600",
      bgColor: "bg-green-50",
      notice: "Votre compte enseignant devra être approuvé par un administrateur avant de pouvoir créer des cours.",
    },
    admin: {
      icon: Shield,
      title: "Administrateur",
      description: "Gérez la plateforme et les utilisateurs",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      notice: "Les comptes administrateurs sont réservés au personnel autorisé.",
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
          <CardTitle className="text-2xl">Inscription</CardTitle>
          <CardDescription>Créez votre compte pour accéder à la plateforme</CardDescription>
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
              <TabsContent key={role} value={role} className="mt-4 space-y-3">
                <div className={`p-3 rounded-lg ${roleInfo[role].bgColor}`}>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = roleInfo[role].icon;
                      return <Icon className={`w-5 h-5 ${roleInfo[role].color}`} />;
                    })()}
                    <span className={`font-medium ${roleInfo[role].color}`}>{roleInfo[role].title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{roleInfo[role].description}</p>
                </div>
                {roleInfo[role].notice && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {roleInfo[role].notice}
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            ))}
          </Tabs>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jean"
                          data-testid="input-firstname"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Dupont"
                          data-testid="input-lastname"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          data-testid="input-confirm-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          data-testid="button-toggle-confirm-password"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                {registerMutation.isPending ? (
                  "Inscription..."
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    S'inscrire
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Déjà un compte ? </span>
            <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
              Se connecter
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
