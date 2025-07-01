import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatetimeCustomEvent, IonContent } from '@ionic/angular';
import * as moment from 'moment';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { AdminService } from 'src/app/services/admin.service';
import { IProject } from '../projects.page';
import { TimeSheetService } from 'src/app/services/time-sheet.service';
import { ShareService } from 'src/app/services/share.service';
import { ActivatedRoute } from '@angular/router';

export interface IAssignPro {
  map(arg0: (item: any) => any): unknown;
  projectId: string,
  userId: string,
  startDate: string, 
  endDate: string,
  guid: string,
  project: {
    title: string;
    guid: string;
  },
  user: {
    firstName: string;
    lastName: string;
  }
}
@Component({
  selector: 'app-assign-project',
  templateUrl: './assign-project.page.html',
  styleUrls: ['./assign-project.page.scss'],
})
export class AssignProjectPage implements OnInit {
  isDataLoaded: boolean = true;
  assignProjectForm!: FormGroup;
  pageIndex:number = 0; 
  allEmployeeList: IEmployeeResponse[] = [];
  isInProgress:boolean = false;
  localDate!: Date;
  openCalendar: boolean = false;
  today: Date = new Date();
  projects: IProject[] = [];
  assProjects: IAssignPro[] = [];
  filterAssProjects:any =[];
  assProjectId: string = '';
  updateForm: boolean = false;
  @ViewChild(IonContent) content!: IonContent;
  userId: string = '';

    isFilterModalOpen: boolean = false;
  filterOptions: any = {
    running: false,
    expired: false,
    expiresIn1Day: false,
    expiresIn2Days: false,
    notStarted: false
  };
  activeFilters: string[] = [];
  filteredAssProjects: any[] = [];
   selectedProjectFilter: string = '';
  selectedEmployeeFilter: string = '';


  constructor(
    private _fb: FormBuilder,
    private adminServ: AdminService,
    private timesheetSer: TimeSheetService,
    private shareServ: ShareService,
    private activeRoute: ActivatedRoute,
  ) { 
    this.userId = localStorage.getItem('userId') || ''; 
    this.filteredAssProjects = this.filterAssProjects || [];
  }

  ngOnInit() {
    this.assignProjectForm = this._fb.group({
      projectId: ['', Validators.required],
      userId: ['', Validators.required],
      startDate: [new Date().toISOString() , Validators.required],
      endDate: [new Date().toISOString() , Validators.required],
    });
    this.getEmployeeList();
    this.getProjects();
    this.getAssignProjects();
    this.applyFilters();
  }

  getDate(ctrlName: string){
    const formDate = this.assignProjectForm.controls[ctrlName].value;
    return formDate != '' ? new Date(formDate).toISOString() : "";
  }

  selectDate(event: DatetimeCustomEvent){
    this.assignProjectForm.controls['startDate'].patchValue(moment(event.detail.value).utc().format());
  }

  getEndDate(ctrlName: string){
    const formDate = this.assignProjectForm.controls[ctrlName].value;
    return formDate != '' ? new Date(formDate).toISOString() : "";
  }

  markTouched(ctrlName: string) {
    this.assignProjectForm.controls[ctrlName].markAsTouched();
  }

  selectEndDate(event: DatetimeCustomEvent){
    this.assignProjectForm.controls['endDate'].patchValue(moment(event.detail.value).utc().format());
  }

  getEmployeeList(){
    this.isDataLoaded = false;
    if(this.pageIndex < 1){
      this.allEmployeeList = [];
    }
    this.adminServ.getEmployees('Active', this.pageIndex * 100, 100).subscribe(res => {
      if(res){

        const data: IEmployeeResponse[] = res;
        this.allEmployeeList = data;
        this.isDataLoaded = true;
      } 
    }, (error) => {
      this.isDataLoaded = true;
    });
  }

  getProjects() {
    this.isDataLoaded = false;
    if(this.pageIndex < 1) {
      this.projects = [];
    }
    this.timesheetSer.getAllProjects(this.pageIndex * 100, 100).subscribe(res => {
      if(res) {
        const data: IProject[] = res;
        this.projects = data;
        this.isDataLoaded = true; 
      }
    })
  }

  getAssignProjects() {
    this.timesheetSer.getAllAssignProjects(this.pageIndex * 100, 100).subscribe(res => {
      if(res) {
        const data: IAssignPro[] = res;
        this.assProjects = data;
        this.getFilteredAssignProjects()
      }
    })
  }

  getFilteredAssignProjects(){
    this.assProjects.forEach((project) => {
      const status = this.getProjectStatus(project.startDate, project.endDate);
      this.filterAssProjects.push({...project, status})
    })
    this.filteredAssProjects = [...this.filterAssProjects];
  }

