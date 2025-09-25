export type Project = {
  id: number;
  name: string;
  status: "active" | "planning" | "completed";
  progress: number;
  budget: number;
  spent: number;
  cpi: number;
  spi: number;
  qualityScore: number;
  safetyScore: number;
  acceptanceCriteriaComplete: number;
  riskLevel: "low" | "medium" | "high";
  client?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  teamSize?: number;
  contractor?: string;
};

export type TeamMember = {
  id: number;
  name: string;
  role: string;
  status: "online" | "offline";
  hoursToday: number;
  productivity: number;
  avatar: string; // initials
};

export type Material = {
  id: number;
  name: string;
  currentStock: number;
  totalRequired: number;
  status: "adequate" | "low" | "critical";
  cost: number;
  supplier: string;
};

export type Weather = {
  current: { temperature: number; condition: string; workSuitability: string };
  forecast: { day: string; high: number; low: number; condition: string; workSuitability: string }[];
};

export type Communications = {
  unreadMessages: number;
  activeCalls: number;
  notifications: number;
  recentMessages: { from: string; avatar: string; message: string; timestamp: string }[];
};

export type Stakeholder = {
  id: number;
  type: "client" | "contractor" | "supplier" | "authority";
  name: string;
  contact: string;
  status: string;
  teamMembers?: number;
  nextDelivery?: string;
  nextInspection?: string;
  lastContact?: string;
};

export const constructionData = {
  projects: [
    {
      id: 1,
      name: "Residential Complex Phase 1",
      status: "active",
      progress: 72,
      budget: 850000,
      spent: 585000,
      cpi: 0.98,
      spi: 1.05,
      qualityScore: 94,
      safetyScore: 92,
      acceptanceCriteriaComplete: 85,
      riskLevel: "medium",
      client: "Metropolitan Housing Ltd",
      location: "London, UK",
      startDate: "2025-01-15",
      endDate: "2025-08-30",
      teamSize: 45,
      contractor: "Premier Construction",
    },
    {
      id: 2,
      name: "Office Building Extension",
      status: "active",
      progress: 45,
      budget: 1200000,
      spent: 495000,
      cpi: 1.02,
      spi: 0.95,
      qualityScore: 91,
      safetyScore: 89,
      acceptanceCriteriaComplete: 68,
      riskLevel: "low",
    },
    {
      id: 3,
      name: "School Renovation",
      status: "planning",
      progress: 15,
      budget: 650000,
      spent: 85000,
      cpi: 1.15,
      spi: 1.1,
      qualityScore: 88,
      safetyScore: 95,
      acceptanceCriteriaComplete: 25,
      riskLevel: "high",
    },
  ] as Project[],

  team: [
    { id: 1, name: "John Smith", role: "Site Manager", status: "online", hoursToday: 7.5, productivity: 94, avatar: "JS" },
    { id: 2, name: "Sarah Jones", role: "Safety Officer", status: "online", hoursToday: 8.0, productivity: 88, avatar: "SJ" },
    { id: 3, name: "Mike Wilson", role: "Project Foreman", status: "online", hoursToday: 6.5, productivity: 91, avatar: "MW" },
    { id: 4, name: "Emma Davis", role: "Quality Inspector", status: "online", hoursToday: 7.0, productivity: 96, avatar: "ED" },
    { id: 5, name: "Tom Brown", role: "Crane Operator", status: "online", hoursToday: 8.0, productivity: 89, avatar: "TB" },
  ] as TeamMember[],

  materials: [
    { id: 1, name: "Concrete Ready-Mix", currentStock: 45, totalRequired: 85, status: "adequate", cost: 120, supplier: "ReadyMix Ltd" },
    { id: 2, name: "Steel Reinforcement", currentStock: 8, totalRequired: 45, status: "critical", cost: 850, supplier: "SteelCorp" },
    { id: 3, name: "Electrical Cable", currentStock: 2500, totalRequired: 8000, status: "low", cost: 3.5, supplier: "ElectriCo" },
  ] as Material[],

  weather: {
    current: { temperature: 16, condition: "Partly Cloudy", workSuitability: "good" },
    forecast: [
      { day: "Today", high: 18, low: 12, condition: "Partly Cloudy", workSuitability: "good" },
      { day: "Tomorrow", high: 16, low: 10, condition: "Light Rain", workSuitability: "limited" },
      { day: "Friday", high: 20, low: 14, condition: "Sunny", workSuitability: "excellent" },
      { day: "Saturday", high: 14, low: 8, condition: "Heavy Rain", workSuitability: "poor" },
    ],
  } as Weather,

  communications: {
    unreadMessages: 5,
    activeCalls: 2,
    notifications: 12,
    recentMessages: [
      { from: "Jane Doe", avatar: "JD", message: "Foundation inspection completed - all checks passed", timestamp: "2 min ago" },
      { from: "Mike Smith", avatar: "MS", message: "Steel delivery confirmed for tomorrow 8AM", timestamp: "15 min ago" },
    ],
  } as Communications,

  stakeholders: [
    { id: 1, type: "client", name: "Metropolitan Housing Ltd", contact: "James Wilson", status: "satisfied", lastContact: "Today 2:30 PM" },
    { id: 2, type: "contractor", name: "Premier Construction", contact: "Main Office", status: "active", teamMembers: 45 },
    { id: 3, type: "supplier", name: "BuildMat Supplies", contact: "Supply Chain", status: "delay-risk", nextDelivery: "Tomorrow" },
    { id: 4, type: "authority", name: "Building Control", contact: "Inspector Davis", status: "scheduled", nextInspection: "26 Sep" },
  ] as Stakeholder[],
};

export default constructionData;
