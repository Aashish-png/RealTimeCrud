import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  constructor(private dbService: NgxIndexedDBService) {


  //  this.clearDatabase()
  }
  clearDatabase() {
    this.dbService.deleteDatabase().subscribe({
      next: () => {
        console.log('Database deleted');
        window.location.reload(); // Reload the app to reinitialize the database
      },
      error: (error) => {
        console.error('Error deleting database:', error);
      }
    });
  }

  addEmployee(employee: any): Observable<any> {
    return this.dbService.add('employees', employee);
  }

  getEmployees(): Observable<any[]> {
    return this.dbService.getAll('employees');
  }

  updateEmployee(employee: any): Observable<any> {
    return this.dbService.update('employees', employee);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.dbService.delete('employees', id);
  }
}
