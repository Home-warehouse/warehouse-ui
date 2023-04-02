import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { hwAPI } from 'src/common/api/api';
import { NotificationsSharedService } from '../notifications/notifications.sharedService';
import getFormAsDict from 'src/common/form';

interface account {
  email: string
  firstName: string
  lastName?: string
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  oldAccountData: account = {
    email: "",
    firstName: ""

  }
  AccountForm: UntypedFormGroup
  PasswordForm: UntypedFormGroup
  constructor(
    private fb: UntypedFormBuilder,
    private hwAPI: hwAPI,
    private notifications: NotificationsSharedService,
  ) {
    this.AccountForm = this.fb.group({
      email: new UntypedFormControl('', [Validators.email, Validators.required]),
      firstName: new UntypedFormControl(''),
      lastName: new UntypedFormControl(''),
    });
    this.PasswordForm = this.fb.group({
      oldPassword: new UntypedFormControl('', [ Validators.required]),
      password: new UntypedFormControl('', [Validators.minLength(5), Validators.required])
    })
  }


  typedKeys<T>(o: T): (keyof T)[] {
    return Object.keys(o) as (keyof T)[];
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
      this.typedKeys(this.oldAccountData).forEach((key)=>{
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
      this.oldAccountData.firstName = formDict.firstName
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
        message: `Couldnt update password - try again or ask administrator for further help`,
         type: 'ERROR'
      });
    }
  }

  ngOnInit(): void {
    this.getAccountData()
  }



}
