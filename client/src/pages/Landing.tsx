import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  BookOpen, 
  Video, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Star,
  Clock,
  Shield,
  Zap
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { EDUCATION_LEVELS } from "@/lib/constants";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-20 text-center">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-1.5">
              Plateforme de cours de renforcement
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl mx-auto leading-tight">
              Réussissez vos études avec des cours de qualité
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Accédez à des cours PDF et des sessions en direct avec des enseignants qualifiés. 
              Du primaire au SIEM, trouvez le soutien dont vous avez besoin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-base px-8" data-testid="button-hero-register">
                <a href="/api/login">
                  Commencer maintenant
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="text-base px-8 bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
                data-testid="button-hero-courses"
              >
                <Link href="/courses">
                  Découvrir les cours
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 mt-12 text-white/80">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>+1000 étudiants</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>+500 cours</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>4.9/5 satisfaction</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Pourquoi nous choisir ?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Une plateforme conçue pour votre réussite académique
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-6 hover-elevate overflow-visible">
                <CardContent className="pt-4 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Shield className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold">Enseignants certifiés</h3>
                  <p className="text-muted-foreground">
                    Tous nos enseignants sont vérifiés et validés par notre équipe avant de pouvoir enseigner.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6 hover-elevate overflow-visible">
                <CardContent className="pt-4 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Video className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold">Cours en direct</h3>
                  <p className="text-muted-foreground">
                    Participez à des sessions en direct et interagissez en temps réel avec vos enseignants.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6 hover-elevate overflow-visible">
                <CardContent className="pt-4 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Zap className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold">Accès illimité</h3>
                  <p className="text-muted-foreground">
                    Consultez les cours PDF à tout moment et progressez à votre rythme.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Niveaux d'enseignement</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Des cours adaptés à chaque niveau scolaire
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {EDUCATION_LEVELS.map((level) => (
                <Link key={level.value} href={`/courses?level=${level.value}`}>
                  <Card className="h-full hover-elevate overflow-visible cursor-pointer group">
                    <CardContent className="p-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold">{level.label}</h3>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Comment ça marche ?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Trois étapes simples pour commencer votre apprentissage
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Inscrivez-vous",
                  description: "Créez votre compte gratuitement en quelques secondes.",
                  icon: Users,
                },
                {
                  step: "02",
                  title: "Choisissez vos cours",
                  description: "Parcourez notre catalogue et sélectionnez les cours qui vous intéressent.",
                  icon: BookOpen,
                },
                {
                  step: "03",
                  title: "Apprenez",
                  description: "Accédez aux cours PDF ou rejoignez les sessions en direct.",
                  icon: GraduationCap,
                },
              ].map((item, index) => (
                <div key={index} className="relative text-center">
                  <div className="relative z-10 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-2xl font-bold">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Vous êtes enseignant ?</h2>
                <p className="text-primary-foreground/80 max-w-xl">
                  Rejoignez notre communauté d'enseignants et partagez votre savoir avec des étudiants motivés. 
                  Créez vos cours, animez des sessions en direct et faites la différence.
                </p>
                <ul className="mt-6 space-y-2">
                  {[
                    "Créez et partagez vos cours PDF",
                    "Animez des sessions en direct via Jitsi",
                    "Touchez des milliers d'étudiants",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-shrink-0">
                <Button size="lg" variant="secondary" asChild className="text-base px-8" data-testid="button-become-teacher">
                  <Link href="/become-teacher">
                    Devenir enseignant
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
