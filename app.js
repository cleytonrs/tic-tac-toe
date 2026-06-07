// --- App Controller ---
(function() {
  'use strict';

  // --- State ---
  var sessionState = {
    playerXName: 'Player X',
    playerOName: 'Player O',
    scores: { playerXWins: 0, playerOWins: 0, draws: 0 },
    roundNumber: 1,
    gameState: {
      board: [null, null, null, null, null, null, null, null, null],
      currentMark: 'X',
      roundStartingMark: 'X',
      isRoundOver: false,
      winningCells: null
    }
  };

  // --- DOM Elements ---
  var screens = {
    start: document.getElementById('screen-start'),
    game: document.getElementById('screen-game'),
    result: document.getElementById('screen-result'),
    end: document.getElementById('screen-end')
  };

  var playerXInput = document.getElementById('player-x-name');
  var playerOInput = document.getElementById('player-o-name');
  var btnStart = document.getElementById('btn-start');
  var turnIndicator = document.getElementById('turn-indicator');
  var gameBoard = document.getElementById('game-board');
  var cells = document.querySelectorAll('.cell');
  var resultText = document.getElementById('result-text');
  var btnPlayAgain = document.getElementById('btn-play-again');
  var btnFinish = document.getElementById('btn-finish');
  var btnShare = document.getElementById('btn-share');
  var btnNewGame = document.getElementById('btn-new-game');
  var btnCloseShare = document.getElementById('btn-close-share');
  var shareDialog = document.getElementById('share-dialog');
  var shareTextDisplay = document.getElementById('share-text-display');
  var shareTwitter = document.getElementById('share-twitter');
  var shareFacebook = document.getElementById('share-facebook');
  var shareCopiedMsg = document.getElementById('share-copied-msg');

  // Scoreboard elements (game screen)
  var scoreXName = document.getElementById('score-x-name');
  var scoreOName = document.getElementById('score-o-name');
  var scoreXWins = document.getElementById('score-x-wins');
  var scoreOWins = document.getElementById('score-o-wins');
  var scoreDraws = document.getElementById('score-draws');

  // Final scoreboard elements (end screen)
  var finalXName = document.getElementById('final-x-name');
  var finalOName = document.getElementById('final-o-name');
  var finalXWins = document.getElementById('final-x-wins');
  var finalOWins = document.getElementById('final-o-wins');
  var finalDraws = document.getElementById('final-draws');

  // --- Screen Manager ---
  var currentScreen = 'start';

  function transitionTo(screen) {
    screens[currentScreen].classList.remove('active');
    screens[screen].classList.add('active');
    currentScreen = screen;
  }

  // --- Score Manager ---
  var scoreManager = createScoreManager();

  function updateScoreboardUI() {
    var scores = scoreManager.getScores();
    sessionState.scores = scores;

    scoreXName.textContent = sessionState.playerXName;
    scoreOName.textContent = sessionState.playerOName;
    scoreXWins.textContent = scores.playerXWins;
    scoreOWins.textContent = scores.playerOWins;
    scoreDraws.textContent = scores.draws;
  }

  function updateFinalScoreboard() {
    var scores = scoreManager.getScores();
    finalXName.textContent = sessionState.playerXName;
    finalOName.textContent = sessionState.playerOName;
    finalXWins.textContent = scores.playerXWins;
    finalOWins.textContent = scores.playerOWins;
    finalDraws.textContent = scores.draws;
  }

  // --- Turn Indicator ---
  function updateTurnIndicator() {
    var gs = sessionState.gameState;
    var name = gs.currentMark === 'X' ? sessionState.playerXName : sessionState.playerOName;
    turnIndicator.textContent = name + "'s turn (" + gs.currentMark + ")";
  }

  // --- Board Rendering ---
  function renderBoard() {
    var gs = sessionState.gameState;
    cells.forEach(function(cell, i) {
      var mark = gs.board[i];
      cell.textContent = mark || '';
      cell.classList.toggle('mark-x', mark === 'X');
      cell.classList.toggle('mark-o', mark === 'O');
      cell.classList.toggle('winning', gs.winningCells !== null && gs.winningCells.includes(i));
      cell.disabled = gs.isRoundOver || mark !== null;
    });
  }

  // --- Game Logic ---
  function handleCellClick(e) {
    var cell = e.target;
    if (!cell.classList.contains('cell')) return;
    var index = Number.parseInt(cell.dataset.index, 10);
    var gs = sessionState.gameState;

    if (gs.isRoundOver) return;

    var newBoard = placeMark(gs.board, index, gs.currentMark);
    if (newBoard === null) return;

    gs.board = newBoard;

    // Check for win
    var winResult = checkWinner(gs.board);
    if (winResult) {
      gs.isRoundOver = true;
      gs.winningCells = winResult.winningCells;
      scoreManager.incrementWin(winResult.winner);
      updateScoreboardUI();
      renderBoard();

      var winnerName = winResult.winner === 'X' ? sessionState.playerXName : sessionState.playerOName;
      resultText.textContent = winnerName + ' wins!';
      setTimeout(function() { transitionTo('result'); }, 600);
      return;
    }

    // Check for draw
    if (checkDraw(gs.board)) {
      gs.isRoundOver = true;
      scoreManager.incrementDraw();
      updateScoreboardUI();
      renderBoard();

      resultText.textContent = "It's a Draw!";
      setTimeout(function() { transitionTo('result'); }, 600);
      return;
    }

    // Switch turn
    gs.currentMark = getNextMark(gs.currentMark);
    updateTurnIndicator();
    renderBoard();
  }

  // --- Event Bindings ---

  // Start Screen
  btnStart.addEventListener('click', function() {
    sessionState.playerXName = validatePlayerName(playerXInput.value, 'Player X');
    sessionState.playerOName = validatePlayerName(playerOInput.value, 'Player O');

    // Reset game state for first round
    sessionState.gameState = createInitialGameState('X');
    sessionState.roundNumber = 1;
    scoreManager.reset();

    updateScoreboardUI();
    updateTurnIndicator();
    renderBoard();
    transitionTo('game');
  });

  // Name input enforcement
  playerXInput.addEventListener('input', function() {
    enforceMaxLength(playerXInput, 20);
  });
  playerOInput.addEventListener('input', function() {
    enforceMaxLength(playerOInput, 20);
  });

  // Game Board
  gameBoard.addEventListener('click', handleCellClick);

  // Result Screen
  btnPlayAgain.addEventListener('click', function() {
    sessionState.gameState = resetForNewRound(sessionState.gameState);
    sessionState.roundNumber++;
    updateTurnIndicator();
    renderBoard();
    transitionTo('game');
  });

  btnFinish.addEventListener('click', function() {
    updateFinalScoreboard();
    transitionTo('end');
  });

  // End Screen
  btnShare.addEventListener('click', function() {
    var text = generateShareText(sessionState.playerXName, sessionState.playerOName, scoreManager.getScores());
    shareTextDisplay.textContent = text;
    shareTwitter.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
    shareFacebook.href = 'https://www.facebook.com/sharer/sharer.php?quote=' + encodeURIComponent(text);
    shareCopiedMsg.classList.add('hidden');
    shareDialog.classList.remove('hidden');
  });

  shareTwitter.addEventListener('click', function(e) {
    e.preventDefault();
    var win = window.open(this.href, '_blank');
    if (win === null) {
      copyFallback();
    }
  });

  shareFacebook.addEventListener('click', function(e) {
    e.preventDefault();
    var win = window.open(this.href, '_blank');
    if (win === null) {
      copyFallback();
    }
  });

  function copyFallback() {
    var text = shareTextDisplay.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        shareCopiedMsg.textContent = 'Copied to clipboard!';
        shareCopiedMsg.classList.remove('hidden');
      }).catch(function() {
        shareCopiedMsg.textContent = 'Could not copy. Please copy manually.';
        shareCopiedMsg.classList.remove('hidden');
      });
    } else {
      shareCopiedMsg.textContent = 'Could not copy. Please copy manually.';
      shareCopiedMsg.classList.remove('hidden');
    }
  }

  btnCloseShare.addEventListener('click', function() {
    shareDialog.classList.add('hidden');
  });

  btnNewGame.addEventListener('click', function() {
    scoreManager.reset();
    sessionState.gameState = createInitialGameState('X');
    sessionState.roundNumber = 1;
    sessionState.playerXName = 'Player X';
    sessionState.playerOName = 'Player O';
    playerXInput.value = 'Player X';
    playerOInput.value = 'Player O';
    shareDialog.classList.add('hidden');
    transitionTo('start');
  });

})();
