import {Mutex} from 'async-mutex'
import Jimp from 'jimp'
import {loadDb, persistDb, makeStorageClient} from './service/core/ipfs/index.js'
import createDb from './service/core/lowdb/index.js'
import createHeartBeat from './service/core/heartbeats/index.js'
import {checkWhenNewGuild, checkWhenReady, onMessageCreate, createClient} from './service/discord/index.js'
import processCommand from './service/discord/command/index.js'
import {checkEndRound} from './service/core/reputation/index.js'
import {processReaction} from './service/discord/reaction/index.js'
import {checkEndProposal} from './service/discord/proposal/index.js'
import dotenv from 'dotenv'


import {getState, stateApi} from "./local-state/state.js";

(async () => {
    dotenv.config()

    if(!process.env.DISCORD_TOKEN){
        console.error('No DISCORD_TOKEN environment variable set ; Standard ways is to write it in a .env file')
        return
    }
    if(!process.env.WEB3_TOKEN){
        console.error('No WEB3_TOKEN environment variable set ; Standard ways is to write it in a .env file')
        return
    }
    process.env.SALT = {}
    // Mutex will be used to prevent concurrent modification on aleph,
    // it's slow inefficient BUT good enough for this use-case
    const mutex = new Mutex()

    // web3.storage client
    const clientWeb3 = await makeStorageClient()

    const db = await createDb()
    const salt = {} // Salt will be used for captcha secret
    const noiseOriginal = await Jimp.read('./images/noise.png') // Noise image for captcha

    // Load last saved Database
    if (stateApi.isAppAvailable()){
        await loadDb(clientWeb3, db, mutex)
    }

    // Discord.js client
    const clientDiscord = await createClient(
        undefined,
        undefined,
        undefined,
        async (client) => await checkWhenReady(client, Object.values(db.data).map(d => d?.guildDiscordId)),
        (message) => onMessageCreate(message, clientDiscord, db, mutex),
        async (messageReaction, user) => await processReaction(messageReaction, user, false, db, mutex),
        async (messageReaction, user) => await processReaction(messageReaction, user, true, db, mutex),
        (interaction) => processCommand(interaction, db, mutex, salt, noiseOriginal, clientWeb3),
        async (guild) => await checkWhenNewGuild(guild),)


        const heartbeat = createHeartBeat(undefined, undefined, [
            {modulo: 6, func: async () => await persistDb(clientWeb3, db, mutex)},
            {modulo: 2, func: async () => await checkEndRound(db, mutex, {client: clientDiscord})},
            {modulo: 2, func: async () => await checkEndProposal(db, mutex, {client: clientDiscord})},
        ])
})()