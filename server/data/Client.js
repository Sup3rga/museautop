const {cookies} = require("next/headers");
const {randomUUID} = require("node:crypto");

class Client {
    async static create(){
        const uid = randomUUID();
        (await cookies()).set('clientuid', uid, {
            maxAge: 60 * 60 * 24 * 365,
            httpOnly: true,
            secure:true,
            path: "/",
            sameSite: 'lax'
        });
        return uid;
    }

    async static get(){
        const uid = (await cookies()).get("clientuid");
        if(!uid) return Client.get();
        return uid;
    }
}

module.exports = Client;