#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { createServer } from './server.js';

// stdout carries MCP messages, so anything meant for people must go to stderr.
const server = createServer();
await server.connect(new StdioServerTransport());
console.error('Tosyn MCP server is running on stdio.');
