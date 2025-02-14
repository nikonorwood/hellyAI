const { messageLink } = require('discord.js');
const bygone = require ('../bygoneBackend');
var fs = require('fs');

let searchDir = "trainingData/JSON/";

bygone.setDebug(true);
bygone.output("Scanning for files...");

//gather filenames
var files = fs.readdirSync(searchDir);

let usermap = []
bygone.output("Found "+files.length+" files!");

for (let filename of files){
    let unparsedFile = new bygone.cachedFile(searchDir+filename);

    unparsedFile.updateCache().then(()=>{
        channelMessages = unparsedFile.cache.messages;

        for (let message of channelMessages){
            if (!usermap.some(e => e.username == message.author.name)){
               usermap.push({
                user : message.author.id,
                username : message.author.name
               }) 
            }
        }

        console.log(usermap);
    })
}