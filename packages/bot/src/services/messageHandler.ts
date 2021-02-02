import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { createDataRequest } from './createDataRequest'
import { parseProposalMessage } from './parseProposalMessage'
import { CommandFinder } from './commandFinder'
import { TYPES } from '../types'

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

        const id = message.id
        const log = `Proposal with ID ${id} is being created. The time for voting will end on ${new Date(
          deadline
        )}`
        console.log('[BOT]:' + log)

        // TODO: make a call to create a DAO
        if (!proposalMessage) {
          return message.reply(
            `The proposal should follow the example: '!proposal [MM dd yyyy HH:mm:ss] [message]'`
          )
        } else if (!(deadline > currentTime)) {
          return message.reply(`The timestamp is invalid`)
        } else {
          // call createDataRequest with channelId and messageId
          setTimeout(() => {
            createDataRequest(channelId, messageId)
            // TODO: it can overflow if the proposal is scheduled far in the future.
          }, deadline - currentTime)
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
