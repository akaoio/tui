//@ts-ignore
import {Library} from "@makeomatic/ffi-napi"
//@ts-ignore
import * as ref from "@makeomatic/ref-napi"
import { platform } from "os"
import path from 'path';

import { fileURLToPath } from 'url';

let dir:string;


if(__dirname){
  dir = __dirname
}else{
  dir = path.dirname(fileURLToPath(import.meta.url))
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

let dynamicLib;
if (p === 'win32') {
    dynamicLib = './binary/huh.dll';
} else if (p === 'linux') {
    dynamicLib = './binary/huh.so';
} else {
    throw new Error(`Unsupported platform: ${p}. This application only supports Windows and Linux.`);
}
const dllfile = path.resolve(dir, dynamicLib);


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