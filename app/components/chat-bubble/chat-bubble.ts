import {Component} from '@angular/core';

@Component({
    selector: 'chat-bubble',
    inputs: ['msg: message'],
    template:
    `
  <div class="chatBubble">
    <div class="profile-pic {{msg.position}}" [style.background-image]="'url(' + msg.img.url + ')' | safe_url"></div>
    <div class="chat-bubble {{msg.position}}">
      <div class="message">{{msg.body}}</div>
      <div class="message-detail">
          <!--<span style="font-weight:bold;">{{msg.uid}} </span>,-->
          <span>{{msg.timestamp | date: "HH:mm" }}</span>
      </div>
    </div>
  </div>
  `
})
export class ChatBubble {

    msg: any;

    constructor() {
        this.msg = {
            content: 'Am I dreaming?',
            position: 'left',
            time: '12/3/2016',
            senderName: 'Gregory'
        }
    }
}