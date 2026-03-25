import React from 'react';

// ===========================
// Syntax Highlighter (shared)
// ===========================

const KW = new Set([
  'import', 'from', 'export', 'default', 'const', 'let', 'var',
  'function', 'return', 'if', 'else', 'for', 'while', 'class',
  'extends', 'new', 'this', 'typeof', 'interface', 'type', 'as',
  'async', 'await', 'try', 'catch', 'throw', 'switch', 'case',
]);
const LIT = new Set(['true', 'false', 'null', 'undefined']);

// Build regex from parts, avoiding literal regex to prevent tooling escape issues.
// Character codes: 91=[  93=]  45=-  39='  34="  96=`
const SQ = String.fromCharCode(39);
const DQ = String.fromCharCode(34);
const BT = String.fromCharCode(96);
const LB = String.fromCharCode(91);
const RB = String.fromCharCode(93);
const DASH = String.fromCharCode(45);

const COMMENT = '//.*';
const SINGLE_Q = SQ + '[^' + SQ + ']*' + SQ;
const DOUBLE_Q = DQ + '[^' + DQ + ']*' + DQ;
const TMPL_Q = BT + '[^' + BT + ']*' + BT;
const NUMBR = '[0-9]+(?:[.][0-9]+)?';
const IDENT = '[a-zA-Z_$][a-zA-Z0-9_$]*';
// Escape ] [ - inside the character class so the regex engine treats them as literals
const ESC = String.fromCharCode(92); // backslash
const PUNCT = '[' + ESC + RB + '{}();,.:=<>+*/!&|?@#~^%' + ESC + LB + ESC + DASH + ']+';
const SPACER = '[ ' + ESC + 't' + ESC + 'n' + ESC + 'r]+';

const TOKEN_PATTERN = '(' + [COMMENT, SINGLE_Q, DOUBLE_Q, TMPL_Q, NUMBR, IDENT, PUNCT, SPACER].join('|') + ')';
const TOKEN_RE_SRC = TOKEN_PATTERN;

function isComment(s: string) { return s.charCodeAt(0) === 47 && s.charCodeAt(1) === 47; }
function isQuote(s: string) { var c = s.charCodeAt(0); return c === 39 || c === 34 || c === 96; }
function isDigit(s: string) { var c = s.charCodeAt(0); return c >= 48 && c <= 57; }
function isUpper(s: string) { var c = s.charCodeAt(0); return c >= 65 && c <= 90; }

export function highlightLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const re = new RegExp(TOKEN_RE_SRC, 'g');
  let m;
  let k = 0;
  while ((m = re.exec(line)) !== null) {
    const s = m[0];
    if (isComment(s)) tokens.push(<span key={k++} className="text-[#6a737d]">{s}</span>);
    else if (isQuote(s)) tokens.push(<span key={k++} className="text-[#b07d48]">{s}</span>);
    else if (isDigit(s)) tokens.push(<span key={k++} className="text-[#0e7490]">{s}</span>);
    else if (KW.has(s)) tokens.push(<span key={k++} className="text-[#7c3aed]">{s}</span>);
    else if (LIT.has(s)) tokens.push(<span key={k++} className="text-[#0e7490]">{s}</span>);
    else if (isUpper(s)) tokens.push(<span key={k++} className="text-[#0369a1]">{s}</span>);
    else tokens.push(<span key={k++}>{s}</span>);
  }
  return tokens;
}