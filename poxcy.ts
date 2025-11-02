/**
 * Proxy utility for handling API requests and forwarding
 */

export interface ProxyConfig {
  target: string
  changeOrigin?: boolean
  pathRewrite?: Record<string, string>
  headers?: Record<string, string>
}

export class Proxy {
  private config: ProxyConfig

  constructor(config: ProxyConfig) {
    this.config = {
      changeOrigin: true,
      ...config,
    }
  }

  /**
   * Create a proxy request handler
   */
  async forward(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const targetUrl = new URL(this.config.target)
    
    // Rewrite path if needed
    let path = url.pathname
    if (this.config.pathRewrite) {
      for (const [pattern, replacement] of Object.entries(this.config.pathRewrite)) {
        path = path.replace(new RegExp(pattern), replacement)
      }
    }

    // Build the target URL
    const proxyUrl = new URL(path, targetUrl)
    proxyUrl.search = url.search

    // Prepare headers
    const headers = new Headers(request.headers)
    if (this.config.headers) {
      Object.entries(this.config.headers).forEach(([key, value]) => {
        headers.set(key, value)
      })
    }

    // Forward the request
    const response = await fetch(proxyUrl.toString(), {
      method: request.method,
      headers,
      body: request.body,
    })

    return response
  }

  /**
   * Create a Next.js API route handler
   */
  createHandler() {
    return async (req: Request) => {
      return this.forward(req)
    }
  }
}

/**
 * Helper function to create a simple proxy
 */
export function createProxy(config: ProxyConfig): Proxy {
  return new Proxy(config)
}

