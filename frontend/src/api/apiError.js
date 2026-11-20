// backend sends { message } or, for validation errors, { error: [{ msg }] }
export const apiErrorMessage = (err, fallback) =>
    err?.response?.data?.message || err?.response?.data?.error?.[0]?.msg || fallback;
