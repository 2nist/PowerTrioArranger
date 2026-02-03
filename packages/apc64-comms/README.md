# @2nist/apc64-comms

Helpers for communicating with the Akai APC64 hardware (SysEx payload builders, pad color helpers and display formatting). The module is intentionally small and adapter-focused for Max for Live integration.

## Quick start

```
const APC64Comms = require('@2nist/apc64-comms');
const apc = new APC64Comms();
apc.on('display', (sysEx, text)=> console.log(sysEx));
apc.displayText('Cmaj');
```
