import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import * as SQLite from 'expo-sqlite';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note: string;
  createdAt: string;
}

export interface NewTransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note: string;
}

interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

interface CategoryTotal {
  category: string;
  amount: number;
  count: number;
}

interface ExpenseContextType {
  transactions: Transaction[];
  isLoaded: boolean;
  addTransaction: (payload: NewTransactionInput) => Promise<void>;
  updateTransaction: (
    id: string,
    payload: Omit<NewTransactionInput, 'type'> & { type?: TransactionType },
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getMonthlySummary: (month?: Date) => MonthlySummary;
  getCategoryTotals: (type: TransactionType, month?: Date) => CategoryTotal[];
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);
const DB_NAME = 'fintrack.sqlite';

function normalizeMonth(dateString: string) {
  const parsed = new Date(`${dateString}T00:00:00`);
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
}

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [database, setDatabase] = useState<SQLite.SQLiteDatabase | null>(null);

  const loadTransactions = useCallback(async (db: SQLite.SQLiteDatabase) => {
    const rows = await db.getAllAsync<{
      id: string;
      type: TransactionType;
      amount: number;
      category: string;
      date: string;
      note: string;
      created_at: string;
    }>(
      `SELECT id, type, amount, category, date, note, created_at
       FROM transactions
       ORDER BY date DESC, created_at DESC`,
    );

    setTransactions(
      rows.map((row: (typeof rows)[number]) => ({
        id: row.id,
        type: row.type,
        amount: Number(row.amount),
        category: row.category,
        date: row.date,
        note: row.note,
        createdAt: row.created_at,
      })),
    );
  }, []);

  useEffect(() => {
    let isActive = true;

    const initDb = async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
          amount REAL NOT NULL,
          category TEXT NOT NULL,
          date TEXT NOT NULL,
          note TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);

      if (!isActive) return;
      setDatabase(db);
      await loadTransactions(db);
      setIsLoaded(true);
    };

    initDb().catch((error) => {
      console.error('Failed to initialize local database:', error);
      setIsLoaded(true);
    });

    return () => {
      isActive = false;
    };
  }, [loadTransactions]);

  const addTransaction = useCallback(
    async (payload: NewTransactionInput) => {
      if (!database) return;

      const createdAt = new Date().toISOString();
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      await database.runAsync(
        `INSERT INTO transactions (id, type, amount, category, date, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          payload.type,
          payload.amount,
          payload.category,
          payload.date,
          payload.note,
          createdAt,
        ],
      );

      await loadTransactions(database);
    },
    [database, loadTransactions],
  );

  const updateTransaction = useCallback(
    async (
      id: string,
      payload: Omit<NewTransactionInput, 'type'> & { type?: TransactionType },
    ) => {
      if (!database) return;

      await database.runAsync(
        `UPDATE transactions
         SET type = ?, amount = ?, category = ?, date = ?, note = ?
         WHERE id = ?`,
        [
          payload.type ?? 'expense',
          payload.amount,
          payload.category,
          payload.date,
          payload.note,
          id,
        ],
      );

      await loadTransactions(database);
    },
    [database, loadTransactions],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!database) return;
      await database.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
      setTransactions((prev) => prev.filter((entry) => entry.id !== id));
    },
    [database],
  );

  const getMonthlySummary = useCallback(
    (month: Date = new Date()): MonthlySummary => {
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;

      const monthlyItems = transactions.filter(
        (entry) => normalizeMonth(entry.date) === monthKey,
      );

      const totalIncome = monthlyItems
        .filter((entry) => entry.type === 'income')
        .reduce((sum, entry) => sum + entry.amount, 0);

      const totalExpenses = monthlyItems
        .filter((entry) => entry.type === 'expense')
        .reduce((sum, entry) => sum + entry.amount, 0);

      return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
      };
    },
    [transactions],
  );

  const getCategoryTotals = useCallback(
    (type: TransactionType, month: Date = new Date()): CategoryTotal[] => {
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      const totals = new Map<string, CategoryTotal>();

      transactions
        .filter(
          (entry) =>
            entry.type === type && normalizeMonth(entry.date) === monthKey,
        )
        .forEach((entry) => {
          const existing = totals.get(entry.category);
          if (!existing) {
            totals.set(entry.category, {
              category: entry.category,
              amount: entry.amount,
              count: 1,
            });
            return;
          }

          totals.set(entry.category, {
            category: entry.category,
            amount: existing.amount + entry.amount,
            count: existing.count + 1,
          });
        });

      return [...totals.values()].sort((a, b) => b.amount - a.amount);
    },
    [transactions],
  );

  const value = useMemo(
    () => ({
      transactions,
      isLoaded,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getMonthlySummary,
      getCategoryTotals,
    }),
    [
      transactions,
      isLoaded,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getMonthlySummary,
      getCategoryTotals,
    ],
  );

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}
