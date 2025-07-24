import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Components
import { ChatbotComponent } from './chatbot/chatbot.component';
import { PentagramLearningComponent } from './pentagram-learning/pentagram-learning.component';

@NgModule({
  declarations: [
    ChatbotComponent,
    PentagramLearningComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    ChatbotComponent,
    PentagramLearningComponent
  ]
})
export class TestModule { }