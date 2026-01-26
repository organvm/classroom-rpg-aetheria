export type Theme = 'fantasy' | 'scifi' | 'medieval' | 'modern'
export type Role = 'teacher' | 'student'

export interface ThemeConfig {
  name: string
  teacherTitle: string
  studentTitle: string
  realmLabel: string
  questLabel: string
  archiveLabel: string
  oracleLabel: string
  xpLabel: string
  geometry: 'octahedron' | 'icosahedron' | 'dodecahedron' | 'sphere'
}

export const THEME_CONFIGS: Record<Theme, ThemeConfig> = {
  fantasy: {
    name: 'High Fantasy',
    teacherTitle: 'Game Master',
    studentTitle: 'Adventurer',
    realmLabel: 'Realm',
    questLabel: 'Quest',
    archiveLabel: 'Archives',
    oracleLabel: 'Oracle',
    xpLabel: 'Glory',
    geometry: 'octahedron'
  },
  scifi: {
    name: 'Cyberpunk',
    teacherTitle: 'Admin',
    studentTitle: 'Operative',
    realmLabel: 'Sector',
    questLabel: 'Mission',
    archiveLabel: 'Database',
    oracleLabel: 'AI Core',
    xpLabel: 'Data',
    geometry: 'icosahedron'
  },
  medieval: {
    name: 'Royal Court',
    teacherTitle: 'Lord',
    studentTitle: 'Vassal',
    realmLabel: 'Domain',
    questLabel: 'Decree',
    archiveLabel: 'Library',
    oracleLabel: 'Council',
    xpLabel: 'Honor',
    geometry: 'dodecahedron'
  },
  modern: {
    name: 'Glass Classroom',
    teacherTitle: 'Teacher',
    studentTitle: 'Student',
    realmLabel: 'Course',
    questLabel: 'Assignment',
    archiveLabel: 'Resources',
    oracleLabel: 'Evaluator',
    xpLabel: 'Points',
    geometry: 'sphere'
  }
}

export interface Realm {
  id: string
  name: string
  description: string
  color: string
  position?: { x: number; y: number; z: number }
  createdAt: number
}

export type QuestType = 'standard' | 'boss' | 'redemption'
export type QuestStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'failed'

export interface Quest {
  id: string
  realmId: string
  name: string
  description: string
  type: QuestType
  xpValue: number
  dueDate?: number
  status: QuestStatus
  prerequisiteIds?: string[]
  createdAt: number
}

export type SubmissionStatus = 'pending' | 'evaluated' | 'resubmitted'

export interface Submission {
  id: string
  questId: string
  studentId: string
  content: string
  score?: number
  feedback?: string
  submittedAt: number
  evaluatedAt?: number
  rubricScores?: Record<string, number>
  status?: SubmissionStatus
}

export interface KnowledgeCrystal {
  id: string
  questId: string
  studentId: string
  title: string
  content: string
  isAttuned: boolean
  createdAt: number
}

export interface Artifact {
  id: string
  name: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earnedAt: number
  questId: string
}

export interface AvatarCustomization {
  skinTone: string
  hairStyle: string
  hairColor: string
  eyeColor: string
  bodyType: string
  outfit: string
  outfitColor: string
  accessories: string[]
}

export interface UserProfile {
  id: string
  name: string
  avatarUrl?: string
  avatar?: AvatarCustomization
  role: Role
  xp: number
  level: number
  artifacts: Artifact[]
}

export interface ConstellationNode {
  id: string
  questId: string
  x: number
  y: number
  status: 'unlit' | 'lit'
  connections: string[]
}

// ============================================
// Educator Dashboard Extended Types
// ============================================

/**
 * Feedback snippet - reusable feedback comment
 */
export interface FeedbackSnippet {
  id: string
  content: string
  category: FeedbackCategory
  justification?: string  // AI explanation for category
  usageCount: number
  createdAt: number
  updatedAt: number
}

