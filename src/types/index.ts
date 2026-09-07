export type WorkItemType = 'idea' | 'feature' | 'improvement' | 'task' | 'bug' | 'test';

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export type Size = 'XXS' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type WorkItemStatus = 'backlog' | 'planned' | 'in_progress' | 'testing' | 'completed';

export type BugSeverity = 'blocker' | 'critical' | 'major' | 'minor' | 'trivial';

export type DependencyType = 'blocks' | 'is_blocked_by' | 'related' | 'duplicate';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface Dependency {
  id: string;
  targetItemId: string;
  targetTitle: string;
  type: DependencyType;
}

export interface TestCase {
  id: string;
  title: string;
  description?: string;
  status: 'untested' | 'passed' | 'failed';
  notes?: string;
}

export interface TestAttempt {
  id: string;
  date: string;
  result: 'passed' | 'failed';
  notes: string;
  versionId?: string | null;
  actionTaken?: 'return_to_progress' | 'move_to_future_version' | 'completed';
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  path: string;
  size?: number;
  type?: string;
  createdAt: string;
}

export interface WorkItem {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  description: string;
  type: WorkItemType;
  priority: Priority;
  size?: Size | null;
  status: WorkItemStatus;
  targetVersionId?: string | null; // null => Backlog
  featureGroupId?: string | null;
  labels: string[];
  dueDate?: string | null;
  isFocus: boolean; // Flagged for Dashboard "My Focus"
  
  subtasks: Subtask[];
  dependencies: Dependency[];
  testCases: TestCase[];
  testHistory: TestAttempt[];
  attachments: Attachment[];

  // Bug-specific fields
  bugSeverity?: BugSeverity | null;
  stepsToReproduce?: string | null;
  expectedBehaviour?: string | null;
  actualBehaviour?: string | null;
  relatedWorkItemId?: string | null;

  // Archive & deletion
  isDeleted: boolean;
  deletedAt?: string | null;
  deletionReason?: string | null;
  completedAt?: string | null;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  status: ProjectStatus;
  currentVersion?: string | null;
  platform?: string[];
  repoUrl?: string | null;
  prodUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export type VersionStatus = 'planning' | 'development' | 'testing' | 'released' | 'archived';

export interface Version {
  id: string;
  projectId: string;
  userId: string;
  versionNumber: string;
  title: string;
  description: string;
  status: VersionStatus;
  targetDate?: string | null;
  releaseDate?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureGroup {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  description: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestReport {
  id: string;
  projectId: string;
  userId: string;
  versionId?: string | null;
  title: string;
  date: string;
  platform: string;
  device: string;
  browser: string;
  passedCount: number;
  failedCount: number;
  notes: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  workItemId: string;
  userId: string;
  userName?: string;
  content: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Activity {
  id: string;
  workItemId: string;
  userId: string;
  type: 'created' | 'status_change' | 'version_change' | 'testing_outcome' | 'archived' | 'restored' | 'general';
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isAnonymous?: boolean;
}
