import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-students',
  templateUrl: './students.page.html',
  styleUrls: ['./students.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class StudentsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
