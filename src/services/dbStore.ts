import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Project, Version, FeatureGroup, WorkItem, TestReport, Comment, Activity } from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'hentamo_projects',
  VERSIONS: 'hentamo_versions',
  FEATURE_GROUPS: 'hentamo_feature_groups',
  WORK_ITEMS: 'hentamo_work_items',
  TEST_REPORTS: 'hentamo_test_reports',
  COMMENTS: 'hentamo_comments',
  ACTIVITIES: 'hentamo_activities',
};

function getLocal<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveLocal<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

// ----------------- PROJECTS -----------------
export const projectService = {
  async getProjects(userId: string): Promise<Project[]> {
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'projects'), where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as Project));
    }
    const list = getLocal<Project>(STORAGE_KEYS.PROJECTS);
    return list;
  },

  async getProject(projectId: string): Promise<Project | null> {
    if (isFirebaseConfigured && db) {
      const d = await getDoc(doc(db, 'projects', projectId));
      return d.exists() ? ({ ...d.data(), id: d.id } as Project) : null;
    }
    const list = getLocal<Project>(STORAGE_KEYS.PROJECTS);
    return list.find(p => p.id === projectId) || null;
  },

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const id = 'proj-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const newProject: Project = {
      ...project,
      id,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'projects', id), {
        ...newProject,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return newProject;
    }

    const list = getLocal<Project>(STORAGE_KEYS.PROJECTS);
    list.push(newProject);
    saveLocal(STORAGE_KEYS.PROJECTS, list);
    return newProject;
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const now = new Date().toISOString();
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'projects', projectId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      const updated = await this.getProject(projectId);
      return updated!;
    }

    const list = getLocal<Project>(STORAGE_KEYS.PROJECTS);
    const index = list.findIndex(p => p.id === projectId);
    if (index === -1) throw new Error('Project not found');
    list[index] = { ...list[index], ...updates, updatedAt: now };
    saveLocal(STORAGE_KEYS.PROJECTS, list);
    return list[index];
  },

  async archiveProject(projectId: string): Promise<void> {
    await this.updateProject(projectId, {
      status: 'archived',
      archivedAt: new Date().toISOString(),
    });
  },

  async restoreProject(projectId: string): Promise<void> {
    await this.updateProject(projectId, {
      status: 'active',
      archivedAt: null,
    });
  },
};

// ----------------- VERSIONS -----------------
export const versionService = {
  async getVersions(projectId: string): Promise<Version[]> {
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, 'versions'),
        where('projectId', '==', projectId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as Version));
    }
    const list = getLocal<Version>(STORAGE_KEYS.VERSIONS);
    return list.filter(v => v.projectId === projectId);
  },

  async getVersion(versionId: string): Promise<Version | null> {
    if (isFirebaseConfigured && db) {
      const d = await getDoc(doc(db, 'versions', versionId));
      return d.exists() ? ({ ...d.data(), id: d.id } as Version) : null;
    }
    const list = getLocal<Version>(STORAGE_KEYS.VERSIONS);
    return list.find(v => v.id === versionId) || null;
  },

  async createVersion(versionData: Omit<Version, 'id' | 'createdAt' | 'updatedAt'>): Promise<Version> {
    const id = 'ver-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const newVersion: Version = {
      ...versionData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'versions', id), {
        ...newVersion,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return newVersion;
    }

    const list = getLocal<Version>(STORAGE_KEYS.VERSIONS);
    list.push(newVersion);
    saveLocal(STORAGE_KEYS.VERSIONS, list);
    return newVersion;
  },

  async updateVersion(versionId: string, updates: Partial<Version>): Promise<Version> {
    const now = new Date().toISOString();
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'versions', versionId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      const updated = await this.getVersion(versionId);
      return updated!;
    }

    const list = getLocal<Version>(STORAGE_KEYS.VERSIONS);
    const index = list.findIndex(v => v.id === versionId);
    if (index === -1) throw new Error('Version not found');
    list[index] = { ...list[index], ...updates, updatedAt: now };
    saveLocal(STORAGE_KEYS.VERSIONS, list);
    return list[index];
  },
};

