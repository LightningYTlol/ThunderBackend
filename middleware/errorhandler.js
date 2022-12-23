module.exports = (error, _, response, __) => {
    if (response.headersSent) return;
    if (error.hasOwnProperty('response')) {
        switch (error.response.status) {
            case 403:
                return createJsonResponse(response, 403, '');

            case 404:
                return createJsonResponse(response, 404, 'The requested resource does not exist');

            case 429:
                return createJsonResponse(response, 429, 'You have hit the rate-limit, please slow down your requests');

        }
    }

    const jsonResponse = {
        status: 500,
        reason: error.message,
    };
    console.log(error);

    return response.status(500).json(jsonResponse);
};

function createJsonResponse(response, statusCode, reason) {
    return response.status(statusCode).json({
        status: statusCode,
        reason: reason,
    });
}