import {Directive, HostListener} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import {Router} from '@angular/router';
import {PresentationComponent} from '../presentation/presentation/presentation.component';

@Directive({
  selector: '[app-tracking]'
})
export class TrackingDirective {
  auth;
  lastSlideChange;
  history: Array<any> = [];

  constructor(private afDb: AngularFireDatabase, private afAuth: AngularFireAuth,
              private router: Router, private presentation: PresentationComponent) {
    afAuth.auth.signInAnonymously();
    afAuth.authState.subscribe(authData => {
      this.auth = authData;
    });
    this.lastSlideChange = Date.now();
  }

  @HostListener('onSlideChange', ['$event']) onSlideChange(index) {
    if (this.auth) {
      const diffMinutes = Date.now() - this.lastSlideChange;
      this.lastSlideChange = Date.now();
      const userHistory = this.afDb.list('/user_progress/' + this.auth.uid);
      userHistory.push({
        slideId: index,
        timeStamp: Date.now(),
        msDiff: diffMinutes, // time user spent on the prev. slide
        route: this.router.url,
        totalSlides: this.presentation.totalSlides,
        milestone: this.router.url.split('\/')[1]
      });
    }
  }
}
