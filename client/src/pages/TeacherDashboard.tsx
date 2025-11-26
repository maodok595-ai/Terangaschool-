import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatsGridSkeleton, TableRowSkeleton } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { EDUCATION_LEVELS, SUBJECTS, getLevelLabel, getSubjectLabel, TEACHER_STATUS_BADGES } from "@/lib/constants";
import { getFullName } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { createCourseSchema, createLiveCourseSchema } from "@shared/schema";
import { 
  BookOpen, 
  Video, 
  Users, 
  TrendingUp,
  Plus,
  Upload,
  Calendar,
  Eye,
  Edit,
  Trash2,
  FileText,
  Clock,
  AlertCircle,
  Play,
  Square,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Course, LiveCourse } from "@shared/schema";
import { z } from "zod";

export default function TeacherDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [createLiveOpen, setCreateLiveOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "teacher")) {
      toast({
        title: "Accès refusé",
        description: "Vous devez être un enseignant approuvé pour accéder à cette page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, authLoading, navigate, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalCourses: number;
    totalLives: number;
    totalViews: number;
    totalStudents: number;
  }>({
    queryKey: ["/api/stats/teacher"],
    enabled: !!user && user.role === "teacher",
  });

  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/teacher/courses"],
    enabled: !!user && user.role === "teacher",
  });

  const { data: liveCourses, isLoading: livesLoading } = useQuery<LiveCourse[]>({
    queryKey: ["/api/teacher/live-courses"],
    enabled: !!user && user.role === "teacher",
  });

  const courseForm = useForm({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      level: "",
    },
  });

  const liveForm = useForm({
    resolver: zodResolver(createLiveCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      level: "",
      scheduledAt: "",
      duration: 60,
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/courses", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la création du cours");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/teacher"] });
      toast({ title: "Cours créé avec succès !" });
      setCreateCourseOpen(false);
      courseForm.reset();
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const createLiveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createLiveCourseSchema>) => {
      return await apiRequest("POST", "/api/live-courses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/live-courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/teacher"] });
      toast({ title: "Live programmé avec succès !" });
      setCreateLiveOpen(false);
      liveForm.reset();
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: "course" | "live"; id: number }) => {
      return await apiRequest("DELETE", `/api/${type === "course" ? "courses" : "live-courses"}/${id}`);
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ 
        queryKey: [type === "course" ? "/api/teacher/courses" : "/api/teacher/live-courses"] 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/teacher"] });
      toast({ title: "Supprimé avec succès !" });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const startLiveMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("POST", `/api/live-courses/${id}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/live-courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/live-courses"] });
      toast({ title: "Live démarré !", description: "Les participants peuvent maintenant rejoindre." });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const endLiveMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("POST", `/api/live-courses/${id}/end`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/live-courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/live-courses"] });
      toast({ title: "Live terminé !", description: "La session a été clôturée." });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const onSubmitCourse = (data: z.infer<typeof createCourseSchema>) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("subject", data.subject);
    formData.append("level", data.level);
    
    const fileInput = document.getElementById("pdf-file") as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append("pdf", fileInput.files[0]);
    }
    
    createCourseMutation.mutate(formData);
  };

  const onSubmitLive = (data: z.infer<typeof createLiveCourseSchema>) => {
    createLiveMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <StatsGridSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (user?.teacherStatus === "pending") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-xl font-semibold">En attente de validation</h2>
              <p className="text-muted-foreground">
                Votre demande d'enseignant est en cours de validation. Vous serez notifié une fois approuvé.
              </p>
              <Badge className={TEACHER_STATUS_BADGES.pending.className}>
                {TEACHER_STATUS_BADGES.pending.label}
              </Badge>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const statCards = [
    { title: "Mes cours", value: stats?.totalCourses || 0, icon: BookOpen, color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Lives programmés", value: stats?.totalLives || 0, icon: Video, color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900/30" },
    { title: "Vues totales", value: stats?.totalViews || 0, icon: Eye, color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/30" },
    { title: "Étudiants actifs", value: stats?.totalStudents || 0, icon: Users, color: "text-purple-500", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Tableau de bord enseignant</h1>
              <p className="text-muted-foreground mt-1">
                Gérez vos cours et sessions en direct
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={createCourseOpen} onOpenChange={setCreateCourseOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-course">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau cours
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Créer un cours PDF</DialogTitle>
                    <DialogDescription>
                      Uploadez un document PDF avec les informations du cours.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...courseForm}>
                    <form onSubmit={courseForm.handleSubmit(onSubmitCourse)} className="space-y-4">
                      <FormField
                        control={courseForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Titre *</FormLabel>
                            <FormControl>
                              <Input placeholder="Titre du cours" {...field} data-testid="input-course-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={courseForm.control}
                          name="level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Niveau *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-course-level">
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {EDUCATION_LEVELS.map((lvl) => (
                                    <SelectItem key={lvl.value} value={lvl.value}>
                                      {lvl.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={courseForm.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Matière *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-course-subject">
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {SUBJECTS.map((sub) => (
                                    <SelectItem key={sub.value} value={sub.value}>
                                      {sub.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={courseForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Description du cours" {...field} data-testid="textarea-course-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div>
                        <FormLabel>Fichier PDF *</FormLabel>
                        <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Glissez-déposez ou cliquez pour sélectionner
                          </p>
                          <Input 
                            id="pdf-file" 
                            type="file" 
                            accept=".pdf" 
                            className="cursor-pointer"
                            data-testid="input-course-pdf"
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={createCourseMutation.isPending}
                        data-testid="button-submit-course"
                      >
                        {createCourseMutation.isPending ? "Création..." : "Créer le cours"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Dialog open={createLiveOpen} onOpenChange={setCreateLiveOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-testid="button-create-live">
                    <Video className="w-4 h-4 mr-2" />
                    Programmer un live
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Programmer un cours en direct</DialogTitle>
                    <DialogDescription>
                      Un lien Jitsi sera automatiquement généré.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...liveForm}>
                    <form onSubmit={liveForm.handleSubmit(onSubmitLive)} className="space-y-4">
                      <FormField
                        control={liveForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Titre *</FormLabel>
                            <FormControl>
                              <Input placeholder="Titre du live" {...field} data-testid="input-live-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={liveForm.control}
                          name="level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Niveau *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-live-level">
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {EDUCATION_LEVELS.map((lvl) => (
                                    <SelectItem key={lvl.value} value={lvl.value}>
                                      {lvl.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={liveForm.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Matière *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-live-subject">
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {SUBJECTS.map((sub) => (
                                    <SelectItem key={sub.value} value={sub.value}>
                                      {sub.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={liveForm.control}
                          name="scheduledAt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date et heure *</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} data-testid="input-live-datetime" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={liveForm.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Durée (min)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={15} 
                                  max={180} 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  data-testid="input-live-duration"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={liveForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Description du live (optionnel)" {...field} data-testid="textarea-live-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={createLiveMutation.isPending}
                        data-testid="button-submit-live"
                      >
                        {createLiveMutation.isPending ? "Programmation..." : "Programmer le live"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {statsLoading ? (
            <StatsGridSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Tabs defaultValue="courses">
            <TabsList>
              <TabsTrigger value="courses" data-testid="tab-my-courses">Mes cours PDF</TabsTrigger>
              <TabsTrigger value="lives" data-testid="tab-my-lives">Mes lives</TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mes cours PDF</CardTitle>
                  <CardDescription>Gérez vos cours publiés</CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  {coursesLoading ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableBody>
                          {Array.from({ length: 3 }).map((_, i) => (
                            <TableRowSkeleton key={i} />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : courses && courses.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table className="min-w-[600px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead>Matière</TableHead>
                          <TableHead>Niveau</TableHead>
                          <TableHead>Vues</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courses.map((course) => (
                          <TableRow key={course.id} data-testid={`row-course-${course.id}`}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span className="truncate max-w-[150px]">{course.title}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getSubjectLabel(course.subject)}</TableCell>
                            <TableCell>{getLevelLabel(course.level)}</TableCell>
                            <TableCell>{course.viewCount || 0}</TableCell>
                            <TableCell>
                              {course.createdAt && format(new Date(course.createdAt), "dd/MM/yy", { locale: fr })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/courses/${course.id}`}>
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => deleteMutation.mutate({ type: "course", id: course.id })}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  ) : (
                    <EmptyState
                      icon={BookOpen}
                      title="Aucun cours"
                      description="Vous n'avez pas encore créé de cours PDF."
                      actionLabel="Créer un cours"
                      onAction={() => setCreateCourseOpen(true)}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lives" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mes lives programmés</CardTitle>
                  <CardDescription>Gérez vos sessions en direct</CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  {livesLoading ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableBody>
                          {Array.from({ length: 3 }).map((_, i) => (
                            <TableRowSkeleton key={i} />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : liveCourses && liveCourses.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table className="min-w-[650px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Titre</TableHead>
                            <TableHead>Matière</TableHead>
                            <TableHead>Niveau</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                      <TableBody>
                        {liveCourses.map((live) => (
                          <TableRow key={live.id} data-testid={`row-live-${live.id}`}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Video className="w-4 h-4 text-muted-foreground" />
                                {live.title}
                              </div>
                            </TableCell>
                            <TableCell>{getSubjectLabel(live.subject)}</TableCell>
                            <TableCell>{getLevelLabel(live.level)}</TableCell>
                            <TableCell>
                              {format(new Date(live.scheduledAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                            </TableCell>
                            <TableCell>
                              {live.isActive ? (
                                <Badge className="bg-red-500 text-white border-0">En direct</Badge>
                              ) : live.isEnded ? (
                                <Badge variant="secondary">Terminé</Badge>
                              ) : (
                                <Badge variant="outline">Programmé</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {!live.isEnded && !live.isActive && (
                                  <Button 
                                    variant="default"
                                    size="sm"
                                    onClick={() => startLiveMutation.mutate(live.id)}
                                    disabled={startLiveMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                    data-testid={`button-start-live-${live.id}`}
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    Démarrer
                                  </Button>
                                )}
                                {live.isActive && !live.isEnded && (
                                  <>
                                    <Button 
                                      variant="outline"
                                      size="sm"
                                      asChild
                                      data-testid={`button-join-live-${live.id}`}
                                    >
                                      <a href={live.jitsiUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4 mr-1" />
                                        Rejoindre
                                      </a>
                                    </Button>
                                    <Button 
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => endLiveMutation.mutate(live.id)}
                                      disabled={endLiveMutation.isPending}
                                      data-testid={`button-end-live-${live.id}`}
                                    >
                                      <Square className="w-4 h-4 mr-1" />
                                      Terminer
                                    </Button>
                                  </>
                                )}
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/live/${live.id}`}>
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                </Button>
                                {!live.isActive && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => deleteMutation.mutate({ type: "live", id: live.id })}
                                    disabled={deleteMutation.isPending}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  ) : (
                    <EmptyState
                      icon={Video}
                      title="Aucun live"
                      description="Vous n'avez pas encore programmé de session en direct."
                      actionLabel="Programmer un live"
                      onAction={() => setCreateLiveOpen(true)}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
