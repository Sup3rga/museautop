const Wayto = require('./wayto');
const SocketTransfer = require('./sockettransfer');
const CommonServe = require('./commonserve');

async function manage(socket){
    await Wayto.startManagement();
    const tns = new SocketTransfer(socket);
    tns
    .transfer(null, 'connected',null)
    .transfer('disconnecting', ()=>{
        console.log('disconnected');
        Wayto.unlinkDisconnectedSocket(socket);
    })
    .transfer('/connect', '/connect/report', Wayto.bindUser)
    .transfer('/writing/write', '/writing/write/response', Wayto.commitRedaction)
    .transfer('/writing/category/fetch', '/writing/category/get', Wayto.getAllCategories)
    .transfer('/writing', '/writing/data', Wayto.getAllWritingData)
    .transfer('/writing/category/set', '/writing/category/get', Wayto.commitCategories, ['A'])
    .transfer('/articles', "/articles/get", Wayto.getArticles)
    .transfer('/logo/fetch', "/logo/get", Wayto.getLogo)
    .transfer('/punchlines/category/set', "/punchlines/category/get", Wayto.commitCategories, ['P'])
    .transfer('/punchlines/category/fetch', "/punchlines/category/get", Wayto.getAllCategories, ['P'])
    .transfer('/punchlines/create', "/punchlines/get", Wayto.commitPunchline)
    .transfer('/punchlines/fetch', "/punchlines/get", Wayto.getPunchlines)
    .transfer('/punchlines/config/fetch', '/punchlines/config/get', Wayto.getPunchlinesConfig)
    .transfer('/articles', "/articles/get", Wayto.getArticles)
    .transfer('/messages/fetch', '/messages/get', Wayto.getAllMessages)
    .transfer('/message/reply', '/message/get', Wayto.replyMessage)
    .transfer('/message/delete', '/message/remove', Wayto.deleteMessage)
    .transfer('/privilegies/fetch', '/privilegies/get', Wayto.getPrivileges)
    .transfer('/manager/nickname/check', '/manager/nickname/is', Wayto.checkIfAvailable, ['nickname'])
    .transfer('/manager/email/check', '/manager/email/is', Wayto.checkIfAvailable, ['mail'])
    .transfer('/manager/integration', '/manager/approval', Wayto.integrateNewManager)
    .transfer('/management/list', '/management/get', Wayto.getAllManagers)
    .transfer('/management/member', '/management/get', Wayto.getManager)
    .transfer('/manager/reset', '/manager/get', Wayto.resetManagerPassword)
    .transfer('/manager/block', '/manager/get', Wayto.blockManager)
    .transfer('/manager/avatar/set', '/manager/get', Wayto.setManagerAvatar)
    .transfer('/cog/essentials', '/cog/get', Wayto.getEssentialsSettings)
    .transfer('/cog/essentials/set', '/cog/get', Wayto.setEssentialsSettings)
}

function serve(request, response, uploader){
    new CommonServe(request, response)
    .serve(['identifier','code'], Wayto.connect)
    .serve(['cli_fname', 'cli_lname', 'cli_mail', 'cli_msg', 'cli_bhid'], Wayto.receiveMessage)
    .serve(['upl_artimg'], Wayto.uploadArticleImage, [uploader])
    .serve(['pch_img'], Wayto.uploadPunchlineImage, [uploader])
    .serve(['upl_mailimg'], Wayto.uploadMailImage, [uploader])
    .serve(['avatar'], Wayto.uploadAvatar, [uploader])
    .serve(['articles', 'bhid'], Wayto.getArticles, [false])
    .serve(['punchlines', 'bhid'], Wayto.getSitePunchlines)
    .serve(['cardid', 'bhid'], Wayto.watchPunchline)
    .serve(['like_article', 'bhid'], Wayto.likeArticle)
    .serve(['dislike_article', 'bhid'], Wayto.dislikeArticle)
    .serve(['sector', 'bhid'], Wayto.getSiteCategories)
    .notFound();
}

module.exports = {manage,serve};