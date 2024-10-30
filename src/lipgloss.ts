
import fs from "fs"

interface ImportObject {
    _gotest: {
      add: () => void;
    };
    gojs: {
      'runtime.wasmExit': () => void; 
      'runtime.wasmWrite': () => void;
      'runtime.resetMemoryDataView': () => void; 
      'runtime.nanotime1': () => number; 
      'runtime.walltime': () => number; 
      'runtime.scheduleTimeoutEvent': () => void; 
      'runtime.clearTimeoutEvent': () => void; 
      'runtime.getRandomData': () => Uint8Array; 
      'syscall/js.finalizeRef': () => void; 
      'syscall/js.stringVal': (val: any) => void; 
      'syscall/js.valueGet': (val: any) => any; 
      'syscall/js.valueSet': (key: any, value: any) => void; 
      'syscall/js.valueDelete': (key: any) => void; 
      'syscall/js.valueIndex': (index: number) => any; 
      'syscall/js.valueSetIndex': (index: number, value: any) => void; 
      'syscall/js.valueCall': (val: any, args: any[]) => any; 
      'syscall/js.valueInvoke': (val: any, args: any[]) => any; 
      'syscall/js.valueNew': (args: any[]) => any; 
      'syscall/js.valueLength': (val: any) => number; 
      'syscall/js.valuePrepareString': (val: any) => void; 
      'syscall/js.valueLoadString': (val: any) => string; 
      'syscall/js.valueInstanceOf': (val: any, constructor: any) => boolean; 
      'syscall/js.copyBytesToGo': (goSlice: any, jsBytes: Uint8Array) => void; 
      'syscall/js.copyBytesToJS': (goSlice: any, jsBytes: Uint8Array) => void; 
      debug: () => void; 
    };
  }
  
  interface gowasm {
    argv: string[];
    env: Record<string, any>; 
    run: (instance: WebAssembly.Instance) => void; 
    exit: () => void; 
    _resolveExitPromise: () => Promise<void>; 
    _exitPromise: Promise<any>; 
    _pendingEvent: any;
    _scheduledTimeouts: Map<any, any>; 
    _nextCallbackTimeoutID: number;
    importObject: ImportObject;
  }
  







export async function initLip(){
    // load the wasm
    const wasmExec = await import('./wasm_exec.js');

    wasmExec.default();

    const go: gowasm = new (globalThis as any).Go()

    const res = await WebAssembly.instantiate(fs.readFileSync("./src/lip.wasm"), go.importObject as unknown as  WebAssembly.Imports)

    if(res){
        go.run(res.instance)
         const a  = 'newStyle' in globalThis
        if(!a){
          throw new Error("Failed to init wasm")
         }
   
        
    }
    
    
}