// ----------------- FEATURE GROUPS -----------------
export const featureGroupService = {
  async getFeatureGroups(projectId: string): Promise<FeatureGroup[]> {
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, 'featureGroups'),
        where('projectId', '==', projectId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as FeatureGroup));
    }
    const list = getLocal<FeatureGroup>(STORAGE_KEYS.FEATURE_GROUPS);
    return list.filter(fg => fg.projectId === projectId);
  },

  async createFeatureGroup(data: Omit<FeatureGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeatureGroup> {
    const id = 'fg-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const group: FeatureGroup = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'featureGroups', id), {
        ...group,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return group;
    }

    const list = getLocal<FeatureGroup>(STORAGE_KEYS.FEATURE_GROUPS);
    list.push(group);
    saveLocal(STORAGE_KEYS.FEATURE_GROUPS, list);
    return group;
  },

  async updateFeatureGroup(groupId: string, updates: Partial<FeatureGroup>): Promise<FeatureGroup> {
    const now = new Date().toISOString();
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'featureGroups', groupId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      const snap = await getDoc(doc(db, 'featureGroups', groupId));
      return { ...snap.data(), id: snap.id } as FeatureGroup;
    }

    const list = getLocal<FeatureGroup>(STORAGE_KEYS.FEATURE_GROUPS);
    const idx = list.findIndex(fg => fg.id === groupId);
    if (idx === -1) throw new Error('Feature Group not found');
    list[idx] = { ...list[idx], ...updates, updatedAt: now };
    saveLocal(STORAGE_KEYS.FEATURE_GROUPS, list);
    return list[idx];
  },
};

