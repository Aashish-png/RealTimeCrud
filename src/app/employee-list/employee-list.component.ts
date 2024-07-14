import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { EmployeeService } from '../employee.service';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
})
export class EmployeeListComponent  implements OnInit , OnDestroy{
  displayedColumns: string[] = ['id', 'name', 'action'];
  @ViewChildren('card') cards!: QueryList<ElementRef>;
  @ViewChildren('cardPrev') cardPrev!: QueryList<ElementRef>;
  @ViewChildren('deletecard') deletecard!: QueryList<ElementRef>;
  @ViewChildren('deletecardPrev') deletecardPrev!: QueryList<ElementRef>;
  @ViewChildren('editIcon') editIcons!: QueryList<ElementRef>;
  @ViewChildren('editIconPrev') editIconPrev!: QueryList<ElementRef>;
  dataExist = false;
  employFrom = false;
  currentEmployee: any = [];
  previewsEMployee: any = [];
  allData: any = [];
  initialX: any;
  transformStyle: string = '';
  deleteIcon ='https://firebasestorage.googleapis.com/v0/b/engage-edge.appspot.com/o/Vector.png?alt=media&token=13b38083-4c58-4657-af1a-60251ccf8991';
  subscription:any;
  notifications=false;
  intervalId:any;
  editvisible=false
  desktopTab=false
  transformMap=new Map()

