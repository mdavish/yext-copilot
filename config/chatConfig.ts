import type { ChatBotConfiguration } from "./ChatBotConfig/index.ts";
import createSearchExperience from "./goals/createSearchExperience.ts";
import yextSoftwareQuestion from "./goals/yextSoftwareQuestion.ts";
import listSearchExperiences from "./goals/listSearchExperiences.ts";
import listEntityTypes from "./goals/listEntityTypes.ts";
import listFields from "./goals/listFields.ts";
import createEntityType from "./goals/createEntityType.ts";
import createCrawler from "./goals/createCrawler.ts";
import chitChat from "./goals/chitChat.ts";
import submitSupportTicket from "./goals/submitSupportTicket.ts";
import modifySearchExperience from "./goals/modifySearchExperience.ts";

const config: ChatBotConfiguration = {
  $id: "yext-copilot",
  name: "Yext Copilot",
  identityContext:
    "You are the Yext Copilot. Your job is to help this user navigate his or her Yext Account. Yext is a SaaS platform that helps users build digital experiences, like websites and chat bots.",
  initialMessage: "Hello, this is your Yext Copilot. How can I help you?",
  goals: {
    "chit-chat": chitChat,
    "submit-support-ticket": submitSupportTicket,
    "create-search-experience": createSearchExperience,
    "yext-software-question": yextSoftwareQuestion,
    "list-search-experiences": listSearchExperiences,
    "list-entity-types": listEntityTypes,
    "list-fields": listFields,
    "create-entity-type": createEntityType,
    "create-crawler": createCrawler,
    "modify-search-experience": modifySearchExperience,
  },
};

export default config;
