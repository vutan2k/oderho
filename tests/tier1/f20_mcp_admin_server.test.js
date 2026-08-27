import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertContains,
} from '../framework/assert.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

setTier('Tier 1: Feature Coverage');

test('[F20-1] Tavy Admin MCP Server file and entry point verification', () => {
  const mcpServerPath = path.join(projectRoot, 'mcp-server', 'index.js');
  assert(fs.existsSync(mcpServerPath), 'mcp-server/index.js exists');

  const content = fs.readFileSync(mcpServerPath, 'utf-8');
  assertContains(content, 'McpServer', 'Contains McpServer initialization');
  assertContains(content, 'list_orders', 'Registers list_orders tool');
  assertContains(content, 'update_exchange_rates', 'Registers update_exchange_rates tool');
  assertContains(content, 'scrape_korean_product', 'Registers scrape_korean_product tool');
});

test('[F20-2] Tavy Admin MCP config registration in ~/.gemini/config/mcp_config.json', () => {
  const mcpConfigPath = '/Users/tan/.gemini/config/mcp_config.json';
  assert(fs.existsSync(mcpConfigPath), 'mcp_config.json exists');

  const config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf-8'));
  assert(config.mcpServers !== undefined, 'mcpServers section exists');
  assert(config.mcpServers['tavy-admin'] !== undefined, 'tavy-admin MCP server is registered');
  assertEquals(config.mcpServers['tavy-admin'].command, 'node', 'Uses node binary');
  assertContains(config.mcpServers['tavy-admin'].args[0], 'mcp-server/index.js', 'Points to correct entry point');
});

test('[F20-3] Tavy Admin MCP Schemas & Tool Definitions verification', () => {
  const mcpDir = '/Users/tan/.gemini/antigravity/mcp/tavy-admin';
  assert(fs.existsSync(mcpDir), 'tavy-admin MCP schema directory exists');

  const requiredTools = [
    'list_orders.json',
    'get_order_detail.json',
    'update_order_status.json',
    'update_exchange_rates.json',
    'scrape_korean_product.json',
    'list_catalog_products.json',
    'get_system_analytics.json',
    'instructions.md'
  ];

  requiredTools.forEach(toolFile => {
    const p = path.join(mcpDir, toolFile);
    assert(fs.existsSync(p), `Tool definition ${toolFile} exists`);
  });
});
