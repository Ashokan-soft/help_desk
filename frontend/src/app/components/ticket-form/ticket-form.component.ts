import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelpdeskService } from '../../services/helpdesk.service';
import { Division, IssuePart, FormSchemaField } from '../../models/helpdesk.models';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss'] 
})
export class TicketFormComponent implements OnInit, OnDestroy {
  divisions: Division[] = [];
  issueParts: IssuePart[] = [];
  
  currentSchema: FormSchemaField[] = [];
  dynamicForm!: FormGroup;

  selectedDivisionId: number | null = null;
  selectedIssuePartId: number | null = null;
  selectedIssuePartObj: IssuePart | null = null; 

  // File Uploads & Recording
  screenshotFile: File | null = null;
  audioFile: File | null = null;
  
  // Audio Recording State Variables
  mediaRecorder: any;
  mediaStream: MediaStream | null = null; // NEW: Save the stream so we can kill it
  audioChunks: any[] = [];
  isRecording = false;
  audioUrl: string | null = null;

  isSubmitting = false;

  constructor(
    private helpdeskService: HelpdeskService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef // NEW: Forces Angular to update the UI instantly
  ) {}

  ngOnInit(): void {
    this.dynamicForm = this.fb.group({});
    this.helpdeskService.getDivisions().subscribe({
      next: (data) => this.divisions = data,
      error: (err) => console.error('Failed to load divisions', err)
    });
  }

  ngOnDestroy(): void {
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
    this.killMicrophone(); // Ensure mic turns off if they navigate away while recording
  }

  onDivisionChange(event: any): void {
    this.selectedDivisionId = event.target.value;
    this.issueParts = [];
    this.currentSchema = [];
    this.selectedIssuePartObj = null;
    this.dynamicForm = this.fb.group({}); 
    
    if (this.selectedDivisionId) {
      this.helpdeskService.getIssueParts(this.selectedDivisionId).subscribe(data => {
        this.issueParts = data;
      });
    }
  }

  onIssuePartChange(event: any): void {
    this.selectedIssuePartId = event.target.value;
    const selectedPart = this.issueParts.find(p => p.id == this.selectedIssuePartId);
    
    if (selectedPart) {
      this.selectedIssuePartObj = selectedPart; 
      this.currentSchema = selectedPart.form_schema || [];
      this.buildForm(this.currentSchema);
    } else {
      this.selectedIssuePartObj = null;
      this.currentSchema = [];
      this.dynamicForm = this.fb.group({});
    }
  }

  buildForm(schema: FormSchemaField[]): void {
    const group: any = {};
    schema.forEach(field => {
      const validators = field.required ? [Validators.required] : [];
      group[field.name] = ['', validators];
    });
    this.dynamicForm = this.fb.group(group);
  }

  onFileChange(event: any, fileType: 'image' | 'audio'): void {
    const file = event.target.files[0];
    if (file) {
      if (fileType === 'image') this.screenshotFile = file;
      if (fileType === 'audio') {
        this.audioFile = file;
        this.audioUrl = null; 
      }
    }
  }

  // --- LIVE AUDIO RECORDING LOGIC ---
  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.isRecording = true;
      this.mediaStream = stream; // Save the stream globally
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioUrl = URL.createObjectURL(audioBlob);
        
        // Convert to File object so Django accepts it
        this.audioFile = new File([audioBlob], "voice_note.webm", { type: 'audio/webm' });

        // MAGIC FIX 1: Tell Angular to update the HTML instantly!
        this.cdr.detectChanges(); 
      };

      this.mediaRecorder.start();
    }).catch(err => {
      console.error('Microphone access denied', err);
      alert('Could not access microphone. Please check your browser permissions.');
    });
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop(); // This triggers onstop above
      this.isRecording = false;
      
      // MAGIC FIX 2: Kill the microphone hardware instantly
      this.killMicrophone();
    }
  }

  killMicrophone() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  clearAudio() {
    this.killMicrophone();
    this.audioFile = null;
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }
    this.audioChunks = [];
  }

  // --- SUBMIT TICKET ---
  onSubmit(): void {
    if (this.dynamicForm.invalid || !this.selectedIssuePartId) {
      alert("Please ensure all required fields are filled out.");
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('issue_part', this.selectedIssuePartId.toString());
    formData.append('dynamic_data', JSON.stringify(this.dynamicForm.value));

    if (this.screenshotFile && this.selectedIssuePartObj?.requires_image) {
      formData.append('screenshot', this.screenshotFile);
    }
    
    // Append the audio file (whether recorded live or uploaded manually)
    if (this.audioFile && this.selectedIssuePartObj?.requires_audio) {
      formData.append('audio_record', this.audioFile);
    }

    this.helpdeskService.submitTicket(formData).subscribe({
      next: (res) => {
        alert('Ticket submitted successfully! 🚀 Your Ticket ID is: #' + res.id);
        this.dynamicForm.reset();
        this.screenshotFile = null;
        this.clearAudio(); 
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        alert('There was an error submitting your ticket. Please try again.');
        this.isSubmitting = false;
      }
    });
  }
}