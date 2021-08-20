import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';

import { AuthGuard } from 'src/common/auth/auth.guard';
import { HomePageComponent } from './home-page/home-page.component';
import { AccountComponent } from './account/account.component';
import { RaportsListComponent } from './raports-list/raports-list.component';
import { RaportFormComponent } from './raport-form/raport-form.component';
import { RaportDisplayComponent } from './raport-display/raport-display.component';
import { AutomatizationsListComponent } from './automatizations-list/automatizations-list.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { UserManagingComponent } from './user-managing/user-managing.component';

const routes: Routes = [
  {path: '', component: HomePageComponent},
  {path: 'activate-account', component: ActivateAccountComponent},
  {path: 'login', component: LoginComponent},
  {path: 'user-managing', component: UserManagingComponent, canActivate: [AuthGuard]},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  {path: 'account', component: AccountComponent, canActivate: [AuthGuard]},
  {path: 'raport-display/:id', component: RaportDisplayComponent, canActivate: [AuthGuard]},
  {path: 'create-raport', component: RaportFormComponent, canActivate: [AuthGuard]},
  {path: 'raports', component: RaportsListComponent, canActivate: [AuthGuard]},
  {path: 'automatizations', component: AutomatizationsListComponent, canActivate: [AuthGuard]},
  {path: 'home', component: HomePageComponent },
  {path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
