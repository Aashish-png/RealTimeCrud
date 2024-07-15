import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  constructor(private dbService: NgxIndexedDBService) {
  }
  clearDatabase() {
    this.dbService.deleteDatabase().subscribe({
      next: () => {
        console.log('Database deleted');
        window.location.reload(); // Reload the app to reinitialize the database in case of someone deleting it the index db 
      },
      error: (error) => {
        console.log('Error deleting database:', error);
      }
    });
  }

  addEmployee(employee: any): Observable<any> { //funciton to add in index db
    return this.dbService.add('employees', employee);
  }
 
  getEmployees(): Observable<any[]> {  // to get all data  
    return this.dbService.getAll('employees');
  }

  updateEmployee(employee: any): Observable<any> { //to update  the data 
    return this.dbService.update('employees', employee);
  }

  deleteEmployee(id: number): Observable<any> {  // to delete the data 
    return this.dbService.delete('employees', id);
  }
}