// ----------------- WORK ITEMS -----------------
export const workItemService = {
  async getWorkItems(projectId: string): Promise<WorkItem[]> {
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, 'workItems'),
        where('projectId', '==', projectId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as WorkItem));
    }
    const list = getLocal<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    return list.filter(w => w.projectId === projectId);
  },

  async getAllUserWorkItems(userId: string): Promise<WorkItem[]> {
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, 'workItems'),
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as WorkItem));
    }
    const list = getLocal<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    return list.filter(w => w.userId === userId);
  },

  async getWorkItem(itemId: string): Promise<WorkItem | null> {
    if (isFirebaseConfigured && db) {
      const d = await getDoc(doc(db, 'workItems', itemId));
      return d.exists() ? ({ ...d.data(), id: d.id } as WorkItem) : null;
    }
    const list = getLocal<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    return list.find(w => w.id === itemId) || null;
  },

  async createWorkItem(itemData: Omit<WorkItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkItem> {
    const id = 'wi-' + Math.floor(100 + Math.random() * 900);
    const now = new Date().toISOString();
    const newItem: WorkItem = {
      ...itemData,
      id,
      subtasks: itemData.subtasks || [],
      dependencies: itemData.dependencies || [],
      testCases: itemData.testCases || [],
      testHistory: itemData.testHistory || [],
      attachments: itemData.attachments || [],
      isDeleted: false,
      deletedAt: null,
      deletionReason: null,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'workItems', id), {
        ...newItem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return newItem;
    }

    const list = getLocal<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    list.unshift(newItem);
    saveLocal(STORAGE_KEYS.WORK_ITEMS, list);

    // Auto record creation activity
    await activityService.logActivity(id, 'created', `Created ${newItem.type}: "${newItem.title}"`);
    return newItem;
  },

  async updateWorkItem(itemId: string, updates: Partial<WorkItem>): Promise<WorkItem> {
    const now = new Date().toISOString();
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'workItems', itemId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      const updated = await this.getWorkItem(itemId);
      return updated!;
    }

    const list = getLocal<WorkItem>(STORAGE_KEYS.WORK_ITEMS);
    const index = list.findIndex(w => w.id === itemId);
    if (index === -1) throw new Error('Work Item not found');
    list[index] = { ...list[index], ...updates, updatedAt: now };
    saveLocal(STORAGE_KEYS.WORK_ITEMS, list);
    return list[index];
  },

  // Enforces the core workflow:
  // Backlog -> Planned -> In Progress -> Testing -> Completed
  async updateWorkItemStatus(
    itemId: string,
    newStatus: WorkItem['status']
  ): Promise<WorkItem> {
    const current = await this.getWorkItem(itemId);
    if (!current) throw new Error('Work item not found');

    const updates: Partial<WorkItem> = { status: newStatus };
    if (newStatus === 'completed') {
      updates.completedAt = new Date().toISOString();
    } else {
      updates.completedAt = null;
    }

    const updated = await this.updateWorkItem(itemId, updates);
    await activityService.logActivity(
      itemId,
      'status_change',
      `Status changed from ${current.status.replace('_', ' ')} to ${newStatus.replace('_', ' ')}`,
      { oldStatus: current.status, newStatus }
    );
    return updated;
  },

  async toggleFocus(itemId: string): Promise<WorkItem> {
    const item = await this.getWorkItem(itemId);
    if (!item) throw new Error('Work item not found');
    const updated = await this.updateWorkItem(itemId, { isFocus: !item.isFocus });
    await activityService.logActivity(
      itemId,
      'general',
      item.isFocus ? 'Removed from My Focus' : 'Added to My Focus'
    );
    return updated;
  },

  async archiveWorkItem(itemId: string, reason?: string): Promise<WorkItem> {
    const now = new Date().toISOString();
    const updated = await this.updateWorkItem(itemId, {
      isDeleted: true,
      deletedAt: now,
      deletionReason: reason || null,
    });
    await activityService.logActivity(
      itemId,
      'archived',
      `Moved to Deleted Archive${reason ? `: ${reason}` : ''}`
    );
    return updated;
  },

  async restoreWorkItem(itemId: string): Promise<WorkItem> {
    const updated = await this.updateWorkItem(itemId, {
      isDeleted: false,
      deletedAt: null,
      deletionReason: null,
    });
    await activityService.logActivity(itemId, 'restored', 'Restored from Deleted Archive');
    return updated;
  },

  // Testing workflow execution
  async recordTestAttempt(
    itemId: string,
    result: 'passed' | 'failed',
    notes: string,
    options?: {
      action?: 'return_to_progress' | 'move_to_future_version' | 'completed';
      futureVersionId?: string | null;
    }
  ): Promise<WorkItem> {
    const item = await this.getWorkItem(itemId);
    if (!item) throw new Error('Work item not found');

    const attemptId = 'th-' + Math.random().toString(36).substring(2, 9);
    const newAttempt = {
      id: attemptId,
      date: new Date().toISOString(),
      result,
      notes,
      versionId: item.targetVersionId || null,
      actionTaken: options?.action,
    };

    const updatedHistory = [newAttempt, ...(item.testHistory || [])];
    const updates: Partial<WorkItem> = {
      testHistory: updatedHistory,
    };

    if (result === 'passed') {
      if (options?.action === 'completed') {
        updates.status = 'completed';
        updates.completedAt = new Date().toISOString();
      }
      await activityService.logActivity(
        itemId,
        'testing_outcome',
        `Testing Passed: ${notes}`
      );
    } else {
      // Failed handling
      if (options?.action === 'return_to_progress') {
        updates.status = 'in_progress';
        await activityService.logActivity(
          itemId,
          'testing_outcome',
          `Testing Failed: Returned to In Progress in same version. Notes: ${notes}`
        );
      } else if (options?.action === 'move_to_future_version') {
        updates.status = 'planned';
        updates.targetVersionId = options.futureVersionId || null;
        await activityService.logActivity(
          itemId,
          'testing_outcome',
          `Testing Failed: Moved to future version. Status reset to Planned. Notes: ${notes}`
        );
      }
    }

    return await this.updateWorkItem(itemId, updates);
  },

  // Bidirectional Dependencies
  async addDependency(
    sourceItemId: string,
    targetItemId: string,
    type: 'blocks' | 'related' | 'duplicate'
  ): Promise<void> {
    const source = await this.getWorkItem(sourceItemId);
    const target = await this.getWorkItem(targetItemId);
    if (!source || !target) throw new Error('Items not found for dependency');

    // Source link
    const sourceDep = {
      id: 'dep-' + Math.random().toString(36).substring(2, 7),
      targetItemId: target.id,
      targetTitle: target.title,
      type,
    };

    // Reciprocal link
    let reciprocalType: 'blocks' | 'is_blocked_by' | 'related' | 'duplicate' = 'related';
    if (type === 'blocks') reciprocalType = 'is_blocked_by';
    else if (type === 'duplicate') reciprocalType = 'duplicate';

    const targetDep = {
      id: 'dep-' + Math.random().toString(36).substring(2, 7),
      targetItemId: source.id,
      targetTitle: source.title,
      type: reciprocalType,
    };

    await this.updateWorkItem(source.id, {
      dependencies: [...(source.dependencies || []).filter(d => d.targetItemId !== target.id), sourceDep],
    });

    await this.updateWorkItem(target.id, {
      dependencies: [...(target.dependencies || []).filter(d => d.targetItemId !== source.id), targetDep],
    });

    await activityService.logActivity(
      source.id,
      'general',
      `Linked dependency: ${type} "${target.title}"`
    );
  },

  async removeDependency(sourceItemId: string, targetItemId: string): Promise<void> {
    const source = await this.getWorkItem(sourceItemId);
    const target = await this.getWorkItem(targetItemId);

    if (source) {
      await this.updateWorkItem(source.id, {
        dependencies: (source.dependencies || []).filter(d => d.targetItemId !== targetItemId),
      });
    }

    if (target) {
      await this.updateWorkItem(target.id, {
        dependencies: (target.dependencies || []).filter(d => d.targetItemId !== sourceItemId),
      });
    }
  },
};

