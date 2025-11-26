import { z } from "zod";

export const EDUCATION_LEVELS = [
  { value: "primaire", label: "Primaire", description: "Classes du primaire (CP-CM2)" },
  { value: "college", label: "Collège", description: "Classes du collège (6ème-3ème)" },
  { value: "lycee", label: "Lycée", description: "Classes du lycée (2nde-Terminale)" },
  { value: "siem", label: "SIEM", description: "Sciences de l'Ingénieur et Mathématiques" },
] as const;

export const SUBJECTS = [
  { value: "mathematiques", label: "Mathématiques", icon: "Calculator" },
  { value: "francais", label: "Français", icon: "BookOpen" },
  { value: "anglais", label: "Anglais", icon: "Globe" },
  { value: "physique", label: "Physique", icon: "Atom" },
  { value: "chimie", label: "Chimie", icon: "Flask" },
  { value: "svt", label: "SVT", icon: "Leaf" },
  { value: "histoire_geo", label: "Histoire-Géo", icon: "Map" },
  { value: "philosophie", label: "Philosophie", icon: "Brain" },
  { value: "informatique", label: "Informatique", icon: "Code" },
  { value: "economie", label: "Économie", icon: "TrendingUp" },
] as const;

export const LEVEL_COLORS: Record<string, string> = {
  primaire: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  college: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  lycee: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  siem: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

export const SUBJECT_COLORS: Record<string, string> = {
  mathematiques: "border-teal-300 text-teal-700 dark:border-teal-700 dark:text-teal-400",
  francais: "border-red-300 text-red-700 dark:border-red-700 dark:text-red-400",
  anglais: "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400",
  physique: "border-cyan-300 text-cyan-700 dark:border-cyan-700 dark:text-cyan-400",
  chimie: "border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400",
  svt: "border-green-300 text-green-700 dark:border-green-700 dark:text-green-400",
  histoire_geo: "border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400",
  philosophie: "border-violet-300 text-violet-700 dark:border-violet-700 dark:text-violet-400",
  informatique: "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-400",
  economie: "border-pink-300 text-pink-700 dark:border-pink-700 dark:text-pink-400",
};

export const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  admin: { label: "Admin", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  teacher: { label: "Enseignant", className: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400" },
  student: { label: "Étudiant", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
};

export const TEACHER_STATUS_BADGES: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  approved: { label: "Approuvé", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  rejected: { label: "Refusé", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

export function getLevelLabel(level: string): string {
  return EDUCATION_LEVELS.find(l => l.value === level)?.label || level;
}

export function getSubjectLabel(subject: string): string {
  return SUBJECTS.find(s => s.value === subject)?.label || subject;
}

export const registerTeacherSchema = z.object({
  specialization: z.string().min(2, "La spécialisation est requise"),
  bio: z.string().min(10, "La bio doit contenir au moins 10 caractères"),
});
