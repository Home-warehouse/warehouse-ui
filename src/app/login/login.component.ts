import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { hwAPI } from 'src/common/api/api';
import { NotificationsSharedService } from '../notifications/notifications.sharedService';
import { Router } from "@angular/router"
import jwtDecode from 'jwt-decode';
import getFormAsDict from 'src/common/form';

interface token {
  client_id: string
  rank: "admin" | "user"
  exp: number
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  SignInForm: UntypedFormGroup;
  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private notifications: NotificationsSharedService,
    private hwAPI: hwAPI,
  ) {
    this.SignInForm = this.fb.group({
      email: new UntypedFormControl('', Validators.email),
      password: new UntypedFormControl('', Validators.required)
    });
  }

  // Autofill fix
  updateValueOnChange(event: Event) {
    const target = event.target as HTMLInputElement
    return target.value
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
      if(response.data.data.login.authenticated){
        let tokenParsed: token
        const accessToken = response.data.data.login.accessToken
        tokenParsed = jwtDecode(accessToken)
        localStorage.setItem("accessToken", accessToken)
        localStorage.setItem("rank", tokenParsed.rank)
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
