export const successResponse = (res, data, message = 'Success') => ({ status: 'success', message, data });
export const errorResponse = (res, message = 'Error') => ({ status: 'error', message });
