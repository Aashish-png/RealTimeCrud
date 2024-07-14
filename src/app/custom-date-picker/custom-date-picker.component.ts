
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EmployeeService } from '../employee.service';

@Component({
  selector: 'app-custom-date-picker',
  templateUrl: './custom-date-picker.component.html',
  styleUrls: ['./custom-date-picker.component.css']
})
export class CustomDatePickerComponent {
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() datePickerClose = new EventEmitter<boolean>();
  _noDate=false
  currentMonth: number;
  currentYear: number;
  days: any[];
  currentMonthYear:any=[]
  userSelectedcurrentMonthYear:string=''
  lastSelectedDate:any;
  monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  dayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  selectedBox=''

  constructor(public employeeService:EmployeeService) {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.days = this.generateDays(this.currentYear, this.currentMonth);
    this.selectDate(this.getTodayDate())
    this.currentMonthYear.push(this.monthNames[this.currentMonth])
    this.currentMonthYear.push(this.currentYear)
    this.userSelectedcurrentMonthYear=this.monthNames[this.currentMonth]+" "+ this.currentYear

    
  }


  @Input()
  set noDate(value: boolean) {
    this._noDate = value;
    if(this._noDate){
      this.selectedBox='No date'
    }else{
       this.selectedBox='Today'
    }
  }
  getTodayDate(): number {
    const today = new Date();
    return today.getDate();
  }
  generateDays(year: number, month: number): any[] {
    const date = new Date(year, month, 1);
    const days = [];

    // Filling  the days array with the correct number of blank days
    // for the days before the start of the month
    const firstDayIndex = date.getDay();
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Filling  the days array with the correct number of days for the month
    while (date.getMonth() === month) {
      days.push(date.getDate());
      date.setDate(date.getDate() + 1);
    }

    return days;
  }

  selectDate(day: number): void {
    console.log("log selcte date ", this.lastSelectedDate)
    if (day !== null) {
      this.lastSelectedDate = new Date(this.currentYear, this.currentMonth, day);
      // this.dateSelected.emit(this.lastSelectedDate);
    }
  }
  closeDatePicker(save:boolean =false){
    if(save){  

      console.log("joinning date", )
      this.dateSelected.emit(this.lastSelectedDate);
    }else{
      this.datePickerClose.emit(false);
    }

  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.days = this.generateDays(this.currentYear, this.currentMonth);
    this.userSelectedcurrentMonthYear=this.monthNames[this.currentMonth]+" "+ this.currentYear
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.days = this.generateDays(this.currentYear, this.currentMonth);

    this.monthNames[this.currentMonth]+this.currentYear
    this.userSelectedcurrentMonthYear=this.monthNames[this.currentMonth]+" "+ this.currentYear
  }


  selectFromBox(key:string){
    const checkcurrentMonthYear= this.monthNames[this.currentMonth]+this.currentYear   
    const checkwithStore= this.currentMonthYear[0]+this.currentMonthYear[1]
    if(checkcurrentMonthYear!=checkwithStore){
      let Currntindex= this.monthNames.findIndex((el)=>this.currentMonthYear[0]==el)
      while(Currntindex!=this.currentMonth){
        if(this.currentMonth >Currntindex){
          this.previousMonth()
        }else{
          this.nextMonth()
        }
      }
    }
    this.selectedBox=key
    if(key=='Today'){
     console.log("==>",this.currentMonthYear)
      
      this.selectDate(this.getTodayDate())
    }
    if(key=='Next Monday'){
      const day=this.getNextMonday()
      this.selectDate(day)

    } 
    if(key=='Next Tuesday'){
      const day=this.getNextTuesday()
      this.selectDate(day)
    }
    if(key=='After 1 week'){
      const day=this.getDateAfterOneWeek()
      this.selectDate(day)
    }
    
    if(key=='No date'){
        
    }


  }

 getNextMonday(): number {
  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
  return  nextMonday.getDate()
}

 getNextTuesday():number {
  const today = new Date();
  const nextTuesday = new Date(today);
  nextTuesday.setDate(today.getDate() + ((2 + 7 - today.getDay()) % 7 || 7));
  return   nextTuesday.getDate()
}

 getDateAfterOneWeek():number {
  const today = new Date();
  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);
  return  oneWeekLater.getDate()
}
  
}
