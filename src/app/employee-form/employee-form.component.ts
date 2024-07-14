import {  Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmployeeService } from '../employee.service';


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
  noDate=false

  constructor(
    private dialogRef: MatDialogRef<EmployeeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private employeeService: EmployeeService,
  ) {
    this.employee = data.employee ? { ...data.employee } :null;

    console.log("=====> checing", this.employee)
    if(this.employee){
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

  //  if(this.employee && !this.employee.endingDate){
  //   this.employee.endingDate='noDate'
  //  } 

    console.log("employee details ", this.employee  , this.joiningDate)
    if(this.joiningDate=='Today'){
      this.employee['joiningDate']= this.employeeService.formatDate(this.employee.joiningDate)
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

  closeDatePicker(event:any){
    if(!event){
      this.datePickerOpen=false
    }

    
  }

  onDateSelected(date: Date): void {
    // this.selectedDate = date;
    console.log("date ==>", date)
    if(this.noDate ){

    this.endingDate=this.employeeService.formatDate(date)
    this.employee['endingDate']=this.endingDate

    }else{
      this.joiningDate= this.employeeService.formatDate(date)
      this.employee['joiningDate']=this.joiningDate
    }
  
    this.datePickerOpen=false;
  }  
}
