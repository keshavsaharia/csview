
export interface ProxyWebsocket {
	requestContext: {
		routeKey: string
	    messageId: string
	    eventType: 'CONNECT' | 'MESSAGE' | 'DISCONNECT'
	    extendedRequestId: string
	    requestTime: string
	    messageDirection: 'IN'
	    stage: string
	    connectedAt: number
	    requestTimeEpoch: number
	    requestId: string
	    domainName: string
	    connectionId: string
	    apiId: string
	}
    body?: string
    isBase64Encoded: boolean
    stageVariables?: { [name: string]: string | undefined }
}

export interface ProxyRequest {
	version: string
    routeKey: string
    rawPath: string
    rawQueryString: string
    cookies?: string[]
	authorizer?: {
		principalId: string
	    integrationLatency: number
	    jwt: {
	        claims: { [name: string]: string | number | boolean | string[] }
	        scopes: string[]
	    }
	}
    headers: { [name: string]: string | undefined }
    queryStringParameters?: { [name: string]: string | undefined }
    requestContext: Context
    body?: string
    pathParameters?: { [name: string]: string | undefined }
    isBase64Encoded: boolean
    stageVariables?: { [name: string]: string | undefined }
}

export interface ProxyResponse {
    statusCode?: number | undefined
    headers?: {
        [header: string]: boolean | number | string
    }
    body?: string | undefined
    isBase64Encoded?: boolean | undefined
    cookies?: string[] | undefined
}

export interface Context {
    accountId: string
    apiId: string
    authentication?: {
        clientCert: {
		    clientCertPem: string
		    serialNumber: string
		    subjectDN: string
		    issuerDN: string
		    validity: {
		        notAfter: string
		        notBefore: string
		    }
		}
    }
    domainName: string
    domainPrefix: string
    http: {
        method: string
        path: string
        protocol: string
        sourceIp: string
        userAgent: string
    }
    requestId: string
    routeKey: string
    stage: string
    time: string
    timeEpoch: number
}
