import { CommonModule, NgClass } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { EstadoAtendimento } from '../../utils/enumUtils';


@Component({
  selector: 'app-mini-chat',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    NgClass
  ],
  templateUrl: './mini-chat.component.html',
  styleUrl: './mini-chat.component.scss'
})
export class MiniChatComponent implements OnInit, AfterViewChecked{

  @Output() chatClosed = new EventEmitter<void>();


  constructor(private cdRef: ChangeDetectorRef,private zone: NgZone ) { 
    this.mensagens.push({
      tipo: 'suporte',
      texto: 'Por favor aguarde. Em breve um de nossos agentes irá lhe atender.',
      hora: this.getHoraAtual()
    });
  };

  ngOnInit(): void {
    this.estadoAtendimento = EstadoAtendimento.FluxoIniciado;
    this.subestadoAtendimento = EstadoAtendimento.Avaliacao;
    const sessaoSalva = localStorage.getItem('sessaoCliente');
    if (sessaoSalva) {
      const dadosCliente = JSON.parse(sessaoSalva);
      const agora = new Date().getTime();
  
      if (agora < dadosCliente.expiracao) {
        // A sessão ainda é válida
        this.nomeCliente = dadosCliente.nome;
        this.emailCliente = dadosCliente.email;
        this.telefoneCliente = dadosCliente.telefone;
        this.dadosConfirmados = true; // Defina isso para exibir os dados confirmados no UI
      } else {
        // Sessão expirou
        localStorage.removeItem('sessaoCliente');
      }
    }
  }


  atendimento = EstadoAtendimento; 
  estadoAtendimento: string = EstadoAtendimento.Inicio;
  subestadoAtendimento: string = '';

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

  isAtendimentoIniciado: boolean = false;
  isLoading = false; // Variável de controle do carregamento
  isDadosCorretos = false;



  @ViewChild('chatBody') chatBody!: ElementRef;
  isNearBottom = true; // Variável para controlar se está perto do final do chat
  novasMensagens = false; // Indica se novas mensagens foram adicionadas
  mensagemAtual: string = '';


  mensagens = [
    { tipo: 'suporte', texto: 'Olá! Como posso te ajudar?', hora: '10:00' },
    { tipo: 'usuario', texto: 'Preciso de ajuda com meu sistema.', hora: '10:01' }
  ];
  isTicketNaoAberto: boolean = false;
  isTicketAberto: boolean = false;
  isDesistir: boolean = false;


  iniciarAtendimento() {
    this.estadoAtendimento = EstadoAtendimento.FluxoIniciado;
    this.subestadoAtendimento = EstadoAtendimento.ConfirmandoDados;
    this.cdRef.detectChanges();
  }
  
  usuarioJaLogadoInicio(){
    this.estadoAtendimento = EstadoAtendimento.FluxoIniciado;
    this.subestadoAtendimento = EstadoAtendimento.DadosCorretos;
  }
  
  enviarDados(dadosForm: NgForm) {
    if (dadosForm.valid) {
      // Após enviar os dados, exibe a parte de confirmação
      this.subestadoAtendimento = EstadoAtendimento.DadosConfirmados;
      this.cdRef.detectChanges();
    } else {
      console.log('Campos não preenchidos corretamente');
      dadosForm.form.markAllAsTouched();
    }
  }

  queroCorrigirDados() {
    this.subestadoAtendimento = EstadoAtendimento.ConfirmandoDados;
  }
  confirmarDados() {
    const agora = new Date().getTime();
    const dataExpiracao = agora + 24 * 60 * 60 * 1000; // 24 horas em milissegundos
  
    const dadosCliente = {
      nome: this.nomeCliente,
      email: this.emailCliente,
      telefone: this.telefoneCliente,
      expiracao: dataExpiracao
    };
    this.dadosConfirmados = true;
    localStorage.setItem('sessaoCliente', JSON.stringify(dadosCliente));
    this.cdRef.detectChanges();
    this.subestadoAtendimento = EstadoAtendimento.DadosCorretos;
  }

  entrarComOutroUsuario() {
    localStorage.removeItem('sessaoCliente');
    this.nomeCliente = '';
    this.emailCliente = '';
    this.telefoneCliente = '';
    this.dadosConfirmados = false; // Redefine para a tela inicial
    this.subestadoAtendimento = EstadoAtendimento.ConfirmandoDados;
  }
  isChatAberto: boolean = false;
  abrirChatSuporte() {
    this.estadoAtendimento = EstadoAtendimento.ChatSuporte;
    this.isChatAberto = true;
  }

logout() {
  localStorage.removeItem('sessaoCliente');
  this.nomeCliente = '';
  this.emailCliente = '';
  this.telefoneCliente = '';
  this.dadosConfirmados = false;
  this.subestadoAtendimento = EstadoAtendimento.Inicio;
  this.cdRef.detectChanges();
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

  isHomeChat() {
    this.zone.run(() => {
      this.estadoAtendimento = EstadoAtendimento.Inicio;
      this.isDesistir = false;
      this.isChatAberto = false;
    });
  }
  onInitChat(){
    this.subestadoAtendimento = EstadoAtendimento.ChatSuporte;
    this.isChatAberto = true;
  }


 // Este método é chamado após cada ciclo de mudança na visualização
 ngAfterViewChecked() {
  if (this.novasMensagens && this.isNearBottom) {
    this.scrollToBottom(true); // Rola para o final somente se houve novas mensagens e o usuário está perto do final
    this.novasMensagens = false; // Reseta a flag após o scroll
  }
}




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



  notas: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  getColor(nota: number): string {
    if (nota <= 4) {
      return 'vermelho';  // Classe CSS definida no seu arquivo de estilos
    } else if (nota <= 7) {
      return 'amarelo';  // Outra classe
    } else {
      return 'verde';  // Classe para notas altas
    }
  }
  
  avaliar(nota: number) {
    console.log(`Nota selecionada: ${nota}`);
    // Aqui você pode implementar o que acontece quando a nota é clicada
  }
};
