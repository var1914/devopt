interface User {
  id: string;
  name: string;
  productivity: number;
  codeQuality: number;
}

interface Project {
  id: string;
  name: string;
  syncStatus: string;
}

interface Health {
  userId: string;
  posture: string;
  breakTime: number;
  focusSessions: number;
  stressLevel: string;
}

interface KnowledgeItem {
  userId: string;
  item: string;
}

class InMemoryDB {
  private users: User[] = [];
  private projects: Project[] = [];
  private healthRecords: Health[] = [];
  private knowledgeGraph: KnowledgeItem[] = [];

  // User methods
  addUser(user: User) {
    this.users.push(user);
  }

  getUser(id: string) {
    return this.users.find(user => user.id === id);
  }

  updateUser(id: string, data: Partial<User>) {
    const index = this.users.findIndex(user => user.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...data };
      return this.users[index];
    }
    return null;
  }

  // Project methods
  addProject(project: Project) {
    this.projects.push(project);
  }

  getProject(id: string) {
    return this.projects.find(project => project.id === id);
  }

  updateProject(id: string, data: Partial<Project>) {
    const index = this.projects.findIndex(project => project.id === id);
    if (index !== -1) {
      this.projects[index] = { ...this.projects[index], ...data };
      return this.projects[index];
    }
    return null;
  }

  // Health methods
  addHealthRecord(health: Health) {
    this.healthRecords.push(health);
  }

  getHealthRecord(userId: string) {
    return this.healthRecords.find(record => record.userId === userId);
  }

  updateHealthRecord(userId: string, data: Partial<Health>) {
    const index = this.healthRecords.findIndex(record => record.userId === userId);
    if (index !== -1) {
      this.healthRecords[index] = { ...this.healthRecords[index], ...data };
      return this.healthRecords[index];
    }
    return null;
  }

  // Knowledge Graph methods
  addKnowledgeItem(item: KnowledgeItem) {
    this.knowledgeGraph.push(item);
  }

  getKnowledgeGraph(userId: string) {
    return this.knowledgeGraph.filter(item => item.userId === userId);
  }
}

export const db = new InMemoryDB();

// Initialize with some data
db.addUser({ id: '1', name: 'John Doe', productivity: 87, codeQuality: 92 });
db.addProject({ id: '1', name: 'DevGenius', syncStatus: 'Up to date' });
db.addHealthRecord({ userId: '1', posture: 'Good', breakTime: 15, focusSessions: 4, stressLevel: 'Moderate' });
db.addKnowledgeItem({ userId: '1', item: 'React Hooks' });
db.addKnowledgeItem({ userId: '1', item: 'GraphQL' });
db.addKnowledgeItem({ userId: '1', item: 'Docker' });