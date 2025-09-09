// SPDX-License-Identifier: AGPL-3.0-or-later
// Safe, deterministic expression engine (AST parser + interpreter)
// Grammar (subset):
//   Expr  := Term (("+"|"-") Term)*
//   Term  := Power (("*"|"/") Power)*
//   Power := Unary ("^" Unary)*
//   Unary := ("+"|"-")* Primary
//   Primary := Number | Ident | Ident"(" ArgList?")" | "(" Expr ")"
//   ArgList := Expr ("," Expr)*
// Identifiers allowed: t, PI, E, pi, e + whitelisted functions.
// Deterministic only (no random). Unknown id/func -> 0 at runtime.

const FN1: Record<string, (a: number) => number> = {
  abs: Math.abs, acos: Math.acos, acosh: Math.acosh, asin: Math.asin, asinh: Math.asinh,
  atan: Math.atan, atanh: Math.atanh, cbrt: Math.cbrt, ceil: Math.ceil, cos: Math.cos,
  cosh: Math.cosh, exp: Math.exp, expm1: Math.expm1, floor: Math.floor, log: Math.log,
  log10: Math.log10, log1p: Math.log1p, log2: Math.log2, round: Math.round, sign: Math.sign,
  sin: Math.sin, sinh: Math.sinh, sqrt: Math.sqrt, tan: Math.tan, tanh: Math.tanh, trunc: Math.trunc,
  // helpers
  clamp: (x: number) => x, // placeholder for arity check at call time
  easeInOutQuad: (x: number) => {
    const u = Math.max(0, Math.min(1, x));
    return u < 0.5 ? 2*u*u : 1 - Math.pow(-2*u + 2, 2)/2;
  },
};

const FNn: Record<string, (...args: number[]) => number> = {
  atan2: Math.atan2,
  pow: Math.pow,
  max: Math.max,
  min: Math.min,
  hypot: Math.hypot,
  mix: (a: number, b: number, t: number) => a + (b - a) * t,
  clamp: (x: number, lo: number = 0, hi: number = 1) => Math.max(lo, Math.min(hi, x)),
};

const CONSTS: Record<string, number> = { PI: Math.PI, pi: Math.PI, E: Math.E, e: Math.E };

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  const re = /\s*([0-9]*\.?[0-9]+|[A-Za-z_][A-Za-z0-9_]*|\^|\+|\-|\*|\/|\(|\)|,)/gy;
  let m: RegExpExecArray | null; let i = 0;
  while ((m = re.exec(input)) !== null) {
    const pos = m.index;
    if (pos !== i) throw new Error(`Unexpected token near "${input.slice(i, pos)}"`);
    i = re.lastIndex; tokens.push(m[1]);
  }
  if (i !== input.length) throw new Error(`Unexpected token near "${input.slice(i)}"`);
  tokens.push('<eof>');
  return tokens;
}

type AST =
  | { type: 'num'; value: number }
  | { type: 'var'; name: string }
  | { type: 'un'; op: '-'; expr: AST }
  | { type: 'bin'; op: '+'|'-'|'*'|'/'|'^'; left: AST; right: AST }
  | { type: 'call'; name: string; args: AST[] };

function parseExprToAST(src: string): AST {
  const toks = tokenize(src);
  let idx = 0;
  const peek = () => toks[idx];
  const eat = (t: string) => { if (peek() !== t) throw new Error(`Expected '${t}', got '${peek()}'`); idx++; };
  const isNumber = (t: string) => /^(?:\d*\.\d+|\d+)$/.test(t);
  const isIdent = (t: string) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(t);

  function parseExpression(): AST {
    let node = parseTerm();
    while (peek()==='+' || peek()==='-') { const op = peek() as '+'|'-'; idx++; const right = parseTerm(); node = { type: 'bin', op, left: node, right }; }
    return node;
  }
  function parseTerm(): AST {
    let node = parsePower();
    while (peek()==='*' || peek()==='/') { const op = peek() as '*'|'/'; idx++; const right = parsePower(); node = { type: 'bin', op, left: node, right }; }
    return node;
  }
  function parsePower(): AST {
    let node = parseUnary();
    while (peek()==='^') { idx++; const right = parseUnary(); node = { type: 'bin', op: '^', left: node, right }; }
    return node;
  }
  function parseUnary(): AST {
    let sign = 1; while (peek()==='+' || peek()==='-') { if (peek()==='-') sign *= -1; idx++; }
    const p = parsePrimary();
    return sign === -1 ? { type: 'un', op: '-', expr: p } : p;
  }
  function parsePrimary(): AST {
    const t = peek();
    if (t === '(') { idx++; const e = parseExpression(); eat(')'); return e; }
    if (isNumber(t)) { idx++; return { type: 'num', value: parseFloat(t) }; }
    if (isIdent(t)) {
      idx++;
      if (peek() === '(') {
        idx++; const args: AST[] = [];
        if (peek() !== ')') { args.push(parseExpression()); while (peek() === ',') { idx++; args.push(parseExpression()); } }
        eat(')');
        return { type: 'call', name: t, args };
      }
      return { type: 'var', name: t };
    }
    throw new Error(`Unexpected token '${t}'`);
  }

  const ast = parseExpression();
  if (peek() !== '<eof>') throw new Error(`Unexpected token '${peek()}'`);
  return ast;
}

export function compileExpr(expr: string): (t: number) => number {
  let ast: AST;
  try { ast = parseExprToAST(String(expr || '0')); }
  catch { return () => 0; }
  return (t: number) => {
    try { return Number(evalAST(ast, { t })) || 0; } catch { return 0; }
  };
}

function evalAST(ast: AST, env: Record<string, number>): number {
  switch (ast.type) {
    case 'num': return ast.value;
    case 'var': {
      if (ast.name in env) return env[ast.name];
      if (ast.name in CONSTS) return CONSTS[ast.name];
      return 0; // Unknown identifier -> safe default
    }
    case 'un': return -evalAST(ast.expr, env);
    case 'bin': {
      const a = evalAST(ast.left, env); const b = evalAST(ast.right, env);
      switch (ast.op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b === 0 ? 0 : a / b; // safe division
        case '^': return Math.pow(a, b);
      }
      return 0;
    }
    case 'call': {
      const args = ast.args.map(x => evalAST(x, env));
      if (ast.name in FN1) {
        if (ast.name === 'clamp') { // 1-arg usage clamp(x) just returns x clamped later in FNn
          return args.length === 1 ? Math.max(0, Math.min(1, args[0])) : 0;
        }
        return args.length === 1 ? (FN1 as any)[ast.name](args[0]) : 0;
      }
      if (ast.name in FNn) {
        return (FNn as any)[ast.name](...args);
      }
      return 0; // Unknown function
    }
  }
}
