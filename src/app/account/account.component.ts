import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { apiFetch } from 'src/common/api/api';
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
  constructor(
    private fb: FormBuilder,
    private notifications: NotificationsSharedService,
  ) {
    this.AccountForm = this.fb.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      oldPassword: new FormControl(''),
      newPassword: new FormControl('', [Validators.minLength(5)])
    });
  }

  getAccountData = async() =>{
      const response = await apiFetch({
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
        // console.log(key, valuesToBeSet[key])
      })
  }

  onAccountDataUpdateSubmit = async()=>{

  }

  ngOnInit(): void {
    this.getAccountData()
  }



}
