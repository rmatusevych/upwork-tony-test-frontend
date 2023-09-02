import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface Url {
  url: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  public urlsLink = environment.backendUrl + '/website_urls'
  title = 'upwork-tony-test-frontend';

  public urlPattern = '^(?:(http|https)://)?[-a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)$'

  public urls = [];

  constructor(public httpClient: HttpClient) {

  }

  ngOnInit(): void {
    this.getUrls()

    this.syncWithDatabase();
  }

  public urlFormGroup = new FormGroup({
    url: new FormControl(null, [Validators.pattern(this.urlPattern)])
  })

  public getUrls() {
    this.httpClient.get(this.urlsLink).subscribe((urls: Array<Url>) => {
      this.urls = urls.map((urlObj) => urlObj.url)
    })
  }

  public postUrl(url) {
    this.httpClient.post(this.urlsLink, { url }).subscribe(() => {})
  }

  public syncWithDatabase() {
    setInterval(() => {
      this.httpClient.get(this.urlsLink).subscribe((urls: Array<Url>) => {
        const mappedUrls = urls.map((urlObj) => urlObj.url)

        this.urls.forEach((url) => {
          if(!mappedUrls.includes(url)) {
            this.postUrl(url)
          }
        })
      })
    }, 15000)
  }

  get url() {
    return this.urlFormGroup.get('url');
  }
  
  public save = (e) => {
    if(!this.url.errors?.pattern && !this.urls.includes(this.url.value)) {
      const correctUrl = this.correctUrl(this.url.value)
      this.urls.push(correctUrl)
      this.postUrl(correctUrl)
      this.url.reset()
    }
  }

  public correctUrl(url) {
    return url.replace(/^(https?):\/\/(www\.)?/, '').split('/')[0]
  }
}
