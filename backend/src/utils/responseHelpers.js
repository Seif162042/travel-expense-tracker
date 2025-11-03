// backend/src/utils/responseHelpers.js
export const successResponse = (res, status, data, message = "Success") => {
    return res.status(status).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    });
};

export const errorResponse = (res, status, message, errors = null) => {
    const payload = {
        success: false,
        message,
        timestamp: new Date().toISOString(),
    };
    if (errors) payload.errors = errors;
    return res.status(status).json(payload);
};
