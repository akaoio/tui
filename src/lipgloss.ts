
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

// Simple approach that works in both CJS and ESM
let dir: string;
try {
  // @ts-ignore
  if (typeof __dirname !== 'undefined') {
    // @ts-ignore
    dir = __dirname;
  } else {
    // Try to resolve from package
    try {
      dir = path.dirname(require.resolve('@akaoio/tui/package.json'));
    } catch {
      // If package not found, use dist directory
      dir = path.join(process.cwd(), 'dist');
    }
  }
} catch {
  dir = path.join(process.cwd(), 'dist');
}

let wasmInstance: WebAssembly.Instance | null = null;
let goInstance: any = null;
let isInitialized = false;

export async function initLip() {
    // Check if already initialized and working
    if (isInitialized && 'createStyle' in globalThis) {
        return true;
    }

    // Import wasm_exec.js and initialize Go environment
    const wasmExec = await import('./wasm_exec');
    wasmExec.default();

    if (!(globalThis as any).Go) {
      throw new Error("Failed to initialize Go from wasm_exec.js");
    }
    
    // Create a new Go instance
    goInstance = new (globalThis as any).Go();

    // Ensure path to the wasm file is correct
    const possibleWasmPaths = [
        path.resolve(dir, 'lip.wasm'),
        path.resolve(dir, '..', 'dist', 'lip.wasm'),
        path.resolve(process.cwd(), 'dist', 'lip.wasm'),
        path.resolve(process.cwd(), 'src', 'lip.wasm')
    ];
    
    let wasmPath = '';
    for (const possiblePath of possibleWasmPaths) {
        if (fs.existsSync(possiblePath)) {
            wasmPath = possiblePath;
            break;
        }
    }
    
    if (!wasmPath) {
        throw new Error(`Could not find lip.wasm in any expected location: ${possibleWasmPaths.join(', ')}`);
    }
    
    const wasmfile = fs.readFileSync(wasmPath);

    // Instantiate the WebAssembly module
    const res = await WebAssembly.instantiate(wasmfile, goInstance.importObject);

    if (res) {
        wasmInstance = res.instance;
        // Run the Go WASM instance
        goInstance.run(wasmInstance);

        // Check if the WASM module initialized correctly
        if (!('createStyle' in globalThis)) {
            throw new Error("Failed to init wasm");
        }

        isInitialized = true;
        // console.log("WASM loaded successfully");
        return true;
    }

    return false;
}

// Helper to check if WASM needs reinitialization
export function checkWasmState(): boolean {
    if (!goInstance || goInstance.exited) {
        isInitialized = false;
        return false;
    }
    return isInitialized && 'createStyle' in globalThis;
}

// Reset WASM state (for testing)
export function resetWasm() {
    wasmInstance = null;
    goInstance = null;
    isInitialized = false;
}
 



type adaptiveColor = {Light: string, Dark: string}
type completeAdaptiveColor= {  Light:{TrueColor: string, ANSI256: string, ANSI: string}, Dark: {TrueColor: string, ANSI256: string, ANSI: string}}
type completeColor = {TrueColor: string, ANSI256: string, ANSI: string}

interface style {
   id: string
   canvasColor?: {color?: string | {adaptiveColor: adaptiveColor} | {completeAdaptiveColor:completeAdaptiveColor} | {completeColor: completeColor}, background?: string| {adaptiveColor: adaptiveColor} | {completeAdaptiveColor:completeAdaptiveColor} | {completeColor: completeColor}}
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

type listStyle = "alphabet" | 'arabic' | 'asterisk' | 'custom'

interface simpleList {
  data: Array<string>
  selected?: Array<string>
  listStyle: listStyle,
  customEnum?: string
  styles: {numeratorColor: string, itemColor: string, marginRight: number}
}
export class Lipgloss {

  private async ensureInitialized() {
    if (!checkWasmState()) {
      await initLip();
    }
  }

  async createStyle(style: style){
      await this.ensureInitialized();
      if ("createStyle" in globalThis){
        (globalThis as any).createStyle(style)
      }
  }
  /**
   * 
   * @param config value to render and an optional id for a specific style, if no id is provided the recently created style is applied
   * @returns 
   */
  async apply(config: {value: string, id?: string}): Promise<string>{
    await this.ensureInitialized();
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
  
  async newTable(config: table): Promise<string> {
     await this.ensureInitialized();
     if("newTable" in globalThis){
        config.data = JSON.stringify(config.data) as any as tableData
        return (globalThis as any).newTable(config)
     }
    return ""
  }


  async RenderMD(content: string = "", style: markdownStyles = "dark"): Promise<string> {
    await this.ensureInitialized();
    if("RenderMD" in globalThis){
     return  (globalThis as any).RenderMD(content, style)
    }

    return ""

  }
// console.log(List({data: JSON.stringify(["A", "B", 'C']), selected: JSON.stringify([]), styles: {numeratorColor: "99",itemColor: "212", marginRight: 4  }})

  async List(config: simpleList = {data: [], selected: [], listStyle: "asterisk", customEnum: "→", styles: {numeratorColor: "99", itemColor: "212", marginRight: 1}}):Promise<string>{
    await this.ensureInitialized();
    if("List" in globalThis){
      return (globalThis as any).List({data: JSON.stringify(config.data),selected: JSON.stringify(config.selected), styles: config.styles, listStyle: config.listStyle, customEnum: config.customEnum})
   }
    return ""
  } 

  // console.log(NdList({data: JSON.stringify(ndO), selected: JSON.stringify(["C", "D"]), listStyle: "custom", customEnum: "→", styles: {numeratorColor: "99",itemColor: "212", marginRight: 4 }, innerStyles: {numeratorColor: "99",itemColor: "212", marginRight: 4, listStyle: "", customEnum: "→", selected: JSON.stringify(["Baking Flour","Eggs" ])}}))
   
  // NDList(config): string{
  //    return ""
  // }
}






