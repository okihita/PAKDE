#!/usr/bin/env python3
"""DuckDB MCP server for the hackathon_data dump.

Exposes three read-only tools to an MCP client (stdio transport):
  - query(sql)      : run a read-only SQL statement, returns rows as a Markdown table
  - list_tables()   : list all table/view names
  - schema(table)   : column names + types for a table/view

The server opens the DuckDB file in read-only mode and additionally rejects any
statement that is not a safe read (SELECT / WITH / EXPLAIN / DESCRIBE /
PRAGMA table_info). This prevents accidental writes — it does NOT protect PII;
the source data is loaded raw, so run this only in a trusted context.

Usage:
    python server.py [--db PATH]            # stdio
    mcp run server.py -- --db PATH          # via mcp CLI
"""
import argparse
import os
import re
import sys

from mcp.server.fastmcp import FastMCP

DEFAULT_DB = os.path.abspath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "hackathon.duckdb")
)

# Statements that are never allowed through the query tool.
FORBIDDEN = re.compile(
    r"(?i)\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|ATTACH|DETACH|COPY|TRUNCATE|"
    r"VACUUM|ANALYZE|PRAGMA\s+(?!table_info|database_list|show))"
)

# Allowed leading keywords for the query tool.
ALLOWED_LEAD = re.compile(r"^\s*(SELECT|WITH|EXPLAIN|DESCRIBE|PRAGMA)\b", re.I)


def make_server(db_path: str) -> FastMCP:
    mcp = FastMCP("hackathon-duckdb")
    # Connect read-only; failures (e.g. missing file) surface at call time.
    con = duckdb_connect(db_path)

    @mcp.tool()
    def query(sql: str) -> str:
        """Run a read-only SQL query against the hackathon DuckDB database.

        Returns a Markdown table (or a short message). Only SELECT / WITH /
        EXPLAIN / DESCRIBE / PRAGMA table_info are permitted; writes and DDL
        are rejected.
        """
        cleaned = sql.strip().rstrip(";").strip()
        if not ALLOWED_LEAD.match(cleaned) or FORBIDDEN.search(cleaned):
            return (
                "Error: only read-only queries are allowed "
                "(SELECT / WITH / EXPLAIN / DESCRIBE / PRAGMA table_info). "
                "Writes and DDL are rejected."
            )
        try:
            cur = con.execute(cleaned)
            cols = [d[0] for d in cur.description] if cur.description else []
            rows = cur.fetchall()
        except Exception as e:  # pragma: no cover
            return f"Query error: {e}"
        if not cols:
            return f"OK ({cur.rowcount if cur.rowcount and cur.rowcount >= 0 else 0} rows affected)."
        if not rows:
            return "No rows."
        return rows_to_md(cols, rows)

    @mcp.tool()
    def list_tables() -> str:
        """List all tables and views in the database."""
        try:
            rows = con.execute(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema='main' ORDER BY table_name;"
            ).fetchall()
        except Exception as e:  # pragma: no cover
            return f"Error: {e}"
        if not rows:
            return "No tables found."
        return "\n".join(f"- {r[0]}" for r in rows)

    @mcp.tool()
    def schema(table: str) -> str:
        """Return the column names and types for a given table or view."""
        safe = table.strip().strip('"').strip("'")
        try:
            rows = con.execute(f'PRAGMA table_info("{safe}");').fetchall()
        except Exception as e:  # pragma: no cover
            return f"Error reading schema for '{safe}': {e}"
        if not rows:
            return f"No schema found for '{safe}'."
        lines = [f"# {safe}", "", "| column | type | notnull |", "|--------|------|---------|"]
        for r in rows:
            # PRAGMA table_info: cid, name, type, notnull, dflt, pk
            lines.append(f"| {r[1]} | {r[2] or 'VARCHAR'} | {r[3]} |")
        return "\n".join(lines)

    return mcp


def duckdb_connect(db_path: str):
    import duckdb

    if not os.path.exists(db_path):
        raise FileNotFoundError(
            f"Database not found: {db_path}. Run build_duckdb.py first."
        )
    return duckdb.connect(db_path, read_only=True)


def rows_to_md(cols, rows, max_rows=200):
    head = "| " + " | ".join(str(c) for c in cols) + " |"
    sep = "| " + " | ".join("---" for _ in cols) + " |"
    body = []
    for r in rows[:max_rows]:
        body.append("| " + " | ".join(_fmt(v) for v in r) + " |")
    out = [head, sep] + body
    if len(rows) > max_rows:
        out.append(f"\n… {len(rows) - max_rows} more row(s) omitted (showing first {max_rows}).")
    return "\n".join(out)


def _fmt(v):
    if v is None:
        return ""
    s = str(v)
    return s.replace("\n", " ").replace("|", "\\|")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.environ.get("DUCKDB_PATH", DEFAULT_DB))
    args = ap.parse_args()
    global mcp
    mcp = make_server(os.path.abspath(args.db))
    mcp.run(transport="stdio")


# Module-level server object so `mcp run server.py` (which expects a global
# `mcp`/`server`/`app`) works without extra arguments. Uses DUCKDB_PATH or the
# default location; override per-invocation with `--db` or the env var.
mcp = make_server(os.environ.get("DUCKDB_PATH", DEFAULT_DB))


if __name__ == "__main__":
    main()
