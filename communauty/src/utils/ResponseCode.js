
let ResponseCode = {
    SUCCESS: 100,
    ERROR: 0,
    INTERNAL: 500,
    INVALID: 400,
    LOGOUT: 404,
    BRANCH_ERROR: 700,
    INVALID_BRANCH: 701,
    INVALID_PRIVILEGE: 702,
    PICTURE_UPDATE_ERROR: 300,
    AUTHENTICATION_ERROR: 60,
    DENIED_ACCESS: 30,
    DOMAIN_EXIST_ERROR: 210,
    INSUFFICIENT_PRIVILEGE: 31
}

module.exports = ResponseCode;