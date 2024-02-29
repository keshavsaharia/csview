import { BODY_METHODS } from '../constant'

export class Redirect {
	private url: string
	private status: number

	constructor(url: string, status?: 301 | 302 | 303 | 304 | 307) {
		this.url = url
		this.status = status || 301
	}

	forMethod(method?: string) {
		// Standard status code after form submission
		if (method && BODY_METHODS.has(method) && this.status == 301)
			this.status = 303
		return this
	}

	found(): this {
		this.status = 302
		return this
	}

	seeOther() {
		this.status = 303
		return this
	}

	notModified() {
		this.status = 304
		return this
	}

	temporary(): this {
		this.status = 307
		return this
	}

	getUrl(): string {
        return this.url
    }

    getStatus(): number {
        return this.status
    }
}
