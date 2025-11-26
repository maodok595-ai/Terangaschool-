import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseCard } from "@/components/CourseCard";
import { LiveCourseCard } from "@/components/LiveCourseCard";
import { CourseGridSkeleton, LiveGridSkeleton, StatsGridSkeleton } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { getFullName } from "@/lib/authUtils";
import { 
  BookOpen, 
  Video, 
  Clock, 
  TrendingUp,
  ArrowRight,
  Calendar,
  GraduationCap
} from "lucide-react";
import type { CourseWithTeacher, LiveCourseWithTeacher } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();

  const { data: courses, isLoading: coursesLoading } = useQuery<CourseWithTeacher[]>({
    queryKey: ["/api/courses", { limit: 6 }],
  });

  const { data: liveCourses, isLoading: livesLoading } = useQuery<LiveCourseWithTeacher[]>({
    queryKey: ["/api/live-courses", { upcoming: true, limit: 3 }],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalCourses: number;
    upcomingLives: number;
    studyHours: number;
    enrolledCourses: number;
  }>({
    queryKey: ["/api/stats/student"],
  });

  const statCards = [
    {
      title: "Cours disponibles",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Lives à venir",
      value: stats?.upcomingLives || 0,
      icon: Video,
      color: "text-red-500",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    {
      title: "Heures d'étude",
      value: stats?.studyHours || 0,
      icon: Clock,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Cours suivis",
      value: stats?.enrolledCourses || 0,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Bienvenue, {getFullName(user?.firstName, user?.lastName)}
              </h1>
              <p className="text-muted-foreground mt-1">
                Continuez votre apprentissage et atteignez vos objectifs.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" data-testid="button-browse-courses">
                <Link href="/courses">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Parcourir les cours
                </Link>
              </Button>
              <Button asChild data-testid="button-browse-lives">
                <Link href="/lives">
                  <Video className="w-4 h-4 mr-2" />
                  Voir les lives
                </Link>
              </Button>
            </div>
          </div>

          {statsLoading ? (
            <StatsGridSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((stat, index) => (
                <Card key={index} data-testid={`stat-card-${index}`}>
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

          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Lives à venir</h2>
                <p className="text-sm text-muted-foreground">Ne manquez pas les prochaines sessions en direct</p>
              </div>
              <Button asChild variant="ghost" className="gap-2" data-testid="link-all-lives">
                <Link href="/lives">
                  Voir tout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            
            {livesLoading ? (
              <LiveGridSkeleton count={3} />
            ) : liveCourses && liveCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveCourses.map((live) => (
                  <LiveCourseCard key={live.id} liveCourse={live} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    icon={Calendar}
                    title="Aucun live programmé"
                    description="Il n'y a pas de cours en direct programmés pour le moment. Revenez plus tard !"
                    actionLabel="Voir les cours PDF"
                    actionHref="/courses"
                  />
                </CardContent>
              </Card>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Cours récents</h2>
                <p className="text-sm text-muted-foreground">Explorez les derniers cours ajoutés</p>
              </div>
              <Button asChild variant="ghost" className="gap-2" data-testid="link-all-courses">
                <Link href="/courses">
                  Voir tout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            
            {coursesLoading ? (
              <CourseGridSkeleton count={6} />
            ) : courses && courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    icon={GraduationCap}
                    title="Aucun cours disponible"
                    description="Il n'y a pas encore de cours disponibles. Revenez bientôt !"
                  />
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
