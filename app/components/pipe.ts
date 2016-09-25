import {Pipe, PipeTransform} from '@angular/core';
import {SecurityContext, DomSanitizationService} from '@angular/platform-browser';


@Pipe({name: 'safe_url'})
export class SafeURL {
  constructor(private sanitizer:DomSanitizationService){
    this.sanitizer = sanitizer;
  }

  transform(style) {
    return this.sanitizer.bypassSecurityTrustStyle(style);
  }
}
