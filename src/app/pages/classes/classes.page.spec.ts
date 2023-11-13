import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ClassesPage } from './classes.page';

describe('ClassesPage', () => {
  let component: ClassesPage;
  let fixture: ComponentFixture<ClassesPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(ClassesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
