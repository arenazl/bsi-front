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

  constructor(private chatService: ChatService) {
    // Mensaje de bienvenida del asistente al iniciar
    this.messages = [{ text: '¡Hola! ¿Qué tal? Me llamo María y voy a ser tu asistente este día.', isUser: false }];
  }
  
  sendMessage() {
    if (this.userInput.trim()) {
      // Añadir el mensaje del usuario al chat
      this.messages.push({ text: this.userInput, isUser: true });
      this.isThinking = true;
  
      // Llamar al servicio para enviar el mensaje al backend
      this.chatService.sendMessage(this.userInput).subscribe(
        (data: any) => {
          this.isThinking = false;
  
          // Procesar la respuesta del servidor para formatearla
          const response = this.formatResponse(data.response[0].text.value);
  
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

  private formatResponse(response: string): string {
    // Divide la respuesta en líneas para analizarlas individualmente
    const lines = response.split('\n');
  
    const formattedLines = lines.map(line => {
      // Ignora las líneas que comienzan con ```
      if (/^```/.test(line)) {
        // Retorna una cadena vacía para ignorar esta línea
        return '';
      }
      // Verifica si la línea comienza con una numeración (ejemplo: 1., 2., etc.)
      else if (/^\d+\.\s/.test(line)) {
        // Si la línea comienza con una numeración, divide en dos partes por el primer ':'
        const parts = line.split(/:(.+)/); // Separa solo en el primer ':' encontrado
        const boldPart = `<b>${parts[0].trim()}:</b>`;
        const newLinePart = parts[1] ? `<br>${parts[1].trim()}` : ''; // Coloca la parte posterior en una nueva línea
  
        // Retorna la línea formateada con el texto posterior en una nueva línea
        return `<p>${boldPart}${newLinePart}</p>`;
      }     
      // Verifica si la línea comienza con triple # y lo pone en negrita con un icono de estrella
      else if (/^###\s/.test(line)) {
        // Elimina los ### y coloca el contenido en negrita con un icono de estrella
        const content = line.replace(/^###\s*/, ''); // Elimina los ###
        return `<b>⭐ ${content.trim()}</b><br>`;
      }
      // Verifica si la línea comienza con cuatro # y lo pone en negrita con un icono de información
      else if (/^####\s/.test(line)) {
        // Elimina los #### y coloca el contenido en negrita con un icono de información
        const content = line.replace(/^####\s*/, ''); // Elimina los ####
        return `<b>☑️ ${content.trim()}</b>`;
      }
      // Detecta si la línea contiene el enlace de WhatsApp y lo formatea correctamente
     // Detecta si la línea contiene el enlace de WhatsApp y lo formatea correctamente
     else if (/wa.me/.test(line)) {
      // Convierte la línea en un enlace clicable
      return `<a href="https://wa.me/5491160223474" target="_blank" class="bot-link"> 👉 Segui hablando un especialista de nuestro staff</a>`;
    }
      else {
        // Si no se encuentra la numeración ni los #, formatea el texto normalmente
        return `<p>${line.trim()}</p>`;
      }
    });
  
    // Une las líneas formateadas en un solo string con espaciado, omitiendo las vacías
    return `<br><div class="formatted-response">${formattedLines.filter(line => line !== '').join('<br>')}</div><br>`;
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
