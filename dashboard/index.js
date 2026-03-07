#!/usr/bin/env node
// Uneden Admin Dashboard — Console CLI
// Run: node index.js
// Package as .exe: npx pkg index.js --targets node18-win-x64 --output fieldharts-dashboard.exe

import readline from "readline";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, "config.json");

// ─── ANSI colors ─────────────────────────────────────────────────────────────
const C = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  dim:    "\x1b[2m",
  green:  "\x1b[32m",
  cyan:   "\x1b[36m",
  yellow: "\x1b[33m",
  red:    "\x1b[31m",
  white:  "\x1b[97m",
  gray:   "\x1b[90m",
};

const g  = (s) => `${C.green}${s}${C.reset}`;
const c  = (s) => `${C.cyan}${s}${C.reset}`;
const y  = (s) => `${C.yellow}${s}${C.reset}`;
const r  = (s) => `${C.red}${s}${C.reset}`;
const b  = (s) => `${C.bold}${s}${C.reset}`;
const dim = (s) => `${C.dim}${s}${C.reset}`;

// ─── Readline helper ──────────────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

// ─── Config ───────────────────────────────────────────────────────────────────
function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")); }
  catch { return null; }
}
function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

// ─── Supabase login (REST) ───────────────────────────────────────────────────
async function loginWithSupabase(supabaseUrl, supabaseAnonKey, email, password) {
  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseAnonKey,
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed — check email/password");
  const data = await res.json();
  return data.access_token;
}