  constructor(
    public employeeService: EmployeeService,
    private dialog: MatDialog,
    private  snackBar:MatSnackBar
  ) {
    this.employeeService.loadEmployees();
    if (window.innerWidth > 1000) {
      this.desktopTab=true
    } else {
      this.desktopTab=false
    }
  }
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    if (window.innerWidth > 1000) {
      this.desktopTab=true
    } else {
      this.desktopTab=false
    }
  }


  ngOnInit(): void {
    this.subscription = this.employeeService.employeeDetails$.subscribe((rendered) => {
      this.allData = rendered;
      console.log("renderred ", this.allData)
      if(this.allData.length){
        this.dataExist=true
      }
      this.filteringData();
      console.log("called ")
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if(this.intervalId){
      clearInterval(this.intervalId)
      this.intervalId=null
    }
  }

  filteringData() {
    if(!this.allData.length)return
    this.currentEmployee = this.allData.filter(
      (obj: any) => !obj.endingDate || obj.endingDate == 'noDate'
    );
    console.log('this current employee', this.currentEmployee);
    this.previewsEMployee = this.allData.filter((obj: any) => obj.endingDate);
    console.log('this previews  employee', this.previewsEMployee);
  }

  onAdd() {
    this.dialog.open(EmployeeFormComponent, {
      // width: '80%',
      // maxHeight:'90%',
      width: '100%',
      maxHeight: '100vh',
      data: { employee: null },
      panelClass: 'custom-dialog-panel',
    });
  }

  onEdit(employee: any) {
    const dialogRef = this.dialog.open(EmployeeFormComponent, {
      width: '100%',
      maxHeight: '100vh',
      panelClass: 'custom-dialog-panel',
      data: { employee },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
            const id=result.id 
            const arr=result.endingDate?this.previewsEMployee:this.currentEmployee 
            this.onDelete(id, false, arr)
      } 
    });
  
  }

  onDelete(id: number|null=null , clearinterval:boolean=false  , arr:any=null) {
    if(clearinterval){     ///when i need to undo the operations 
      if(this.intervalId)clearInterval(this.intervalId)
        this.intervalId=null
        this.notifications=false;
        this.filteringData()
        return
    }

    if(id && this.intervalId){

      let message='Please wait before deleting again.'
      this.snackBar.open(message, '', {
        duration: 2000,
      });
      return
    }

    this.notifications=true

    if(id)this.findAndDeleteById(arr, id)

    this.intervalId= setTimeout(()=>{
      this.notifications=false
       if(id)this.employeeService.deleteEmployee(id);
      if(this.intervalId) clearInterval(this.intervalId)
        this.intervalId=null
     },3000)


    
  }
   findAndDeleteById(arr:any, id:number) {
    const index = arr.findIndex((item:any) => item.id === id);
    if (index !== -1) {
        const deletedItem = arr.splice(index, 1)[0];
        return { deletedItem, index };
    }
    return null; 
}

  // ====================

  onTouchStart(event: TouchEvent, id: any, pre: any = false) {
    this.initialX = event.touches[0].clientX;
  }

  onTouchMove(event: TouchEvent, id: any, pre: any = false){
    if(this.desktopTab) return
    if (this.initialX === null) {
      return;
    }

    let back=false

    const currentX = event.touches[0].clientX;
    const diffX = this.initialX - currentX;
    
    if (diffX > 0) {// Sliding to the  left

      let transformStyle=this.transformMap.get(id)  //for the first time undefine then it will be false 

      if(transformStyle=='translateX(89px)'){
        this.editvisible=true
        this.transformStyle = `translateX(0)`;

        this.transformMap.set(id, this.transformStyle)
         back=true

      }else{
        this.editvisible=false
        this.transformStyle='translateX(-89px)';
        this.transformMap.set(id, this.transformStyle)
      }
      
    }else  if (diffX < 0) {   ///sliding back to normal 
      let transformStyle=this.transformMap.get(id) 
      if(transformStyle=='translateX(-89px)'){
        this.transformStyle = `translateX(0)`;

        this.transformMap.set(id, this.transformStyle)
        back=true
      } else{
        this.editvisible=true
        this.transformStyle='translateX(89px)'
        this.transformMap.set(id, this.transformStyle)
        
      }
    
    }


    if(this.editvisible){// this is edit section 
     
      if (pre) {//for old emplyesss in edit section 
        let index = id.split('_');
        index = index[0];
        console.log('index of prev ', index);
        this.cardPrev.forEach((cardPrev, idx) => {
          if (idx == index) {
            cardPrev.nativeElement.style.transform = this.transformStyle;
          }
        });
  
        // this.deletecardPrev.forEach((card, idx) => {
        //   if (idx == index) {
        //     card.nativeElement.style.zIndex = '22';
        //   }
        // });
        if(this.editvisible){ ///when  slide right for edit 
          this.editIconPrev.forEach((card, idx) => {
            if (idx == index) {
              card.nativeElement.style.zIndex = '22';
            }
          });
  
        }
        
  
        if(back){//when get back from 
          back=false
          this.deletecardPrev.forEach((card, idx) => {
            if (idx == index) {
              card.nativeElement.style.zIndex = '-1';
            }
          });
  
          if(this.editvisible){ ///when  slide right for edit 
            this.editvisible=false
            this.editIconPrev.forEach((card, idx) => {
              if (idx == index) {
                card.nativeElement.style.zIndex = '-1';
              }
            });
    
          }
        }
  
  
      } else {  //for current employess    in edit section 
        const index = id;
        this.cards.forEach((card, idx) => {
          if (idx === index) {
            card.nativeElement.style.transform = this.transformStyle;
          }
        });
        
        // this.deletecard.forEach((card, idx) => {
        //   if (idx === index) {
        //     card.nativeElement.style.zIndex = '22';
        //   }
        // });
  
        if(this.editvisible){ ///when  slide right for the edit
          // this.editvisible=false;
          this.editIcons.forEach((card, idx) => {
            if (idx == index) {
              card.nativeElement.style.zIndex = '22';
            }
          });
  
        }
  
  
        if(back){
          back=false
          // this.deletecard.forEach((card, idx) => {
          //   if (idx === index) {
          //     card.nativeElement.style.zIndex = '-1';
          //   }
          // });
  
          if(this.editvisible){ ///when  slide right for edit 
            this.editvisible=false
            this.editIcons.forEach((card, idx) => {
              if (idx == index) {
                card.nativeElement.style.zIndex = '-1';
              }
            });
    
          }
  
  
        }
      }
//========================================================================================================delete section =====================
    }else{// this is delete sections 
      if (pre) {//for old emplyesss 
        let index = id.split('_');
        index = index[0];
        console.log('index of prev ', index);
        this.cardPrev.forEach((cardPrev, idx) => {
          if (idx == index) {
            cardPrev.nativeElement.style.transform = this.transformStyle;
          }
        });
  
        this.deletecardPrev.forEach((card, idx) => {
          if (idx == index) {
            card.nativeElement.style.zIndex = '22';
          }
        });
        if(this.editvisible){ ///when  slide right for edit 
          this.editIcons.forEach((card, idx) => {
            if (idx == index) {
              card.nativeElement.style.zIndex = '22';
            }
          });
  
        }
        
  
        if(back){//when get back from 
          back=false
          this.deletecardPrev.forEach((card, idx) => {
            if (idx == index) {
              card.nativeElement.style.zIndex = '-1';
            }
          });
  
          if(this.editvisible){ ///when  slide right for edit 
            this.editvisible=false
            this.editIcons.forEach((card, idx) => {
              if (idx == index) {
                card.nativeElement.style.zIndex = '-1';
              }
            });
    
          }
        }
  
  
      } else {  //for current employess 
        const index = id;
        this.cards.forEach((card, idx) => {
          if (idx === index) {
            card.nativeElement.style.transform = this.transformStyle;
          }
        });
        
        this.deletecard.forEach((card, idx) => {
          if (idx === index) {
            card.nativeElement.style.zIndex = '22';
          }
        });
  
        // if(this.editvisible){ ///when  slide right for edit 
        //   this.editIcons.forEach((card, idx) => {
        //     if (idx == index) {
        //       card.nativeElement.style.zIndex = '-1';
        //     }
        //   });
  
        // }
  
  
        if(back){
          back=false
          this.deletecard.forEach((card, idx) => {
            if (idx === index) {
              card.nativeElement.style.zIndex = '-1';
            }
          });
  
          // if(this.editvisible){ ///when  slide right for edit 
          //   this.editvisible=false
          //   this.editIcons.forEach((card, idx) => {
          //     if (idx == index) {
          //       card.nativeElement.style.zIndex = '22';
          //     }
          //   });
    
          // }
  
  
        }
      }

    }






  
    this.initialX = null;
  }

  
}