// ----------------- TEST REPORTS -----------------
export const testReportService = {
  async getTestReports(projectId: string): Promise<TestReport[]> {
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, 'testReports'),
        where('projectId', '==', projectId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as TestReport));
    }
    const list = getLocal<TestReport>(STORAGE_KEYS.TEST_REPORTS);
    return list.filter(tr => tr.projectId === projectId);
  },

  async createTestReport(data: Omit<TestReport, 'id' | 'createdAt'>): Promise<TestReport> {
    const id = 'tr-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const report: TestReport = {
      ...data,
      id,
      createdAt: now,
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'testReports', id), {
        ...report,
        createdAt: serverTimestamp(),
      });
      return report;
    }

    const list = getLocal<TestReport>(STORAGE_KEYS.TEST_REPORTS);
    list.unshift(report);
    saveLocal(STORAGE_KEYS.TEST_REPORTS, list);
    return report;
  },
};

// ----------------- COMMENTS -----------------
export const commentService = {
  async getComments(workItemId: string): Promise<Comment[]> {
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, 'workItems', workItemId, 'comments'),
        orderBy('createdAt', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as Comment));
    }
    const list = getLocal<Comment>(STORAGE_KEYS.COMMENTS);
    return list.filter(c => c.workItemId === workItemId);
  },

  async addComment(workItemId: string, content: string, user: { uid: string; displayName?: string | null }): Promise<Comment> {
    const id = 'comm-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const comment: Comment = {
      id,
      workItemId,
      userId: user.uid,
      userName: user.displayName || 'Developer',
      content,
      createdAt: now,
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'workItems', workItemId, 'comments', id), {
        ...comment,
        createdAt: serverTimestamp(),
      });
      return comment;
    }

    const list = getLocal<Comment>(STORAGE_KEYS.COMMENTS);
    list.push(comment);
    saveLocal(STORAGE_KEYS.COMMENTS, list);
    return comment;
  },
};

// ----------------- ACTIVITIES -----------------
export const activityService = {
  async getActivities(workItemId: string): Promise<Activity[]> {
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, 'workItems', workItemId, 'activities'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as Activity));
    }
    const list = getLocal<Activity>(STORAGE_KEYS.ACTIVITIES);
    return list.filter(a => a.workItemId === workItemId);
  },

  async logActivity(
    workItemId: string,
    type: Activity['type'],
    description: string,
    metadata?: Record<string, any>
  ): Promise<Activity> {
    const id = 'act-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const activity: Activity = {
      id,
      workItemId,
      userId: 'user-hentamo-solo',
      type,
      description,
      metadata,
      createdAt: now,
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'workItems', workItemId, 'activities', id), {
          ...activity,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Failed to save activity to Firestore:', err);
      }
      return activity;
    }

    const list = getLocal<Activity>(STORAGE_KEYS.ACTIVITIES);
    list.unshift(activity);
    saveLocal(STORAGE_KEYS.ACTIVITIES, list);
    return activity;
  },
};
