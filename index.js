#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const API_URL = 'https://www.solonreview.dev/api/mcp'
const API_KEY = process.env.SOLON_API_KEY

if (!API_KEY) {
  console.error('Error: SOLON_API_KEY environment variable is required')
  console.error('Get your API key at https://www.solonreview.dev/dashboard/settings')
  process.exit(1)
}

async function callSolon(tool, params) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({ tool, params }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Request failed')
  }
  return res.json()
}

const server = new McpServer({
  name: 'solon-ai',
  version: '1.0.0',
})

server.tool(
  'solon_check_standards',
  'Check code against your team\'s playbook rules configured in Solon AI',
  {
    repoFullName: z.string().describe('GitHub repo full name e.g. myorg/myrepo'),
    code: z.string().describe('Code or git diff to check against team standards'),
    language: z.string().optional().describe('Language: typescript, javascript, python, rust'),
  },
  async ({ repoFullName, code, language }) => {
    const result = await callSolon('solon_check_standards', { repoFullName, code, language })
    return { content: [{ type: 'text', text: JSON.stringify(result.review, null, 2) }] }
  }
)

server.tool(
  'solon_get_playbook',
  'Get the enabled playbook rules for a connected repo in Solon AI',
  {
    repoFullName: z.string().describe('GitHub repo full name e.g. myorg/myrepo'),
  },
  async ({ repoFullName }) => {
    const result = await callSolon('solon_get_playbook', { repoFullName })
    return { content: [{ type: 'text', text: JSON.stringify(result.playbook, null, 2) }] }
  }
)

server.tool(
  'solon_record_review',
  'Record a completed code review to the Solon AI dashboard',
  {
    repoFullName: z.string().describe('GitHub repo full name'),
    prNumber: z.number().describe('Pull request number'),
    prTitle: z.string().describe('Pull request title'),
    summary: z.string().describe('Review summary'),
    status: z.enum(['pass', 'fail']).optional().describe('Review status'),
  },
  async ({ repoFullName, prNumber, prTitle, summary, status }) => {
    const result = await callSolon('solon_record_review', { repoFullName, prNumber, prTitle, summary, status })
    return { content: [{ type: 'text', text: result.recorded ? 'Review recorded successfully' : 'Failed to record review' }] }
  }
)

const transport = new StdioServerTransport()
await server.connect(transport)
