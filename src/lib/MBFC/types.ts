export interface MBFCReport {
    bias:string,
    credibility: string,
    domain: string,
    facebook?: string,
    twitter?:string,
    name: string,
    popularity?: number,
    questionable: string[],
    reporting: string,
    url: string,
    biases?: MBFCBiases
    score?: number
    
}

export interface MBFCBiases {
    bias: string,
    code: string,
    description: string,
    name: string,
    pretty: string,
    url: string
}

export interface MBFCCredibility {
    code: string,
    credibility: string,
    name: string,
    pretty: string
}

export interface MBFCQuestionable {
    code: string,
    name: string,
    pretty:string,
    questionable: string
}

export interface MBFCReporting {
    code: string,
    name: string,
    pretty:string,
    reporting:string
}

export interface MBFCTraffic {
    code: string,
    name: string,
    pretty:string,
    traffic: string
}

export interface MBFCDataSet {
    aliases: {},
    biases: MBFCBiases[],
    credibility: MBFCCredibility[],
    date: string,
    questionable: MBFCQuestionable[]
    reporting: MBFCReporting[],
    sources: MBFCReport[],
    traffic: MBFCTraffic[]
}