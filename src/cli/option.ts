
export class CliOption<T = any> {

    name: string[]

    constructor(name: string | string[]) {
        this.name = Array.isArray(name) ? name : [ name ]
    }

    static globalOption(): Map<string, CliOption> {
        const option = new Map()

        return option
    }

    static mapOption(...options: CliOption[]): Map<string, CliOption> {
        const optionMap = new Map()
        for (const option of options) {
            for (const name of option.name) {
                optionMap.set(name, option)
            }
        }
        return optionMap
    }

    static parse(map: Map<string, CliOption>, args: string[], index: number = 0): number {
        return 0
    }

    static getOption(arg: string, map: Map<string, CliOption>): CliOption | null {
        if (! arg.startsWith('-'))
            return null
        
        const name = arg.replace(/^\-+/g, '')
        return map.has(name) ? map.get(name) : null
    }

    static isOption(option: string, map: Map<string, CliOption>): boolean {
        return option.startsWith('-') && map.has(option.replace(/^\-+/g, ''))
    }

}
