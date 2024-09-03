import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatService } from 'src/app/services/chat-service.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})

export class ChatbotComponent  {

  messages: { text: string; isUser: boolean }[] = [];
  userInput: string = '';
  isThinking: boolean = false;

  @ViewChild('messageContainer') private messageContainer: ElementRef | undefined;

  constructor(private chatService: ChatService) {}

  sendMessage() {

    
    if (this.userInput.trim()) {
      // Añadir el mensaje del usuario al chat
      this.messages.push({ text: this.userInput, isUser: true });
      this.isThinking = true;

      // Llamar al servicio para enviar el mensaje al backend
      this.chatService.sendMessage(this.userInput).subscribe(
        (data: ResponseObject) => {

          this.isThinking = false;

          var response = data.response.text.value;

          // Añadir la respuesta del bot al chat
          this.messages.push({ text: response, isUser: false });
          this.scrollToBottom();
        },
        (error) => {
          this.isThinking = false;
          console.error('Error al enviar el mensaje:', error);
        }
      );

      this.userInput = '';
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error al hacer scroll en el chat:', err);
    }
  }


}

interface ResponseObject {
  response: {
    type: string;
    text: {
      value: string;
      annotations: any[];
    };
  };
}
