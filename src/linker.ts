//@ts-ignore
import {Library} from "@makeomatic/ffi-napi"
//@ts-ignore
import * as ref from "@makeomatic/ref-napi"
import { platform } from "os"
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

// console.dir(Library)
// console.log(dir)
//@ts-ignore
// import * as refStruct from "ref-struct-di"
// const StructType = refStruct(ref)
// var time_t = ref.types.long
// var suseconds_t = ref.types.long

// // define the "timeval" struct type
// var timeval = StructType({
//   tv_sec: time_t,
//   tv_usec: suseconds_t
// })

// var tv = new timeval({tv_sec: 0, tv_usec: 0})
// console.log(tv.ref())

// var MyStruct = StructType()
// MyStruct.defineProperty('width', ref.types.int)
// MyStruct.defineProperty('height', ref.types.int)

// var i = new MyStruct({ width: 5, height: 10 })
// console.log(i, i.ref())

// console.dir(ref.types)
// Function.toString
// console.dir(ref.coerceType.toString())
// console.dir(  ref.writeObject.toString())
// console.dir(  ref.alloc.toString())
// console.dir(ref.types)
// don't care about object shape, any:
var myobj = ref.types.void // we don't know what the layout of "myobj" looks like
var myobjPtr = ref.refType(myobj);

// const Inputstruct = {
//     id: ref.types.CString,
//     placeholder: ref.types.CString,
//     description: ref.types.int,
// };

// Create the structure type using ref-struct
const Input =  ref.types.void 
const InputPtr = ref.refType(Input);

// switch C.GoString(t) {
// 	case "dracula":
// 		theme = huh.ThemeDracula()
// 	case "Charm":
// 		theme = huh.ThemeCharm()
// 	case "Catppuccin":
// 		theme = huh.ThemeCatppuccin()
// 	case "Base16":
// 		theme = huh.ThemeBase16()
// 	default:
// 		theme = huh.ThemeBase()
// 	}

type HuhT ={
    CreateInput(t :number):string
    SetInputOptions(ptr:string, title: string, desc: string, placeholder: string, validators: string):number
    FreeStruct(ptr:string): number
    RunInput(ptr:string): string
    Confirm(title:string, affirmative: string, negative: string): string
    Select(title:string, opts:string): string
    MultiSelect(ptr:string, title:string, opts:string): string
    SetTheme(theme:"dracula" | "Charm" | "Catppuccin" | "Base16" | "default"): void
    Run(prt:string):string
    CreateGroup(ptrs:string):string
    CreateForm(ptrs:string):void
    GetValue(ptr:string):string
    Spinner(seconds: number, title: string): void
    Note(title: string, description: string, nextlabel?:string, next?:number):string

}

const p = platform()
const arch = process.arch; // Get architecture: 'x64', 'arm64', etc.

let dynamicLib;
if (p === 'win32') {
    dynamicLib = 'binary/huh.dll';
} else if (p === 'linux') {
    // Select the appropriate binary based on architecture
    if (arch === 'arm64' || arch === 'arm') {
        dynamicLib = 'binary/huh-arm64.so';
    } else if (arch === 'x64' || arch === 'ia32') {
        dynamicLib = 'binary/huh-x86-64.so';
    } else {
        // Fallback to generic name if architecture not explicitly supported
        dynamicLib = 'binary/huh.so';
    }
} else {
    throw new Error(`Unsupported platform: ${p}. This application only supports Windows and Linux.`);
}

// Check if we're in dist or src directory
const fs = require('fs');
const possiblePaths = [
    path.resolve(dir, dynamicLib),
    path.resolve(dir, '..', 'dist', dynamicLib),
    path.resolve(process.cwd(), 'dist', dynamicLib),
    path.resolve(process.cwd(), 'src', dynamicLib)
];

let dllfile = '';
for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
        dllfile = possiblePath;
        break;
    }
}

if (!dllfile) {
    throw new Error(`Could not find ${dynamicLib} in any expected location: ${possiblePaths.join(', ')}`);
}


const huh:HuhT  = Library(dllfile, {
    "CreateInput": ["string", ["int"]],
    "SetInputOptions": ["int", ["string", "string", "string", "string", "string"]],
    "FreeStruct": ['int', ["string"]],
    "RunInput": ["string", ["string"]],
    "Confirm":  ["string", ["string", "string", "string"]],
    "Select": ["string", ["string", "string"]],
    "MultiSelect": ["int", ["string", "string", "string"]],
    "SetTheme": ["void", ["string"]],
    "Run": ["string", ["string"]],
    "CreateGroup": ["string", ["string"]],
    "CreateForm": ["void", ["string"]],
    "GetValue": ["string", ["string"]],
    "Spinner": ["void", ["int", "string"]],
    "Note": ["string", ["string", "string", "string", "int"]],
})

type inputprops = {
    Title: string
    Placeholder: string 
    Description: string
    validators: string
}

export function CreateInput(t: number){
    // const i = ref.refType(opts);
    // console.log(i)
    // var MyStruct = StructType()
    // MyStruct.defineProperty('Description', ref.types.CString)
    // MyStruct.defineProperty('Title', ref.types.CString)
    // MyStruct.defineProperty('Placeholder', ref.types.CString)
  

//    var i = new MyStruct(opts)
//    console.log(i)
//    console.log("\n")
//    console.log(i.ref())
    // var db = ref.alloc("Object")
    // ref.writeObject(db, 0, opts)
    // console.log(db)
    const Ptr = huh.CreateInput(t);
    // console.log(Ptr)
    return Ptr
}

export function SetInputOptions(ptr:any, opts:inputprops){
     return  huh.SetInputOptions(ptr, opts.Title, opts.Description, opts.Placeholder, opts.validators)
}


export const FreeStruct = (prt:any) => {
    // console.log("bro wtf")
    const m = huh.FreeStruct(prt)
    // console.log(m, "m")
    return m
}

export default huh