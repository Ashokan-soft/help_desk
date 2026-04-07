export interface Division {
  id: number;
  name: string;
}

export interface FormSchemaField {
  label: string;
  name: string;
  type: string; // 'text', 'select', 'textarea', etc.
  options?: string[]; // Only used if type is 'select'
  required: boolean;
}

export interface IssuePart {
  id: number;
  division: number;
  name: string;
  requires_image: boolean; // NEW
  requires_audio: boolean; // NEW
  form_schema: FormSchemaField[];
  division_name?: string; // <--- ADD THIS LINE HERE
}