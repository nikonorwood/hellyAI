import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'prompt',
    description: 'Replies with AI generated nonsense',
    options : [
        {
            type : 3,
            name : "input",
            description : "The input to give to the AI"
        }
    ]
  },
  {
    name: 'rollback',
    description: 'Removes the last x amount of interactions from Helly\'s memory ',
    options : [
        {
            type : 4,
            name : "memories",
            description : "How many memories to remove"
        }
    ]
  }
];

const rest = new REST({ version: '10' }).setToken("");

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands("1335375953773199481"), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}
