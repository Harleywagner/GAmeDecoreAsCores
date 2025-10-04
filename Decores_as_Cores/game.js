// Rastro de Cores - Jogo de Memória e Reflexo
// Versão robusta e funcional com efeitos sonoros

class RastroDeCores {
    constructor() {
        // Estado do jogo
        this.gameState = {
            sequence: [],
            playerSequence: [],
            level: 1,
            score: 0,
            isPlaying: false,
            isPlayerTurn: false,
            isPaused: false,
            speed: 1000,
            currentScreen: 'start'
        };

        // Configurações
        this.config = {
            colors: ['red', 'blue', 'green', 'yellow'],
            baseSpeed: 1000,
            speedDecrease: 50,
            minSpeed: 100,
            pointsPerLevel: 10
        };

        // Elementos DOM
        this.elements = {};

        // Efeitos Sonoros
        this.sounds = {
            click: new Audio("red.mp3"),
            click2: new Audio("blue.mp3"),
            click3: new Audio("green.mp3"),
            click4: new Audio("yellow.mp3"),
            victory: new Audio("victory.mp3"),
            gameOver: new Audio("gameover.mp3")
        };
        
        // Inicializar o jogo
        this.init();
    }

    init() {
        console.log('Inicializando Rastro de Cores...');
        
        // Aguardar o DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupGame());
        } else {
            this.setupGame();
        }
    }

    setupGame() {
        console.log('Configurando elementos do jogo...');
        
        // Mapear elementos DOM
        this.mapElements();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Mostrar tela inicial
        this.showScreen('start');
        
        console.log('Jogo inicializado com sucesso!');
    }

    mapElements() {
        // Telas
        this.elements.startScreen = document.getElementById('start-screen');
        this.elements.gameScreen = document.getElementById('game-screen');
        this.elements.gameoverScreen = document.getElementById('gameover-screen');
        this.elements.pauseScreen = document.getElementById('pause-screen');

        // Botões
        this.elements.startButton = document.getElementById('start-button');
        this.elements.pauseButton = document.getElementById('pause-button');
        this.elements.resumeButton = document.getElementById('resume-button');
        this.elements.restartButton = document.getElementById('restart-button');
        this.elements.menuButton = document.getElementById('menu-button');
        this.elements.quitButton = document.getElementById('quit-button');

        // Elementos de informação
        this.elements.score = document.getElementById('score');
        this.elements.level = document.getElementById('level');
        this.elements.statusMessage = document.getElementById('status-message');
        this.elements.finalScore = document.getElementById('final-score');
        this.elements.finalLevel = document.getElementById('final-level');
        this.elements.pauseScore = document.getElementById('pause-score');
        this.elements.pauseLevel = document.getElementById('pause-level');
        this.elements.performanceMessage = document.getElementById('performance-message');

        // Botões de cores
        this.elements.colorButtons = {};
        this.config.colors.forEach(color => {
            this.elements.colorButtons[color] = document.querySelector(`.color-button.${color}`);
        });

        console.log('Elementos mapeados:', Object.keys(this.elements));
    }

    setupEventListeners() {
        // Botões de controle
        this.elements.startButton?.addEventListener('click', () => this.startGame());
        this.elements.pauseButton?.addEventListener('click', () => this.pauseGame());
        this.elements.resumeButton?.addEventListener('click', () => this.resumeGame());
        this.elements.restartButton?.addEventListener('click', () => this.startGame());
        this.elements.menuButton?.addEventListener('click', () => this.showScreen('start'));
        this.elements.quitButton?.addEventListener('click', () => this.showScreen('start'));

        // Botões de cores
        Object.entries(this.elements.colorButtons).forEach(([color, button]) => {
            if (button) {
                button.addEventListener('click', () => this.handleColorClick(color));
                // Prevenir seleção de texto
                button.addEventListener('selectstart', (e) => e.preventDefault());
            }
        });

        // Prevenir zoom em dispositivos móveis
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });

        console.log('Event listeners configurados');
    }

    showScreen(screenName) {
        console.log(`Mostrando tela: ${screenName}`);
        
        // Esconder todas as telas
        Object.values(this.elements).forEach(element => {
            if (element && element.classList && element.classList.contains('screen')) {
                element.classList.remove('active');
            }
        });

        // Mostrar tela específica
        const screenElement = this.elements[`${screenName}Screen`];
        if (screenElement) {
            screenElement.classList.add('active');
            this.gameState.currentScreen = screenName;
        }
    }

    startGame() {
        console.log('Iniciando novo jogo...');
        
        // Resetar estado do jogo
        this.gameState = {
            sequence: [],
            playerSequence: [],
            level: 1,
            score: 0,
            isPlaying: true,
            isPlayerTurn: false,
            isPaused: false,
            speed: this.config.baseSpeed,
            currentScreen: 'game'
        };

        // Atualizar interface
        this.updateUI();
        
        // Mostrar tela do jogo
        this.showScreen('game');
        
        // Iniciar primeira rodada
        setTimeout(() => this.nextRound(), 500);
    }

    nextRound() {
        console.log(`Iniciando nível ${this.gameState.level}`);
        
        // Adicionar nova cor à sequência
        const randomColor = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
        this.gameState.sequence.push(randomColor);
        
        // Resetar sequência do jogador
        this.gameState.playerSequence = [];
        this.gameState.isPlayerTurn = false;
        
        // Atualizar velocidade
        this.gameState.speed = Math.max(
            this.config.minSpeed,
            this.config.baseSpeed - (this.gameState.level - 1) * this.config.speedDecrease
        );
        
        // Atualizar interface
        this.updateUI();
        
        // Tocar som de vitória se não for a primeira rodada
        if (this.gameState.level > 1) {
            this.sounds.victory.play();
        }

        // Mostrar sequência
        this.showSequence();
    }

    async showSequence() {
        console.log('Mostrando sequência:', this.gameState.sequence);
        
        this.elements.statusMessage.textContent = 'Memorize a sequência!';
        
        // Aguardar um pouco antes de começar
        await this.delay(800);
        
        // Mostrar cada cor da sequência
        for (let i = 0; i < this.gameState.sequence.length; i++) {
            const color = this.gameState.sequence[i];
            await this.flashColor(color, true); // Passa true para indicar que é a sequência do jogo
            await this.delay(this.gameState.speed * 0.3);
        }
        
        // Aguardar um pouco e então permitir input do jogador
        await this.delay(500);
        this.gameState.isPlayerTurn = true;
        this.elements.statusMessage.textContent = 'Sua vez! Toque as cores na ordem correta.';
        
        console.log('Aguardando input do jogador...');
    }

    async flashColor(color, isGameSequence = false) {
        const button = this.elements.colorButtons[color];
        if (!button) return;

        // Tocar som de clique
        this.sounds.click.currentTime = 0; // Reinicia o som para que possa ser tocado rapidamente
        this.sounds.click.play();

        // Adicionar classe de flash
        button.classList.add('flash');
        
        // Vibração (se disponível) - apenas para a sequência do jogo, não para o clique do jogador
        if (isGameSequence && navigator.vibrate) {
            navigator.vibrate(100);
        }
        
        // Aguardar duração do flash
        await this.delay(this.gameState.speed * 0.4);
        
        // Remover classe de flash
        button.classList.remove('flash');
    }

    handleColorClick(color) {
        if (!this.gameState.isPlaying || !this.gameState.isPlayerTurn || this.gameState.isPaused) {
            return;
        }

        console.log(`Jogador clicou em: ${color}`);
        
        // Adicionar cor à sequência do jogador
        this.gameState.playerSequence.push(color);
        
        // Flash visual e som de clique
        this.flashColor(color, false); // Passa false para indicar que é o clique do jogador
        
        // Verificar se a cor está correta
        const currentIndex = this.gameState.playerSequence.length - 1;
        const expectedColor = this.gameState.sequence[currentIndex];
        
        if (color !== expectedColor) {
            // Cor errada - game over
            console.log('Cor errada! Game over.');
            this.gameOver();
            return;
        }
        
        // Cor correta
        console.log('Cor correta!');
        
        // Verificar se completou a sequência
        if (this.gameState.playerSequence.length === this.gameState.sequence.length) {
            // Sequência completa - próximo nível
            this.gameState.isPlayerTurn = false;
            this.gameState.level++;
            this.gameState.score += this.config.pointsPerLevel;
            
            this.elements.statusMessage.textContent = 'Perfeito! Preparando próximo nível...';
            
            // Vibração de sucesso
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
            
            setTimeout(() => this.nextRound(), 1500);
        }
    }

    gameOver() {
        console.log('Game Over!');
        
        this.gameState.isPlaying = false;
        this.gameState.isPlayerTurn = false;
        
        // Tocar som de game over
        this.sounds.gameOver.play();

        // Vibração de game over
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
        
        // Atualizar estatísticas finais
        this.elements.finalScore.textContent = this.gameState.score;
        this.elements.finalLevel.textContent = this.gameState.level;
        
        // Mensagem de performance
        let message = '';
        if (this.gameState.level <= 3) {
            message = 'Continue tentando! Você pode fazer melhor.';
        } else if (this.gameState.level <= 7) {
            message = 'Bom trabalho! Sua memória está melhorando.';
        } else if (this.gameState.level <= 12) {
            message = 'Impressionante! Você tem uma ótima memória.';
        } else {
            message = 'Incrível! Você é um mestre das cores!';
        }
        this.elements.performanceMessage.textContent = message;
        
        // Mostrar tela de game over
        setTimeout(() => this.showScreen('gameover'), 1000);
    }

    pauseGame() {
        if (!this.gameState.isPlaying || this.gameState.isPaused) return;
        
        console.log('Jogo pausado');
        
        this.gameState.isPaused = true;
        this.gameState.isPlayerTurn = false;
        
        // Atualizar estatísticas da pausa
        this.elements.pauseScore.textContent = this.gameState.score;
        this.elements.pauseLevel.textContent = this.gameState.level;
        
        this.showScreen('pause');
    }

    resumeGame() {
        if (!this.gameState.isPaused) return;
        
        console.log('Jogo retomado');
        
        this.gameState.isPaused = false;
        this.showScreen('game');
        
        // Retomar o turno do jogador se estava no meio de uma sequência
        if (this.gameState.playerSequence.length < this.gameState.sequence.length) {
            this.gameState.isPlayerTurn = true;
            this.elements.statusMessage.textContent = 'Sua vez! Continue a sequência.';
        }
    }

    updateUI() {
        // Atualizar pontuação e nível
        if (this.elements.score) {
            this.elements.score.textContent = this.gameState.score;
        }
        if (this.elements.level) {
            this.elements.level.textContent = this.gameState.level;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar o jogo quando o script for carregado
console.log('Script do jogo carregado');

// Criar instância global do jogo
let game;

// Aguardar DOM estar pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM carregado, inicializando jogo...');
        game = new RastroDeCores();
    });
} else {
    console.log('DOM já carregado, inicializando jogo...');
    game = new RastroDeCores();
}

// Expor para debug (opcional)
window.game = game;

