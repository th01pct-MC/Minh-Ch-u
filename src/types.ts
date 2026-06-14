export interface Grade {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  grade_id: string;
  name: string;
}

export interface Lesson {
  id: string;
  topic_id: string;
  name: string;
}

export interface ResourceType {
  id: string;
  name: string;
  iconName: string; // We'll map string names to Lucide icons dynamically
  color: string;
  bg: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  grade_id: string;
  topic_id: string | null;
  lesson_id: string | null;
  resource_type_id: string;
  file_name: string;
  file_size: string;
  uploaded_by: string;
  view_count: number;
  download_count: number;
  created_at: string;
  contentUrl?: string; // Optional field for viewing content demo
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  avatar: string;
  email: string;
}
