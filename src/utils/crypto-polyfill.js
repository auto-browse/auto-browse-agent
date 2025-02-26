// Simple polyfill for crypto.randomUUID() used by chromium-bidi
// Uses the Web Crypto API available in modern browsers
export const randomUUID = () => {
	// Generate 16 random bytes using Web Crypto API
	const bytes = crypto.getRandomValues(new Uint8Array(16));

	// Set version (4) and variant (RFC4122) bits
	bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
	bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant RFC4122

	// Convert to UUID string format
	const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
		12,
		16
	)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

// Export a minimal crypto interface needed by chromium-bidi
export default {
	randomUUID
};
