
export type KernelDefinition = Array<[ number, Array<[ string, number[] ]> ]>
export type KernelState = Array<[ number, Array<[ number[], number[] ]> ]>

// Table output kernel definition
export type DisplayKernels = [ number, DisplayKernel[] ]
export type DisplayKernel = [ string, number[] ]
