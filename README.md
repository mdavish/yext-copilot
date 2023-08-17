# Yext Copilot

The goal of this repository is to create a copilot for Yext, similar to the one you're using right now - GitHub Copilot. The `config/` directory builds the backend of the bot, while the `front-end/` directory explores options for the front-end.

## Backend

The `config/` directory contains the code for the backend of the Yext Copilot. This includes the configuration files, the code for the natural language processing (NLP) engine, and the code for the machine learning (ML) models that power the copilot's suggestions.

## Frontend

The `front-end/` directory contains the code for the front-end of the Yext Copilot. This includes the user interface (UI) for the copilot, as well as any additional features or functionality that may be added in the future.

# Building the Configuration

Run this bad boy
```
deno run --allow-read --allow-write script.ts
yext resources apply build
```