
class FetchService {
    async fetch(url: string, method: "GET" | "POST", timeoutMs: number): Promise<Response> {
        // Create an AbortController to handle the custom timeout constraint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            // Execute fetch with configuration options and the abort signal
            const response = await fetch(url, { 
                method: method,
                signal: controller.signal
            });

            // Validate network status codes
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
            }

            return response;
        } catch (error: any) {
            // Provide clean error messaging if the timeout is triggered
            if (error.name === 'AbortError') {
                throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
            }
            throw error;
        } finally {
            // Always clear the timeout timer to prevent memory leaks
            clearTimeout(timeoutId);
        }
    }
}

export default FetchService;
