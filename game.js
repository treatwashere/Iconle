class Iconle {
      constructor() {
              this.baseMaxGuesses = 6;
              this.hardModeMaxGuesses = 4;
              this.hardMode = localStorage.getItem('iconleHardMode') === 'true';
              this.maxGuesses = this.hardMode ? this.hardModeMaxGuesses : this.baseMaxGuesses;
              this.guessesLeft = this.maxGuesses;
              this.wrongGuesses = [];
              this.currentBrand = null;
              this.gameOver = false;
              this.won = false;
              this.currentZoom = 0;
              this.allBrands = [];
              this.mode = 'daily';
              this.dailyRecorded = false;
              this.countdownTimer = null;
              this.toastTimer = null;
              this.autoAdvanceTimer = null;

        this.setupLevels();
              this.initializeElements();
              this.applyDarkModePreference();
              this.setupEventListeners();
              this.loadBrands().then(() => this.startGame());
              this.maybeShowHelp();
      }

  setupLevels() {
          this.zoomLevels = this.computeLevels(100, 88, this.maxGuesses);
          this.blurLevels = this.computeLevels(12, 0, this.maxGuesses);
  }

  computeLevels(start, end, steps) {
          const arr = [];
          for (let i = 0; i <= steps; i++) {
                    arr.push(Math.round(start + (end - start) * (i / steps)));
          }
          return arr;
  }

  initializeElements() {
          this.iconImage = document.getElementById('iconImage');
          this.guessInput = document.getElementById('guessInput');
          this.submitBtn = document.getElementById('submitBtn');
          this.messageDiv = document.getElementById('message');
          this.guessesLeftSpan = document.getElementById('guessesLeft');
          this.maxGuessesSpan = document.getElementById('maxGuessesLabel');
          this.attemptsListDiv = document.getElementById('attemptsList');
          this.zoomPercentSpan = document.getElementById('zoomPercent');
          this.newGameBtn = document.getElementById('newGameBtn');

        this.dailyModeBtn = document.getElementById('dailyModeBtn');
          this.practiceModeBtn = document.getElementById('practiceModeBtn');
          this.hardModeToggle = document.getElementById('hardModeToggle');

        this.helpBtn = document.getElementById('helpBtn');
          this.helpModal = document.getElementById('helpModal');
          this.closeHelpBtn = document.getElementById('closeHelpBtn');

        this.statsBtn = document.getElementById('statsBtn');
          this.statsModal = document.getElementById('statsModal');
          this.closeStatsBtn = document.getElementById('closeStatsBtn');
          this.statPlayed = document.getElementById('statPlayed');
          this.statWinPct = document.getElementById('statWinPct');
          this.statStreak = document.getElementById('statStreak');
          this.statMaxStreak = document.getElementById('statMaxStreak');
          this.guessDistributionDiv = document.getElementById('guessDistribution');
          this.countdownSpan = document.getElementById('countdown');
          this.shareBtn = document.getElementById('shareBtn');

        this.darkModeBtn = document.getElementById('darkModeBtn');
          this.toastDiv = document.getElementById('toast');

        if (this.hardModeToggle) this.hardModeToggle.checked = this.hardMode;
  }

  setupEventListeners() {
          this.submitBtn.addEventListener('click', () => this.makeGuess());
          this.guessInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.makeGuess();
          });
          this.newGameBtn.addEventListener('click', () => this.startGame());

        this.dailyModeBtn.addEventListener('click', () => this.setMode('daily'));
          this.practiceModeBtn.addEventListener('click', () => this.setMode('practice'));
          this.hardModeToggle.addEventListener('change', (e) => this.handleHardModeToggle(e.target.checked));

        this.helpBtn.addEventListener('click', () => this.openModal(this.helpModal));
          this.closeHelpBtn.addEventListener('click', () => this.closeModal(this.helpModal));

        this.statsBtn.addEventListener('click', () => this.openStats());
          this.closeStatsBtn.addEventListener('click', () => this.closeModal(this.statsModal, true));

        this.shareBtn.addEventListener('click', () => this.shareResults());

        this.darkModeBtn.addEventListener('click', () => this.toggleDarkMode());

        [this.helpModal, this.statsModal].forEach((modal) => {
                  modal.addEventListener('click', (e) => {
                              if (e.target === modal) this.closeModal(modal, modal === this.statsModal);
                  });
        });
  }

  async loadBrands() {
          try {
                    const response = await fetch('data.json');
                    const data = await response.json();
                    this.allBrands = data.brands;
          } catch (error) {
                    console.error('Error loading brands:', error);
                    this.allBrands = [
                        { id: 1, name: 'Google', icon: 'https://www.google.com/favicon.ico', aliases: ['google', 'search'] },
                        { id: 2, name: 'Apple', icon: 'https://www.apple.com/favicon.ico', aliases: ['apple', 'ios'] }
                              ];
          }
  }

  getTodayKey() {
          const now = new Date();
          return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  getDailyBrand() {
          const start = new Date(2024, 0, 1);
          const now = new Date();
          const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
          const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const daysSince = Math.floor((todayMidnight - startMidnight) / 86400000);
          const index = ((daysSince % this.allBrands.length) + this.allBrands.length) % this.allBrands.length;
          return this.allBrands[index];
  }

  setMode(mode) {
          if (this.mode === mode) return;
          this.mode = mode;
          this.dailyModeBtn.classList.toggle('active', mode === 'daily');
          this.practiceModeBtn.classList.toggle('active', mode === 'practice');
          this.startGame();
  }

  handleHardModeToggle(checked) {
          if (this.mode === 'daily') {
                    const saved = this.getDailyState();
                    const inProgress = saved && saved.date === this.getTodayKey() && (saved.wrongGuesses.length > 0 || saved.gameOver);
                    if (inProgress) {
                                this.hardModeToggle.checked = this.hardMode;
                                this.showToast("Hard mode can only change before today's puzzle starts.");
                                return;
                    }
          } else if (this.wrongGuesses.length > 0 && !this.gameOver) {
                    this.hardModeToggle.checked = this.hardMode;
                    this.showToast('Hard mode can only change at the start of a game.');
                    return;
          }
          this.hardMode = checked;
          localStorage.setItem('iconleHardMode', checked);
          this.maxGuesses = checked ? this.hardModeMaxGuesses : this.baseMaxGuesses;
          this.setupLevels();
          this.startGame();
  }

  startGame() {
          if (this.allBrands.length === 0) {
                    setTimeout(() => this.startGame(), 100);
                    return;
          }

        clearTimeout(this.autoAdvanceTimer);
          this.newGameBtn.classList.toggle('hidden', this.mode !== 'practice');

        if (this.mode === 'daily') {
                  const saved = this.getDailyState();
                  if (saved && saved.date === this.getTodayKey()) {
                              this.restoreDailyState(saved);
                              return;
                  }
                  this.currentBrand = this.getDailyBrand();
        } else {
                  this.currentBrand = this.allBrands[Math.floor(Math.random() * this.allBrands.length)];
        }

        this.guessesLeft = this.maxGuesses;
          this.wrongGuesses = [];
          this.currentZoom = 0;
          this.gameOver = false;
          this.won = false;
          this.dailyRecorded = false;

        this.updateDisplay();
          this.guessInput.disabled = false;
          this.submitBtn.disabled = false;
          this.guessInput.value = '';
          this.guessInput.focus();
          this.messageDiv.textContent = '';
          this.messageDiv.className = 'message';
  }

  restoreDailyState(saved) {
          this.currentBrand = this.allBrands.find((b) => b.id === saved.brandId) || this.getDailyBrand();
          this.wrongGuesses = saved.wrongGuesses || [];
          this.guessesLeft = Math.max(0, this.maxGuesses - this.wrongGuesses.length);
          this.gameOver = saved.gameOver;
          this.won = saved.won;
          this.dailyRecorded = saved.recorded || false;
          this.currentZoom = Math.min(this.wrongGuesses.length, this.zoomLevels.length - 1);

        this.updateDisplay();

        if (this.gameOver) {
                  this.guessInput.disabled = true;
                  this.submitBtn.disabled = true;
                  this.messageDiv.textContent = this.won
                    ? `Correct! It's ${this.currentBrand.name}!`
                              : `It was ${this.currentBrand.name}. Come back tomorrow!`;
                  this.messageDiv.className = `message ${this.won ? 'success' : 'error'}`;
        } else {
                  this.guessInput.disabled = false;
                  this.submitBtn.disabled = false;
                  this.guessInput.value = '';
                  this.guessInput.focus();
                  this.messageDiv.textContent = '';
                  this.messageDiv.className = 'message';
        }
  }

  getDailyState() {
          try {
                    const raw = localStorage.getItem('iconleDailyState');
                    return raw ? JSON.parse(raw) : null;
          } catch (e) {
                    return null;
          }
  }

  saveDailyState() {
          const state = {
                    date: this.getTodayKey(),
                    brandId: this.currentBrand.id,
                    wrongGuesses: this.wrongGuesses,
                    gameOver: this.gameOver,
                    won: this.won,
                    recorded: this.dailyRecorded
          };
          localStorage.setItem('iconleDailyState', JSON.stringify(state));
  }

  makeGuess() {
          if (this.gameOver) return;

        const guess = this.guessInput.value.trim().toLowerCase();

        if (!guess) {
                  this.showMessage('Enter a guess!', 'info');
                  return;
        }

        if (this.wrongGuesses.includes(guess)) {
                  this.guessInput.value = '';
                  this.showMessage('You already tried that!', 'info');
                  return;
        }

        this.guessInput.value = '';

        const isCorrect =
                  guess === this.currentBrand.name.toLowerCase() ||
                  this.currentBrand.aliases.includes(guess);

        if (isCorrect) {
                  this.won = true;
                  this.gameOver = true;
                  this.showMessage(`Correct! It's ${this.currentBrand.name}!`, 'success');
                  this.guessInput.disabled = true;
                  this.submitBtn.disabled = true;
                  this.finishGame();
                  return;
        }

        this.wrongGuesses.push(guess);
          this.guessesLeft--;

        if (this.guessesLeft > 0) {
                  this.currentZoom = Math.min(this.currentZoom + 1, this.zoomLevels.length - 1);
                  this.showMessage('Wrong! Guess again.', 'error');
                  this.updateDisplay();
                  if (this.mode === 'daily') this.saveDailyState();
        } else {
                  this.gameOver = true;
                  this.showMessage(`Game Over! It was ${this.currentBrand.name}.`, 'error');
                  this.guessInput.disabled = true;
                  this.submitBtn.disabled = true;
                  this.currentZoom = this.zoomLevels.length - 1;
                  this.updateDisplay();
                  this.finishGame();
        }
  }

  finishGame() {
          this.updateDisplay();
          if (this.mode === 'daily') {
                    this.recordDailyResult();
                    this.saveDailyState();
                    this.autoAdvanceTimer = setTimeout(() => this.openStats(), 1500);
          } else {
                    this.autoAdvanceTimer = setTimeout(() => this.startGame(), 2000);
          }
  }

  recordDailyResult() {
          if (this.dailyRecorded) return;

        const stats = this.getStats();
          stats.played += 1;
          if (this.won) {
                    stats.won += 1;
                    stats.currentStreak += 1;
                    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
                    const guessesUsed = this.wrongGuesses.length + 1;
                    stats.distribution[guessesUsed - 1] = (stats.distribution[guessesUsed - 1] || 0) + 1;
          } else {
                    stats.currentStreak = 0;
          }
          this.saveStats(stats);
          this.dailyRecorded = true;
  }

  getStats() {
          try {
                    const raw = localStorage.getItem('iconleStats');
                    if (raw) return JSON.parse(raw);
          } catch (e) {
                    // ignore
          }
          return { played: 0, won: 0, currentStreak: 0, maxStreak: 0, distribution: [0, 0, 0, 0, 0, 0] };
  }

  saveStats(stats) {
          localStorage.setItem('iconleStats', JSON.stringify(stats));
  }

  showMessage(text, className) {
          this.messageDiv.textContent = text;
          this.messageDiv.className = `message ${className}`;
  }

  updateDisplay() {
          this.updateIconDisplay();
          this.guessesLeftSpan.textContent = this.guessesLeft;
          if (this.maxGuessesSpan) this.maxGuessesSpan.textContent = this.maxGuesses;
          this.updateAttemptsList();
          const zoomPercent = this.zoomLevels[this.currentZoom];
          this.zoomPercentSpan.textContent = zoomPercent;
  }

  updateIconDisplay() {
          this.iconImage.src = this.currentBrand.icon;
          this.iconImage.alt = `Mystery icon - zoomed to ${this.zoomLevels[this.currentZoom]}%`;
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

  maybeShowHelp() {
          if (localStorage.getItem('iconleSeenHelp') !== 'true') {
                    this.openModal(this.helpModal);
                    localStorage.setItem('iconleSeenHelp', 'true');
          }
  }

  openModal(modal) {
          modal.classList.remove('hidden');
  }

  closeModal(modal, stopCountdown) {
          modal.classList.add('hidden');
          if (stopCountdown && this.countdownTimer) {
                    clearInterval(this.countdownTimer);
                    this.countdownTimer = null;
          }
  }

  openStats() {
          const stats = this.getStats();
          this.statPlayed.textContent = stats.played;
          this.statWinPct.textContent = stats.played ? Math.round((stats.won / stats.played) * 100) : 0;
          this.statStreak.textContent = stats.currentStreak;
          this.statMaxStreak.textContent = stats.maxStreak;

        this.renderDistribution(stats.distribution);
          this.startCountdown();
          this.openModal(this.statsModal);
  }

  renderDistribution(distribution) {
          this.guessDistributionDiv.innerHTML = '';
          const max = Math.max(1, ...distribution);
          distribution.forEach((count, i) => {
                    const row = document.createElement('div');
                    row.className = 'distribution-row';

                                     const label = document.createElement('span');
                    label.className = 'distribution-label';
                    label.textContent = i + 1;

                                     const barWrap = document.createElement('div');
                    barWrap.className = 'distribution-bar-wrap';
                    const bar = document.createElement('div');
                    bar.className = 'distribution-bar';
                    bar.style.width = `${Math.max(8, (count / max) * 100)}%`;
                    bar.textContent = count;
                    barWrap.appendChild(bar);

                                     row.appendChild(label);
                    row.appendChild(barWrap);
                    this.guessDistributionDiv.appendChild(row);
          });
  }

  startCountdown() {
          if (this.countdownTimer) clearInterval(this.countdownTimer);
          const update = () => {
                    const now = new Date();
                    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                    const diff = next - now;
                    const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
                    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
                    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
                    this.countdownSpan.textContent = `${h}:${m}:${s}`;
          };
          update();
          this.countdownTimer = setInterval(update, 1000);
  }

  shareResults() {
          if (!this.gameOver) {
                    this.showToast('Finish the round first!');
                    return;
          }
          const total = this.maxGuesses;
          const used = this.won ? this.wrongGuesses.length + 1 : total;
          let squares = '';
          for (let i = 0; i < total; i++) {
                    if (i < this.wrongGuesses.length) squares += '⬛';
                    else if (this.won && i === this.wrongGuesses.length) squares += '🟩';
                    else squares += '⬜';
          }
          const scoreLabel = this.won ? `${used}/${total}` : `X/${total}`;
          const modeLabel = this.mode === 'daily' ? 'Daily' : 'Practice';
          const text = `Iconle ${modeLabel} ${this.getTodayKey()} ${scoreLabel}\n${squares}`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(text).then(
                              () => this.showToast('Copied results to clipboard!'),
                              () => this.showToast('Could not copy automatically.')
                            );
        } else {
                  this.showToast('Clipboard not available.');
        }
  }

  showToast(message, duration = 2500) {
          this.toastDiv.textContent = message;
          this.toastDiv.classList.remove('hidden');
          clearTimeout(this.toastTimer);
          this.toastTimer = setTimeout(() => this.toastDiv.classList.add('hidden'), duration);
  }

  applyDarkModePreference() {
          const isDark = localStorage.getItem('iconleDarkMode') === 'true';
          document.body.classList.toggle('dark-mode', isDark);
          if (this.darkModeBtn) this.darkModeBtn.textContent = isDark ? '☀️' : '🌙';
  }

  toggleDarkMode() {
          const isDark = !document.body.classList.contains('dark-mode');
          document.body.classList.toggle('dark-mode', isDark);
          localStorage.setItem('iconleDarkMode', isDark);
          this.darkModeBtn.textContent = isDark ? '☀️' : '🌙';
  }
}

document.addEventListener('DOMContentLoaded', () => {
      new Iconle();
});
