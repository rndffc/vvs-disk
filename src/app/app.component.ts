import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MiniChatComponent } from "./components/mini-chat/mini-chat.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MiniChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'vvs-disk';
}
