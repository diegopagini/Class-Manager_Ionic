import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.page.html',
  styleUrls: ['./classes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ClassesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
