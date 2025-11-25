# Design Guidelines: Professional Educational Platform

## Design Approach
**Hybrid System**: Modern LMS aesthetics inspired by Coursera and Notion, with Material Design principles for consistency. This platform requires professional credibility while maintaining approachable usability for students, teachers, and administrators.

---

## Typography

**Font Stack**: 
- Primary: Inter (via Google Fonts CDN)
- Headings: Inter SemiBold/Bold
- Body: Inter Regular/Medium

**Hierarchy**:
- Page Titles: text-3xl md:text-4xl font-bold
- Section Headers: text-2xl font-semibold
- Card Titles: text-lg font-semibold
- Body Text: text-base font-normal
- Labels/Meta: text-sm font-medium
- Captions: text-xs

---

## Layout System

**Spacing Units**: Use Tailwind spacing of **4, 6, 8, 12, 16, 20** (e.g., p-4, gap-6, mb-8, py-12)

**Containers**:
- Max-width: max-w-7xl mx-auto px-4 md:px-6
- Dashboard grids: max-w-6xl
- Content reading: max-w-4xl

**Grid Systems**:
- Course cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Dashboard stats: grid-cols-2 md:grid-cols-4 gap-4
- Admin tables: Full-width responsive tables

---

## Component Library

### Navigation
- **Sticky top navbar** with logo, main navigation, and user profile dropdown
- Role-specific menu items (conditional rendering)
- Mobile: Hamburger menu with slide-out drawer
- Profile dropdown: Avatar + name + role badge + links to dashboard/logout

### Hero Section (Homepage)
- **Large hero image**: Professional classroom/study environment (students with laptops, modern learning space)
- Height: min-h-[500px] md:min-h-[600px]
- Overlay gradient for text readability
- Centered content: Headline + subtitle + dual CTAs ("S'inscrire" + "Connexion")
- Blurred background buttons (backdrop-blur-sm bg-white/20)

### Course Cards
- **Structure**: Image thumbnail + content section
- Rounded corners: rounded-xl
- Shadow: shadow-md hover:shadow-lg transition
- Content: Badge (niveau), title, teacher name, subject tag, meta info
- Action button at bottom
- PDF icon indicator for document courses
- "LIVE" badge with pulsing dot for active sessions

### Dashboard Layouts

**Student Dashboard**:
- Welcome header with personalized greeting
- Quick stats cards (Cours suivis, Prochains lives, Heures d'étude)
- "Mes cours" section with filterable course grid
- "Lives à venir" section with scheduled sessions
- Sidebar filters: Niveau (Primaire/Collège/Lycée/SIEM), Matière

**Teacher Dashboard**:
- Stats overview (Total cours, Lives créés, Étudiants actifs)
- "Mes cours PDF" table with edit/delete actions
- "Créer nouveau cours" prominent CTA
- "Mes lives programmés" section with Jitsi links
- Upload interface with drag-and-drop zone

**Admin Dashboard**:
- Multi-tab interface: "Enseignants en attente", "Tous les cours", "Statistiques"
- Pending teachers: Cards with approve/reject actions
- Data tables with search and filters
- User management section with role badges
- System stats with visual indicators

### Forms
- **Input fields**: Rounded-lg border with focus ring
- Labels above inputs: text-sm font-medium mb-2
- Required indicators: Asterisk in red
- Error messages: text-sm text-red-600 mt-1
- File upload: Bordered dashed box with icon + "Glissez-déposez ou cliquez"
- Select dropdowns: Custom styled with chevron icon
- Submit buttons: Full-width on mobile, inline on desktop

### Live Classroom Page
- **Layout**: Full-screen Jitsi iframe embed
- Sidebar (collapsible): Course info, participant list, chat toggle
- Top bar: Course title, subject badge, end session button (teacher only)
- Mobile: Stack iframe above info section

### Badges & Tags
- Role badges: Rounded-full px-3 py-1 text-xs font-medium
  - Admin: Purple background
  - Teacher: Blue background
  - Student: Green background
- Level tags: Rounded-md px-2 py-1 text-xs
- Subject tags: Outlined style, rounded-full
- Status indicators: Dot + text ("pending", "approved", "live")

### Buttons
- **Primary**: Rounded-lg px-6 py-3 font-medium
- **Secondary**: Outlined variant
- **Icon buttons**: Square with icon, p-2
- **Text buttons**: Underline on hover
- Hover states: Built-in, no custom hover needed for image overlays

### Data Tables
- Striped rows for readability
- Sticky headers on scroll
- Action column with icon buttons (edit, delete, view)
- Responsive: Cards on mobile, table on desktop
- Pagination at bottom

---

## Page-Specific Layouts

**Homepage**:
1. Hero section with image + CTAs
2. "Pourquoi nous choisir?" - 3-column feature grid with icons
3. "Niveaux d'enseignement" - 4-card grid (Primaire, Collège, Lycée, SIEM)
4. "Comment ça marche" - 3-step process with numbers
5. Teacher CTA section with image
6. Footer with links, contact, social

**Course List**:
- Page header with title + add button (teachers only)
- Filter sidebar (desktop) or dropdown (mobile)
- Course grid layout
- Empty state: Illustration + "Aucun cours disponible"

**Course Detail**:
- Breadcrumb navigation
- Two-column: Content (left), Sidebar (right) on desktop
- PDF preview or download button
- Teacher info card
- Related courses section at bottom

**Authentication Pages**:
- Centered card: max-w-md mx-auto
- Logo at top
- Form with social login options (Replit Auth)
- Footer links ("Pas de compte? S'inscrire")
- Background: Subtle gradient or pattern

---

## Images

**Hero Image**: Professional educational setting - modern classroom or students collaborating with laptops, bright and aspirational (min 1920x1080)

**Course Thumbnails**: Subject-specific illustrations or photos (400x300), use placeholder service initially

**Teacher Profile Photos**: Circular avatars, 40x40 in cards, 80x80 in profiles

**Empty States**: Friendly illustrations for "no courses", "no pending teachers"

**Background Patterns**: Subtle geometric or dot patterns for auth pages

---

## Icons
**Library**: Heroicons (outline for navigation, solid for emphasis)
- CDN: https://cdn.jsdelivr.net/npm/heroicons@2.0.18/
- Usage: Academic cap, document, video camera, users, calendar, filter, search, upload

---

## Accessibility
- Focus rings on all interactive elements
- ARIA labels for icon buttons
- Keyboard navigation for dashboards
- Screen reader text for status indicators
- Minimum contrast ratio 4.5:1 for all text