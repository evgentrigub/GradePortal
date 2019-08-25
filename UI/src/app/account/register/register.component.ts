import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../_services/authentication.service';
import { UserService } from '../../_services/user.service';
import { first, tap, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { User } from 'src/app/_models/user';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  hide = true;
  valueFirstName = '';
  valueLastname = '';
  valueLogin = '';

  registerForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private snackbar: MatSnackBar
  ) {
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const user = this.registerForm.value as User;
    // setTimeout(() => {
    this.authenticationService
      .register(user)
      .pipe(
        first(),
        switchMap(r => {
          const userLogin$ = this.authenticationService.login(user.username, user.password);
          return userLogin$;
        })
      )
      .subscribe(
        _ => {
          this.router.navigate(['/table']);
          this.showMessage('Sign up success!');
          this.loading = false;
        },
        error => {
          this.loading = false;
          this.showMessage(error);
        }
      );
    // }, 1500);
  }

  private showErrorMessage(message: HttpErrorResponse) {
    this.snackbar.open(message.error.message, 'OK', { duration: 6000 });
  }
  private showMessage(message: any) {
    this.snackbar.open(message, 'OK', { duration: 3000 });
  }
}
