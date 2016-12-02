import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from 'angularfire2';
import { HttpModule } from '@angular/http';
import { ExtBrowserXhr } from './common/classes/extBrowserXhr';
import { NgModule } from '@angular/core';
import { VgCore } from "videogular2/core";
import { VgControlsModule } from "videogular2/controls";
import { VgOverlayPlayModule } from "videogular2/overlay-play";
import { VgBufferingModule } from "videogular2/buffering";

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import{ routing } from './common/services/routing.service';
import { ProjectService } from './common/services/project.service';
import firebaseConfig from './config/firebase.config';
import { AuthGuard } from './common/guards/auth';
import { NoAuthGuard } from './common/guards/noAuth';
import { AdminGuard } from './common/guards/admin';

import { AppComponent } from './app.component';
import { LoginForm } from './views/public/auth/components/login/login-form';
// import { VrtAppsComponent } from './views/public/vrtapps.component';

import { SubtitlesComponent } from './views/public/subtitles/subtitles.component';
import { VrtVideoPlayer } from "./views/public/subtitles/components/vrtvideo-player";
import { OpenComponent } from './views/public/subtitles/components/open.component';
import { ProgressComponent } from './views/public/subtitles/components/progress.component';
import { ProgressBarComponent } from './views/public/subtitles/components/progressbar.component';
import { RangeSliderComponent } from './views/public/subtitles/components/range-slider.component';
import { AuthComponent } from './views/public/auth/authentication.component';
import { DownloadComponent } from './views/public/download/download.component';
import { AdminComponent } from './views/public/admin/admin.component';
import { MenuComponent } from './views/public/partials/menu.component';


import { ListPipe } from './common/pipes/list.pipe';
import { SortByPropPipe } from './common/pipes/sortByProp.pipe';
import { KeysPipe } from './common/pipes/keys.pipe';

import { NgInitDir } from './common/directives/ngInit.directive'

@NgModule({
    declarations: [
        AppComponent,
        VrtVideoPlayer,
        // VrtAppsComponent,
        SubtitlesComponent,
        OpenComponent,
        ProgressComponent,
        ProgressBarComponent,
        AuthComponent,
        DownloadComponent,
        AdminComponent,
        MenuComponent,
        RangeSliderComponent,
        LoginForm,
        ListPipe,
        SortByPropPipe,
        KeysPipe,
        NgInitDir
    ],
    imports: [
        BrowserModule, 
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        VgCore, 
        VgControlsModule, 
        VgOverlayPlayModule, 
        VgBufferingModule,
        HttpModule,
        AngularFireModule.initializeApp( firebaseConfig()['firebaseConfig'], firebaseConfig()['firebaseAuthConfig']  ),
        routing,
    ],
    exports: [
        FormsModule,
        ReactiveFormsModule,
    ],
    providers: [ExtBrowserXhr, AuthGuard, NoAuthGuard, AdminGuard, ProjectService],
    bootstrap: [AppComponent],
})
export class AppModule {}
