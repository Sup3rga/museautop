const Maria = require("./utils/Maria");

const t = new Maria({
    host: "musautop.com",
    user: "admusautop",
    password: "hppxsvSe8EDunNVsrUoSOP5ZR7qT9xXuTFTtOt6L0",
    database: "musautop"
});
async function tryit(){

    const request =  await t.prepare("select * from manager").execute();
    if(request.rowCount){
        console.log('[Req]', request.fetch())
    }
}
tryit();