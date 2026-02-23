const API_BASE = "/api";

export function useApi() {
	async function get<T>(path: string): Promise<T> {
		const response = await fetch(`${API_BASE}${path}`, {
			credentials: "include",
		});
		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}
		return response.json();
	}

	async function post<T>(path: string, body?: unknown): Promise<T> {
		const response = await fetch(`${API_BASE}${path}`, {
			method: "POST",
			credentials: "include",
			headers: body ? { "Content-Type": "application/json" } : undefined,
			body: body ? JSON.stringify(body) : undefined,
		});
		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}
		return response.json();
	}

	async function patch<T>(path: string, body?: unknown): Promise<T> {
		const response = await fetch(`${API_BASE}${path}`, {
			method: "PATCH",
			credentials: "include",
			headers: body ? { "Content-Type": "application/json" } : undefined,
			body: body ? JSON.stringify(body) : undefined,
		});
		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}
		return response.json();
	}

	async function del<T>(path: string): Promise<T> {
		const response = await fetch(`${API_BASE}${path}`, {
			method: "DELETE",
			credentials: "include",
		});
		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}
		return response.json();
	}

	return { get, post, patch, del };
}
