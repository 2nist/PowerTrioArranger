// Minimal mock for max-api used in adapter integration tests

function createMock() {
    const handlers = {};
    const outlets = [];
    return {
        addHandler: (name, fn) => { handlers[name] = fn; },
        trigger: (name, ...args) => { if (typeof handlers[name] === 'function') handlers[name](...args); else throw new Error(`Handler ${name} not found`); },
        outlet: (...args) => { outlets.push(args); },
        post: (...args) => { /* console.log('MAX POST:',...args); */ },
        getOutlets: () => outlets.slice(),
        clear: () => { for (const k in handlers) delete handlers[k]; outlets.length = 0; }
    };
}

module.exports = { createMock };
