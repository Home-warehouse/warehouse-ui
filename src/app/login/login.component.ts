import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { hwAPI } from 'src/common/api/api';
import { NotificationsSharedService } from '../notifications/notifications.sharedService';
import { Router } from "@angular/router"
import getFormAsDict from 'src/common/form';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  SignUpForm: FormGroup;
  SignInForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private notifications: NotificationsSharedService,
    private hwAPI: hwAPI,
  ) {
    this.SignUpForm = this.fb.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl(''),
      password: new FormControl('', [Validators.minLength(5), Validators.required])
    });
    this.SignInForm = this.fb.group({
      email: new FormControl('', Validators.email),
      password: new FormControl('', Validators.required)
    });
  }

  onSignUpSubmit = async () => {
    let formDict = getFormAsDict(this.SignUpForm)
    const response = await this.hwAPI.fetch({
      query: `mutation createAccount($email: String, $password: String){
        createAccount(accountDetails: {email: $email, password: $password}){
          created
        }
      }`,
      variables: formDict
    })
    if(response.data.data.createAccount.created){
      this.notifications.sendOpenNotificationEvent({
        message: `Registered successfully - now you can login`,
         type: 'SUCCESS'
      });
    } else {
      this.notifications.sendOpenNotificationEvent({
        message: `Could not register, try again or ask administrator for further help`,
         type: 'ERROR'
      });
    }
  }

  onSignInSubmit = async () => {
    let formDict = getFormAsDict(this.SignInForm)
    const response = await this.hwAPI.fetch({
      query: `query login($email: String, $password: String){
        login(email: $email, password: $password){
          authenticated,
          accessToken
        }
      }`,
      variables: formDict
    })
    if(response.data){
      const accessToken = response.data.data.login.accessToken
      if (accessToken){
        localStorage.setItem("accessToken", accessToken)
        this.router.navigate(['/dashboard'])
      } else {
        this.notifications.sendOpenNotificationEvent({
          message: `Could not login - check if you used correct credentials`,
           type: 'ERROR'
        });
      }
    }
    }

  ngOnInit(): void {

  }

}
