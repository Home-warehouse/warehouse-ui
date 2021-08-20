import { Component, OnInit } from '@angular/core';
import { User, UsersService } from '../users.service';

@Component({
  selector: 'app-user-managing',
  templateUrl: './user-managing.component.html',
  styleUrls: ['./user-managing.component.scss']
})
export class UserManagingComponent implements OnInit {
  creatingUser = false
  constructor(
    public usersService: UsersService
  ) {}

  getUserProperties = (user: any) => {
    return Object.keys(user).map((key:string)=>{
      return {name: key, value: user[key]}
    })
  }

  initialQuery = async() => {
    const result = await this.usersService.queryUsersList()
    this.usersService.usersList = result.data.data.accountsList.edges
  }

  ngOnInit(): void {
    this.initialQuery()
  }


}
