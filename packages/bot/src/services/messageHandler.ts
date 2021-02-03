import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { createDataRequest } from './createDataRequest'
import { parseProposalMessage } from './parseProposalMessage'
import { CommandFinder } from './commandFinder'
import { TYPES } from '../types'
import { sendRequestToWitnetNode } from '../nodeMethods/sendRequestToWitnetNode'
import { waitForTally } from '../nodeMethods/waitForTally'

@injectable()
export class MessageHandler {
  private commandFinder: CommandFinder

  constructor (@inject(TYPES.CommandFinder) commandFinder: CommandFinder) {
    this.commandFinder = commandFinder
  }

  handle (message: Message): Promise<Message | Array<Message>> | undefined {
    if (!message.author.bot) {
      if (this.commandFinder.isNewDaoMessage(message.content)) {
        const id = message.id
        const log = `DAO with ID ${id} is being created`
        // TODO: make a call to create a DAO
        return message.reply(log)
      } else if (this.commandFinder.isNewProposalMessage(message.content)) {
        const id = message.id
        const log = `Proposal with ID ${id} is being created`
        // TODO: make a call to create a DAO
        console.log('[BOT]:' + log)
        // TODO(#5): handle create proposal command
        // define proposal message structure and parse new proposal message
        const {
          channelId,
          messageId,
          proposaldeadline,
          proposalMessage
        } = parseProposalMessage(message)
        const deadline = Date.parse(proposaldeadline)
        const currentTime = Date.now()

        if (!proposalMessage) {
          return message.reply(
            `The proposal should follow the example: '!proposal [dd MM yyyy hh:mm:ss] [message]'`
          )
        } else if (!(deadline > currentTime)) {
          return message.reply(`The timestamp is invalid`)
        } else {
          // call createDataRequest with channelId and messageId
          setTimeout(() => {
            console.log(
              'Will create request for channelId ',
              channelId,
              ' and messageId ',
              messageId
            )
            const request = createDataRequest(channelId, messageId)
            console.log('Created request:', request)
            sendRequestToWitnetNode(
              request,
              (drTxHash: String) => {
                console.log('Request sent to witnet node, drTxHash: ', drTxHash)
                waitForTally(
                  drTxHash,
                  (tally: any) => {
                    console.log('Found tally for dr ', drTxHash, ': ', tally)
                  },
                  () => {}
                )
              },
              () => {}
            )
          }, deadline - Date.now())
          return message.reply(log)
        }
      } else {
        return
      }
    } else {
      return
    }
  }
}
