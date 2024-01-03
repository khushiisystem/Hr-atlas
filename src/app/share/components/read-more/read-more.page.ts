import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'read-more-text',
  templateUrl: './read-more.page.html',
  styleUrls: ['./read-more.page.scss'],
})
export class ReadMorePage implements OnInit {
  @Input() textString = '';
  @Input() maxLength = 100;
  trimmedText: string = '';
  showReadMore: boolean = false;
  buttonText = 'Read more';

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.toggleReadMore();
  }

  toggleReadMore() {
    this.showReadMore = !this.showReadMore;
    this.buttonText = this.showReadMore ? 'Read more' : 'Read less';

    if (this.showReadMore) {
      this.trimText();
    } else {
      this.trimmedText = this.textString;
    }
  }

  private trimText() {
    if (this.textString.length > this.maxLength) {
      this.trimmedText = this.textString.slice(0, this.maxLength).padEnd(this.maxLength + 3, '...');
    } else {
      this.trimmedText = this.textString;
    }
  }  

}
