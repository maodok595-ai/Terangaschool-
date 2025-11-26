import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LiveCourseCard } from "@/components/LiveCourseCard";
import { LiveGridSkeleton } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EDUCATION_LEVELS, SUBJECTS } from "@/lib/constants";
import { Video, Calendar, X } from "lucide-react";
import type { LiveCourseWithTeacher } from "@shared/schema";

export default function Lives() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  
  const [tab, setTab] = useState<"upcoming" | "live" | "past">("upcoming");
  const [level, setLevel] = useState(searchParams.get("level") || "all");
  const [subject, setSubject] = useState(searchParams.get("subject") || "all");

  const { data: liveCourses, isLoading } = useQuery<LiveCourseWithTeacher[]>({
    queryKey: ["/api/live-courses", { 
      status: tab,
      level: level !== "all" ? level : undefined, 
      subject: subject !== "all" ? subject : undefined 
    }],
  });

  const clearFilters = () => {
    setLevel("all");
    setSubject("all");
  };

  const hasFilters = level !== "all" || subject !== "all";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Cours en direct</h1>
            <p className="text-muted-foreground mt-1">
              Participez à des sessions en direct avec nos enseignants qualifiés
            </p>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="live" className="gap-2" data-testid="tab-live">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  En direct
                </TabsTrigger>
                <TabsTrigger value="upcoming" data-testid="tab-upcoming">
                  À venir
                </TabsTrigger>
                <TabsTrigger value="past" data-testid="tab-past">
                  Terminés
                </TabsTrigger>
              </TabsList>

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

            <TabsContent value="live" className="mt-6">
              {isLoading ? (
                <LiveGridSkeleton count={6} />
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
                      icon={Video}
                      title="Aucun live en cours"
                      description="Il n'y a pas de cours en direct en ce moment. Consultez les lives à venir !"
                      actionLabel="Voir les lives à venir"
                      onAction={() => setTab("upcoming")}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="mt-6">
              {isLoading ? (
                <LiveGridSkeleton count={6} />
              ) : liveCourses && liveCourses.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {liveCourses.length} live{liveCourses.length > 1 ? "s" : ""} programmé{liveCourses.length > 1 ? "s" : ""}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {liveCourses.map((live) => (
                      <LiveCourseCard key={live.id} liveCourse={live} />
                    ))}
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <EmptyState
                      icon={Calendar}
                      title="Aucun live programmé"
                      description={
                        hasFilters 
                          ? "Aucun live ne correspond à vos critères. Essayez d'autres filtres."
                          : "Il n'y a pas de cours en direct programmés pour le moment."
                      }
                      actionLabel={hasFilters ? "Effacer les filtres" : undefined}
                      onAction={hasFilters ? clearFilters : undefined}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {isLoading ? (
                <LiveGridSkeleton count={6} />
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
                      icon={Video}
                      title="Aucun live terminé"
                      description="Il n'y a pas encore de cours en direct terminés."
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
