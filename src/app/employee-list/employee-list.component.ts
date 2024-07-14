import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { EmployeeService } from '../employee.service';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
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

  constructor(
    public employeeService: EmployeeService,
    private dialog: MatDialog
  ) {
    this.employeeService.loadEmployees();
    setTimeout(() => {
      console.log('=========>', this.employeeService.employees);
      if (employeeService.employees) {
        this.dataExist = true;
        this.allData = employeeService.employees;

        this.filteringData();
      }
    }, 2000);

  }


  ngOnInit(): void {
    this.subscription = this.employeeService.employeeDetails$.subscribe((rendered) => {
      this.allData = rendered;
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
    }
  }

  filteringData() {
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
      backdropClass: 'custom-dialog-backdrop',
    });
  }

  onEdit(employee: any) {
    this.dialog.open(EmployeeFormComponent, {
      width: '100%',
      maxHeight: '100vh',
      panelClass: 'custom-dialog-panel',
      backdropClass: 'custom-dialog-backdrop',
      data: { employee },
    });
  }

  onDelete(id: number|null=null , clearinterval:boolean=false  , arr:any=null) {
    if(clearinterval){     ///when i need to undo the operations 
      if(this.intervalId)clearInterval(this.intervalId)
        this.notifications=false;
        this.filteringData()
        return
    }
    this.notifications=true

    if(id)this.findAndDeleteById(arr, id)

    this.intervalId= setTimeout(()=>{
      this.notifications=false
       if(id)this.employeeService.deleteEmployee(id);
      if(this.intervalId) clearInterval(this.intervalId)
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
    console.log('Evenet  move  ', event, this.initialX);
    if (this.initialX === null) {
      return;
    }

    let back=false

    const currentX = event.touches[0].clientX;
    const diffX = this.initialX - currentX;
    
    if (diffX > 0) {// Sliding to the  left

      if(this.transformStyle=='translateX(89px)'){
        this.editvisible=true
        this.transformStyle = `translateX(0)`;
         back=true

      }else{
        this.editvisible=false
        this.transformStyle='translateX(-89px)';
      }
      
    }else  if (diffX < 0) {   ///sliding back to normal 

      if(this.transformStyle=='translateX(-89px)'){
        this.transformStyle = `translateX(0)`;
        back=true
      } else{
        this.editvisible=true
        this.transformStyle='translateX(89px)'
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



  onTouchMove2(event: TouchEvent, id: any, pre: any = false){
    console.log('Evenet  move  ', event, this.initialX);
    if (this.initialX === null) {
      return;
    }

    let back=false

    const currentX = event.touches[0].clientX;
    const diffX = currentX-this.initialX 

    
    if (diffX > 0) {// Sliding to the  left
      this.transformStyle = `translateX(-89px)`;
    }
    if (diffX < 0) {   ///sliding back to normal 
      this.transformStyle = `translateX(0)`;
      back=true
    }

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

      if(back){
        back=false
        this.deletecardPrev.forEach((card, idx) => {
          if (idx == index) {
            card.nativeElement.style.zIndex = '-1';
          }
        });
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

      if(back){
        back=false
        this.deletecard.forEach((card, idx) => {
          if (idx === index) {
            card.nativeElement.style.zIndex = '-1';
          }
        });
      }
    }
    this.initialX = null;
  }



  
}
