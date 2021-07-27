import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { hwAPI } from 'src/common/api/api';
import { NotificationsSharedService } from '../notifications/notifications.sharedService';
import getFormAsDict from 'src/common/form';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  oldAccountData: any = {}
  AccountForm: FormGroup
  PasswordForm: FormGroup
  constructor(
    private fb: FormBuilder,
    private hwAPI: hwAPI,
    private notifications: NotificationsSharedService,
  ) {
    this.AccountForm = this.fb.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
    });
    this.PasswordForm = this.fb.group({
      oldPassword: new FormControl('', [ Validators.required]),
      password: new FormControl('', [Validators.minLength(5), Validators.required])
    })
  }

  getAccountData = async() =>{
      const response = await this.hwAPI.fetch({
        query: `
        query accDets {
          myAccount{
            email,
            firstName,
            lastName
          }
        }`
      })
      this.oldAccountData = response.data.data.myAccount
      Object.keys(this.oldAccountData).forEach((key)=>{
        this.AccountForm.controls[key].setValue(this.oldAccountData[key])
      })
  }

  onAccountDataUpdateSubmit = async()=>{
    let formDict = getFormAsDict(this.AccountForm)
    const response = await this.hwAPI.fetch({
      query: `mutation updateAcc($accountDetails: AccountInput!){
        modifyAccount(accountDetails: $accountDetails){
          modified
        }
      }`,
      variables: {
        accountDetails: formDict
      }
    })
    if(response.data.data.modifyAccount.modified){
      this.notifications.sendOpenNotificationEvent({
        message: `Updated account information successfully`,
         type: 'SUCCESS'
      });
    }
  }

  onPasswordDataUpdateSubmit = async() => {
    let formDict = getFormAsDict(this.PasswordForm)
    const response = await this.hwAPI.fetch({
      query: `mutation updateAcc($accountDetails: AccountInput!, $oldPwd: String!){
        modifyAccount(accountDetails: $accountDetails, oldPassword: $oldPwd){
          modified
        }
      }`,
      variables: {
        accountDetails: {password: formDict.password},
        oldPwd: formDict.oldPassword
      }
    })
    this.PasswordForm.reset();
    if(response.data.data.modifyAccount.modified){
      this.notifications.sendOpenNotificationEvent({
          message: `Updated password successfully`,
           type: 'SUCCESS'
        });
    } else {
      this.notifications.sendOpenNotificationEvent({
        message: `Couldnt update password`,
         type: 'ERROR'
      });
    }
  }

  ngOnInit(): void {
    this.getAccountData()
  }



}
