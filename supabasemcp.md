Connect your AI tools to Supabase using MCP

The Model Context Protocol (MCP) is a standard for connecting Large Language Models (LLMs) to platforms like Supabase. Once connected, your AI assistants can interact with and query your Supabase projects on your behalf.

Remote MCP installation#
Step 1: Follow our security best practices#
Before running the MCP server, we recommend you read our security best practices to understand the risks of connecting an LLM to your Supabase projects and how to mitigate them.

Step 2: Configure your AI tool#
Choose your Supabase platform, project, and MCP client and follow the installation instructions:

Platform

Hosted
Project

meshrepair
Scope the MCP server to a project. If no project is selected, all projects will be accessible.

Options
Read-only


Feature Groups


All features except Storage enabled by default
Server URL
https://mcp.supabase.com/mcp?project_ref=sfwisfsqhaztfbygegvy

Client

openai logoCodex
Configure your MCP client to connect with your Supabase project

Installation
Add the Supabase MCP server to Codex:

codex mcp add supabase --url "https://mcp.supabase.com/mcp?project_ref=sfwisfsqhaztfbygegvy"

Alternatively, add this configuration to ~/.codex/config.toml:
[mcp_servers.supabase]
url = "https://mcp.supabase.com/mcp?project_ref=sfwisfsqhaztfbygegvy"

Authenticate with the MCP server:

codex mcp login supabase

Finally, run /mcp inside Codex to verify authentication.

Need help?
View Codex docs
Authentication
Some MCP clients will automatically prompt you to login during setup, while others may require manual authentication steps. Either authentication method will open a browser window where you can login to your Supabase account and grant organization access to the MCP client. In the future, we'll offer more fine grain control over these permissions.

Previously Supabase MCP required you to generate a personal access token (PAT), but this is no longer required.

Next steps#
Your MCP client automatically redirects you to log in to Supabase during setup. This opens a browser window where you can log in to your Supabase account and grant access to the MCP client. Be sure to choose the organization that contains the project you wish to work with.

After you log in, check that the MCP server is connected. For instance, in Cursor, navigate to Settings > Cursor Settings > Tools & MCP. Depending on the client, you may need to restart it to connect and detect all tools after authorization.

To verify the client has access to the MCP server tools, try asking it to query your project or database using natural language. For example: "What tables are there in the database? Use MCP tools."

For curated, ready-to-use prompts that work well with IDEs and AI agents, see our AI Prompts collection.

Additionally, you can install Supabase agent skills alongside the MCP server, use the Supabase Plugin for AI Coding Agents for a combined one-step setup.

Available tools#
The Supabase MCP server provides tools organized into feature groups. All groups except Storage are enabled by default. You can enable or disable specific groups using the configuration panel above.

Database#
list_tables - List all tables in the database
list_extensions - List available/installed Postgres extensions
list_migrations - List database migrations
apply_migration - Apply a database migration
execute_sql - Execute SQL queries
Debugging#
get_logs - Retrieve service logs (API, Postgres, Edge Functions, Auth, Storage, Realtime)
get_advisors - Get security and performance advisors
Development#
get_project_url - Get the API URL for a project
get_publishable_keys - Get publishable and legacy anon API keys for a project
generate_typescript_types - Generate TypeScript types from schema
Edge Functions#
list_edge_functions - List all Edge Functions
get_edge_function - Get a specific Edge Function
deploy_edge_function - Deploy an Edge Function
Account management#
Disabled when using project-scoped mode (project_ref parameter).

list_projects / get_project - List or get project details
create_project / pause_project / restore_project - Manage projects
list_organizations / get_organization - Organization management
get_cost / confirm_cost - Cost information
Docs#
search_docs - Search Supabase documentation
Branching (experimental)#
Requires a paid plan.

create_branch / list_branches / delete_branch - Branch management
merge_branch / reset_branch / rebase_branch - Branch operations
Storage (disabled by default)#
list_storage_buckets - List storage buckets
get_storage_config / update_storage_config - Storage configuration
Configuration options#
The configuration panel above can set these options for you. If you prefer to configure manually, the following URL query parameters are available:

Parameter	Description	Example
read_only=true	Execute all queries as a read-only Postgres user	?read_only=true
project_ref=<id>	Scope to a specific project (disables account tools)	?project_ref=abc123
features=<groups>	Enable only specific tool groups (comma-separated)	?features=database,docs
Parameters can be combined: https://mcp.supabase.com/mcp?project_ref=abc123&read_only=true

When using Supabase CLI for local development, the MCP server is available at http://localhost:54321/mcp.

