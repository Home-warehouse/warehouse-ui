import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { hwAPI } from 'src/common/api/api';
import { NotificationsSharedService } from '../../notifications/notifications.sharedService';
import { Router } from "@angular/router"
import getFormAsDict from 'src/common/form';


@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  @Output() hideModal = new EventEmitter()
  SignUpForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private notifications: NotificationsSharedService,
    private hwAPI: hwAPI,
  ) {
    this.SignUpForm = this.fb.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl(''),
      password: new FormControl('', [Validators.minLength(5), Validators.required])
    });
  }

  onSignUpSubmit = async () => {
    let formDict = getFormAsDict(this.SignUpForm)
    const response = await this.hwAPI.fetch({
      query: `mutation createAccount($accountDetails: CreatingAccountInput!){
        createAccount(accountDetails: $accountDetails){
          created
        }
      }`,
      variables: {accountDetails: formDict}
    })
    if(response.data.data.createAccount.created){
      this.notifications.sendOpenNotificationEvent({
        message: `Account created successfully.`,
         type: 'SUCCESS'
      });
    } else {
      this.notifications.sendOpenNotificationEvent({
        message: `Could not register, try again.`,
         type: 'ERROR'
      });
    }
    this.hideModal.emit()
  }
  ngOnInit(): void {
  }

}
