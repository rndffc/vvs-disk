import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EstadoAtendimento } from '../../utils/enumUtils';


@Component({
  selector: 'app-mini-chat',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
  ],
  templateUrl: './mini-chat.component.html',
  styleUrl: './mini-chat.component.scss'
})
export class MiniChatComponent implements OnInit, AfterViewChecked{

  @Output() chatClosed = new EventEmitter<void>();


  constructor( ) { 
    this.mensagens.push({
      tipo: 'suporte',
      texto: 'Por favor aguarde. Em breve um de nossos agentes irá lhe atender.',
      hora: this.getHoraAtual()
    });
  };

  ngOnInit(): void {
      this.isPopupVisible = true;
  }


  EstadoAtendimento = EstadoAtendimento; 
 
  estadoAtendimento: string = EstadoAtendimento.Inicio;
  subestadoAtendimento: string = '';
  iniciarAtendimento() {
    this.estadoAtendimento = EstadoAtendimento.FluxoIniciado;
    this.subestadoAtendimento = EstadoAtendimento.ConfirmandoDados;
  }
  
  
 enviarDados() {
    if (this.nomeCliente && this.emailCliente && this.telefoneCliente) {
      // Após enviar os dados, exibe a parte de confirmação
      this.subestadoAtendimento = EstadoAtendimento.DadosConfirmados;
    }
  }
  queroCorrigirDados() {
    this.subestadoAtendimento = EstadoAtendimento.ConfirmandoDados;
  }
  confirmarDados() {
    this.subestadoAtendimento = EstadoAtendimento.DadosCorretos;
  }
  
  abrirChatSuporte() {
    this.estadoAtendimento = EstadoAtendimento.ChatSuporte;
  }



  nomeCliente: string = '';
  emailCliente: string = '';
  telefoneCliente: string = '';
  selectAssunto = [
    {  texto: 'Atendimento ao C-PLUS 4' },
    {  texto: `Atendimento ao C-PLUS 5` },
    {  texto: `Atendimento integração E-commerce` },
    {  texto: `Atendimento ao mobile` },
    {  texto: 'Atendimento ao Smart Pedidos' },
    {  texto: 'Financeiro' },

  ]
  assuntoSelecionado: string = '';
  mostrarRespostas = false;
  dadosConfirmados: boolean = false;
  isPopupVisible: boolean = false;
  isAtendimentoIniciado: boolean = false;
  isLoading = false; // Variável de controle do carregamento
  isDadosCorretos = false;
  ticketConfirmado: boolean = false;
  isNaoAbriuTicket: boolean = false;
  isChatSuporte: boolean = false;

  mensagemAtual: string = '';
  mensagens = [
    { tipo: 'suporte', texto: 'Olá! Como posso te ajudar?', hora: '10:00' },
    { tipo: 'usuario', texto: 'Preciso de ajuda com meu sistema.', hora: '10:01' }
    // Outras mensagens...
  ];
  isTicketNaoAberto: boolean = false;


  isTicketAberto: boolean = false;
  isDesistir: boolean = false;
  conversas = [
    { tipo: 'received', texto: 'Informe seus dados para o atendimento' },
    { tipo: 'sent', texto: `Eu me chamo ${this.nomeCliente}` },
    { tipo: 'sent', texto: `Telefone: ${this.telefoneCliente}` },
    { tipo: 'sent', texto: `E-mail: ${this.emailCliente}` },
    { tipo: 'received', texto: 'Seus dados estão certos?' }
  ];




  // iniciarAtendimento() {
  //   this.isLoading = true; 
  //   setTimeout(() => {
  //     this.isLoading = false; // Esconde o spinner
  //     this.isAtendimentoIniciado = true; // Exibe a segunda tela
  //   }, 2000); // Simulação de 2 segundos
  // }

  // confirmarDados() {
  //   // Ao confirmar os dados, exibe a próxima "telinha"
  //   this.ticketConfirmado = true;
  // }



  togglePopup() {
    this.isPopupVisible = !this.isPopupVisible;
    console.log(this.isPopupVisible)
  }


  fecharPopup() {
    this.isPopupVisible = false;
    this.chatClosed.emit(); // Emite um evento quando o chat é fechado
  }

  ticketJaAberto() {
    this.subestadoAtendimento = EstadoAtendimento.JaAbriuTicket;
    console.log("Usuário já abriu um ticket");
  }

  ticketNaoAberto() {
    // Lógica caso o usuário não tenha aberto um ticket]
    this.subestadoAtendimento = EstadoAtendimento.TicketNaoAberto;
    console.log("Usuário não abriu um ticket");
  }

  ticketDesistiu(){
    this.subestadoAtendimento = EstadoAtendimento.Desistir;
    console.log("Desistiu? ", this.isDesistir);
  }

  isHomeChat(){
    this.estadoAtendimento = EstadoAtendimento.Inicio;
  }
  onInitChat(){
    this.subestadoAtendimento = EstadoAtendimento.ChatSuporte;
  }






 // Este método é chamado após cada ciclo de mudança na visualização
 ngAfterViewChecked() {
  if (this.novasMensagens && this.isNearBottom) {
    this.scrollToBottom(true); // Rola para o final somente se houve novas mensagens e o usuário está perto do final
    this.novasMensagens = false; // Reseta a flag após o scroll
  }
}


@ViewChild('chatBody') chatBody!: ElementRef;
isNearBottom = true; // Variável para controlar se está perto do final do chat
novasMensagens = false; // Indica se novas mensagens foram adicionadas




enviarMensagem() {
  if (this.mensagemAtual.trim() !== '') {
    this.mensagens.push({
      tipo: 'usuario',
      texto: this.mensagemAtual,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.mensagemAtual = '';
    this.novasMensagens = true; // Marca que uma nova mensagem foi adicionada
  }
}


 // Método para rolar o chat para a última mensagem
 scrollToBottom(forceScroll: boolean = false): void {
  if (this.chatBody) { // Verifica se o chatBody está definido
    const element = this.chatBody.nativeElement;
    const threshold = 50; // Pixels antes do final para considerar que está "perto"
    const position = element.scrollTop + element.clientHeight;
    const height = element.scrollHeight;

    if (forceScroll || position > height - threshold) {
      element.scrollTop = height; // Desce até o final
      this.isNearBottom = true;
    } else {
      this.isNearBottom = false;
    }
  }
}

  // Evento de rolagem para monitorar a posição do usuário
  onScroll() {
    if (this.chatBody) { // Verifica se o chatBody está definido
      const element = this.chatBody.nativeElement;
      const threshold = 50;
      const position = element.scrollTop + element.clientHeight;
      const height = element.scrollHeight;

      this.isNearBottom = position > height - threshold;
    }
  }

  getHoraAtual(): string {
    const agora = new Date();
    return `${agora.getHours()}:${agora.getMinutes().toString().padStart(2, '0')}`;
  }
};
