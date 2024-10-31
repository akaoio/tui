
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

        console.log("WASM loaded successfully");
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
   align?: lipglosspos
   width?: number
   height?: number,
   maxWidth?: number,
   maxHeight?: number
   
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
  
    /**
     * 
     * @param text the text data to style and render in the cli 
     * @param elementId a unique id to track this element in wasm go for re-use (like a dom element id)
     */
     newStyle(text: string, elementId: string) {
        if ('newStyle' in globalThis) {
            const newStyle = (globalThis as any).newStyle as (name: string, id: string) => void;

            newStyle(text, elementId);
        }

        return this;
    }

    /**
     * 
     * @param color lipgloss color - e.g "#7D56F4"
     * @param isBackground 1 for true else 0 to intepret as foreground
     */
     canvasColor(color: string, isBackground:number){
            if('canvasColor' in globalThis){
                const canvasColor = (globalThis as any).canvasColor as (color: string, isBackground: number) => void;
                canvasColor(color, isBackground)
            }

            return this;
    }
    // top, right, bottom, left

     margin(top: number, right: number, bottom: number, left: number ){
        if('margin' in globalThis){
            const margin = (globalThis as any).margin as (top: number, right: number, bottom: number, left: number ) => void;
           margin(top, right, bottom, left)
        }

        return this;
    }

     padding(top: number, right: number, bottom: number, left: number ){
        if('padding' in globalThis){
            const padding = (globalThis as any).padding as (top: number, right: number, bottom: number, left: number ) => void;
           padding(top, right, bottom, left)
        }

        return this;
    }


     JoinHorizontal(position: lipglosspos | number,...args: string[]){
        if("JoinHorizontal" in globalThis){
            const JoinHorizontal = (globalThis as any).JoinHorizontal as (position: lipglosspos | number, ...args: string[]) => string;
           return JoinHorizontal(position, ...args)
        }
        
    }

     JoinVertical(position: lipglosspos | number,...args: string[]){
        if("JoinVertical" in globalThis){
            const JoinVertical = (globalThis as any).JoinVertical as (position: lipglosspos | number, ...args: string[]) => string;
            return JoinVertical(position, ...args)
        }
        
    }

    render(){
        if ("render" in globalThis){
            (globalThis as any).render()
        }

        return this;
    }


    // border
    /**
     * 
     * @param borderType 
     * @param args booleans values for sides e.g true false for border at top and bottom, all four sides are required to style the border for now
     *   e.g   ```jsborder("rounded", true, true, false, false, "216")```  background then froground color 
     * @returns 
     */
    border(borderType: borderType, ...args: (string | boolean)[] ){
       if("border" in globalThis){
       const b = (globalThis as any).border as (borderType: string, ...args: (string | boolean)[] ) => void
         b(borderType, ...args)

       }
       return this
    }

    width(width: number ){
        if("width" in globalThis){
        const w = (globalThis as any).width as (width:number) => void
          w(width)
 
        }
        return this
     }

     height(height: number ){
        if("height" in globalThis){
        const h = (globalThis as any).width as (width:number) => void
          h(height)
 
        }
        return this
     }
}






