import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationModel } from '../../../models/base.model.data';

import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { ValidationService } from '../../../services/validation/validation.service';
import { SharedDataService } from '../../../services/shared-data/shared-data.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

    formErrorMsg = '';
    formErrorMsgSecondInfo = '';
    formError = false;
    appForm: FormGroup;
    isSubmited = false;
    loginAttempt = false;
    model: AuthenticationModel;
    processing = false;
    timedOut = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private authenticationService: AuthenticationService,
        private routeParams: ActivatedRoute,
        private sharedData: SharedDataService
    ) {
        this.buildForm();
    }

    ngOnInit() {
        if (this.authenticationService.isSignIn()) {
            this.router.navigate(['home']);
        }
    }

    private buildForm(): void {
        this.appForm = this.fb.group({
            'username': ['', Validators.compose([Validators.required, ValidationService.emailValidator])],
            'password': ['', Validators.compose([Validators.required, ValidationService.allBlankSpaces])],
        });
    }

    private callAuthenticationService(loginModel) {
        if (loginModel.valid) {
        this.processing = true;
        this.formError = false;

            this.authenticationService.AuthenticateUser(this.model).subscribe(res => {
              if (this.sharedData) {
                this.sharedData.storeSessionData(res);
              }
                this.isSubmited = false;
                this.model = null;
                this.processing = false;
                this.router.navigate(['home']);
            },
            err => {

                let _errorBody;
                if (err['_body']) {
                    _errorBody = JSON.parse(err['_body'])[0];
                }
                    switch (err.status) {
                        case 400:
                            break;
                        case 403:                
                            break;
                        case 500:
                            break;
                        default:
                            this.formErrorMsg = 'An error occurred attempting to sign in. Please try again.';
                }

                this.formError = true;
                this.isSubmited = false;
                this.processing = false;
                this.model = null;
            });
        }
    }

    onSubmit(loginModel: FormGroup): void {
        this.isSubmited = true;

        this.model = {
            'workspaceId': "jinyan",
            'email': loginModel.controls['username'].value,
            'password': loginModel.controls['password'].value
        };

        this.callAuthenticationService(loginModel);
    }

    goToSignUp() {
        this.router.navigate(['signup']);
    }
}
