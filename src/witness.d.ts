/// <reference types="node" />
export declare function buildWitnessScript({ recover, ...options }: WitnessScriptOptions): Buffer;
export type WitnessScriptOptions = {
    xkey: string;
    mediaContent: string;
    mediaType: string;
    meta: any;
    commitment?: Buffer;
    recover?: boolean;
};
export declare class OrditSDKError extends Error {
    constructor(message: string);
}
export declare const MAXIMUM_SCRIPT_ELEMENT_SIZE = 520;
export declare const chunkContent: (str: string, encoding?: BufferEncoding) => Buffer[];
