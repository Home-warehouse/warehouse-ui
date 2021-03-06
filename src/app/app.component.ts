import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/common/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Home Warehouse';
  mobileNavOpen = false;
  isLogged: Boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ){
    router.events.subscribe((e) =>{
      this.isLogged = auth.isLoggedIn()
    })
  }

  getRank=()=>{
    return localStorage.getItem("rank")
  }

  toggleMobileNav=()=>{
    this.mobileNavOpen = !this.mobileNavOpen
  }

  logout = () =>{
    localStorage.removeItem("accessToken")
    localStorage.removeItem("rank")
    this.router.navigate(['/login'])
  }

  ngOnInit(): void {
    if(this.auth.isLoggedIn()){
      this.auth.updateToken()
    }
  }
}
