// renderer.js — RPN engine (top-result display only)

document.addEventListener('DOMContentLoaded', () => {
    const commandInput = document.getElementById('commandInput');
    const clearButton = document.getElementById('clearButton');
    const output = document.getElementById('output');

    commandInput.focus();

    // ----- RPN ENGINE -----
    const stack = [];
    let lastClipboardText = ""; // fallback if clipboard access is blocked

    function fmt(n) {
        if (Number.isNaN(n)) return "NaN";
        if (!Number.isFinite(n)) return n > 0 ? "∞" : "-∞";
        const s = Number(n.toFixed(12)).toString();
        return s.includes('.') ? s.replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1') : s;
    }

    function renderTop() {
        if (stack.length === 0) {
            output.textContent = "Results...";
            return;
        }
        const top = stack[stack.length - 1];
        output.textContent = `Result: ${fmt(top)}`;
    }

    function need(n = 1) {
        if (stack.length < n) throw new Error("Stack underflow");
    }

    function pushNumber(tok) {
        const n = Number(tok);
        if (tok.trim() === "" || Number.isNaN(n)) {
            throw new Error(`Not a number: "${tok}"`);
        }
        stack.push(n);
    }

    const ops = {
        "+": () => { need(2); const b=stack.pop(), a=stack.pop(); stack.push(a+b); },
        "-": () => { need(2); const b=stack.pop(), a=stack.pop(); stack.push(a-b); },
        "*": () => { need(2); const b=stack.pop(), a=stack.pop(); stack.push(a*b); },
        "/": () => { need(2); const b=stack.pop(), a=stack.pop(); stack.push(a/b); },
        "^": () => { need(2); const b=stack.pop(), a=stack.pop(); stack.push(Math.pow(a,b)); },
        sqrt: () => { need(1); const a=stack.pop(); stack.push(Math.sqrt(a)); },
        neg:  () => { need(1); const a=stack.pop(); stack.push(-a); },
        dup:  () => { need(1); stack.push(stack[stack.length-1]); },
        swap: () => { need(2); const a=stack.pop(), b=stack.pop(); stack.push(a,b); },
        drop: () => { need(1); stack.pop(); },
        clear:() => { stack.length = 0; },
        enter:() => { need(1); stack.push(stack[stack.length-1]); } // classic ENTER
    };

    const alias = { s:"swap", d:"drop", u:"dup", c:"clear", r:"sqrt", n:"neg" };

    function isNumberToken(t) {
        return /^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(t); // +3, -3.14, .5 allowed
    }

    async function copyTopToClipboard() {
        if (stack.length === 0) return;
        const top = fmt(stack[stack.length - 1]);
        lastClipboardText = top;
        try { await navigator.clipboard.writeText(top); } catch { /* fallback kept */ }
    }

    function processTokens(line) {
        const tokens = line.trim().length ? line.trim().split(/\s+/) : [];
        for (const raw of tokens) {
            const t = (raw in alias) ? alias[raw] : raw;

            if (isNumberToken(t)) {
                pushNumber(t);
            } else if (ops[t]) {
                ops[t]();
            } else if (["+","-","*","/","^"].includes(t)) {
                ops[t]();
            } else {
                throw new Error(`Unknown token: "${raw}"`);
            }
        }
    }

    // ---- UI wiring ----
    clearButton.addEventListener('click', () => {
        // Soft clear: keep stack for chaining; you can paste last result with Ctrl+V
        commandInput.value = '';
        output.textContent = 'Results...';
        commandInput.focus();
    });

    commandInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleCalculation();
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            commandInput.value = '';
        }
    });

    document.addEventListener('keydown', (ev) => {
        // Ctrl+L => soft clear
        if (ev.ctrlKey && ev.key.toLowerCase() === 'l') {
            ev.preventDefault();
            commandInput.value = '';
            output.textContent = 'Results...';
            commandInput.focus();
        }
        // Ctrl+/ => quick help
        if (ev.ctrlKey && ev.key === '/') {
            ev.preventDefault();
            output.textContent =
`Help:
- Enter RPN tokens: 75 3 /   9 sqrt   5 2 ^
- Ops: + - * / ^   sqrt   neg   dup   drop   swap   clear   enter
- Shortcuts: s=swap d=drop u=dup c=clear r=sqrt n=neg
- Enter evaluates; top result is copied to clipboard for easy Ctrl+V.
- Clear button only resets fields (stack preserved). Use "clear" to wipe stack.`;
        }
    });

    renderTop();

    // Keep old IPC listener available (harmless) if you later pipe to dc.
    if (window.electron?.receive) {
        window.electron.receive('calculation-result', (result) => {
            const roundedResult = parseFloat(Number(result).toFixed(10));
            output.textContent = `Result: ${roundedResult}`;
        });
    }

    function handleCalculation() {
        const line = commandInput.value.trim();
        try {
            if (line.length) {
                processTokens(line);
                copyTopToClipboard(); // enables your Clear -> Ctrl+V workflow
            }
            renderTop();
            commandInput.select();
        } catch (e) {
            output.textContent = `Error: ${e.message}`;
            commandInput.select();
        }
    }
});
