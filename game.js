class Iconle {
    constructor() {
        this.maxGuesses = 6;
        this.guessesLeft = this.maxGuesses;
        this.wrongGuesses = [];
        this.currentBrand = null;
        this.gameOver = false;
        this.won = false;
        this.zoomLevels = [100, 98, 96, 94, 92, 90, 88];
        this.currentZoom = 0;
        this.allBrands = [];
        this.blurLevels = [35, 33, 31, 29, 27, 25, 23];
        this.gamesPlayed = 0;

        this.initializeElements();
        this.loadBrands();
        this.startNewGame();
        this.setupEventListeners();
    }

    initializeElements() {
        this.iconImage = document.getElementById('iconImage');
        this.guessInput = document.getElementById('guessInput');
        this.submitBtn = document.getElementById('submitBtn');
        this.messageDiv = document.getElementById('message');
        this.guessesLeftSpan = document.getElementById('guessesLeft');
        this.attemptsListDiv = document.getElementById('attemptsList');
        this.zoomPercentSpan = document.getElementById('zoomPercent');
        this.newGameBtn = document.getElementById('newGameBtn');
    }

    async loadBrands() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            this.allBrands = data.brands;
        } catch (error) {
            console.error('Error loading brands:', error);
            // Fallback brands if file doesn't load
            this.allBrands = [
                {
                    id: 1,
                    name: 'Google',
                    icon: 'https://www.google.com/favicon.ico',
                    aliases: ['google', 'search']
                },
                {
                    id: 2,
                    name: 'Apple',
                    icon: 'https://www.apple.com/favicon.ico',
                    aliases: ['apple', 'ios']
                }
            ];
        }
    }

    setupEventListeners() {
        this.submitBtn.addEventListener('click', () => this.makeGuess());
        this.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.makeGuess();
        });
    }

    startNewGame() {
        if (this.allBrands.length === 0) {
            // Wait for brands to load
            setTimeout(() => this.startNewGame(), 100);
            return;
        }

        this.guessesLeft = this.maxGuesses;
        this.wrongGuesses = [];
        this.currentZoom = 0;
        this.gameOver = false;
        this.won = false;

        // Pick a random brand
        this.currentBrand = this.allBrands[Math.floor(Math.random() * this.allBrands.length)];

        this.updateDisplay();
        this.guessInput.disabled = false;
        this.submitBtn.disabled = false;
        this.guessInput.value = '';
        this.guessInput.focus();
        this.messageDiv.textContent = '';
        this.messageDiv.className = '';
        this.newGameBtn.classList.add('hidden');
    }

    makeGuess() {
        if (this.gameOver) return;

        const guess = this.guessInput.value.trim().toLowerCase();

        if (!guess) {
            this.showMessage('Enter a guess!', 'info');
            return;
        }

        this.guessInput.value = '';

        // Check if guess is correct
        const isCorrect =
            guess === this.currentBrand.name.toLowerCase() ||
            this.currentBrand.aliases.includes(guess);

        if (isCorrect) {
            this.won = true;
            this.gameOver = true;
            this.showMessage(`🎉 Correct! It's ${this.currentBrand.name}!`, 'success');
            this.guessInput.disabled = true;
            this.submitBtn.disabled = true;
            
            // Auto-start new game after 2 seconds
            setTimeout(() => this.startNewGame(), 2000);
            return;
        }

        // Wrong guess
        this.wrongGuesses.push(guess);
        this.guessesLeft--;

        if (this.guessesLeft > 0) {
            // Zoom in
            this.currentZoom = Math.min(this.currentZoom + 1, this.zoomLevels.length - 1);
            this.showMessage(`Wrong! Guess again.`, 'error');
        } else {
            // Game over - lost
            this.gameOver = true;
            this.showMessage(`💔 Game Over! It was ${this.currentBrand.name}.`, 'error');
            this.guessInput.disabled = true;
            this.submitBtn.disabled = true;

            // Reveal full icon
            this.currentZoom = this.zoomLevels.length - 1;

            // Auto-start new game after 2 seconds
            setTimeout(() => this.startNewGame(), 2000);
        }

        this.updateDisplay();
    }

    showMessage(text, className) {
        this.messageDiv.textContent = text;
        this.messageDiv.className = `message ${className}`;
    }

    updateDisplay() {
        // Update icon with zoom/blur
        this.updateIconDisplay();

        // Update guesses left
        this.guessesLeftSpan.textContent = this.guessesLeft;

        // Update attempts list
        this.updateAttemptsList();

        // Update zoom percentage
        const zoomPercent = this.zoomLevels[this.currentZoom];
        this.zoomPercentSpan.textContent = zoomPercent;
    }

    updateIconDisplay() {
        this.iconImage.src = this.currentBrand.icon;
        this.iconImage.alt = `Mystery icon - zoomed to ${this.zoomLevels[this.currentZoom]}%`;

        // Apply blur based on current zoom level
        const blurAmount = this.blurLevels[this.currentZoom];
        this.iconImage.style.filter = `blur(${blurAmount}px)`;
    }

    updateAttemptsList() {
        this.attemptsListDiv.innerHTML = '';

        this.wrongGuesses.forEach((guess) => {
            const attemptEl = document.createElement('div');
            attemptEl.className = 'attempt wrong';
            attemptEl.textContent = `✗ ${guess}`;
            this.attemptsListDiv.appendChild(attemptEl);
        });
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Iconle();
});