export type FeedbackCategory =
  | 'grammar'
  | 'thesis'
  | 'evidence'
  | 'organization'
  | 'clarity'
  | 'citations'
  | 'analysis'
  | 'mechanics'
  | 'positive'
  | 'other'

export const FEEDBACK_CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'grammar', label: 'Grammar' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'evidence', label: 'Evidence' },
  { value: 'organization', label: 'Organization' },
  { value: 'clarity', label: 'Clarity' },
  { value: 'citations', label: 'Citations' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'mechanics', label: 'Mechanics' },
  { value: 'positive', label: 'Positive Feedback' },
  { value: 'other', label: 'Other' }
]

/**
 * Syllabus document for a realm/course
 */
export interface Syllabus {
  id: string
  realmId: string
  title: string
  content?: string  // Text content if uploaded as text
  fileUrl?: string  // Firebase Storage URL
  storagePath?: string  // Path for deletion
  fileName?: string
  fileSize?: number
  createdAt: number
  updatedAt: number
}

/**
 * Student work sample with feedback
 */
export interface StudentSample {
  id: string
  questId: string
  realmId: string
  studentName: string  // Anonymous/pseudonymous
  content?: string  // Text content
  fileUrl?: string  // Firebase Storage URL
  storagePath?: string
  fileName?: string
  fileSize?: number
  feedback?: string
  grade?: string
  snippetIds?: string[]  // Feedback snippets used
  createdAt: number
  updatedAt: number
}

/**
 * Structured rubric data
 */
export interface RubricCriterion {
  id: string
  name: string
  description: string
  weight: number  // Percentage weight
  levels: RubricLevel[]
}

export interface RubricLevel {
  score: number
  label: string
  description: string
}

export interface RubricData {
  id: string
  name: string
  description?: string
  criteria: RubricCriterion[]
  totalPoints: number
  createdAt: number
  updatedAt: number
}

/**
 * Grading scale for a realm/course
 */
export interface GradeLevel {
  grade: string
  minScore: number
  maxScore: number
}

/**
 * Extended Realm with educator features
 */
export interface RealmExtended extends Realm {
  syllabi?: string[]  // Syllabus IDs
  gradingScale?: GradeLevel[]
  defaultRubricId?: string
}

/**
 * Extended Quest with file attachments and structured rubric
 */
export interface QuestExtended extends Quest {
  instructionsFileUrl?: string
  instructionsStoragePath?: string
  rubricFileUrl?: string
  rubricStoragePath?: string
  rubricData?: RubricData
  maxScore?: number
}

/**
 * Extended Submission with snippet tracking
 */
export interface SubmissionExtended extends Submission {
  snippetIds?: string[]  // Feedback snippets used
  fileUrl?: string
  storagePath?: string
}

/**
 * AI Consent state
 */
export interface AIConsentState {
  hasConsented: boolean
  consentedAt?: number
  version: string
}

/**
 * Feedback insights/analytics
 */
export interface FeedbackInsight {
  id: string
  type: 'trend' | 'suggestion' | 'pattern'
  title: string
  description: string
  category?: FeedbackCategory
  snippetId?: string
  createdAt: number
}

/**
 * Report configuration
 */
export interface ReportConfig {
  type: 'transcript' | 'mastery' | 'progress'
  realmId?: string
  studentId?: string
  dateRange?: {
    start: number
    end: number
  }
  includeComments: boolean
  format: 'pdf' | 'csv' | 'json'
}

// ============================================
// Phase 5: Personalization System Types
// ============================================

/**
 * Thematic interest areas for personalized content
 */
export type ThematicInterest =
  | 'sports'
  | 'science'
  | 'arts'
  | 'technology'
  | 'nature'
  | 'social-justice'
  | 'business'
  | 'general'

