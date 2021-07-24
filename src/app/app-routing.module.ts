import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';

import { AuthGuard } from 'src/common/auth/auth.guard';
import { HomePageComponent } from './home-page/home-page.component';
import { AccountComponent } from './account/account.component';
import { RaportsListComponent } from './raports-list/raports-list.component';
import { RaportComponent } from './raport/raport.component';
import { RaportFormComponent } from './raport-form/raport-form.component';
import { RaportDisplayComponent } from './raport-display/raport-display.component';

const routes: Routes = [
  {path: '', component: HomePageComponent},
  {path: 'login', component: LoginComponent},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  {path: 'account', component: AccountComponent, canActivate: [AuthGuard]},
  // TODO: Add query parameters
  {path: 'raport-display/:id', component: RaportDisplayComponent, canActivate: [AuthGuard]},
  {path: 'create-raport', component: RaportFormComponent, canActivate: [AuthGuard]},
  {path: 'raports', component: RaportsListComponent, canActivate: [AuthGuard]},
  {path: 'home', component: HomePageComponent },
  {path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
