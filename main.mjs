#!/usr/bin/env node

import { Ollama } from 'ollama';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import bygone from './bygoneBackend.js'

let hellyMemory = new bygone.cachedFile("hellyMemory.json");
hellyMemory.updateCache();

const ollama = new Ollama();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, readyClient => {
    bygone.output(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong! - Hook Online v000c');
    }

    if (interaction.commandName === 'prompt') {
        await interaction.deferReply();
        
        try {
            //parse chat message and make it fermiliar to the AI
            let prompt = interaction.user.id + ' said "' + interaction.options.getString('input') + '"';
            
            //push the messasge to memory so we can feed the AI the whole memory at once.
            hellyMemory.cache.chatHistory.push({role: 'user', content : prompt});
            
            //Request responce from ollama
            const hellySpeak = await ollama.chat({
                model : 'helly-small',
                messages: hellyMemory.cache.chatHistory,
            });

            //Filter out the think at the top of the message.
            let unfilteredOut = hellySpeak.message.content;
            const startIdx = unfilteredOut.indexOf("<think>");
            const endIdx = unfilteredOut.indexOf("</think>", startIdx + 1);
            let filteredOut = unfilteredOut
            if (startIdx !== -1 && endIdx !== -1) {
                filteredOut = unfilteredOut.substring(endIdx+9);
            }

            //if output is over 2000 discords API with throw an error
            if (filteredOut> 2000){
                throw "AI Responded with a message that was too long!";
            }

            //push both prompt and responce into memory
            hellyMemory.cache.chatHistory.push({role: 'assistant', content:filteredOut});

            await interaction.editReply(filteredOut);
            hellyMemory.updateFile();
            
        } catch (error){
            bygone.output("\n---ERROR---\n"+error)
            await interaction.editReply("SYSTEM - the Ai is borked up");
        }
    }

    if (interaction.commandName === 'rollback'){
        let memoriesToRemove = interaction.options.getInteger('memories');

        try {
            //if no input dump it all
            if (memoriesToRemove == null){
                memoriesToRemove = 1;
            }
            for (let i = 0; i < memoriesToRemove*2; i++){
                hellyMemory.cache.chatHistory.pop();
            }

            hellyMemory.updateFile();

            await interaction.reply('SYSTEM - Cleared last' + memoriesToRemove +' memories. '+ (hellyMemory.cache.chatHistory.length/2) + ' memories are remaining');
        } catch {
            await interaction.reply('SYSTEM - Error Occured While Clearing Memories');
        }
    }
});

client.login("");