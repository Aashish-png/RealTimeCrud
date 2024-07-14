import {  Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmployeeService } from '../employee.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent  {
  employee: any;
  positionOfEmp:any='Select role'
  allPositions=[ 'Product Designer' ,'Flutter Developer' , 'QA Tester' ,'Product Owner']
  dropdownOpen=false;
  endingDate='NoDate'
  datePickerOpen=false
  joiningDate='Today'
  noDate=false;
  isEditForm=false

  constructor(
    private dialogRef: MatDialogRef<EmployeeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private employeeService: EmployeeService,
    private snackBar:MatSnackBar
  ) {
    this.employee = data.employee ? { ...data.employee } :null;
    if(this.employee){
      this.isEditForm=true
        this.joiningDate= this.employee.joiningDate
        this.positionOfEmp=this.employee.role
        if(this.employee.endingDate){
          this.endingDate=this.employee.endingDate
        }
    }else{
         this.employee={joiningDate: new Date()}
    }

  }

  onSave() {
  if(this.employee &&  !this.employee.name || !this.employee.role ){
    let message='Please fill in all the fields.'
    this.snackBar.open(message, '', {
      duration: 2000,
    });
    return    // early returning if there is filed missing 
  }
  
    console.log("employee details ", this.employee  , this.joiningDate)
    if(this.joiningDate=='Today'){
      this.employee['joiningDate']= this.employeeService.formatDate(this.employee.joiningDate)
    }else{
      this.employee['joiningDate']=this.joiningDate
    }
    if (this.employee.id) {
      this.employeeService.updateEmployee(this.employee);
    } else {
      this.employeeService.addEmployee(this.employee);
    }
    this.dialogRef.close();
  }
  onCancel(){
    this.dialogRef.close();
  }

  DeleteEditDataFromHeader(){
    this.dialogRef.close( {...this.data.employee});
  }


  openDropdown(close:any=null){
    if(!close) this.dropdownOpen=!this.dropdownOpen
    else {
      this.dropdownOpen=false
      this.datePickerOpen=false
    }

  }
  selecteValue(role:any){
    this.positionOfEmp=role
    this.employee['role']=this.positionOfEmp
    this.dropdownOpen=false
  }

  onDatepickerOpen(joining:boolean=true) {
    this.datePickerOpen=true;
    if(joining){
      this.noDate=false
    }else{
      this.noDate=true
    }
   
  }

  closeDatePicker(event:any){  /// this is on cancel 
    if(!event){
      this.datePickerOpen=false
    }
  }

  onDateSelected(date: Date): void {
    if(this.noDate ){
      const formatedDate= this.employeeService.formatDate(date)
      if(this.joiningDate=='Today'){
        this.joiningDate=  this.employeeService.formatDate(new Date())
      }
     let less=   this.compareDates(this.joiningDate, formatedDate)  // joinning date can not be greater then ending date 
     if(!less){
      let message='! SORRY,  the joining date cannot be later than the ending date. Please check your dates and try again.'
      this.snackBar.open(message, '', {
        duration: 5000,
      });
      return
     }
    this.endingDate=formatedDate
    this.employee['endingDate']=this.endingDate
    }else{
      this.joiningDate= this.employeeService.formatDate(date)
      this.employee['joiningDate']=this.joiningDate
    }
  
    this.datePickerOpen=false;
  }  
  compareDates(joining:any, ending:any) {
    const dateObj1 = new Date(joining);
    const dateObj2 = new Date(ending);
    if (dateObj1 > dateObj2) {
      return   false
    } else if (dateObj1 < dateObj2) {
      return true
    } else {
      return false
    }
  }
}
