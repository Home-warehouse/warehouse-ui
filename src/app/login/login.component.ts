import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { SendHTTPrequest } from 'src/common/api/wrapper';
import { RequestConfig } from 'src/common/interfaces/request.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  SignUpForm: FormGroup;
  SignInForm: FormGroup;
  constructor(
    private fb: FormBuilder
  ) {
    this.SignUpForm = this.fb.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      password: new FormControl('', [Validators.minLength(4), Validators.required])
    });
    this.SignInForm = this.fb.group({
      email: new FormControl('', Validators.email),
      password: new FormControl('', Validators.required)
    });
  }

  getFormAsDict = (form: FormGroup) => {
    let formDict: any = {};
    Object.keys(form.value).forEach(element => {
      const field = form.get(String(element));
      if (field){
        if(field.value !== null){
          formDict[String(element)] = field.value
        }
      }
    });
    return formDict;
  }

  onSignUpSubmit = async () => {
    let formDict = this.getFormAsDict(this.SignUpForm)
  }

  onSignInSubmit = async () => {
    let formDict = this.getFormAsDict(this.SignInForm)

    const requestConfig: RequestConfig = {
      endpoint: 'graphql',
      method: 'POST',
      headers: {"content-type": "application/json"},
      data: JSON.stringify({
        query: `query login($email: String, $password: String){
          login(email: $email, password: $password){
            authenticated,
            accessToken
          }
        }`,
        variables: formDict
      }),
      }

    const response = await SendHTTPrequest(requestConfig);
  }

  ngOnInit(): void {

  }

}
