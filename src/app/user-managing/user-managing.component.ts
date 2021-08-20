import { Component, OnInit } from '@angular/core';
import { NotificationsSharedService } from '../notifications/notifications.sharedService';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-user-managing',
  templateUrl: './user-managing.component.html',
  styleUrls: ['./user-managing.component.scss']
})
export class UserManagingComponent implements OnInit {
  creatingUser = false
  constructor(
    public usersService: UsersService,
    private notifications: NotificationsSharedService,
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

  deleteUser = async(id: string)=>{
    const result = await this.usersService.deleteUser(id)
    if(result.data.data.deleteAccount.deleted){
      this.notifications.sendOpenNotificationEvent({
        message: `Account deleted successfully.`,
         type: 'SUCCESS'
      });
    } else {
      this.notifications.sendOpenNotificationEvent({
        message: `Could not delete account, try again.`,
         type: 'ERROR'
      });
    }
  }

  ngOnInit(): void {
    this.initialQuery()
  }


}