export const THEMATIC_INTERESTS: { value: ThematicInterest; label: string; description: string }[] = [
  { value: 'sports', label: 'Sports', description: 'Athletics, competition, and teamwork' },
  { value: 'science', label: 'Science', description: 'Research, discovery, and natural world' },
  { value: 'arts', label: 'Arts', description: 'Visual art, music, and performance' },
  { value: 'technology', label: 'Technology', description: 'Computing, innovation, and digital life' },
  { value: 'nature', label: 'Nature', description: 'Environment, ecology, and outdoors' },
  { value: 'social-justice', label: 'Social Justice', description: 'Equity, activism, and community' },
  { value: 'business', label: 'Business', description: 'Entrepreneurship and economics' },
  { value: 'general', label: 'General', description: 'Traditional academic framing' }
]

/**
 * Thematic variant of quest content
 */
export interface ThematicVariant {
  id: string
  interestArea: ThematicInterest
  title: string
  description: string
  content: string
  resources: string[]
}

/**
 * Extended Quest with thematic variants and learning objectives
 */
export interface QuestWithVariants extends QuestExtended {
  thematicVariants?: ThematicVariant[]
  learningObjectives: string[]
  standardIds?: string[]
}

/**
 * Student learning preferences
 */
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading'

export interface StudentPreferences {
  studentId: string
  primaryInterest: ThematicInterest
  secondaryInterest?: ThematicInterest
  learningStyle: LearningStyle
  updatedAt: number
}

/**
 * Vote option for three-way voting
 */
export interface VoteOption {
  id: string
  label: string
  description: string
  thematicInterest?: ThematicInterest
}

/**
 * Three-way vote between teacher, student, and parent
 */
export type VoteStatus = 'pending' | 'decided' | 'override'

export interface ThreeWayVote {
  id: string
  questId: string
  studentId: string
  topic: string
  options: VoteOption[]
  teacherVote?: string
  studentVote?: string
  parentVote?: string
  status: VoteStatus
  decidedOption?: string
  deadline?: number
  createdAt: number
  decidedAt?: number
}

/**
 * Parent account linked to student
 */
export interface ParentAccount {
  id: string
  name: string
  email: string
  linkedStudentIds: string[]
  notificationPreferences: {
    email: boolean
    inApp: boolean
    voteReminders: boolean
  }
  createdAt: number
}

/**
 * Parent-student link request
 */
export type LinkStatus = 'pending' | 'approved' | 'rejected'

export interface ParentStudentLink {
  id: string
  parentId: string
  studentId: string
  status: LinkStatus
  requestedAt: number
  resolvedAt?: number
}

// ============================================
// Standards Alignment Types
// ============================================

/**
 * Learning standard reference
 */
export type StandardFramework = 'ccss' | 'ap-lit'

export interface LearningStandardRef {
  id: string
  framework: StandardFramework
  code: string
  description: string
  gradeLevel: number[]
  category: 'reading' | 'writing' | 'speaking' | 'language'
  strand?: string
}

/**
 * Quest-standard alignment
 */
export type CoverageLevel = 'full' | 'partial' | 'introduced'

export interface QuestStandardAlignment {
  questId: string
  standardId: string
  coverage: CoverageLevel
}

/**
 * Student standard mastery
 */
export type MasteryLevel = 'not-started' | 'beginning' | 'developing' | 'proficient' | 'mastered'

export interface StandardMastery {
  studentId: string
  standardId: string
  level: MasteryLevel
  evidence: string[]
  lastAssessed: number
}

/**
 * Standards progress report
 */
export interface StandardsReport {
  studentId: string
  framework: StandardFramework
  totalStandards: number
  masteryByLevel: Record<MasteryLevel, number>
  standardDetails: StandardMastery[]
  generatedAt: number
}

// ============================================
// Notification Types
// ============================================

export type NotificationType =
  | 'vote-created'
  | 'vote-reminder'
  | 'vote-decided'
  | 'quest-assigned'
  | 'quest-graded'
  | 'achievement-earned'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: number
}

// ============================================
// Extended User Profile with Preferences
// ============================================

export interface UserProfileExtended extends UserProfile {
  preferences?: StudentPreferences
  parentIds?: string[]
  notificationSettings?: {
    email: boolean
    inApp: boolean
  }
}
