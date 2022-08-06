import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { hwAPI } from 'src/common/api/api';
import { NotificationsSharedService } from '../notifications/notifications.sharedService';
import { Router } from "@angular/router"
import getFormAsDict from 'src/common/form';

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss']
})
export class ActivateAccountComponent implements OnInit {
  AccountForm: FormGroup
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private hwAPI: hwAPI,
    private notifications: NotificationsSharedService,
  ) {
    this.AccountForm = this.fb.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      oldPassword: new FormControl('', [ Validators.required]),
      password: new FormControl('', [Validators.minLength(5), Validators.required])
    })
  }

  onAccountDataUpdateSubmit = async()=>{
    let formDict = getFormAsDict(this.AccountForm)
    const {oldPassword, ...parsedFormDict} = formDict
    const response = await this.hwAPI.fetch({
      query: `mutation updateAcc($accountDetails: AccountInput!, $oldPwd: String!){
        modifyAccount(accountDetails: $accountDetails, oldPassword: $oldPwd){
          modified
        }
      }`,
      variables: {
        oldPwd: formDict.oldPassword,
        accountDetails: parsedFormDict
      }
    })
    if(response.data.data.modifyAccount.modified){
      this.notifications.sendOpenNotificationEvent({
        message: `Updated account information successfully`,
         type: 'SUCCESS'
      });
      this.router.navigate(['/dashboard'])
    } else {
      this.notifications.sendOpenNotificationEvent({
        message: `Could not update account information`,
        type: 'ERROR'
      });
    }
  }

  ngOnInit(): void {}
}

