import { User } from '@/app/models/user.models';
import {
  updateUserAction
} from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { selectUser } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-tableusers',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, FormsModule],
  templateUrl: './tableusers.component.html',
  styleUrl: './tableusers.component.scss'
})
export class TableUsersComponent implements OnInit {

  displayedColumns = ['username', 'first_name', 'last_name', 'is_active', 'acciones'];
  dataSource = new MatTableDataSource<User>([]);
  editingId: string | null = null;
  editedUser: Partial<User> = {};

  constructor(private store: Store<AppState>, private cdRef: ChangeDetectorRef) { }

  ngOnInit() {

    this.store.select(selectUser).subscribe(usersState => {
      this.dataSource.data = usersState.users;
    });
  }

  onEditUser(user: User) {
    this.editingId = user.username;
    this.editedUser = { ...user };
  }

  onUpdateUser() {

    this.store.dispatch(updateUserAction({ user: this.editedUser }))
    this.editingId = null;

  }

  onCancelEdit() {
    this.editingId = null;
  }

  onToggle(user: User) {

  }

  onDeleteUser(user: User) {
    if (confirm(`¿Seguro que quieres eliminar a ${user.username}?`)) {

    }
  }
}
