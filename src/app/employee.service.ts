import { computed, Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IndexedDbService } from './indexed-db.service';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
 _employees:any = signal<any[]>([]);
  constructor(private indexedDbService: IndexedDbService) {
    this.loadEmployees();
  }

  loadEmployees() {
    this.indexedDbService.getEmployees().subscribe({
      next: (employees) => {
        this._employees.set(employees)
      },
      error: (err) => {
        console.log('Error fetching employees:', err);
        this.indexedDbService.clearDatabase()
      }
    });
  }

  addEmployee(employee: any) {
      this.indexedDbService.addEmployee(employee).subscribe({
        next: () => {
          console.log('Employee added successfully');
          this.loadEmployees();
        },
        error: (err) => {
          console.log('Error adding employee:', err);
          this.indexedDbService.clearDatabase()
        },
        complete: () => {
          console.log('Employee addition complete');
        }
      }); 
  }

  updateEmployee(employee: any) {
    this.indexedDbService.updateEmployee(employee).subscribe(() => {
      this.loadEmployees();
    });
  }

  deleteEmployee(id: number) {
    this.indexedDbService.deleteEmployee(id).subscribe(() => {
      this.loadEmployees();
    });
  }

  formatDate(date: any): string {
    const dateString = date.toDateString();
    const day = dateString.substring(8, 10);
    const month = dateString.substring(4, 7);
    const year = dateString.substring(11, 15);
    return `${day} ${month}, ${year}`;
  }
}
