import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseCard } from "@/components/CourseCard";
import { CourseGridSkeleton } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EDUCATION_LEVELS, SUBJECTS } from "@/lib/constants";
import { Search, Filter, X, BookOpen } from "lucide-react";
import type { CourseWithTeacher } from "@shared/schema";

export default function Courses() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState(searchParams.get("level") || "all");
  const [subject, setSubject] = useState(searchParams.get("subject") || "all");

  const { data: courses, isLoading } = useQuery<CourseWithTeacher[]>({
    queryKey: ["/api/courses", { search, level: level !== "all" ? level : undefined, subject: subject !== "all" ? subject : undefined }],
  });

  const clearFilters = () => {
    setSearch("");
    setLevel("all");
    setSubject("all");
  };

  const hasFilters = search || level !== "all" || subject !== "all";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Cours PDF</h1>
            <p className="text-muted-foreground mt-1">
              Explorez notre catalogue de cours et trouvez ce qui vous convient
            </p>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un cours..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-courses"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger className="w-[140px]" data-testid="select-level">
                      <SelectValue placeholder="Niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les niveaux</SelectItem>
                      {EDUCATION_LEVELS.map((lvl) => (
                        <SelectItem key={lvl.value} value={lvl.value}>
                          {lvl.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="w-[160px]" data-testid="select-subject">
                      <SelectValue placeholder="Matière" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les matières</SelectItem>
                      {SUBJECTS.map((sub) => (
                        <SelectItem key={sub.value} value={sub.value}>
                          {sub.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {hasFilters && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={clearFilters}
                      data-testid="button-clear-filters"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <CourseGridSkeleton count={9} />
          ) : courses && courses.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                {courses.length} cours trouvé{courses.length > 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  icon={BookOpen}
                  title="Aucun cours trouvé"
                  description={
                    hasFilters 
                      ? "Aucun cours ne correspond à vos critères de recherche. Essayez d'autres filtres."
                      : "Il n'y a pas encore de cours disponibles. Revenez bientôt !"
                  }
                  actionLabel={hasFilters ? "Effacer les filtres" : undefined}
                  onAction={hasFilters ? clearFilters : undefined}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
