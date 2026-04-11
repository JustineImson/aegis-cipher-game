import { 
  caesarCipher, 
  atbashCipher, 
  vigenereCipher, 
  columnarTranspositionCipher, 
  railFenceCipher 
} from './cipherAlgorithms.js';

/**
 * Randomly select a cipher method based on difficulty
 * @param {string} difficulty 
 * @returns {object} { name: string, applyCipher: function }
 */
export function selectCipherMethod(difficulty = 'easy') {
  const normDifficulty = difficulty.toLowerCase();
  let choices = [];

  if (normDifficulty === 'easy') {
    const shift = Math.floor(Math.random() * 25) + 1;
    choices = [
      { name: 'Caesar Shift', key: `Shift: ${shift}`, applyCipher: (text) => caesarCipher(text, shift) },
      { name: 'Atbash', key: 'Standard', applyCipher: (text) => atbashCipher(text) }
    ];
  } else if (normDifficulty === 'medium') {
    choices = [
      { name: 'Rail Fence', key: 'Rails: 3', applyCipher: (text) => railFenceCipher(text, 3) }
    ];
  } else if (normDifficulty === 'hard') {
    choices = [
      { name: 'Vigenere', key: 'Keyword: MYSTERY', applyCipher: (text) => vigenereCipher(text, 'MYSTERY') },
      { name: 'Columnar', key: 'Keyword: TIME', applyCipher: (text) => columnarTranspositionCipher(text, 'TIME') }
    ];
  } else {
    // fallback
    choices = [
      { name: 'Caesar Shift', key: 'Shift: 5', applyCipher: (text) => caesarCipher(text, 5) }
    ];
  }

  // Randomly pick one from the choices
  const selection = choices[Math.floor(Math.random() * choices.length)];
  return selection;
}

/**
 * Compares user input securely against the actual decrypted term
 * @param {string} userInput 
 * @param {string} actualTerm 
 * @returns {boolean}
 */
export function validateAnswer(userInput, actualTerm) {
  // Strict string sanitization:
  // 1. Remove all spaces and non-alphanumeric characters.
  // 2. Convert to uppercase for case-insensitivity.
  const sanitize = (str) => {
    if (!str) return '';
    return str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  };

  const cleanInput = sanitize(userInput);
  const cleanActual = sanitize(actualTerm);

  // Guard against empty strings
  if (cleanInput === '' || cleanActual === '') return false;

  return cleanInput === cleanActual;
}
