export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "lecturer" | "admin";
  admission_number?: string;
  display_name?: string;
  university?: number;
  university_detail?: {
    id: number;
    name: string;
    code: string;
  };
  is_student: boolean;
  is_lecturer: boolean;
  is_admin_user: boolean;
}

export interface Institution {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem("EduLabs_access_token") || localStorage.getItem("edulabs_access_token") || localStorage.getItem("access_token");
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
    const token = this.getToken();

    const isPublicAuthEndpoint =
      endpoint.includes("/api/auth/student-login/") ||
      endpoint.includes("/api/auth/lecturer-login/") ||
      endpoint.includes("/api/auth/admin-login/") ||
      endpoint.includes("/api/auth/student-register/") ||
      endpoint.includes("/api/auth/lecturer-register/") ||
      endpoint.includes("/api/auth/password-reset/") ||
      endpoint.includes("/api/auth/institutions/");

    let headers: HeadersInit;
    if (options.body instanceof FormData) {
      headers = isPublicAuthEndpoint
        ? {}
        : { Authorization: `Bearer ${token || ""}` };
    } else {
      const baseHeaders: HeadersInit = { "Content-Type": "application/json" };
      if (token && !isPublicAuthEndpoint) {
        baseHeaders["Authorization"] = `Bearer ${token}`;
      }
      headers = { ...baseHeaders, ...options.headers };
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const res = await fetch(url, config);

    if (res.status === 401) {
      console.warn("Session expired or unauthorized");
      if (typeof window !== "undefined") {
        localStorage.removeItem("EduLabs_access_token");
        localStorage.removeItem("EduLabs_refresh_token");
        localStorage.removeItem("EduLabs_user");
      }
    }

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errJson = await res.json();
        errorMsg = errJson.error || errJson.detail || JSON.stringify(errJson);
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  // ---------------- AUTH API ----------------
  async getInstitutions(): Promise<Institution[]> {
    return this.request<Institution[]>("/api/auth/institutions/");
  }

  async studentLogin(data: { university_code: string; admission_number: string; password: string }) {
    return this.request<{ access: string; refresh: string; user: UserProfile; portal: string }>(
      "/api/auth/student-login/",
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  async lecturerLogin(data: { username: string; password: string }) {
    return this.request<{ access: string; refresh: string; user: UserProfile; portal: string }>(
      "/api/auth/lecturer-login/",
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  async adminLogin(data: { username: string; password: string }) {
    return this.request<{ access: string; refresh: string; user: UserProfile; portal: string }>(
      "/api/auth/admin-login/",
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  async studentRegister(data: {
    first_name: string;
    last_name: string;
    admission_number: string;
    email: string;
    university_code: string;
    year_of_study?: number;
    password: string;
    confirm_password: string;
  }) {
    return this.request<{ access: string; refresh: string; user: UserProfile; portal: string; message: string }>(
      "/api/auth/student-register/",
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  async lecturerRegister(data: {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    university_code: string;
    password: string;
    confirm_password: string;
  }) {
    return this.request<{ access: string; refresh: string; user: UserProfile; portal: string; message: string }>(
      "/api/auth/lecturer-register/",
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  async requestPasswordReset(identifier: string) {
    return this.request<{ message: string; reset_token: string; identifier: string; role: string }>(
      "/api/auth/password-reset-request/",
      { method: "POST", body: JSON.stringify({ identifier }) }
    );
  }

  async confirmPasswordReset(data: {
    identifier: string;
    reset_token: string;
    new_password: string;
    confirm_password: string;
  }) {
    return this.request<{ message: string; role: string }>(
      "/api/auth/password-reset-confirm/",
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  async getMe(): Promise<UserProfile> {
    return this.request<UserProfile>("/api/auth/me/");
  }

  // Direct ApiClient aliases for student methods
  async getStudentDashboard() {
    return this.request<any>("/api/student/dashboard/");
  }

  async getStudentFinalTest(unitId: number) {
    return this.request<any>(`/api/student/units/${unitId}/final-test/`);
  }

  async getStudentAssessment(assessmentId: number) {
    return this.request<any>(`/api/student/assessments/${assessmentId}/`);
  }

  async submitStudentAttempt(attemptId: number, answers: any[]) {
    return this.request<any>(`/api/student/attempts/${attemptId}/submit/`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  }

  async getStudentAttemptDetail(attemptId: number) {
    return this.request<any>(`/api/student/attempts/${attemptId}/`);
  }

  async getStudentAttemptHistory(assessmentId: number) {
    return this.request<any[]>(`/api/student/assessments/${assessmentId}/attempts/`);
  }

  async getStudentRevision(unitId: number) {
    return this.request<any>(`/api/student/units/${unitId}/revision/`);
  }

  async getStudentUnitDetail(unitId: number) {
    return this.request<any>(`/api/student/units/${unitId}/`);
  }

  async getStudentWeekDetail(weekNumber: number, unitId: number = 1) {
    return this.request<any>(`/api/student/units/${unitId}/weeks/${weekNumber}/`);
  }

  async askTutor(query: string) {
    return this.request<any>("/api/student/ask-tutor/", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  }

  async getLeaderboard(timeframe?: string) {
    const url = timeframe ? `/api/student/leaderboard/?timeframe=${encodeURIComponent(timeframe)}` : "/api/student/leaderboard/";
    return this.request<any[]>(url);
  }

  async getPracticeQuestions(params?: { unitId?: number; weekId?: number; assessmentId?: number }) {
    const sp = new URLSearchParams();
    if (params?.unitId) sp.append("unit_id", String(params.unitId));
    if (params?.weekId) sp.append("week_id", String(params.weekId));
    if (params?.assessmentId) sp.append("assessment_id", String(params.assessmentId));
    const qs = sp.toString() ? `?${sp.toString()}` : "";
    return this.request<any[]>(`/api/student/practice-questions/${qs}`);
  }

  async checkPracticeQuestion(questionId: number, selectedOption: string) {
    return this.request<any>(`/api/student/practice-questions/${questionId}/check/`, {
      method: "POST",
      body: JSON.stringify({ selected_option: selectedOption }),
    });
  }
}

export const api = new ApiClient();

export const authApi = {
  getInstitutions: async () => ({ data: await api.getInstitutions() }),
  studentLogin: async (data: any) => ({ data: await api.studentLogin(data) }),
  studentRegister: async (data: any) => ({ data: await api.studentRegister(data) }),
  lecturerLogin: async (data: any) => ({ data: await api.lecturerLogin(data) }),
  lecturerRegister: async (data: any) => ({ data: await api.lecturerRegister(data) }),
  adminLogin: async (data: any) => ({ data: await api.adminLogin(data) }),
  requestPasswordReset: async (identifier: string) => ({ data: await api.requestPasswordReset(identifier) }),
  confirmPasswordReset: async (data: any) => ({ data: await api.confirmPasswordReset(data) }),
  getMe: async () => ({ data: await api.getMe() }),
};

export const studentApi = {
  getDashboard: async () => ({ data: await api.request<any>("/api/student/dashboard/") }),
  getSemesterUnits: async (semesterId?: number) => {
    const q = semesterId ? `?semester_id=${semesterId}` : "";
    return { data: await api.request<any>(`/api/student/units/${q}`) };
  },
  getUnitDetail: async (unitId: number) => ({
    data: await api.request<any>(`/api/student/units/${unitId}/`),
  }),
  getWeekMaterials: async (weekNumber: number, unitId: number = 1) => ({
    data: await api.request<any>(`/api/student/units/${unitId}/weeks/${weekNumber}/`),
  }),
  getAssessment: async (assessmentId: number) => ({
    data: await api.request<any>(`/api/student/assessments/${assessmentId}/`),
  }),
  submitAttempt: async (attemptId: number, answers: any[]) => ({
    data: await api.request<any>(`/api/student/attempts/${attemptId}/submit/`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
  }),
  getAttemptDetail: async (attemptId: number) => ({
    data: await api.request<any>(`/api/student/attempts/${attemptId}/`),
  }),
  getAttemptHistory: async (assessmentId: number) => ({
    data: await api.request<any[]>(`/api/student/assessments/${assessmentId}/history/`),
  }),
  getRevisionPack: async (unitId: number) => ({
    data: await api.request<any>(`/api/student/units/${unitId}/revision/`),
  }),
  getFinalTest: async (unitId: number) => ({
    data: await api.request<any>(`/api/student/units/${unitId}/final-test/`),
  }),
  getLeaderboard: async (timeframe?: string) => ({
    data: await api.getLeaderboard(timeframe),
  }),
  getPastSemesters: async () => ({
    data: await api.request<any[]>("/api/student/past-semesters/"),
  }),
  askTutor: async (query: string) => ({
    data: await api.request<any>("/api/student/ask-tutor/", {
      method: "POST",
      body: JSON.stringify({ query }),
    }),
  }),
  getPracticeQuestions: async (params?: { unitId?: number; weekId?: number; assessmentId?: number }) => ({
    data: await api.getPracticeQuestions(params),
  }),
  checkPracticeQuestion: async (questionId: number, selectedOption: string) => ({
    data: await api.checkPracticeQuestion(questionId, selectedOption),
  }),
};

export const lecturerApi = {
  getDashboard: async () => ({
    data: await api.request<any>("/api/lecturer/dashboard/"),
  }),
  getAssignedUnits: async () => ({
    data: await api.request<any[]>("/api/lecturer/units/"),
  }),
  getWeeks: async (unitId: number) => ({
    data: await api.request<any>(`/api/lecturer/units/${unitId}/weeks/`),
  }),
  createWeek: async (unitId: number, data: { week_number?: number; title?: string; description?: string }) => ({
    data: await api.request<any>(`/api/lecturer/units/${unitId}/weeks/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  }),
  getMaterials: async (weekId: number) => ({
    data: await api.request<any[]>(`/api/lecturer/weeks/${weekId}/materials/`),
  }),
  createMaterial: async (formData: FormData) => ({
    data: await api.request<any>("/api/lecturer/materials/", {
      method: "POST",
      body: formData,
    }),
  }),
  deleteMaterial: async (materialId: number) => ({
    data: await api.request<any>(`/api/lecturer/materials/${materialId}/`, {
      method: "DELETE",
    }),
  }),
  getAssessments: async (unitId: number) => ({
    data: await api.request<any[]>(`/api/lecturer/units/${unitId}/assessments/`),
  }),
  getAssessmentDetail: async (assessmentId: number) => ({
    data: await api.request<any>(`/api/lecturer/assessments/${assessmentId}/`),
  }),
  updateAssessment: async (assessmentId: number, data: any) => ({
    data: await api.request<any>(`/api/lecturer/assessments/${assessmentId}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  }),
  generateDemoContent: async (assessmentId: number, useGemini: boolean = false, body?: any) => ({
    data: await api.request<any>(
      `/api/lecturer/assessments/${assessmentId}/generate-demo-content/${useGemini ? "?use_gemini=true" : ""}`,
      {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      }
    ),
  }),
  getAssessmentMaterials: async (assessmentId: number) => ({
    data: await api.request<any[]>(`/api/lecturer/assessments/${assessmentId}/materials/`),
  }),
  uploadAssessmentMaterial: async (assessmentId: number, formData: FormData) => ({
    data: await api.request<any>(`/api/lecturer/assessments/${assessmentId}/materials/`, {
      method: "POST",
      body: formData,
    }),
  }),
  generateGroundedQuestions: async (
    assessmentId: number,
    data: {
      material_ids: number[];
      topic?: string;
      difficulty?: string;
      question_count?: number;
      question_types?: string[];
      append?: boolean;
    }
  ) => ({
    data: await api.request<any>(`/api/lecturer/assessments/${assessmentId}/generate-grounded/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  }),
  regenerateQuestion: async (questionId: number, materialIds?: number[]) => ({
    data: await api.request<any>(`/api/lecturer/questions/${questionId}/regenerate/`, {
      method: "POST",
      body: JSON.stringify({ material_ids: materialIds || [] }),
    }),
  }),
  createQuestion: async (data: any) => ({
    data: await api.request<any>("/api/lecturer/questions/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  }),
  updateQuestion: async (questionId: number, data: any) => ({
    data: await api.request<any>(`/api/lecturer/questions/${questionId}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  }),

  deleteQuestion: async (questionId: number) => ({
    data: await api.request<any>(`/api/lecturer/questions/${questionId}/`, {
      method: "DELETE",
    }),
  }),
  getUnitAnalytics: async (unitId: number) => ({
    data: await api.request<any>(`/api/lecturer/units/${unitId}/analytics/`),
  }),
  getRevisionPack: async (unitId: number) => ({
    data: await api.request<any>(`/api/lecturer/units/${unitId}/revision-pack/`),
  }),
  createRevisionTopic: async (unitId: number, data: any) => ({
    data: await api.request<any>(`/api/lecturer/units/${unitId}/revision-pack/`, {
      method: "POST",
      body: JSON.stringify({ type: "topic", ...data }),
    }),
  }),
  createRevisionResource: async (unitId: number, data: any) => ({
    data: await api.request<any>(`/api/lecturer/units/${unitId}/revision-pack/`, {
      method: "POST",
      body: JSON.stringify({ type: "resource", ...data }),
    }),
  }),
  getExamReadinessConfig: async (unitId: number) => ({
    data: await api.request<any>(`/api/lecturer/units/${unitId}/generate-exam-readiness/`),
  }),
  generateExamReadiness: async (
    unitId: number,
    data?: {
      action?: string;
      individual_performance?: boolean;
      topics?: string[];
      weak_areas?: string[];
      mcq_count?: number;
      written_count?: number;
      difficulty?: string;
    }
  ) => ({
    data: await api.request<any>(`/api/lecturer/units/${unitId}/generate-exam-readiness/`, {
      method: "POST",
      body: JSON.stringify(data || {}),
    }),
  }),
  getFinalExamApprovals: async (unitId: number) => ({
    data: await api.request<any>(`/api/lecturer/units/${unitId}/final-exam-approvals/`),
  }),
  approveFinalExam: async (unitId: number, data: { student_id: number; is_approved: boolean; approval_notes?: string }) => ({
    data: await api.request<any>(`/api/lecturer/units/${unitId}/final-exam-approvals/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  }),
  getPracticeQuestions: async (params?: { unitId?: number; weekId?: number; assessmentId?: number }) => {
    const sp = new URLSearchParams();
    if (params?.unitId) sp.append("unit_id", String(params.unitId));
    if (params?.weekId) sp.append("week_id", String(params.weekId));
    if (params?.assessmentId) sp.append("assessment_id", String(params.assessmentId));
    const qs = sp.toString() ? `?${sp.toString()}` : "";
    return { data: await api.request<any[]>(`/api/lecturer/practice-questions/${qs}`) };
  },
  createPracticeQuestion: async (data: any) => ({
    data: await api.request<any>("/api/lecturer/practice-questions/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  }),
  updatePracticeQuestion: async (questionId: number, data: any) => ({
    data: await api.request<any>(`/api/lecturer/practice-questions/${questionId}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  }),
  deletePracticeQuestion: async (questionId: number) => ({
    data: await api.request<any>(`/api/lecturer/practice-questions/${questionId}/`, {
      method: "DELETE",
    }),
  }),
  reorderPracticeQuestions: async (orderIds: number[]) => ({
    data: await api.request<any>("/api/lecturer/practice-questions/reorder/", {
      method: "POST",
      body: JSON.stringify({ order_ids: orderIds }),
    }),
  }),
  generateLearningContent: async (unitId: number, data?: { selected_modes?: string[]; action?: string }) => ({
    data: await api.request<any>(`/api/lecturer/units/${unitId}/generate-learning-content/`, {
      method: "POST",
      body: JSON.stringify(data || {}),
    }),
  }),
};

export const adminApi = {
  getSOCDashboard: async () => ({
    data: await api.request<any>("/api/admin/soc/dashboard/"),
  }),
  getSOCEvents: async (filters?: { severity?: string; status?: string; q?: string }) => {
    const params = new URLSearchParams();
    if (filters?.severity) params.append("severity", filters.severity);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.q) params.append("q", filters.q);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return { data: await api.request<any[]>(`/api/admin/soc/events/${qs}`) };
  },
  getSOCEventDetail: async (eventId: number) => ({
    data: await api.request<any>(`/api/admin/soc/events/${eventId}/`),
  }),
  updateSOCEvent: async (eventId: number, data: { status?: string; investigation_status?: string; investigation_notes?: string; resolution_notes?: string }) => ({
    data: await api.request<any>(`/api/admin/soc/events/${eventId}/`, {
      method: "PATCH",
      body: JSON.stringify({
        investigation_status: data.investigation_status || data.status,
        resolution_notes: data.resolution_notes || data.investigation_notes,
      }),
    }),
  }),
  getSOCAuditLogs: async () => ({
    data: await api.request<any[]>("/api/admin/soc/audit/"),
  }),
  simulateAttack: async (attackType: string) => ({
    data: await api.request<any>("/api/admin/soc/trigger-simulation/", {
      method: "POST",
      body: JSON.stringify({ attack_type: attackType }),
    }),
  }),
  escalateSOCEvent: async (eventId: number, data?: { escalation_notes?: string; severity?: string }) => ({
    data: await api.request<any>(`/api/admin/soc/events/${eventId}/escalate/`, {
      method: "POST",
      body: JSON.stringify(data || {}),
    }),
  }),
  getSOCLogins: async (filters?: { status?: string; role?: string; q?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.role) params.append("role", filters.role);
    if (filters?.q) params.append("q", filters.q);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return { data: await api.request<any[]>(`/api/admin/soc/logins/${qs}`) };
  },
  getSOCApiActivity: async (filters?: { method?: string; status_code?: string; blocked?: boolean; q?: string }) => {
    const params = new URLSearchParams();
    if (filters?.method) params.append("method", filters.method);
    if (filters?.status_code) params.append("status_code", filters.status_code);
    if (filters?.blocked !== undefined) params.append("blocked", String(filters.blocked));
    if (filters?.q) params.append("q", filters.q);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return { data: await api.request<any[]>(`/api/admin/soc/api-activity/${qs}`) };
  },
};