  getProjectStatus(startDate: string, endDate: string):any {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      message: 'Invalid date(s) provided',
      status: 'danger'
    };
  }

  if (now < start) {
    return {
      message: 'Project has not started yet',
      status: 'tertiary'
    };
  }

  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (now > end) {
    return {
      message: 'Access expired',
      status: 'danger'
    };
  } else if (diffDays === 1) {
    return {
      message: 'Expires in 1 day',
      status: 'warning'
    };
  } else if (diffDays === 2) {
    return {
      message: 'Expires in 2 days',
      status: 'warning'
    };
  } else {
    return {
      message: `Running`,
      status: 'success'
    };
  }
}

  // getAssignProjectById() {
  //   this.timesheetSer.getAssignProjectById(this.userId).subscribe(res => {
  //     if(res) {
  //       const data: IAssignPro[] = res;
  //       this.assProjects = data;
  //     }
  //   })
  // }
  
  submit() {
    if(this.updateForm) {
      if(this.assProjectId.trim() == '') { return }
      this.timesheetSer.updateAssignProject(this.assProjectId, this.assignProjectForm.value).subscribe(res => {
        if(res) {
          this.shareServ.presentToast('Assign Project Updated successfully.', 'top', 'success');
          this.assignProjectForm.reset();
          this.updateForm = false;
          this.assProjectId = '';
          this.getAssignProjects();
          this.assignProjectForm.patchValue({
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString()
          })
        }
      });
    }
    else {
      this.timesheetSer.addAssignProject(this.assignProjectForm.value).subscribe(res => {
        if(res) {
          this.shareServ.presentToast('Assign Project successfully.', 'top', 'success');
          this.assignProjectForm.reset();
          this.getAssignProjects();
          this.assignProjectForm.patchValue({
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString()
          })
        }
      });
    }
  }

  update(assProject: IAssignPro) {
    this.assignProjectForm.patchValue(assProject);
    this.assProjectId = assProject.guid;
    this.updateForm = true;
    if(this.content) {
      this.content.scrollToTop(100);
    }
  }

  // Open filter modal
  openFilterModal(): void {
    this.isFilterModalOpen = true;
  }

  // Close filter modal
  closeFilterModal(): void {
    this.isFilterModalOpen = false;
  }

  // Handle filter change
  onFilterChange(): void {
    // Update active filters array for badge display
    this.updateActiveFilters();
  }

  // Update active filters array
  updateActiveFilters(): void {
    this.activeFilters = [];
    if (this.filterOptions.running) this.activeFilters.push('running');
    if (this.filterOptions.expired) this.activeFilters.push('expired');
    if (this.filterOptions.expiresIn1Day) this.activeFilters.push('expiresIn1Day');
    if (this.filterOptions.expiresIn2Days) this.activeFilters.push('expiresIn2Days');
    if (this.filterOptions.notStarted) this.activeFilters.push('notStarted');
    if (this.selectedProjectFilter) this.activeFilters.push('project');
    if (this.selectedEmployeeFilter) this.activeFilters.push('employee');
  }

  // Handle project filter change
  onProjectFilterChange(): void {
    this.updateActiveFilters();
  }

  // Handle employee filter change
  onEmployeeFilterChange(): void {
    this.updateActiveFilters();
  }

  // Apply filters to the project list
  applyFilters(): void {
    this.updateActiveFilters();
    
    let filtered = [...this.filterAssProjects];
    
    // Apply project filter
    if (this.selectedProjectFilter) {
      filtered = filtered.filter((project: any) => {
        return project.project.guid === this.selectedProjectFilter}
      );
    }
    
    // Apply employee filter
    if (this.selectedEmployeeFilter) {
      filtered = filtered.filter((project: any) => 
        project.user.guid === this.selectedEmployeeFilter
      );
    }
    
    // Apply status filters
    // Apply status filters
    if (this.hasStatusFilters()) {
      filtered = filtered.filter((project: any) => {
        const statusMessage = project.status.message.toLowerCase();
        
        return (
          (this.filterOptions.running && statusMessage.includes('running')) ||
          (this.filterOptions.expired && statusMessage.includes('expired')) ||
          (this.filterOptions.expiresIn1Day && statusMessage.includes('expires in 1 day')) ||
          (this.filterOptions.expiresIn2Days && statusMessage.includes('expires in 2 days')) ||
          (this.filterOptions.notStarted && statusMessage.includes('project has not started yet'))
        );
      });
    }

    this.filteredAssProjects = filtered;
    this.closeFilterModal();
  }
  
  // Check if project is currently running
  private isRunning(project: any, currentDate: Date): boolean {
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    return currentDate >= startDate && currentDate <= endDate;
  }
  
  // Check if any status filters are selected
  private hasStatusFilters(): boolean {
    return this.filterOptions.running || 
           this.filterOptions.expired || 
           this.filterOptions.expiresIn1Day || 
           this.filterOptions.expiresIn2Days || 
           this.filterOptions.notStarted;
  }

  // Clear all filters
  clearAllFilters() {
    this.filterOptions = {
      expired: false,
      pending: false,
      running: false
    };
    this.activeFilters = [];
    this.selectedProjectFilter = '';
    this.selectedEmployeeFilter = '';
    this.filteredAssProjects = [...this.filterAssProjects];
    this.closeFilterModal();
  }
  
}
