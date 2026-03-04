"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Clock, ChevronRight } from "lucide-react";

interface WalletData {
  balance: number;
  total_earned: number;
  total_spent: number;
}

interface Transaction {
  id: string;
  booking_id: string | null;
  type: "credit" | "debit";
  amount: number;
  description: string;
  other_user_name: string | null;
  listing_title: string | null;
  created_at: string;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatAmount(amount: number) {
  return Number(amount).toFixed(2);
}

export default function WalletPage() {
  const { user, session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!session?.access_token) return;

    const headers = { Authorization: `Bearer ${session.access_token}` };

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet`, { headers }).then((r) => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/transactions`, { headers }).then((r) => r.json()),
    ])
      .then(([walletData, txData]) => {
        setWallet(walletData);
        setTransactions(Array.isArray(txData) ? txData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, session, router, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-40" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
            <div className="h-64 bg-gray-100 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>

        {/* Balance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:col-span-1 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <Wallet className="h-6 w-6 text-green-700" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Available Balance</p>
            <p className="text-3xl font-extrabold text-green-700">
              ${formatAmount(wallet?.balance ?? 0)}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <ArrowDownCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Earned</p>
              <p className="text-xl font-bold text-gray-900">${formatAmount(wallet?.total_earned ?? 0)}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <ArrowUpCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Spent</p>
              <p className="text-xl font-bold text-gray-900">${formatAmount(wallet?.total_spent ?? 0)}</p>
            </div>
          </div>
        </div>

        {/* Transaction history */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Transaction History</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Clock className="h-10 w-10 mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-600">No transactions yet</p>
              <p className="text-xs text-gray-400 mt-1">Completed jobs will appear here</p>
              <Link href="/listings" className="text-sm text-green-700 hover:underline mt-4">
                Browse listings
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === "credit" ? "bg-green-100" : "bg-orange-100"
                  }`}>
                    {tx.type === "credit"
                      ? <ArrowDownCircle className="h-4.5 w-4.5 text-green-600 h-5 w-5" />
                      : <ArrowUpCircle className="h-5 w-5 text-orange-600" />
                    }
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tx.listing_title ?? tx.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {tx.other_user_name && (
                        <span className="text-xs text-gray-500">
                          {tx.type === "credit" ? "From" : "To"} {tx.other_user_name}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400">{formatDate(tx.created_at)}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-base font-bold ${
                      tx.type === "credit" ? "text-green-700" : "text-orange-600"
                    }`}>
                      {tx.type === "credit" ? "+" : "−"}${formatAmount(tx.amount)}
                    </span>
                    {tx.booking_id && (
                      <Link href="/bookings">
                        <ChevronRight className="h-4 w-4 text-gray-300 hover:text-gray-500" />
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
