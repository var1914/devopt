const API_BASE_URL = '/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  getUser: (id: string) => fetchAPI(`/user?id=${id}`),
  updateUser: (id: string, data: any) => fetchAPI(`/user?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  getProject: (id: string) => fetchAPI(`/project?id=${id}`),
  updateProject: (id: string, data: any) => fetchAPI(`/project?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  getHealth: (userId: string) => fetchAPI(`/health?userId=${userId}`),
  updateHealth: (userId: string, data: any) => fetchAPI(`/health?userId=${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  getKnowledgeGraph: (userId: string) => fetchAPI(`/knowledge?userId=${userId}`),
  addKnowledgeItem: (userId: string, item: string) => fetchAPI(`/knowledge?userId=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item }),
  }),
};