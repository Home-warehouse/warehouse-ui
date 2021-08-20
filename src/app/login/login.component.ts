import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { hwAPI } from 'src/common/api/api';
import { NotificationsSharedService } from '../notifications/notifications.sharedService';
import { Router } from "@angular/router"
import jwtDecode from 'jwt-decode';
import getFormAsDict from 'src/common/form';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  SignInForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private notifications: NotificationsSharedService,
    private hwAPI: hwAPI,
  ) {
    this.SignInForm = this.fb.group({
      email: new FormControl('', Validators.email),
      password: new FormControl('', Validators.required)
    });
  }

  onSignInSubmit = async () => {
    let formDict = getFormAsDict(this.SignInForm)
    const response = await this.hwAPI.fetch({
      query: `query login($email: String, $password: String){
        login(email: $email, password: $password){
          authenticated
          accessToken
          newAccount
        }
      }`,
      variables: formDict
    })
    if(response.data){
      const accessToken = response.data.data.login.accessToken
      if (accessToken){
        localStorage.setItem("accessToken", accessToken)
        if(response.data.data.login.newAccount){
          this.router.navigate(['/activate-account'])
        } else {
          this.router.navigate(['/dashboard'])
        }
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
