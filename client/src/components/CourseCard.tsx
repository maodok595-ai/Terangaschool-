import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Eye, User, Calendar } from "lucide-react";
import { getLevelLabel, getSubjectLabel, LEVEL_COLORS, SUBJECT_COLORS } from "@/lib/constants";
import { getFullName, getInitials } from "@/lib/authUtils";
import type { CourseWithTeacher } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CourseCardProps {
  course: CourseWithTeacher;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="group flex flex-col h-full hover-elevate overflow-visible" data-testid={`card-course-${course.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <Badge className={`${LEVEL_COLORS[course.level]} border-0`}>
            {getLevelLabel(course.level)}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="w-3 h-3" />
            <span>{course.viewCount || 0}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="w-5 h-5 text-primary" />
          <span className={`text-xs px-2 py-0.5 rounded-full border ${SUBJECT_COLORS[course.subject]}`}>
            {getSubjectLabel(course.subject)}
          </span>
        </div>
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        )}
        <div className="flex items-center gap-2 pt-2">
          <Avatar className="w-7 h-7">
            <AvatarImage 
              src={course.teacher?.profileImageUrl || undefined} 
              alt={getFullName(course.teacher?.firstName, course.teacher?.lastName)}
              className="object-cover"
            />
            <AvatarFallback className="text-xs bg-muted">
              {getInitials(course.teacher?.firstName, course.teacher?.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {getFullName(course.teacher?.firstName, course.teacher?.lastName)}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {course.createdAt && format(new Date(course.createdAt), "dd MMM yyyy", { locale: fr })}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <Button asChild className="w-full" data-testid={`button-view-course-${course.id}`}>
          <Link href={`/courses/${course.id}`}>
            Voir le cours
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
