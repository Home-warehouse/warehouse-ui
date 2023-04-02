import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
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
  SignUpForm: UntypedFormGroup;
  constructor(
    private fb: UntypedFormBuilder,
    private notifications: NotificationsSharedService,
    private hwAPI: hwAPI,
  ) {
    this.SignUpForm = this.fb.group({
      email: new UntypedFormControl('', [Validators.email, Validators.required]),
      firstName: new UntypedFormControl('', [Validators.required]),
      lastName: new UntypedFormControl(''),
      password: new UntypedFormControl('', [Validators.minLength(5), Validators.required])
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
