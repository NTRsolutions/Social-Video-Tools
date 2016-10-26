import { Component, OnInit } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import './subtitles.component.scss';
import { UploadService } from '../../../common/services/video.service';

@Component({
    providers: [ UploadService ],
    selector: 'subtitles-component',
    templateUrl: 'subtitles.component.html',
})
export class SubtitlesComponent implements OnInit {
    af: AngularFire;
    projectTemplate: Object; //this is the object we use to initialize new projects in firebase
    video: any;
    uploadFile: any;
    firebaseToProcess: FirebaseListObservable<any[]>; // this is the 'to-process' queue object in firebase
    firebaseProjects:  FirebaseListObservable<any[]>; // this is the 'projects' object in firebase
    firebaseProject: any; // this is the firebase project object we're currently working on
    firebaseSubtitles:  FirebaseListObservable<any[]>;  // af.FirebaseListObservable supplies an iterable list
    project: any; // this is the ngModel we use to update, receive and bind firebase data

  constructor(
      private http: Http,
      private service: UploadService,
      af: AngularFire
    ) {
      this.af = af;

      this.video = { 
        lowResUrl: ''
      }
      // set project template 
      this.projectTemplate = {
        name: '',
        clip: {},
        subtitles: {
          initial: {
            text: 'Dit is een test',
            start: '0.20',
            end: '1.20',
            options: {
              "fade": true,
              "size": 20
            }
          }
        },
        status: {
          initiated: true,
          uploaded:'',
          downscaled: '',
        }
      };

      // init AngularFire
      this.firebaseToProcess = af.database.list('/to-process');
      this.firebaseProjects = af.database.list('/projects');

      // subscribe to service observable
      this.service.progress$.subscribe(data => {
        //console.log(`progress = ${data}`);
      });
  }

  ngOnInit() {}

  newProject() {
    // Bound UI elements need to be initiated
    this.project = this.projectTemplate;

    // store new project in Firebase
    this.firebaseProjects.push(this.project).then((ref) => {
      this.firebaseProject = ref;
      this.firebaseSubtitles = this.af.database.list(`/projects/${this.firebaseProject.key}/subtitles`);
      this.listen();
    });
  }

  update() {
    // update firebase reference with local project model
    this.firebaseProject.update( this.project );
  }

  listen() {
    // when data in firebase updates, propagate it to our working model
    // only update the relevant nodes
    this.firebaseProject.on('child_changed', (snapshot) => { 
      const child = snapshot.key;
      const data = snapshot.val();
      this.project[child] = data;
    });
  }

  // #todo write general update function instead of updateThis, updateThat...
  updateSubtitles(event) { 
    const key = event.$key;
    delete event.$exists;
    delete event.$key;

    this.firebaseProject.child('subtitles').child(key).update(event);
  }

  upload($event) {
    // store the new file 
    this.uploadFile = $event.target;

    // Post uploaded video
    this.service.makeFileRequest('http://localhost:8080/upload', this.uploadFile.files[0], this.firebaseProject.key)
      .subscribe((data) => {
        // response holds link to owres video source
        this.firebaseProject.child('clip').update({lowResUrl: data.lowResUrl});
      });
  }

  queue() {
    // add a project ID to the 'to-process' list
    const key = this.firebaseProject.key;
    this.firebaseToProcess.push({ projectId: key});
  }

  addSubtitle() {
    this.firebaseProject.child('subtitles').push({
      text: 'Dit is een test',
      start: '0.2',
      end: '1.2',
      options: {
        "fade": true,
        "size": 20
      }
    })
  }
}