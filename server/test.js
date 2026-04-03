const MongoSql =  require("./utils/MongoSql");
const initializeDatabase = require("./utils/database_init");
const PDO = require("./utils/pdo");
const fs = require("fs").promises;
const path = require("path");

const msql = new MongoSql();

const Pdo = new PDO({
    driver: "mysql",
    host: 'localhost',
    database: 'museautop',
    password: 'root',
    user: 'root'
});

const tree = {
    writing: {
        "page.tsx": null,
        new: {
            "page.tsx": null
        },
        category: {
            "page.tsx": null
        },
        draft:{
            "page.tsx": null
        }
    },
    studio:{
        "page.tsx": null,
        new: {
            "page.tsx": null
        },
        category:{
            "page.tsx": null
        }
    },
    communauty:{
        "page.tsx": null,
        integration: {
            "page.tsx": null
        },
        usr: {
            "page.tsx": null
        }
    },
    messenging: {
        "page.tsx": null,
        read:{
            "page.tsx": null
        }
    },
    usr: {
        "page.tsx": null
    },
    settings:{
        "page.tsx": null
    }
}

async function setupTree(itemPath, object){
    for (let i in object) {
        console.log('[Item]', i, itemPath);
        if (/\.tsx$/.test(i)) {
            try {
                await fs.readFile(path.join(itemPath, i), {flag: 'a'});
            }catch (e){
                console.log('[Err]',e);
            }
        } else {
            try {
                await fs.mkdir(path.join(itemPath, i));
            }catch (e){
                console.log('[Err]',e);
            }
            await setupTree(path.join(itemPath, i), object[i]);
        }
    }
}

// setupTree("app/(admin)/cmgr/", tree);
async function saveSuperUser(){
    // const result = await Pdo.prepare(`
    //     insert into manager(firstname, lastname, mail, access, code, nickname, phone, created_at, created_by, active)
    //     values(:firstname, :lastname, :mail, :access, sha1(:code), :nickname, :phone, NOW(), null, 1)
    // `).execute({
    //     firstname: "Admin",
    //     lastname: "Admin",
    //     mail: "admin@museautop.com",
    //     code: "admin",
    //     nickname: "admin",
    //     access: "0,1,2,3,4,5,6,101,102,103,104,105,106,200,201,202,203,300,301,302,303,400,401,402,403,404,405,406,407,408,409",
    //     phone: "+509 1234 2345"
    // });

    const result = await Pdo.prepare(`
        insert into branch(domain, created_at) values (:domain, NOW())
    `).execute({
        domain: 'museautop'
    })

    console.log('[RESULT]',result);
}

saveSuperUser();

initializeDatabase().then(async ()=>{
    // const result = await Pdo.prepare(`
    //     insert into manager(firstname, lastname, mail, access, code, nickname, phone, created_at, created_by, active)
    //     values(:firstname, :lastname, :mail, :access, sha1(:code), :nickname, :phone, NOW(), null, 1)
    // `).execute({
    //     firstname: "Admin",
    //     lastname: "Admin",
    //     mail: "admin@museautop.com",
    //     code: "admin",
    //     nickname: "admin",
    //     access: "0,1,2,3,4,5,6,101,102,103,104,105,106,200,201,202,203,300,301,302,303,400,401,402,403,404,405,406,407,408,409",
    //     phone: "+509 1234 2345"
    // });
    //
    // console.log('[RESULT]',result);
});