// ─── API call ─────────────────────────────────────────────────────────────────
async function fetchMetrics(cfg) {
  const res = await fetch(`${cfg.apiUrl}/admin/metrics`, {
    headers: { Authorization: `Bearer ${cfg.token}` },
  });
  if (res.status === 401) throw new Error("Token expired — re-login required");
  if (res.status === 403) throw new Error("Not authorized — is this account an admin?");
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ─── Display helpers ─────────────────────────────────────────────────────────
function hr(char = "─", len = 60) { return C.gray + char.repeat(len) + C.reset; }

function table(rows, keyLabel, valueLabel) {
  if (!rows || rows.length === 0) { console.log(dim("  (no data)")); return; }
  const maxKey = Math.max(keyLabel.length, ...rows.map(r => String(Object.values(r)[0]).length));
  console.log(`  ${b(keyLabel.padEnd(maxKey + 2))} ${b(valueLabel)}`);
  console.log(`  ${"-".repeat(maxKey + 2 + valueLabel.length + 2)}`);
  for (const row of rows) {
    const vals = Object.values(row);
    const key = String(vals[0]).padEnd(maxKey + 2);
    const val = String(vals[1]);
    console.log(`  ${c(key)} ${g(val)}`);
  }
}

function stat(label, value, unit = "") {
  console.log(`  ${b(label.padEnd(40))} ${g(value)}${unit ? dim(" " + unit) : ""}`);
}

function section(title) {
  console.log("\n" + hr());
  console.log(` ${b(y("▶"))} ${b(title)}`);
  console.log(hr());
}

// ─── Metrics display functions ────────────────────────────────────────────────
function showUsers(m) {
  section("USERS");
  stat("Total users", m.users.total);
  const byType = m.users.by_type || [];
  const persons   = byType.find(x => x.account_type === "person")?.count || 0;
  const companies = byType.find(x => x.account_type === "company")?.count || 0;
  stat("  → Person accounts", persons);
  stat("  → Business accounts", companies);
}

function showListings(m) {
  section("LISTINGS");
  stat("Total listings (all time)", m.listings.total);
  console.log("\n  By type:");
  table(m.listings.by_type.map(x => ({ type: x.type, count: x.count })), "Type", "Count");
}

function showListingsByCategory(m) {
  section("LISTINGS BY CATEGORY (popularity)");
  table(m.listings.by_category.map(x => ({ category: x.category, count: x.count })), "Category", "Count");
}

function showBookings(m) {
  section("BOOKINGS / REQUESTS");
  stat("Total requests (all time)", m.bookings.total);

  console.log("\n  By status:");
  table(m.bookings.by_status.map(x => ({ status: x.status, count: x.count })), "Status", "Count");

  console.log("\n  By listing type:");
  table(m.bookings.by_listing_type.map(x => ({ type: x.listing_type, count: x.count })), "Listing type", "Count");
}

function showBookingsDetail(m) {
  section("BOOKINGS DETAIL BY LISTING TYPE");

  console.log("\n  Completed:");
  table(m.bookings.completed_by_listing_type.map(x => ({ type: x.listing_type, count: x.count })), "Type", "Completed");

  console.log("\n  Cancelled:");
  table(m.bookings.cancelled_by_listing_type.map(x => ({ type: x.listing_type, count: x.count })), "Type", "Cancelled");
}

function showDisputes(m) {
  section("DISPUTES / COMPLAINTS");
  stat("Total disputes (all time)", m.disputes.total);
  console.log("\n  By status:");
  table(m.disputes.by_status.map(x => ({ status: x.status, count: x.count })), "Status", "Count");
}

function showFinancials(m) {
  section("FINANCIALS");
  const f = m.financials;
  stat("Total money transacted", `$${parseFloat(f.total_transacted).toFixed(2)}`);
  stat("Total revenue (commissions)", `$${parseFloat(f.total_revenue).toFixed(2)}`);
  stat("Total refunded", `$${parseFloat(f.total_refunded).toFixed(2)}`);
}

function showLocations(m) {
  section("TOP LOCATIONS — Listings");
  table(m.locations.listings.map(x => ({ location: x.location, count: x.listing_count })), "Location", "Listings");

  section("TOP LOCATIONS — Bookings");
  table(m.locations.bookings.map(x => ({ location: x.location, count: x.booking_count })), "Location", "Bookings");
}

function showAll(m) {
  showUsers(m);
  showListings(m);
  showListingsByCategory(m);
  showBookings(m);
  showBookingsDetail(m);
  showDisputes(m);
  showFinancials(m);
  showLocations(m);
}

// ─── Menu ─────────────────────────────────────────────────────────────────────
const MENU = [
  { key: "1",  label: "Users (totals & by type)",            fn: showUsers },
  { key: "2",  label: "Listings (totals & by type)",         fn: showListings },
  { key: "3",  label: "Listings by category",                fn: showListingsByCategory },
  { key: "4",  label: "Bookings / Requests (summary)",       fn: showBookings },
  { key: "5",  label: "Bookings detail by listing type",     fn: showBookingsDetail },
  { key: "6",  label: "Disputes & complaints",               fn: showDisputes },
  { key: "7",  label: "Financials (volume, revenue, refunds)",fn: showFinancials },
  { key: "8",  label: "Top locations",                       fn: showLocations },
  { key: "9",  label: "Show ALL metrics",                    fn: showAll },
  { key: "r",  label: "Refresh data from API",               fn: null },
  { key: "0",  label: "Exit",                                fn: null },
];

function printMenu() {
  console.log("\n" + hr("═"));
  console.log(b(c("  Uneden Admin Dashboard")));
  console.log(hr("═"));
  for (const item of MENU) {
    const prefix = item.key === "0" ? r : item.key === "r" ? y : dim;
    console.log(`  ${prefix(item.key.padStart(2))}  ${item.label}`);
  }
  console.log(hr("═"));
}

// ─── Setup wizard ─────────────────────────────────────────────────────────────
async function setup() {
  console.clear();
  console.log(hr("═"));
  console.log(b(c("  Uneden Admin Dashboard — First Time Setup")));
  console.log(hr("═"));
  console.log(dim("  This config will be saved locally for future runs.\n"));

  const apiUrl        = (await ask("  Backend API URL (e.g. http://localhost:5000/api): ")).trim();
  const supabaseUrl   = (await ask("  Supabase URL (e.g. https://xxx.supabase.co): ")).trim();
  const supabaseKey   = (await ask("  Supabase Anon Key: ")).trim();
  const email         = (await ask("  Admin email: ")).trim();
  const password      = (await ask("  Admin password: ")).trim();

  process.stdout.write("\n  Authenticating...");
  const token = await loginWithSupabase(supabaseUrl, supabaseKey, email, password);
  console.log(g(" OK"));

  const cfg = { apiUrl, supabaseUrl, supabaseKey, email, token };
  saveConfig(cfg);
  console.log(g("\n  Config saved. Starting dashboard...\n"));
  return cfg;
}

// ─── Re-login ─────────────────────────────────────────────────────────────────
async function reLogin(cfg) {
  const password = (await ask("  Password (token expired): ")).trim();
  cfg.token = await loginWithSupabase(cfg.supabaseUrl, cfg.supabaseKey, cfg.email, password);
  saveConfig(cfg);
  return cfg;
}

// ─── Main loop ────────────────────────────────────────────────────────────────
async function main() {
  console.clear();

  let cfg = loadConfig();
  if (!cfg) {
    cfg = await setup();
  }

  // Fetch initial data
  process.stdout.write("\n  Fetching metrics...");
  let metrics;
  try {
    metrics = await fetchMetrics(cfg);
    console.log(g(" OK"));
  } catch (err) {
    if (err.message.includes("expired")) {
      console.log(y(" Token expired — re-authenticating"));
      cfg = await reLogin(cfg);
      metrics = await fetchMetrics(cfg);
    } else {
      console.log(r(" FAILED: " + err.message));
      rl.close();
      process.exit(1);
    }
  }

  // Main loop
  while (true) {
    printMenu();
    const input = (await ask("\n  Enter number: ")).trim().toLowerCase();

    if (input === "0") {
      console.log(dim("\n  Goodbye.\n"));
      rl.close();
      process.exit(0);
    }

    if (input === "r") {
      process.stdout.write("\n  Refreshing...");
      try {
        metrics = await fetchMetrics(cfg);
        console.log(g(" OK"));
      } catch (err) {
        console.log(r(" Failed: " + err.message));
      }
      continue;
    }

    const item = MENU.find(m => m.key === input);
    if (!item || !item.fn) {
      console.log(r("  Invalid option."));
      continue;
    }

    console.clear();
    item.fn(metrics);
    console.log("\n" + dim("  Press Enter to return to menu..."));
    await ask("");
    console.clear();
  }
}

main().catch((err) => {
  console.error(r("\n  Fatal error: " + err.message));
  rl.close();
  process.exit(1);
});
