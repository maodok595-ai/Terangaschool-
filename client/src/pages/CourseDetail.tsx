import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getLevelLabel, getSubjectLabel, LEVEL_COLORS, SUBJECT_COLORS } from "@/lib/constants";
import { getFullName, getInitials } from "@/lib/authUtils";
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  ArrowLeft,
  ExternalLink,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { CourseWithTeacher } from "@shared/schema";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: course, isLoading, error } = useQuery<CourseWithTeacher>({
    queryKey: ["/api/courses", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-12 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <h2 className="text-xl font-semibold mb-2">Cours non trouvé</h2>
              <p className="text-muted-foreground mb-4">
                Le cours que vous recherchez n'existe pas ou a été supprimé.
              </p>
              <Button asChild>
                <Link href="/courses">Retour aux cours</Link>
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
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/courses">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Retour
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">{course.title}</span>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className={`${LEVEL_COLORS[course.level]} border-0`}>
                {getLevelLabel(course.level)}
              </Badge>
              <span className={`text-xs px-2 py-1 rounded-full border ${SUBJECT_COLORS[course.subject]}`}>
                {getSubjectLabel(course.subject)}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{course.viewCount || 0} vues</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Publié le {course.createdAt && format(new Date(course.createdAt), "dd MMMM yyyy", { locale: fr })}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {course.description || "Aucune description disponible."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Document du cours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium">{course.pdfFileName || "Cours.pdf"}</p>
                        <p className="text-sm text-muted-foreground">Document PDF</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" asChild data-testid="button-view-pdf">
                        <a href={course.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Ouvrir
                        </a>
                      </Button>
                      <Button asChild data-testid="button-download-pdf">
                        <a href={course.pdfUrl} download>
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enseignant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-14 h-14">
                      <AvatarImage 
                        src={course.teacher?.profileImageUrl || undefined} 
                        alt={getFullName(course.teacher?.firstName, course.teacher?.lastName)}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                        {getInitials(course.teacher?.firstName, course.teacher?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {getFullName(course.teacher?.firstName, course.teacher?.lastName)}
                      </p>
                      {course.teacher?.specialization && (
                        <p className="text-sm text-muted-foreground">
                          {course.teacher.specialization}
                        </p>
                      )}
                    </div>
                  </div>
                  {course.teacher?.bio && (
                    <p className="text-sm text-muted-foreground mt-4 line-clamp-4">
                      {course.teacher.bio}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Niveau</span>
                    <span className="font-medium">{getLevelLabel(course.level)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Matière</span>
                    <span className="font-medium">{getSubjectLabel(course.subject)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vues</span>
                    <span className="font-medium">{course.viewCount || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
