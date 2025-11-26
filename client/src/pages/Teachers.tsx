import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { getFullName, getInitials } from "@/lib/authUtils";
import { 
  GraduationCap, 
  BookOpen, 
  Video, 
  Users,
  ArrowRight
} from "lucide-react";
import type { User } from "@shared/schema";

interface TeacherWithStats extends User {
  courseCount?: number;
  liveCount?: number;
}

function TeacherCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Teachers() {
  const { data: teachers, isLoading } = useQuery<TeacherWithStats[]>({
    queryKey: ["/api/teachers"],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-12 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Nos enseignants</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez notre équipe d'enseignants qualifiés et certifiés, prêts à vous accompagner dans votre réussite.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <TeacherCardSkeleton key={i} />
                ))}
              </div>
            ) : teachers && teachers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teachers.map((teacher) => (
                  <Card 
                    key={teacher.id} 
                    className="hover-elevate overflow-visible"
                    data-testid={`card-teacher-${teacher.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <Avatar className="w-20 h-20">
                          <AvatarImage 
                            src={teacher.profileImageUrl || undefined}
                            alt={getFullName(teacher.firstName, teacher.lastName)}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                            {getInitials(teacher.firstName, teacher.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h3 className="font-semibold text-lg">
                            {getFullName(teacher.firstName, teacher.lastName)}
                          </h3>
                          {teacher.specialization && (
                            <p className="text-sm text-primary font-medium">
                              {teacher.specialization}
                            </p>
                          )}
                        </div>

                        {teacher.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {teacher.bio}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{teacher.courseCount || 0} cours</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            <span>{teacher.liveCount || 0} lives</span>
                          </div>
                        </div>

                        <Button asChild className="w-full" variant="outline" data-testid={`button-view-teacher-courses-${teacher.id}`}>
                          <Link href={`/courses?teacherId=${teacher.id}`}>
                            Voir ses cours
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16">
                  <EmptyState
                    icon={GraduationCap}
                    title="Aucun enseignant"
                    description="Il n'y a pas encore d'enseignants sur la plateforme."
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="py-12 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">Vous êtes enseignant ?</h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto">
              Rejoignez notre équipe et partagez votre savoir avec des milliers d'étudiants.
            </p>
            <Button size="lg" variant="secondary" asChild data-testid="button-become-teacher-cta">
              <Link href="/become-teacher">
                Devenir enseignant
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
