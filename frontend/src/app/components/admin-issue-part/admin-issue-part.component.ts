import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HelpdeskService } from '../../services/helpdesk.service';
import { Division, IssuePart } from '../../models/helpdesk.models';

@Component({
  selector: 'app-admin-issue-part',
  templateUrl: './admin-issue-part.component.html',
  styleUrls: ['./admin-issue-part.component.scss']
})
export class AdminIssuePartComponent implements OnInit {
  issuePartForm!: FormGroup;
  divisions: Division[] = [];
  existingIssueParts: IssuePart[] = [];
  
  activeTab: 'list' | 'form' = 'list'; 
  searchQuery: string = '';

  isEditing = false;
  editingId: number | null = null;
  formSubmitted = false;

  toast: { message: string, type: 'success' | 'error' } | null = null;

  constructor(private fb: FormBuilder, private helpdeskService: HelpdeskService) {}

  ngOnInit(): void {
    this.loadData();
    this.issuePartForm = this.fb.group({
      division: ['', Validators.required],
      name: ['', Validators.required],
      requires_image: [false],
      requires_audio: [false],
      form_schema: this.fb.array([])
    });
  }

  loadData() {
    this.helpdeskService.getDivisions().subscribe(data => this.divisions = data || []);
    
    this.helpdeskService.getIssueParts().subscribe({
      next: (data) => {
        this.existingIssueParts = data || [];
      },
      error: (err) => {
        console.error('API Error:', err);
        this.showToast('Failed to load existing issue parts from server.', 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 4000);
  }

  get filteredIssueParts() {
    if (!this.existingIssueParts) return [];
    
    return this.existingIssueParts.filter(part => {
      const pName = part.name || '';
      const pDiv = part.division_name || '';
      const searchStr = `${pName} ${pDiv}`.toLowerCase();
      const query = (this.searchQuery || '').toLowerCase();
      
      return searchStr.includes(query);
    });
  }

  get formSchema(): FormArray { return this.issuePartForm.get('form_schema') as FormArray; }

  newField(): FormGroup {
    return this.fb.group({
      label: ['', Validators.required],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]*$')]],
      type: ['text', Validators.required],
      required: [false],
      options: ['']
    });
  }

  addField() { this.formSchema.push(this.newField()); }
  removeField(index: number) { this.formSchema.removeAt(index); }

  // --- NEW MAGIC FUNCTION: Auto generates the DB key! ---
  autoGenerateKey(index: number) {
    const fieldControl = this.formSchema.at(index);
    const labelValue = fieldControl.get('label')?.value || '';
    
    // Converts "Account ID" to "account_id" automatically!
    const generatedKey = labelValue
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_') // Replace spaces & special chars with underscores
      .replace(/^_|_$/g, '');      // Remove leading/trailing underscores
      
    fieldControl.get('name')?.setValue(generatedKey);
  }

  openCreateForm() {
    this.isEditing = false;
    this.editingId = null;
    this.issuePartForm.reset({ requires_image: false, requires_audio: false });
    this.formSchema.clear();
    this.formSubmitted = false;
    this.activeTab = 'form'; 
  }

  editIssuePart(part: IssuePart) {
    this.activeTab = 'form';
    this.isEditing = true;
    this.editingId = part.id;
    this.formSchema.clear();
    this.formSubmitted = false;

    this.issuePartForm.patchValue({
      division: part.division,
      name: part.name,
      requires_image: part.requires_image || false,
      requires_audio: part.requires_audio || false
    });

    let schemaArray = part.form_schema;
    if (typeof schemaArray === 'string') {
      try { schemaArray = JSON.parse(schemaArray); } catch(e) { schemaArray = []; }
    }

    if (Array.isArray(schemaArray)) {
      schemaArray.forEach((field: any) => {
        const fieldGroup = this.newField();
        fieldGroup.patchValue({
          label: field.label || '', 
          name: field.name || '', 
          type: field.type || 'text',
          required: field.required || false, 
          options: field.options && Array.isArray(field.options) ? field.options.join(', ') : ''
        });
        this.formSchema.push(fieldGroup);
      });
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingId = null;
    this.issuePartForm.reset({ requires_image: false, requires_audio: false });
    this.formSchema.clear();
    this.formSubmitted = false;
    this.activeTab = 'list'; 
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.issuePartForm.invalid) { this.showToast("Please fill in all required fields.", 'error'); return; }
    if (this.formSchema.length === 0) { this.showToast("You must add at least one input field!", 'error'); return; }

    let formData = { ...this.issuePartForm.value };
    
    formData.form_schema = formData.form_schema.map((field: any) => {
      let formattedField = { ...field };
      if (field.type === 'select' && field.options) {
        formattedField.options = field.options.split(',').map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0);
      } else { 
        delete formattedField.options; 
      }
      return formattedField;
    });

    if (this.isEditing && this.editingId) {
      this.helpdeskService.updateIssuePart(this.editingId, formData).subscribe({
        next: () => {
          this.showToast('Schema updated successfully!', 'success');
          this.loadData();
          this.cancelEdit();
        },
        error: () => this.showToast('Error updating schema.', 'error')
      });
    } else {
      this.helpdeskService.createIssuePart(formData).subscribe({
        next: () => {
          this.showToast('Schema created successfully!', 'success');
          this.loadData();
          this.cancelEdit();
        },
        error: () => this.showToast('Error creating schema.', 'error')
      });
    }
  }
}