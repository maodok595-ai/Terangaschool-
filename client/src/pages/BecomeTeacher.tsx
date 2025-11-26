import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { registerTeacherSchema, TEACHER_STATUS_BADGES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  CheckCircle, 
  Users, 
  Video, 
  BookOpen,
  ArrowRight,
  Clock,
  AlertCircle
} from "lucide-react";
import { z } from "zod";

const formSchema = z.object({
  specialization: z.string().min(2, "La spécialisation est requise"),
  bio: z.string().min(10, "La bio doit contenir au moins 10 caractères"),
});

export default function BecomeTeacher() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specialization: "",
      bio: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/api/become-teacher", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ 
        title: "Demande envoyée !",
        description: "Votre demande sera examinée par un administrateur."
      });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    registerMutation.mutate(data);
  };

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <section className="py-20 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 md:px-6 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <GraduationCap className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Devenez enseignant</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Partagez vos connaissances et aidez des étudiants à réussir leurs études.
              </p>
              <Button size="lg" asChild className="text-base px-8" data-testid="button-login-to-apply">
                <Link href="/login">
                  Se connecter pour postuler
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </section>

          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: BookOpen,
                    title: "Créez des cours PDF",
                    description: "Uploadez vos documents de cours et partagez-les avec des étudiants motivés.",
                  },
                  {
                    icon: Video,
                    title: "Animez des lives",
                    description: "Enseignez en direct via Jitsi et interagissez en temps réel avec vos élèves.",
                  },
                  {
                    icon: Users,
                    title: "Touchez des milliers d'étudiants",
                    description: "Rejoignez une communauté active et faites la différence dans la vie des étudiants.",
                  },
                ].map((item, index) => (
                  <Card key={index} className="text-center hover-elevate overflow-visible">
                    <CardContent className="pt-8 pb-6 space-y-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <item.icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (user?.role === "teacher") {
    if (user.teacherStatus === "pending") {
      return (
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1 flex items-center justify-center py-20">
            <Card className="max-w-md mx-auto">
              <CardContent className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-xl font-semibold">Demande en cours de traitement</h2>
                <p className="text-muted-foreground">
                  Votre demande d'enseignant est en cours d'examen. Vous serez notifié une fois votre compte validé.
                </p>
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  En attente de validation
                </Badge>
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
      );
    }

    if (user.teacherStatus === "approved") {
      return (
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1 flex items-center justify-center py-20">
            <Card className="max-w-md mx-auto">
              <CardContent className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold">Vous êtes enseignant !</h2>
                <p className="text-muted-foreground">
                  Votre compte enseignant est actif. Accédez à votre tableau de bord pour commencer.
                </p>
                <Button asChild data-testid="button-go-to-dashboard">
                  <a href="/teacher">
                    Accéder au tableau de bord
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
      );
    }

    if (user.teacherStatus === "rejected") {
      return (
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1 flex items-center justify-center py-20">
            <Card className="max-w-md mx-auto">
              <CardContent className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold">Demande refusée</h2>
                <p className="text-muted-foreground">
                  Malheureusement, votre demande d'enseignant n'a pas été approuvée. Contactez-nous pour plus d'informations.
                </p>
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  Refusée
                </Badge>
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
      );
    }
  }

  if (user?.role === "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center space-y-4">
              <h2 className="text-xl font-semibold">Vous êtes administrateur</h2>
              <p className="text-muted-foreground">
                En tant qu'administrateur, vous n'avez pas besoin de postuler comme enseignant.
              </p>
              <Button asChild>
                <a href="/admin">Accéder à l'administration</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-12 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Devenez enseignant</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Remplissez le formulaire ci-dessous pour soumettre votre candidature. Un administrateur examinera votre demande.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-lg mx-auto px-4 md:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Formulaire de candidature</CardTitle>
                <CardDescription>
                  Parlez-nous de vous et de votre expérience pédagogique.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spécialisation *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Mathématiques, Physique-Chimie..."
                              {...field}
                              data-testid="input-specialization"
                            />
                          </FormControl>
                          <FormDescription>
                            Indiquez votre ou vos matières principales
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biographie *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Décrivez votre parcours, votre expérience d'enseignement, vos qualifications..."
                              className="min-h-[150px]"
                              {...field}
                              data-testid="textarea-bio"
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum 10 caractères
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                      data-testid="button-submit-application"
                    >
                      {registerMutation.isPending ? "Envoi en cours..." : "Soumettre ma candidature"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
