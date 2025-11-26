import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { getLevelLabel, getSubjectLabel, ROLE_BADGES, TEACHER_STATUS_BADGES } from "@/lib/constants";
import { getFullName, getInitials } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  BookOpen, 
  Video, 
  Eye,
  UserCheck,
  FileText,
  Play,
  Square,
  ExternalLink,
  Trash2,
  Pencil
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { User, Course, LiveCourse } from "@shared/schema";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      toast({
        title: "Accès refusé",
        description: "Vous devez être administrateur pour accéder à cette page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, authLoading, navigate, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalUsers: number;
    totalTeachers: number;
    pendingTeachers: number;
    totalCourses: number;
    totalLives: number;
  }>({
    queryKey: ["/api/stats/admin"],
    enabled: !!user && user.role === "admin",
  });


  const { data: allUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === "admin",
  });

  const { data: allCourses, isLoading: coursesLoading } = useQuery<(Course & { teacher: User })[]>({
    queryKey: ["/api/admin/courses"],
    enabled: !!user && user.role === "admin",
  });

  const { data: allLives, isLoading: livesLoading } = useQuery<(LiveCourse & { teacher: User })[]>({
    queryKey: ["/api/admin/live-courses"],
    enabled: !!user && user.role === "admin",
  });


  const startLiveMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("POST", `/api/live-courses/${id}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-courses"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-courses"] });
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

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/admin"] });
      toast({ title: "Utilisateur supprimé avec succès !" });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/admin"] });
      toast({ title: "Cours supprimé avec succès !" });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteLiveMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/live-courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/live-courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/admin"] });
      toast({ title: "Live supprimé avec succès !" });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

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

  const statCards = [
    { title: "Utilisateurs", value: stats?.totalUsers || 0, icon: Users, color: "text-teal-500", bgColor: "bg-teal-100 dark:bg-teal-900/30" },
    { title: "Enseignants", value: stats?.totalTeachers || 0, icon: UserCheck, color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/30" },
    { title: "Cours PDF", value: stats?.totalCourses || 0, icon: BookOpen, color: "text-purple-500", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
    { title: "Lives", value: stats?.totalLives || 0, icon: Video, color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900/30" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Administration</h1>
            <p className="text-muted-foreground mt-1">
              Gérez les utilisateurs, cours et la plateforme
            </p>
          </div>

          {statsLoading ? (
            <StatsGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {statCards.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Tabs defaultValue="users">
            <TabsList>
              <TabsTrigger value="users" data-testid="tab-users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="courses" data-testid="tab-courses">Cours</TabsTrigger>
              <TabsTrigger value="lives" data-testid="tab-lives">Lives</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tous les utilisateurs</CardTitle>
                  <CardDescription>Liste de tous les utilisateurs de la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <Table>
                      <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <TableRowSkeleton key={i} />
                        ))}
                      </TableBody>
                    </Table>
                  ) : allUsers && allUsers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Utilisateur</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rôle</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Inscription</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allUsers.map((u) => (
                          <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={u.profileImageUrl || undefined} className="object-cover" />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(u.firstName, u.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{getFullName(u.firstName, u.lastName)}</span>
                              </div>
                            </TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Badge className={ROLE_BADGES[u.role]?.className}>
                                {ROLE_BADGES[u.role]?.label || u.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {u.role === "teacher" && u.teacherStatus && (
                                <Badge className={TEACHER_STATUS_BADGES[u.teacherStatus]?.className}>
                                  {TEACHER_STATUS_BADGES[u.teacherStatus]?.label}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {u.createdAt && format(new Date(u.createdAt), "dd/MM/yyyy", { locale: fr })}
                            </TableCell>
                            <TableCell className="text-right">
                              {u.role !== "admin" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="text-destructive hover:text-destructive"
                                      data-testid={`button-delete-user-${u.id}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Cette action supprimera définitivement l'utilisateur "{getFullName(u.firstName, u.lastName)}" et toutes ses données associées.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteUserMutation.mutate(Number(u.id))}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyState
                      icon={Users}
                      title="Aucun utilisateur"
                      description="Il n'y a pas encore d'utilisateurs inscrits."
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tous les cours PDF</CardTitle>
                  <CardDescription>Liste de tous les cours publiés</CardDescription>
                </CardHeader>
                <CardContent>
                  {coursesLoading ? (
                    <Table>
                      <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <TableRowSkeleton key={i} />
                        ))}
                      </TableBody>
                    </Table>
                  ) : allCourses && allCourses.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead>Enseignant</TableHead>
                          <TableHead>Matière</TableHead>
                          <TableHead>Niveau</TableHead>
                          <TableHead>Vues</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allCourses.map((course) => (
                          <TableRow key={course.id} data-testid={`row-course-${course.id}`}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                {course.title}
                              </div>
                            </TableCell>
                            <TableCell>{getFullName(course.teacher?.firstName, course.teacher?.lastName)}</TableCell>
                            <TableCell>{getSubjectLabel(course.subject)}</TableCell>
                            <TableCell>{getLevelLabel(course.level)}</TableCell>
                            <TableCell>{course.viewCount || 0}</TableCell>
                            <TableCell>
                              {course.createdAt && format(new Date(course.createdAt), "dd/MM/yyyy", { locale: fr })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" asChild data-testid={`button-view-course-${course.id}`}>
                                  <a href={`/course/${course.id}`}>
                                    <Eye className="w-4 h-4" />
                                  </a>
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="text-destructive hover:text-destructive"
                                      data-testid={`button-delete-course-${course.id}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Supprimer ce cours ?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Cette action supprimera définitivement le cours "{course.title}" et son fichier PDF associé.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteCourseMutation.mutate(course.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyState
                      icon={BookOpen}
                      title="Aucun cours"
                      description="Il n'y a pas encore de cours publiés."
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lives" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tous les lives</CardTitle>
                  <CardDescription>Liste de toutes les sessions en direct</CardDescription>
                </CardHeader>
                <CardContent>
                  {livesLoading ? (
                    <Table>
                      <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <TableRowSkeleton key={i} />
                        ))}
                      </TableBody>
                    </Table>
                  ) : allLives && allLives.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table className="min-w-[800px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Titre</TableHead>
                            <TableHead>Enseignant</TableHead>
                            <TableHead>Matière</TableHead>
                            <TableHead>Niveau</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allLives.map((live) => (
                            <TableRow key={live.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Video className="w-4 h-4 text-muted-foreground" />
                                  <span className="truncate max-w-[150px]">{live.title}</span>
                                </div>
                              </TableCell>
                              <TableCell>{getFullName(live.teacher?.firstName, live.teacher?.lastName)}</TableCell>
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
                                  <Button variant="ghost" size="icon" asChild data-testid={`button-view-live-${live.id}`}>
                                    <a href={`/live/${live.id}`}>
                                      <Eye className="w-4 h-4" />
                                    </a>
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        data-testid={`button-delete-live-${live.id}`}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Supprimer ce live ?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Cette action supprimera définitivement le live "{live.title}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteLiveMutation.mutate(live.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Supprimer
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
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
                      description="Il n'y a pas encore de sessions en direct."
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
