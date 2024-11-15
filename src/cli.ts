#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program
  .name("st")
  .description("Stitch CLI - Seamlessly connecting development workflow gaps")
  .version("0.1.0");

program
  .command("hello")
  .description("Test command")
  .action(() => {
    console.log("Hello from Stitch CLI!");
  });

program.parse();
