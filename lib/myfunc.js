"use strict";
const axios = require("axios");
const fs = require("fs");
const fetch = require('node-fetch')
const jimp = require("jimp")

exports.serialize = (conn, msg) => {
    /** if (msg.message["ephemeralMessage"]){
      msg.message = msg.message.ephemeralMessage.message
      msg.ephemeralMessage = true
    }else{
      msg.ephemeralMessage = false
    } */
    msg.isGroup = msg.key.remoteJid.endsWith('@g.us')
    try{
        const berak = Object.keys(msg.message)[0]
        msg.type = berak
    } catch {
        msg.type = null
    }
    try{
        const context = msg.message[msg.type].contextInfo.quotedMessage
        if(context["ephemeralMessage"]){
            msg.quotedMsg = context.ephemeralMessage.message
        }else{
            msg.quotedMsg = context
        }
        msg.isQuotedMsg = true
        msg.quotedMsg.sender = msg.message[msg.type].contextInfo.participant
        msg.quotedMsg.fromMe = msg.quotedMsg.sender === conn.user.id.split(':')[0]+'@s.whatsapp.net' ? true : false
        msg.quotedMsg.type = Object.keys(msg.quotedMsg)[0]
        let ane = msg.quotedMsg
        msg.quotedMsg.chats = (ane.type === 'conversation' && ane.conversation) ? ane.conversation : (ane.type == 'imageMessage') && ane.imageMessage.caption ? ane.imageMessage.caption : (ane.type == 'documentMessage') && ane.documentMessage.caption ? ane.documentMessage.caption : (ane.type == 'videoMessage') && ane.videoMessage.caption ? ane.videoMessage.caption : (ane.type == 'extendedTextMessage') && ane.extendedTextMessage.text ? ane.extendedTextMessage.text : (ane.type == 'buttonsMessage') && ane.buttonsMessage.contentText ? ane.buttonsMessage.contentText : ""
        msg.quotedMsg.id = msg.message[msg.type].contextInfo.stanzaId
        msg.quotedMsg.key = { remoteJid: msg.key.remoteJid, fromMe: ane.fromMe, id: ane.id, participant: msg.isGroup ? ane.sender : undefined }
    }catch{
        msg.quotedMsg = null
        msg.isQuotedMsg = false
    }

    try{
        const mention = msg.message[msg.type].contextInfo.mentionedJid
        msg.mentioned = mention
    }catch{
        msg.mentioned = []
    }
    
    if (msg.isGroup){
        msg.sender = msg.participant
    }else{
        msg.sender = msg.key.remoteJid
    }
    if (msg.key.fromMe){
        msg.sender = conn.user.id.split(':')[0]+'@s.whatsapp.net'
    }

    msg.from = msg.key.remoteJid
    msg.now = msg.messageTimestamp
    msg.fromMe = msg.key.fromMe

    return msg
}

exports.getBuffer = async (url, options) => {
        try {
          options ? options : {}
          const res = await axios({
              method: "get",
              url,
              headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
              },
              ...options,
              responseType: 'arraybuffer'
            })
            return res.data
        } catch (e) {
            console.log(`Error : ${e}`)
        }
}

exports.fetchJson = (url, options) => new Promise(async(resolve, reject) => {
    fetch(url, options)
        .then(response => response.json())
        .then(json => {
            resolve(json)
        })
        .catch((err) => {
            reject(err)
        })
})

exports.getGroupAdmins = function(participants){
    let admins = []
	for (let i of participants) {
		i.admin !== null ? admins.push(i.id) : ''
	}
	return admins
}

exports.cekNumber = (num) => {
     if (num.startsWith('62')) num = num.replace('62', '0')
     var rep = num.slice(4)
     var has = num.replace(rep, '')
     var db = JSON.parse(fs.readFileSync('./database/provider.json'))
     var result = db[has] ? db[has] : { status: 404, msg: 'Invalid Number' }
     return result
}
