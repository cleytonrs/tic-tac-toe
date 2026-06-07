import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';

// Read the HTML file
const htmlPath = path.resolve(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

describe('Start Screen', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM(htmlContent, { runScripts: 'dangerously', resources: 'usable', url: 'http://localhost' });
    document = dom.window.document;
  });

  it('displays the game title "Tic Tac Toe"', () => {
    const title = document.querySelector('.game-title');
    expect(title).not.toBeNull();
    expect(title!.textContent).toBe('Tic Tac Toe');
  });

  it('displays a visible and enabled "Start Game" button', () => {
    const btn = document.getElementById('btn-start');
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toBe('Start Game');
    expect((btn as HTMLButtonElement).disabled).toBe(false);
  });

  it('shows editable name fields with default values', () => {
    const playerX = document.getElementById('player-x-name') as HTMLInputElement;
    const playerO = document.getElementById('player-o-name') as HTMLInputElement;
    expect(playerX).not.toBeNull();
    expect(playerO).not.toBeNull();
    expect(playerX.value).toBe('Player X');
    expect(playerO.value).toBe('Player O');
  });

  it('has maxlength=20 on name input fields', () => {
    const playerX = document.getElementById('player-x-name') as HTMLInputElement;
    const playerO = document.getElementById('player-o-name') as HTMLInputElement;
    expect(playerX.getAttribute('maxlength')).toBe('20');
    expect(playerO.getAttribute('maxlength')).toBe('20');
  });

  it('start screen is initially active', () => {
    const startScreen = document.getElementById('screen-start');
    expect(startScreen!.classList.contains('active')).toBe(true);
  });

  it('other screens are initially hidden', () => {
    const gameScreen = document.getElementById('screen-game');
    const resultScreen = document.getElementById('screen-result');
    const endScreen = document.getElementById('screen-end');
    expect(gameScreen!.classList.contains('active')).toBe(false);
    expect(resultScreen!.classList.contains('active')).toBe(false);
    expect(endScreen!.classList.contains('active')).toBe(false);
  });
});

describe('Game Board Structure', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM(htmlContent, { runScripts: 'dangerously', resources: 'usable', url: 'http://localhost' });
    document = dom.window.document;
  });

  it('has a 3x3 grid of 9 cells', () => {
    const cells = document.querySelectorAll('.cell');
    expect(cells.length).toBe(9);
  });

  it('each cell has a data-index attribute from 0-8', () => {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, i) => {
      expect(cell.getAttribute('data-index')).toBe(String(i));
    });
  });

  it('has a turn indicator element', () => {
    const indicator = document.getElementById('turn-indicator');
    expect(indicator).not.toBeNull();
  });

  it('has scoreboard elements', () => {
    expect(document.getElementById('score-x-name')).not.toBeNull();
    expect(document.getElementById('score-o-name')).not.toBeNull();
    expect(document.getElementById('score-x-wins')).not.toBeNull();
    expect(document.getElementById('score-o-wins')).not.toBeNull();
    expect(document.getElementById('score-draws')).not.toBeNull();
  });
});

describe('Result Screen Structure', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM(htmlContent, { runScripts: 'dangerously', resources: 'usable', url: 'http://localhost' });
    document = dom.window.document;
  });

  it('has a result text element', () => {
    const resultText = document.getElementById('result-text');
    expect(resultText).not.toBeNull();
  });

  it('has "Play Again" and "Finish Game" buttons', () => {
    const playAgain = document.getElementById('btn-play-again');
    const finish = document.getElementById('btn-finish');
    expect(playAgain).not.toBeNull();
    expect(playAgain!.textContent).toBe('Play Again');
    expect(finish).not.toBeNull();
    expect(finish!.textContent).toBe('Finish Game');
  });
});

describe('End Screen Structure', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM(htmlContent, { runScripts: 'dangerously', resources: 'usable', url: 'http://localhost' });
    document = dom.window.document;
  });

  it('has final scoreboard elements', () => {
    expect(document.getElementById('final-x-name')).not.toBeNull();
    expect(document.getElementById('final-o-name')).not.toBeNull();
    expect(document.getElementById('final-x-wins')).not.toBeNull();
    expect(document.getElementById('final-o-wins')).not.toBeNull();
    expect(document.getElementById('final-draws')).not.toBeNull();
  });

  it('has "Share Results" and "New Game" buttons', () => {
    const share = document.getElementById('btn-share');
    const newGame = document.getElementById('btn-new-game');
    expect(share).not.toBeNull();
    expect(share!.textContent).toBe('Share Results');
    expect(newGame).not.toBeNull();
    expect(newGame!.textContent).toBe('New Game');
  });

  it('has share dialog that is initially hidden', () => {
    const shareDialog = document.getElementById('share-dialog');
    expect(shareDialog).not.toBeNull();
    expect(shareDialog!.classList.contains('hidden')).toBe(true);
  });

  it('share dialog has Twitter and Facebook links and Close button', () => {
    expect(document.getElementById('share-twitter')).not.toBeNull();
    expect(document.getElementById('share-facebook')).not.toBeNull();
    const closeBtn = document.getElementById('btn-close-share');
    expect(closeBtn).not.toBeNull();
    expect(closeBtn!.textContent).toBe('Close');
  });
});

describe('Screen Transitions', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM(htmlContent, { url: 'http://localhost' });
    document = dom.window.document;
  });

  it('all four screens exist in the DOM', () => {
    expect(document.getElementById('screen-start')).not.toBeNull();
    expect(document.getElementById('screen-game')).not.toBeNull();
    expect(document.getElementById('screen-result')).not.toBeNull();
    expect(document.getElementById('screen-end')).not.toBeNull();
  });

  it('screens use CSS class toggling for visibility', () => {
    const startScreen = document.getElementById('screen-start')!;
    // Start screen has the 'active' class by default
    expect(startScreen.classList.contains('active')).toBe(true);
    expect(startScreen.classList.contains('screen')).toBe(true);

    // Other screens have 'screen' class but NOT 'active'
    const gameScreen = document.getElementById('screen-game')!;
    expect(gameScreen.classList.contains('screen')).toBe(true);
    expect(gameScreen.classList.contains('active')).toBe(false);
  });
});

describe('CSS Design Properties', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM(htmlContent, { url: 'http://localhost' });
    document = dom.window.document;
  });

  it('links an external stylesheet', () => {
    const link = document.querySelector('link[rel="stylesheet"]');
    expect(link).not.toBeNull();
    expect(link!.getAttribute('href')).toBe('styles.css');
  });

  it('does not have embedded style tags', () => {
    const styles = document.querySelectorAll('style');
    expect(styles.length).toBe(0);
  });
});
