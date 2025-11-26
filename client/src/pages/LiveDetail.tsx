import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
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
  Video, 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft,
  ExternalLink,
  Play
} from "lucide-react";
import { format, isFuture, isPast, isToday, differenceInMinutes } from "date-fns";
import { fr } from "date-fns/locale";
import type { LiveCourseWithTeacher } from "@shared/schema";

export default function LiveDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();

  const { data: liveCourse, isLoading, error } = useQuery<LiveCourseWithTeacher>({
    queryKey: ["/api/live-courses", id],
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
            <Skeleton className="h-[400px] w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !liveCourse) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <h2 className="text-xl font-semibold mb-2">Live non trouvé</h2>
              <p className="text-muted-foreground mb-4">
                Le cours en direct que vous recherchez n'existe pas ou a été supprimé.
              </p>
              <Button asChild>
                <Link href="/lives">Retour aux lives</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const scheduledDate = liveCourse.scheduledAt ? new Date(liveCourse.scheduledAt) : new Date();
  const isValidDate = !isNaN(scheduledDate.getTime());
  const isLive = liveCourse.isActive && !liveCourse.isEnded;
  const isUpcoming = isValidDate && isFuture(scheduledDate) && !liveCourse.isActive;
  const hasEnded = liveCourse.isEnded || (isValidDate && isPast(scheduledDate) && !liveCourse.isActive);
  const minutesUntilStart = isValidDate ? differenceInMinutes(scheduledDate, new Date()) : 0;

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <Badge className="bg-red-500 text-white border-0">
          <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-ping" />
          EN DIRECT
        </Badge>
      );
    }
    if (hasEnded) {
      return <Badge variant="secondary">Terminé</Badge>;
    }
    if (isValidDate && isToday(scheduledDate)) {
      return <Badge className="bg-green-500 text-white border-0">Aujourd'hui</Badge>;
    }
    return <Badge variant="outline">Programmé</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/lives">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Retour
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground truncate">{liveCourse.title}</span>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className={`${LEVEL_COLORS[liveCourse.level]} border-0`}>
                {getLevelLabel(liveCourse.level)}
              </Badge>
              <span className={`text-xs px-2 py-1 rounded-full border ${SUBJECT_COLORS[liveCourse.subject]}`}>
                {getSubjectLabel(liveCourse.subject)}
              </span>
              {getStatusBadge()}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold">{liveCourse.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{isValidDate ? format(scheduledDate, "EEEE dd MMMM yyyy", { locale: fr }) : "Date non définie"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{isValidDate ? format(scheduledDate, "HH:mm", { locale: fr }) : "--:--"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Max {liveCourse.maxParticipants} participants</span>
              </div>
            </div>
          </div>

          {isLive && isAuthenticated ? (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={liveCourse.jitsiUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    allowFullScreen
                    data-testid="iframe-jitsi"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="py-16 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Video className={`w-10 h-10 ${isLive ? "text-red-500" : "text-primary"}`} />
                </div>
                
                {isLive ? (
                  <>
                    <h3 className="text-xl font-semibold">Ce live est en cours !</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Connectez-vous pour rejoindre cette session en direct.
                    </p>
                    <Button asChild size="lg" className="bg-red-500 hover:bg-red-600">
                      <Link href="/login">
                        <Play className="w-5 h-5 mr-2" />
                        Se connecter pour rejoindre
                      </Link>
                    </Button>
                  </>
                ) : hasEnded ? (
                  <>
                    <h3 className="text-xl font-semibold">Ce live est terminé</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Cette session s'est terminée. Consultez les autres lives à venir !
                    </p>
                    <Button asChild variant="outline">
                      <Link href="/lives">Voir les lives à venir</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold">Live programmé</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {minutesUntilStart > 0 && minutesUntilStart < 60
                        ? `Ce live commence dans ${minutesUntilStart} minutes.`
                        : `Ce live est prévu le ${format(scheduledDate, "dd MMMM yyyy à HH:mm", { locale: fr })}.`}
                    </p>
                    {isAuthenticated ? (
                      <p className="text-sm text-muted-foreground">
                        Revenez à l'heure prévue pour rejoindre la session.
                      </p>
                    ) : (
                      <Button asChild>
                        <Link href="/login">Se connecter pour être notifié</Link>
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {liveCourse.description || "Aucune description disponible."}
                  </p>
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
                        src={liveCourse.teacher?.profileImageUrl || undefined} 
                        alt={getFullName(liveCourse.teacher?.firstName, liveCourse.teacher?.lastName)}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                        {getInitials(liveCourse.teacher?.firstName, liveCourse.teacher?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {getFullName(liveCourse.teacher?.firstName, liveCourse.teacher?.lastName)}
                      </p>
                      {liveCourse.teacher?.specialization && (
                        <p className="text-sm text-muted-foreground">
                          {liveCourse.teacher.specialization}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Niveau</span>
                    <span className="font-medium">{getLevelLabel(liveCourse.level)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Matière</span>
                    <span className="font-medium">{getSubjectLabel(liveCourse.subject)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durée</span>
                    <span className="font-medium">{liveCourse.duration || 60} min</span>
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
