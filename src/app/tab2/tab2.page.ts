import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import {
  Base64ToGallery,
  Base64ToGalleryOptions,
} from '@ionic-native/base64-to-gallery/ngx';

import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  isEdit: boolean;
  constructor(
    public photoService: PhotoService,
    private plt: Platform,
    private base64ToGallery: Base64ToGallery,
    private toastCtrl: ToastController
  ) {
    photoService.Change.subscribe(ite=>{
      this.isEdit=true;
      var background = new Image();
      background.src = ite.webviewPath;
      let ctx = this.canvasElement.getContext('2d');
  
      background.onload = () => {
        ctx.drawImage(
          background,
          0,
          0,
          this.canvasElement.width,
          this.canvasElement.height
        );
      };
    })
  }
  async ngOnInit() {
    await this.photoService.loadSaved();
  }
  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  @ViewChild('imageCanvas', { static: false }) canvas: any;
  canvasElement: any;
  saveX: number;
  saveY: number;

  selectedColor = '#9e2956';
  colors = [
    '#9e2956',
    '#c2281d',
    '#de722f',
    '#edbf4c',
    '#5db37e',
    '#459cde',
    '#4250ad',
    '#802fa3',
  ];

  drawing = false;
  lineWidth = 5;

  ngAfterViewInit() {
    // Set the Canvas Element and its size
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.plt.width() + '';
    this.canvasElement.height = 200;
  }

  startDrawing(ev) {
    this.drawing = true;
    var canvasPosition = this.canvasElement.getBoundingClientRect();

    this.saveX = ev.pageX - canvasPosition.x;
    this.saveY = ev.pageY - canvasPosition.y;
  }

  endDrawing() {
    this.drawing = false;
  }

  selectColor(color) {
    this.selectedColor = color;
  }
  goBack(){
    this.isEdit = false
  }
  moved(ev) {
    if (!this.drawing) return;

    var canvasPosition = this.canvasElement.getBoundingClientRect();
    let ctx = this.canvasElement.getContext('2d');

    let currentX = ev.pageX - canvasPosition.x;
    let currentY = ev.pageY - canvasPosition.y;

    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.selectedColor;
    ctx.lineWidth = this.lineWidth;

    ctx.beginPath();
    ctx.moveTo(this.saveX, this.saveY);
    ctx.lineTo(currentX, currentY);
    ctx.closePath();

    ctx.stroke();

    this.saveX = currentX;
    this.saveY = currentY;
  }

  exportCanvasImage() {
    this.goBack()
    var dataUrl = this.canvasElement.toDataURL();

    // Clear the current canvas
    let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (this.plt.is('cordova')) {
      const options: Base64ToGalleryOptions = {
        prefix: 'canvas_',
        mediaScanner: true,
      };

      this.base64ToGallery.base64ToGallery(dataUrl, options).then(
        async (res: any) => {
          const toast = await this.toastCtrl.create({
            message: 'Image saved to camera roll.',
            duration: 2000,
          });
          toast.present();
        },
        (err) => console.log('Error saving image to gallery ', err)
      );
    } else {
      // Fallback for Desktop
      var data = dataUrl.split(',')[1];
      let blob = this.b64toBlob(data, 'image.webp');

      var a = window.document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'Abhishek.webp';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  // https://forum.ionicframework.com/t/save-base64-encoded-image-to-specific-filepath/96180/3
  b64toBlob(b64Data: any, contentType: any) {
    contentType = contentType || '';
    var sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
}
