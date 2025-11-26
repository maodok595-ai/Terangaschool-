import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, Clock, Users, Calendar } from "lucide-react";
import { getLevelLabel, getSubjectLabel, LEVEL_COLORS, SUBJECT_COLORS } from "@/lib/constants";
import { getFullName, getInitials } from "@/lib/authUtils";
import type { LiveCourseWithTeacher } from "@shared/schema";
import { format, isFuture, isPast, isToday } from "date-fns";
import { fr } from "date-fns/locale";

interface LiveCourseCardProps {
  liveCourse: LiveCourseWithTeacher;
}

export function LiveCourseCard({ liveCourse }: LiveCourseCardProps) {
  const scheduledDate = new Date(liveCourse.scheduledAt);
  const isLive = liveCourse.isActive && !liveCourse.isEnded;
  const isUpcoming = isFuture(scheduledDate) && !liveCourse.isActive;
  const hasEnded = liveCourse.isEnded || (isPast(scheduledDate) && !liveCourse.isActive);

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <Badge className="bg-red-500 text-white border-0 animate-pulse">
          <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-ping" />
          EN DIRECT
        </Badge>
      );
    }
    if (hasEnded) {
      return <Badge variant="secondary">Terminé</Badge>;
    }
    if (isToday(scheduledDate)) {
      return <Badge className="bg-green-500 text-white border-0">Aujourd'hui</Badge>;
    }
    return <Badge variant="outline">Programmé</Badge>;
  };

  return (
    <Card className="group flex flex-col h-full hover-elevate overflow-visible" data-testid={`card-live-${liveCourse.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <Badge className={`${LEVEL_COLORS[liveCourse.level]} border-0`}>
            {getLevelLabel(liveCourse.level)}
          </Badge>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Video className={`w-5 h-5 ${isLive ? "text-red-500" : "text-primary"}`} />
          <span className={`text-xs px-2 py-0.5 rounded-full border ${SUBJECT_COLORS[liveCourse.subject]}`}>
            {getSubjectLabel(liveCourse.subject)}
          </span>
        </div>
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {liveCourse.title}
        </h3>
        {liveCourse.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {liveCourse.description}
          </p>
        )}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{format(scheduledDate, "EEEE dd MMMM yyyy", { locale: fr })}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{format(scheduledDate, "HH:mm", { locale: fr })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Max {liveCourse.maxParticipants}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Avatar className="w-7 h-7">
            <AvatarImage 
              src={liveCourse.teacher?.profileImageUrl || undefined} 
              alt={getFullName(liveCourse.teacher?.firstName, liveCourse.teacher?.lastName)}
              className="object-cover"
            />
            <AvatarFallback className="text-xs bg-muted">
              {getInitials(liveCourse.teacher?.firstName, liveCourse.teacher?.lastName)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">
            {getFullName(liveCourse.teacher?.firstName, liveCourse.teacher?.lastName)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        {isLive ? (
          <Button asChild className="w-full bg-red-500 hover:bg-red-600" data-testid={`button-join-live-${liveCourse.id}`}>
            <Link href={`/live/${liveCourse.id}`}>
              Rejoindre le live
            </Link>
          </Button>
        ) : hasEnded ? (
          <Button variant="secondary" className="w-full" disabled>
            Session terminée
          </Button>
        ) : (
          <Button asChild variant="outline" className="w-full" data-testid={`button-view-live-${liveCourse.id}`}>
            <Link href={`/live/${liveCourse.id}`}>
              Voir les détails
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
