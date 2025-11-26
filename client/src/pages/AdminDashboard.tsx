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
  TrendingUp,
  Check,
  X,
  Eye,
  UserCheck,
  UserX,
  Clock,
  FileText,
  Play,
  Square,
  ExternalLink
} from "lucide-react";
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

  const { data: pendingTeachers, isLoading: pendingLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/pending-teachers"],
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

  const approveTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      return await apiRequest("POST", `/api/admin/teachers/${teacherId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/admin"] });
      toast({ title: "Enseignant approuvé avec succès !" });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const rejectTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      return await apiRequest("POST", `/api/admin/teachers/${teacherId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/admin"] });
      toast({ title: "Enseignant refusé." });
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
    { title: "Utilisateurs", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Enseignants", value: stats?.totalTeachers || 0, icon: UserCheck, color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/30" },
    { title: "En attente", value: stats?.pendingTeachers || 0, icon: Clock, color: "text-yellow-500", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" },
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
            <StatsGridSkeleton count={5} />
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

          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2" data-testid="tab-pending">
                <Clock className="w-4 h-4" />
                En attente
                {pendingTeachers && pendingTeachers.length > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {pendingTeachers.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="courses" data-testid="tab-courses">Cours</TabsTrigger>
              <TabsTrigger value="lives" data-testid="tab-lives">Lives</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enseignants en attente de validation</CardTitle>
                  <CardDescription>
                    Validez ou refusez les demandes d'inscription des enseignants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                                <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : pendingTeachers && pendingTeachers.length > 0 ? (
                    <div className="space-y-4">
                      {pendingTeachers.map((teacher) => (
                        <Card key={teacher.id} data-testid={`card-pending-teacher-${teacher.id}`}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage 
                                    src={teacher.profileImageUrl || undefined} 
                                    alt={getFullName(teacher.firstName, teacher.lastName)}
                                    className="object-cover"
                                  />
                                  <AvatarFallback className="bg-primary text-primary-foreground">
                                    {getInitials(teacher.firstName, teacher.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold">
                                    {getFullName(teacher.firstName, teacher.lastName)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{teacher.email}</p>
                                  {teacher.specialization && (
                                    <p className="text-sm text-muted-foreground">
                                      Spécialisation : {teacher.specialization}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {teacher.bio && (
                                <p className="text-sm text-muted-foreground flex-1 md:px-4 line-clamp-2">
                                  {teacher.bio}
                                </p>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => approveTeacherMutation.mutate(teacher.id)}
                                  disabled={approveTeacherMutation.isPending}
                                  className="gap-2"
                                  data-testid={`button-approve-${teacher.id}`}
                                >
                                  <Check className="w-4 h-4" />
                                  Approuver
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => rejectTeacherMutation.mutate(teacher.id)}
                                  disabled={rejectTeacherMutation.isPending}
                                  className="gap-2"
                                  data-testid={`button-reject-${teacher.id}`}
                                >
                                  <X className="w-4 h-4" />
                                  Refuser
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={UserCheck}
                      title="Aucune demande en attente"
                      description="Il n'y a pas de nouvelles demandes d'enseignant à valider."
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allCourses.map((course) => (
                          <TableRow key={course.id}>
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
