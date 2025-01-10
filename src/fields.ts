// huh.NewInput().
// Value(&order.Name).
// Title("What's your name?").
// Placeholder("Margaret Thatcher").
// Validate(func(s string) error {
//     if s == "Frank" {
//         return errors.New("no franks, sorry")
//     }
//     return nil
// }).
// Description("For when your order is ready."),
//TODO: validators

import huh, { CreateInput, FreeStruct, SetInputOptions } from "./linker";
//  "required" | "email" | "no_numbers" | "alpha_only" | "no_special_chars"
type inputprops = {
    Description: string
    Title: string
    Placeholder: string
    validators: string

}

type ReturnProps = {
    readonly value: string
    id: string
    run: () => string
}
export class NewInput {
    id: string;
    props: inputprops;
    type_: number
    /**
     * 
     * @param p 
     * @param type_ 0 for normal inline input 1 for multiline
     */
    constructor(p: inputprops, type_: number) {
        this.id = ""
        this.props = p
        this.type_ = type_

    }
    /**
     * load the struct into c memory
     */
    load() {
        let e = CreateInput(this.type_)
        //  console.log("create", e)
        if (!e) {
            throw new Error("Error creating struct in Go")
        }
        this.id = e
        return SetInputOptions(this.id, this.props)
    }

    run() {
        return huh.RunInput(this.id)
    }
    get value(){
        return huh.GetValue(this.id)
    }
}

export const Confirm = (title: string, affirmative: string, negative: string): ReturnProps => {

    const i = huh.Confirm(title, affirmative, negative)
    return {
        id: i,
        run: function () {
            return huh.Run(this.id)
        },
        get value() {
            return huh.GetValue(this.id)
        }
    }
}
export const SetTheme = huh.SetTheme

export const Select = (title: string, options: string[]): ReturnProps => {
    

    const i = huh.Select(title, options.join(","))
    return {
        id: i,
        run: function () {
            return huh.Run(this.id)
        },
        get value() {
            return huh.GetValue(this.id)
        }

    }

}


export const multiSelect = (title: string, options: string[], limit: number = 0): { id: string, run: () => string[], readonly value: string } => {
    // will use limit soon
    const i = `id_${Date.now()}`
    huh.MultiSelect(i, title, options.join(","))
    return {
        id: i,
        run: function () {
            return huh.Run(this.id).split(",")
        },
        get value() {
            return huh.GetValue(this.id)
        }

    }
    // const res = huh.RunMultiSelect(title, options.join(","))
    // return res.split(",")
}

export const Note = (title: string, desc: string, nextlabel: string, next: boolean): { id: string, run: () => string, readonly value: string }  => {

    const i = huh.Note(title, desc, nextlabel, next ? 1 : 0)
    return {
        id: i,
        run: function(){
            return huh.Run(this.id)
        },
        get value(){
            return ""
            
        }
    }
}


export const CreateGroup = huh.CreateGroup
export const CreateForm = huh.CreateForm
export const GetValue = huh.GetValue 
// export const Note = huh.Note
export const Spinner = huh.Spinner