
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
  







// export async function initLip(){
//     // load the wasm
//     const wasmExec = await import('./wasm_exec.js');

//     wasmExec.default();

//     const go: gowasm = new (globalThis as any).Go()
//    const wasmfile = fs.readFileSync("./src/lip.wasm")
//    console.log(wasmfile)
//     const res = await WebAssembly.instantiate(wasmfile, go.importObject as unknown as  WebAssembly.Imports)

//     if(res){
//         go.run(res.instance)
//          const a  = 'newStyle' in globalThis
//         if(!a){
//           throw new Error("Failed to init wasm")
//          }
   
        
//          return true
//     }
    
    
//     return false
// }



import path from 'path';

import { fileURLToPath } from 'url';
// const __dirname:string = typeof __dirname !== 'undefined' 
//     ? __dirname
//     : path.dirname(fileURLToPath(import.meta.url));


let dir:string;


if(__dirname){
  dir = __dirname
}else{
  dir = path.dirname(fileURLToPath(import.meta.url))
}

export async function initLip() {
    // Import wasm_exec.js and initialize Go environment
    const wasmExec = await import('./wasm_exec');
    wasmExec.default();



    if (!(globalThis as any).Go) {
      throw new Error("Failed to initialize Go from wasm_exec.js");
  }
    // Create a new Go instance
    const go =new (globalThis as any).Go();

    // Ensure path to the wasm file is correct
    const wasmPath = path.resolve(dir, './lip.wasm');
    const wasmfile = fs.readFileSync(wasmPath);

    // Instantiate the WebAssembly module
    const res = await WebAssembly.instantiate(wasmfile, go.importObject);

    if (res) {
        // Run the Go WASM instance
        go.run(res.instance);

        // Check if the WASM module initialized correctly
        if (!('createStyle' in globalThis)) {
            throw new Error("Failed to init wasm");
        }

        // console.log("WASM loaded successfully");
        return true;
    }

    return false;
}
 



interface style {
   id: string
   canvasColor?: {color?: string, background?: string}
   border?: {type: borderType, foreground?: string, background?: string, sides:Array<boolean>}
   padding?: Array<number>
   margin: Array<number>
   bold?: boolean
   alignV?: lipglosspos
   alignH?: lipglosspos
   width?: number
   height?: number,
   maxWidth?: number,
   maxHeight?: number
   
}


interface tableData {
  headers: Array<string>
  rows: Array<Array<string>>

}

interface table{
  data: tableData,
  table: {border: borderType, color: string, width?:number, height?:number},
  header?: {color: string, bold: boolean},
  rows?: {even: {color: string}, odd?: {color: string}}
}

	// lip.createStyle({
	//     id: "primaryButton",
	//     canvasColor: {color: "#007BFF", isBackground: true},
	//     border: { type: "rounded", foreground: "#0056b3", background: "", sides: [true, false] },
	//     padding: [8, 12, 8, 12],
	//     margin: [0, 0, 10, 0],
	//     bold: true,
	//     align: "center",
	//     width: 100,
	//     height: 100
	// });


// render()
type lipglosspos = "bottom" | "top" | "left" | "right" | "center"
type borderType = "rounded" | "block" | "thick" | "double" 
type direction = "vertical" | "horizontal"

type markdownStyles = "dark" | "light" | "dracula" | "notty" | "tokyo-night" | "ascii"
export class Lipgloss {


  createStyle(style: style){
      if ("createStyle" in globalThis){
        (globalThis as any).createStyle(style)
      }
  }
  /**
   * 
   * @param config value to render and an optional id for a specific style, if no id is provided the recently created style is applied
   * @returns 
   */
  apply(config: {value: string, id?: string}): string{
    if ("apply" in globalThis){
     return (globalThis as any).apply(config)
    }

    return ""
  }

  
// lip.join({
// 	direction: "vertical",
// 	position: "bottom",
// 	elements: ['', ''],
//  pc
// })
  join(config: {direction: direction, position:lipglosspos , elements: Array<string>, pc?: number} = {direction: "horizontal", position: "left", elements: ['']}) :string{
   
     if("join" in globalThis){
      return  (globalThis as any).join(config)
     }

     return ""

  }
  
  newTable(config: table): string {
     if("newTable" in globalThis){
        config.data = JSON.stringify(config.data) as any as tableData
        return (globalThis as any).newTable(config)
     }
    return ""
  }


  RenderMD(content: string = "", style: markdownStyles = "dark") {
    if("RenderMD" in globalThis){
      (globalThis as any).RenderMD(content, style)
    }

  }
}






