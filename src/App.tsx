import { useState, useEffect } from "react";
import { initDb, getDb } from "./db";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import "./App.css";

// Interface Definitions
interface Member {
  id: string;
  nik: string;
  name: string;
  place_of_birth: string;
  date_of_birth: string;
  gender: "L" | "P";
  occupation: string;
  education: string;
  rt: string;
  rw: string;
  hamlet: string;
  status: "aktif" | "nonaktif";
  savings_pokok: number;
  savings_wajib: number;
  savings_sukarela: number;
  loan_total: number;
  loan_outstanding: number;
  loan_status: string;
}

interface CoaAccount {
  code: string;
  name: string;
  type: "aset" | "kewajiban" | "ekuitas" | "pendapatan" | "beban";
  normal_balance: "debit" | "kredit";
  balance: number;
}

interface JournalLineInput {
  accountCode: string;
  debit: number;
  credit: number;
}

interface JournalEntryWithLines {
  id: string;
  number: string;
  date: string;
  description: string;
  reference: string;
  category: string;
  tags: string;
  lines: Array<{
    account_code: string;
    name: string;
    debit: number;
    credit: number;
  }>;
}

export default function App() {
  // Navigation & Core States
  const [appState, setAppState] = useState<"splash" | "setup" | "login" | "main" | "db_error">("splash");
  const [dbErrorMessage, setDbErrorMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string } | null>(null);

  // PIN Auth States
  const [pinInput, setPinInput] = useState("");
  const [setupPin, setSetupPin] = useState("");
  const [setupConfirmPin, setSetupConfirmPin] = useState("");
  const [setupQuestion, setSetupQuestion] = useState("Apa nama hewan peliharaan pertama Anda?");
  const [setupAnswer, setSetupAnswer] = useState("");

  const [loginLockedUntil, setLoginLockedUntil] = useState<number | null>(null);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const [showRecoveryFlow, setShowRecoveryFlow] = useState(false);
  const [recoveryAnswerInput, setRecoveryAnswerInput] = useState("");
  const [recoveryQuestionText, setRecoveryQuestionText] = useState("");
  const [pinErrorText, setPinErrorText] = useState("");

  // Dashboard Data States
  const [activeTab, setActiveTab] = useState<"home" | "members" | "accounting" | "feasibility" | "sync" | "settings">("home");
  const [coopProfile, setCoopProfile] = useState<any>({
    name: "Koperasi Maju Bersama",
    legal_id: "",
    address: "",
    village: "",
    district: "",
    regency: "Mojokerto",
    province: "Jawa Timur",
    postal_code: "",
    phone: "",
    email: "",
    business_units: '["unit_apotek", "unit_pupuk"]',
    officers: '{"chairman": "", "secretary": "", "treasurer": "", "supervisor": ""}',
    health_score: 100,
    rag_status: "green",
  });
  const [ewsAlertsList, setEwsAlertsList] = useState<any[]>([]);
  const [dashboardIncomeData, setDashboardIncomeData] = useState<any[]>([]);

  // Member CRUD States
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberFilterStatus, setMemberFilterStatus] = useState("semua");
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberFormType, setMemberFormType] = useState<"add" | "edit">("add");
  const [currentMemberId, setCurrentMemberId] = useState("");
  const [memberFormValues, setMemberFormValues] = useState<any>({
    nik: "",
    name: "",
    place_of_birth: "",
    date_of_birth: "",
    gender: "L",
    occupation: "",
    education: "",
    rt: "",
    rw: "",
    hamlet: "",
    status: "aktif",
    savings_pokok: 0,
    savings_wajib: 0,
    savings_sukarela: 0,
    loan_total: 0,
    loan_outstanding: 0,
    loan_status: "lancar",
  });

  // Accounting States
  const [accountingTab, setAccountingTab] = useState<"coa" | "journal" | "ledger" | "neraca" | "labarugi">("coa");
  const [coaAccounts, setCoaAccounts] = useState<CoaAccount[]>([]);
  const [showCoaModal, setShowCoaModal] = useState(false);
  const [newCoaValues, setNewCoaValues] = useState({
    code: "",
    name: "",
    type: "aset" as const,
    normal_balance: "debit" as const,
    balance: 0,
  });
  const [journalEntries, setJournalEntries] = useState<JournalEntryWithLines[]>([]);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalForm, setJournalForm] = useState({
    date: new Date().toISOString().split("T")[0],
    number: "",
    description: "",
    reference: "",
    category: "operasional",
    tags: "",
    lines: [
      { accountCode: "1.1.01", debit: 0, credit: 0 },
      { accountCode: "4.01", debit: 0, credit: 0 },
    ] as JournalLineInput[],
  });
  const [ledgerSelectedCode, setLedgerSelectedCode] = useState("1.1.01");
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [ledgerBalanceStart, setLedgerBalanceStart] = useState(0);
  const [ledgerBalanceEnd, setLedgerBalanceEnd] = useState(0);

  // Financial Feasibility Analysis States
  const [feasibilityActiveTab, setFeasibilityActiveTab] = useState<"calculator" | "sensitivity">("calculator");
  const [feasibilityParams, setFeasibilityParams] = useState({
    initialInvestment: 50000000,
    projectionYears: 5,
    cashFlows: "18000000,22000000,25000000,28000000,30000000",
    discountRate: 8.5,
    opportunityCost: 5.0,
  });
  const [feasibilityResults, setFeasibilityResults] = useState<any>(null);
  const [sensitivityScenario, setSensitivityScenario] = useState<"optimis" | "moderat" | "pesimis">("moderat");
  const [sensitivityPresetResults, setSensitivityPresetResults] = useState<any>(null);

  // Sync Center States
  const [syncHistoryList, setSyncHistoryList] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState("");
  const [syncServerUrl] = useState("koperasi.kab-mojokerto.go.id");

  // Settings & Core updates
  const [appTheme, setAppTheme] = useState<"dark" | "light">("dark");
  const [fontSizeSetting, setFontSizeSetting] = useState<"normal" | "large">("normal");
  const [updateStatusText, setUpdateStatusText] = useState("");
  const [isUpdateChecking, setIsUpdateChecking] = useState(false);

  // Database Initialization Hook
  useEffect(() => {
    async function loadDatabase() {
      try {
        await initDb();
        const db = await getDb();

        // Check if users table is populated
        const users = await db.select<any[]>("SELECT * FROM local_users");
        if (users.length === 0) {
          setAppState("setup");
        } else {
          // Retrieve recovery question for user reset fallback
          if (users[0].recovery_question) {
            setRecoveryQuestionText(users[0].recovery_question);
          }
          setAppState("login");
        }
      } catch (err: any) {
        console.error(err);
        setDbErrorMessage(err.message || String(err));
        setAppState("db_error");
      }
    }
    setTimeout(loadDatabase, 800); // Small timeout to show splash screen branding
  }, []);

  // Lockout Timer Hook
  useEffect(() => {
    let timer: any;
    if (loginLockedUntil) {
      const remaining = Math.ceil((loginLockedUntil - Date.now()) / 1000);
      if (remaining > 0) {
        setLockoutCountdown(remaining);
        timer = setInterval(() => {
          const rem = Math.ceil((loginLockedUntil - Date.now()) / 1000);
          if (rem <= 0) {
            setLoginLockedUntil(null);
            setLockoutCountdown(0);
            setPinErrorText("");
            clearInterval(timer);
          } else {
            setLockoutCountdown(rem);
          }
        }, 1000);
      } else {
        setLoginLockedUntil(null);
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [loginLockedUntil]);

  // Load Main Panel States Hook
  useEffect(() => {
    if (appState === "main") {
      loadProfileData();
      loadDashboardStats();
      loadMembersData();
      loadAccountsData();
      loadJournalData();
      loadLedgerData();
      loadSyncHistoryData();
    }
  }, [appState]);

  // General Ledger Update Hook when selection changes
  useEffect(() => {
    if (appState === "main") {
      loadLedgerData();
    }
  }, [ledgerSelectedCode]);

  // --- BUSINESS LOGIC FUNCTIONS ---

  // Database loaders
  async function loadProfileData() {
    try {
      const db = await getDb();
      const res = await db.select<any[]>("SELECT * FROM cooperatives LIMIT 1");
      if (res.length > 0) {
        setCoopProfile(res[0]);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadDashboardStats() {
    try {
      const db = await getDb();
      // Load recent EWS alerts
      const alerts = await db.select<any[]>("SELECT * FROM ews_alerts ORDER BY triggered_at DESC LIMIT 5");
      setEwsAlertsList(alerts);

      // Load mock income data or calculate monthly totals (here we use mock monthly finance defaults)
      setDashboardIncomeData([
        { month: "Feb", income: 72000000, expense: 58000000 },
        { month: "Mar", income: 75000000, expense: 61000000 },
        { month: "Apr", income: 81000000, expense: 59000000 },
        { month: "May", income: 78000000, expense: 64000000 },
        { month: "Jun", income: 85000000, expense: 62000000 },
        { month: "Jul", income: 89000000, expense: 60000000 },
      ]);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadMembersData() {
    try {
      const db = await getDb();
      const res = await db.select<Member[]>("SELECT * FROM members ORDER BY name ASC");
      setMembersList(res);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadAccountsData() {
    try {
      const db = await getDb();
      const res = await db.select<CoaAccount[]>("SELECT * FROM coa_accounts ORDER BY code ASC");
      setCoaAccounts(res);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadJournalData() {
    try {
      const db = await getDb();
      const entries = await db.select<any[]>("SELECT * FROM journal_entries ORDER BY date DESC, number DESC");
      const mapped: JournalEntryWithLines[] = [];

      for (const entry of entries) {
        const lines = await db.select<any[]>(
          `SELECT jl.*, ca.name 
           FROM journal_lines jl
           LEFT JOIN coa_accounts ca ON jl.account_code = ca.code
           WHERE jl.journal_entry_id = ?`,
          [entry.id]
        );
        mapped.push({ ...entry, lines });
      }
      setJournalEntries(mapped);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadLedgerData() {
    try {
      const db = await getDb();
      // Fetch starting balance
      const account = await db.select<any[]>("SELECT balance FROM coa_accounts WHERE code = ?", [ledgerSelectedCode]);
      const balanceEnd = account.length > 0 ? account[0].balance : 0;
      setLedgerBalanceEnd(balanceEnd);

      // Fetch lines matching account code
      const lines = await db.select<any[]>(
        `SELECT jl.*, je.date, je.number, je.description as entry_desc
         FROM journal_lines jl
         INNER JOIN journal_entries je ON jl.journal_entry_id = je.id
         WHERE jl.account_code = ?
         ORDER BY je.date ASC, je.created_at ASC`,
        [ledgerSelectedCode]
      );

      // Calculate running balances

      // Reverse lines to calculate start balance
      let debSum = 0;
      let credSum = 0;
      for (const line of lines) {
        debSum += line.debit;
        credSum += line.credit;
      }
      // Assuming normal balance type
      const accInfo = await db.select<any[]>("SELECT normal_balance FROM coa_accounts WHERE code = ?", [ledgerSelectedCode]);
      const normalBal = accInfo.length > 0 ? accInfo[0].normal_balance : "debit";
      
      const netActivity = normalBal === "debit" ? (debSum - credSum) : (credSum - debSum);
      const balanceStart = balanceEnd - netActivity;
      setLedgerBalanceStart(balanceStart);

      let running = balanceStart;
      const computedLines = lines.map((line) => {
        const change = normalBal === "debit" ? (line.debit - line.credit) : (line.credit - line.debit);
        running += change;
        return { ...line, runningBalance: running };
      });

      setLedgerEntries(computedLines);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadSyncHistoryData() {
    try {
      const db = await getDb();
      const res = await db.select<any[]>("SELECT * FROM sync_history ORDER BY started_at DESC LIMIT 10");
      setSyncHistoryList(res);
    } catch (e) {
      console.error(e);
    }
  }

  // Auth Operations
  const handleSetupPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupPin.length !== 6 || setupConfirmPin.length !== 6) {
      setPinErrorText("PIN harus 6 digit angka.");
      return;
    }
    if (setupPin !== setupConfirmPin) {
      setPinErrorText("Konfirmasi PIN tidak cocok.");
      return;
    }
    if (!setupAnswer.trim()) {
      setPinErrorText("Jawaban pemulihan harus diisi.");
      return;
    }

    try {
      const db = await getDb();
      // Insert default admin user linked to kdp-001
      const userId = "usr-001";
      await db.execute(
        `INSERT INTO local_users (id, cooperative_id, name, role, pin_hash, recovery_question, recovery_answer_hash)
         VALUES (?, 'kdp-001', 'Slamet Riyadi', 'admin', ?, ?, ?)`,
        [userId, setupPin, setupQuestion, setupAnswer.trim().toLowerCase()]
      );

      // Authenticate directly
      setCurrentUser({ id: userId, name: "Slamet Riyadi", role: "admin" });
      setAppState("main");
    } catch (err: any) {
      setPinErrorText(`Setup gagal: ${err.message || err}`);
    }
  };

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loginLockedUntil && Date.now() < loginLockedUntil) {
      return;
    }

    try {
      const db = await getDb();
      const users = await db.select<any[]>("SELECT * FROM local_users WHERE id = 'usr-001'");
      if (users.length === 0) {
        setAppState("setup");
        return;
      }

      const matchUser = users[0];
      if (pinInput === matchUser.pin_hash) {
        // Successful login
        await db.execute("UPDATE local_users SET failed_attempts = 0, locked_until = NULL WHERE id = ?", [matchUser.id]);
        setCurrentUser({ id: matchUser.id, name: matchUser.name, role: matchUser.role });
        setAppState("main");
        setPinInput("");
        setPinErrorText("");
      } else {
        // Failed attempt
        const newAttempts = matchUser.failed_attempts + 1;
        if (newAttempts >= 5) {
          const lockTime = Date.now() + 60000; // 60 seconds lockout
          await db.execute("UPDATE local_users SET failed_attempts = ?, locked_until = ? WHERE id = ?", [
            newAttempts,
            String(lockTime),
            matchUser.id,
          ]);
          setLoginLockedUntil(lockTime);
          setPinErrorText("Terlalu banyak percobaan salah. Terkunci 60 detik.");
        } else {
          await db.execute("UPDATE local_users SET failed_attempts = ? WHERE id = ?", [newAttempts, matchUser.id]);
          setPinErrorText(`PIN salah. Sisa percobaan: ${5 - newAttempts}`);
        }
        setPinInput("");
      }
    } catch (err: any) {
      setPinErrorText(`Login Error: ${err.message || err}`);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const db = await getDb();
      const users = await db.select<any[]>("SELECT * FROM local_users WHERE id = 'usr-001'");
      if (users.length > 0) {
        const adminUser = users[0];
        if (recoveryAnswerInput.trim().toLowerCase() === adminUser.recovery_answer_hash) {
          // Recovery correct: Reset PIN to "123456" as helper, reset locks
          await db.execute(
            "UPDATE local_users SET pin_hash = '123456', failed_attempts = 0, locked_until = NULL WHERE id = ?",
            [adminUser.id]
          );
          setPinErrorText("PIN direset menjadi default '123456'. Harap segera ubah di Settings.");
          setShowRecoveryFlow(false);
          setRecoveryAnswerInput("");
        } else {
          setPinErrorText("Jawaban pemulihan salah.");
        }
      }
    } catch (err: any) {
      setPinErrorText(`Recovery Error: ${err.message || err}`);
    }
  };

  // Cooperative Profile Settings Operations
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const db = await getDb();
      await db.execute(
        `UPDATE cooperatives SET 
           name = ?, legal_id = ?, address = ?, village = ?, district = ?, 
           regency = ?, province = ?, postal_code = ?, phone = ?, email = ?, 
           business_units = ?, officers = ?, updated_at = datetime('now')
         WHERE id = 'kdp-001'`,
        [
          coopProfile.name,
          coopProfile.legal_id,
          coopProfile.address,
          coopProfile.village,
          coopProfile.district,
          coopProfile.regency,
          coopProfile.province,
          coopProfile.postal_code,
          coopProfile.phone,
          coopProfile.email,
          coopProfile.business_units,
          coopProfile.officers,
        ]
      );
      alert("Profil Koperasi disimpan successfully!");
      loadProfileData();
    } catch (err) {
      alert(`Save Profile Gagal: ${err}`);
    }
  };

  const handleProfileFieldChange = (key: string, value: any) => {
    setCoopProfile((prev: any) => ({ ...prev, [key]: value }));
  };

  // Member CRUD Operations
  const openAddMemberModal = () => {
    setMemberFormType("add");
    setMemberFormValues({
      nik: "",
      name: "",
      place_of_birth: "",
      date_of_birth: "",
      gender: "L",
      occupation: "",
      education: "",
      rt: "",
      rw: "",
      hamlet: "",
      status: "aktif",
      savings_pokok: 0,
      savings_wajib: 0,
      savings_sukarela: 0,
      loan_total: 0,
      loan_outstanding: 0,
      loan_status: "lancar",
    });
    setShowMemberModal(true);
  };

  const openEditMemberModal = (member: Member) => {
    setMemberFormType("edit");
    setCurrentMemberId(member.id);
    setMemberFormValues({ ...member });
    setShowMemberModal(true);
  };

  const handleMemberFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (memberFormValues.nik.length !== 16) {
      alert("Error: NIK harus 16 digit.");
      return;
    }
    if (!memberFormValues.name.trim()) {
      alert("Error: Nama harus diisi.");
      return;
    }

    try {
      const db = await getDb();
      if (memberFormType === "add") {
        const newId = `mbr-${Date.now()}`;
        await db.execute(
          `INSERT INTO members (
            id, cooperative_id, nik, name, place_of_birth, date_of_birth, gender,
            occupation, education, rt, rw, hamlet, status, savings_pokok, savings_wajib,
            savings_sukarela, loan_total, loan_outstanding, loan_status
          ) VALUES (?, 'kdp-001', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newId,
            memberFormValues.nik,
            memberFormValues.name,
            memberFormValues.place_of_birth,
            memberFormValues.date_of_birth,
            memberFormValues.gender,
            memberFormValues.occupation,
            memberFormValues.education,
            memberFormValues.rt,
            memberFormValues.rw,
            memberFormValues.hamlet,
            memberFormValues.status,
            Number(memberFormValues.savings_pokok),
            Number(memberFormValues.savings_wajib),
            Number(memberFormValues.savings_sukarela),
            Number(memberFormValues.loan_total),
            Number(memberFormValues.loan_outstanding),
            memberFormValues.loan_status,
          ]
        );
      } else {
        await db.execute(
          `UPDATE members SET 
            nik = ?, name = ?, place_of_birth = ?, date_of_birth = ?, gender = ?,
            occupation = ?, education = ?, rt = ?, rw = ?, hamlet = ?, status = ?,
            savings_pokok = ?, savings_wajib = ?, savings_sukarela = ?,
            loan_total = ?, loan_outstanding = ?, loan_status = ?, updated_at = datetime('now')
           WHERE id = ?`,
          [
            memberFormValues.nik,
            memberFormValues.name,
            memberFormValues.place_of_birth,
            memberFormValues.date_of_birth,
            memberFormValues.gender,
            memberFormValues.occupation,
            memberFormValues.education,
            memberFormValues.rt,
            memberFormValues.rw,
            memberFormValues.hamlet,
            memberFormValues.status,
            Number(memberFormValues.savings_pokok),
            Number(memberFormValues.savings_wajib),
            Number(memberFormValues.savings_sukarela),
            Number(memberFormValues.loan_total),
            Number(memberFormValues.loan_outstanding),
            memberFormValues.loan_status,
            currentMemberId,
          ]
        );
      }
      setShowMemberModal(false);
      loadMembersData();
    } catch (err: any) {
      alert(`Gagal menyimpan anggota: ${err.message || err}`);
    }
  };

  const handleDeleteMember = async (member: Member) => {
    if (member.loan_outstanding > 0) {
      alert("Error: Tidak dapat menghapus anggota dengan pinjaman aktif yang belum lunas.");
      return;
    }
    const yes = confirm(`Apakah Anda yakin ingin menghapus anggota ${member.name}?`);
    if (!yes) return;

    try {
      const db = await getDb();
      await db.execute("DELETE FROM members WHERE id = ?", [member.id]);
      loadMembersData();
    } catch (err) {
      alert(`Delete Gagal: ${err}`);
    }
  };

  // SAK EP Accounting operations
  const handleCreateCoaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoaValues.code || !newCoaValues.name) {
      alert("Error: Kode dan Nama Akun harus diisi.");
      return;
    }
    try {
      const db = await getDb();
      await db.execute(
        `INSERT INTO coa_accounts (code, cooperative_id, name, type, normal_balance, balance)
         VALUES (?, 'kdp-001', ?, ?, ?, ?)`,
        [
          newCoaValues.code,
          newCoaValues.name,
          newCoaValues.type,
          newCoaValues.normal_balance,
          Number(newCoaValues.balance),
        ]
      );
      setShowCoaModal(false);
      loadAccountsData();
    } catch (err: any) {
      alert(`Gagal menambah akun: ${err.message || err}`);
    }
  };

  const handleJournalLineChange = (index: number, key: keyof JournalLineInput, value: any) => {
    setJournalForm((prev) => {
      const lines = [...prev.lines];
      lines[index] = { ...lines[index], [key]: value };
      return { ...prev, lines };
    });
  };

  const addJournalLineRow = () => {
    setJournalForm((prev) => ({
      ...prev,
      lines: [...prev.lines, { accountCode: "1.1.01", debit: 0, credit: 0 }],
    }));
  };

  const removeJournalLineRow = (index: number) => {
    if (journalForm.lines.length <= 2) return;
    setJournalForm((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, idx) => idx !== index),
    }));
  };

  const handleJournalEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalForm.number || !journalForm.description) {
      alert("Error: Nomor Bukti dan Keterangan harus diisi.");
      return;
    }

    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of journalForm.lines) {
      totalDebit += Number(line.debit || 0);
      totalCredit += Number(line.credit || 0);
    }

    if (totalDebit !== totalCredit) {
      alert(`Error: Jurnal tidak seimbang. Selisih: Rp ${Math.abs(totalDebit - totalCredit).toLocaleString()}`);
      return;
    }
    if (totalDebit === 0) {
      alert("Error: Jumlah transaksi tidak boleh Rp 0.");
      return;
    }

    try {
      const db = await getDb();
      const newEntryId = `je-${Date.now()}`;

      // Insert Journal Entry header
      await db.execute(
        `INSERT INTO journal_entries (id, cooperative_id, number, date, description, reference, category, created_by)
         VALUES (?, 'kdp-001', ?, ?, ?, ?, ?, ?)`,
        [
          newEntryId,
          journalForm.number,
          journalForm.date,
          journalForm.description,
          journalForm.reference,
          journalForm.category,
          currentUser?.id || "usr-001",
        ]
      );

      // Insert Journal Lines and update COA account balance
      for (const line of journalForm.lines) {
        const lineId = `jl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        await db.execute(
          `INSERT INTO journal_lines (id, journal_entry_id, account_code, debit, credit)
           VALUES (?, ?, ?, ?, ?)`,
          [lineId, newEntryId, line.accountCode, Number(line.debit), Number(line.credit)]
        );

        // Fetch normal balance indicator to run calculations
        const account = await db.select<any[]>("SELECT normal_balance, balance FROM coa_accounts WHERE code = ?", [
          line.accountCode,
        ]);
        if (account.length > 0) {
          const norm = account[0].normal_balance;
          const currentBal = account[0].balance;
          const delta = norm === "debit" ? (Number(line.debit) - Number(line.credit)) : (Number(line.credit) - Number(line.debit));
          const updatedBal = currentBal + delta;

          await db.execute("UPDATE coa_accounts SET balance = ? WHERE code = ?", [updatedBal, line.accountCode]);
        }
      }

      alert("Transaksi Jurnal berhasil disimpan!");
      setShowJournalModal(false);
      setJournalForm({
        date: new Date().toISOString().split("T")[0],
        number: "",
        description: "",
        reference: "",
        category: "operasional",
        tags: "",
        lines: [
          { accountCode: "1.1.01", debit: 0, credit: 0 },
          { accountCode: "4.01", debit: 0, credit: 0 },
        ],
      });
      loadJournalData();
      loadAccountsData();
      loadLedgerData();
    } catch (err: any) {
      alert(`Gagal menyimpan transaksi: ${err.message || err}`);
    }
  };

  // Financial calculations: NPV, IRR, BCR
  const calculateFeasibility = () => {
    const { initialInvestment, projectionYears, cashFlows, discountRate } = feasibilityParams;
    const rate = Number(discountRate) / 100;
    const flows = cashFlows.split(",").map(Number);

    if (flows.length !== Number(projectionYears)) {
      alert("Error: Jumlah elemen arus kas tidak sesuai dengan Tahun Proyeksi.");
      return;
    }

    // 1. Calculate ENPV
    let pvBenefits = 0;
    for (let t = 0; t < flows.length; t++) {
      pvBenefits += flows[t] / Math.pow(1 + rate, t + 1);
    }
    const enpv = pvBenefits - Number(initialInvestment);

    // 2. Calculate EBCR
    const ebcr = pvBenefits / Number(initialInvestment);

    // 3. Solve for EIRR (Newton-Raphson numerical solver)
    const npvFunc = (r: number) => {
      let sum = 0;
      for (let t = 0; t < flows.length; t++) {
        sum += flows[t] / Math.pow(1 + r, t + 1);
      }
      return sum - Number(initialInvestment);
    };

    const dNpvFunc = (r: number) => {
      let sum = 0;
      for (let t = 0; t < flows.length; t++) {
        sum += (- (t + 1) * flows[t]) / Math.pow(1 + r, t + 2);
      }
      return sum;
    };

    let eirr = 0.1; // initial guess (10%)
    let iterations = 0;
    let error = 1e-6;
    let diff = 1;

    while (Math.abs(diff) > error && iterations < 100) {
      const npvVal = npvFunc(eirr);
      const dNpvVal = dNpvFunc(eirr);
      if (dNpvVal === 0) break;
      const nextR = eirr - npvVal / dNpvVal;
      diff = nextR - eirr;
      eirr = nextR;
      iterations++;
    }

    // EIRR converted back to percentage
    const eirrPct = eirr * 100;

    // 4. Feasibility tiering
    let tier = 3;
    let tierLabel = "Tidak Layak";
    let tierColor = "red";

    const isNPVPass = enpv > 0;
    const isIRRPass = eirrPct > Number(discountRate);
    const isBCRPass = ebcr >= 1.0;

    if (isNPVPass && isIRRPass && isBCRPass) {
      tier = 1;
      tierLabel = "Layak";
      tierColor = "green";
    } else if (isNPVPass && (isIRRPass || isBCRPass)) {
      tier = 2;
      tierLabel = "Cukup Layak (Risiko Waspada)";
      tierColor = "amber";
    }

    setFeasibilityResults({
      enpv,
      ebcr,
      eirr: eirrPct,
      tier,
      tierLabel,
      tierColor,
      isNPVPass,
      isIRRPass,
      isBCRPass,
    });
  };

  const handleSensitivityScenarioChange = (scenario: "optimis" | "moderat" | "pesimis") => {
    setSensitivityScenario(scenario);
    if (!feasibilityResults) return;

    // Adjust parameters based on scenario multiplier
    const multipliers = {
      optimis: { investment: 0.95, flows: 1.15 },
      moderat: { investment: 1.0, flows: 1.0 },
      pesimis: { investment: 1.15, flows: 0.7 },
    };

    const mult = multipliers[scenario];
    const adjustedInvest = feasibilityParams.initialInvestment * mult.investment;
    const originalFlows = feasibilityParams.cashFlows.split(",").map(Number);
    const adjustedFlows = originalFlows.map((cf) => cf * mult.flows);

    const rate = Number(feasibilityParams.discountRate) / 100;

    let pv = 0;
    for (let t = 0; t < adjustedFlows.length; t++) {
      pv += adjustedFlows[t] / Math.pow(1 + rate, t + 1);
    }
    const enpv = pv - adjustedInvest;
    const ebcr = pv / adjustedInvest;

    // Numerical solver for adjusted IRR
    const npvFunc = (r: number) => {
      let sum = 0;
      for (let t = 0; t < adjustedFlows.length; t++) {
        sum += adjustedFlows[t] / Math.pow(1 + r, t + 1);
      }
      return sum - adjustedInvest;
    };

    const dNpvFunc = (r: number) => {
      let sum = 0;
      for (let t = 0; t < adjustedFlows.length; t++) {
        sum += (- (t + 1) * adjustedFlows[t]) / Math.pow(1 + r, t + 2);
      }
      return sum;
    };

    let eirr = 0.1;
    let diff = 1;
    let iter = 0;
    while (Math.abs(diff) > 1e-6 && iter < 100) {
      const v = npvFunc(eirr);
      const d = dNpvFunc(eirr);
      if (d === 0) break;
      const nextR = eirr - v / d;
      diff = nextR - eirr;
      eirr = nextR;
      iter++;
    }

    const eirrPct = eirr * 100;
    let tier = 3;
    let tierLabel = "Tidak Layak";
    if (enpv > 0 && eirrPct > feasibilityParams.discountRate && ebcr >= 1.0) {
      tier = 1;
      tierLabel = "Layak";
    } else if (enpv > 0 && (eirrPct > feasibilityParams.discountRate || ebcr >= 1.0)) {
      tier = 2;
      tierLabel = "Cukup Layak";
    }

    setSensitivityPresetResults({
      scenario,
      investment: adjustedInvest,
      flows: adjustedFlows,
      enpv,
      ebcr,
      eirr: eirrPct,
      tier,
      tierLabel,
    });
  };

  // Sync Log simulation
  const handleSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncProgress("Memeriksa sambungan ke server...");
    
    setTimeout(() => {
      setSyncProgress("Mengupload data anggota dan transaksi baru...");
      
      setTimeout(async () => {
        setSyncProgress("Menyinkronkan data bagan akun (COA)...");
        
        setTimeout(async () => {
          try {
            const db = await getDb();
            const syncId = `sync-${Date.now()}`;
            // Fetch mock entries count (sum of members + journals)
            const members = await db.select<any[]>("SELECT COUNT(*) as count FROM members");
            const entries = await db.select<any[]>("SELECT COUNT(*) as count FROM journal_entries");
            const count = (members[0]?.count || 0) + (entries[0]?.count || 0);

            // Record sync entry
            await db.execute(
              `INSERT INTO sync_history (id, cooperative_id, direction, status, entity_count, completed_at)
               VALUES (?, 'kdp-001', 'upload', 'success', ?, datetime('now'))`,
              [syncId, count]
            );

            setSyncProgress("Sinkronisasi Selesai!");
            setIsSyncing(false);
            loadSyncHistoryData();
            setTimeout(() => setSyncProgress(""), 3000);
          } catch (e) {
            console.error(e);
            setSyncProgress(`Sinkronisasi Gagal: ${e}`);
            setIsSyncing(false);
          }
        }, 1000);
      }, 1000);
    }, 1000);
  };

  // App Settings Operations
  const handlePinChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const oldPin = (e.currentTarget as any).oldPin.value;
    const newPin = (e.currentTarget as any).newPin.value;
    const confirmPin = (e.currentTarget as any).confirmPin.value;

    if (newPin.length !== 6 || oldPin.length !== 6) {
      alert("Error: PIN harus 6 digit.");
      return;
    }
    if (newPin !== confirmPin) {
      alert("Error: Konfirmasi PIN baru tidak cocok.");
      return;
    }

    try {
      const db = await getDb();
      const users = await db.select<any[]>("SELECT pin_hash FROM local_users WHERE id = 'usr-001'");
      if (users.length > 0 && users[0].pin_hash === oldPin) {
        await db.execute("UPDATE local_users SET pin_hash = ? WHERE id = 'usr-001'", [newPin]);
        alert("PIN berhasil diperbarui!");
        (e.currentTarget as any).reset();
      } else {
        alert("Error: PIN lama salah.");
      }
    } catch (err) {
      alert(`Update PIN Gagal: ${err}`);
    }
  };

  // Updater Check
  const checkUpdateCenter = async () => {
    setIsUpdateChecking(true);
    setUpdateStatusText("Memeriksa pembaruan...");
    try {
      const update = await check();
      if (update) {
        setUpdateStatusText(`Mengunduh update v${update.version}...`);
        await update.downloadAndInstall();
        setUpdateStatusText("Relaunching...");
        await relaunch();
      } else {
        setUpdateStatusText("Aplikasi berada di versi terbaru!");
        setTimeout(() => setUpdateStatusText(""), 3000);
      }
    } catch (e) {
      console.error(e);
      setUpdateStatusText(`Gagal: ${e}`);
      setTimeout(() => setUpdateStatusText(""), 4000);
    } finally {
      setIsUpdateChecking(false);
    }
  };

  // Financial Statements calculations for display
  const getAccountingReports = () => {
    const assets = coaAccounts.filter((a) => a.type === "aset");
    const liabilities = coaAccounts.filter((a) => a.type === "kewajiban");
    const equity = coaAccounts.filter((a) => a.type === "ekuitas");
    const revenues = coaAccounts.filter((a) => a.type === "pendapatan");
    const expenses = coaAccounts.filter((a) => a.type === "beban");

    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
    const totalEquity = equity.reduce((sum, a) => sum + a.balance, 0);

    const totalRevenue = revenues.reduce((sum, a) => sum + a.balance, 0);
    const totalExpense = expenses.reduce((sum, a) => sum + a.balance, 0);

    const shuKotor = totalRevenue - totalExpense;
    const tax = shuKotor > 0 ? shuKotor * 0.1 : 0;
    const shuBersih = shuKotor - tax;

    return {
      assets,
      liabilities,
      equity,
      revenues,
      expenses,
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue,
      totalExpense,
      shuKotor,
      tax,
      shuBersih,
      balanced: totalAssets === totalLiabilities + totalEquity,
    };
  };

  const reports = getAccountingReports();

  // --- LAYOUT RENDERING VIEWS ---

  if (appState === "splash") {
    return (
      <div className="splash-screen">
        <div className="splash-branding">
          <div className="splash-logo">KDKMP</div>
          <h2>Sistem Informasi KDKMP</h2>
          <div className="spinner"></div>
          <p className="loading-text">Memuat data lokal...</p>
        </div>
        <p className="splash-footer">v0.4.0 • SAK EP Compliant</p>
      </div>
    );
  }

  if (appState === "db_error") {
    return (
      <div className="login-screen">
        <div className="auth-card" style={{ border: "2px solid #ef4444" }}>
          <h2 style={{ color: "#ef4444" }}>Database Connection Error</h2>
          <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
            Gagal memuat database SQLite. Harap hubungi administrator Anda.
          </p>
          <div className="error-message-box" style={{ background: "rgba(239, 68, 68, 0.1)", padding: "1rem", borderRadius: "8px", color: "#ef4444", marginBottom: "2rem" }}>
            <code>{dbErrorMessage}</code>
          </div>
          <button onClick={() => window.location.reload()}>Coba Lagi</button>
        </div>
      </div>
    );
  }

  if (appState === "setup") {
    return (
      <div className="login-screen">
        <form className="auth-card" onSubmit={handleSetupPinSubmit}>
          <div className="auth-logo">KDKMP</div>
          <h2>Buat PIN Baru</h2>
          <p className="auth-subtext">Atur PIN 6 digit untuk mengamankan data koperasi lokal.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", margin: "1.5rem 0" }}>
            <input
              type="password"
              placeholder="Masukkan PIN (6 digit)"
              maxLength={6}
              value={setupPin}
              onChange={(e) => setSetupPin(e.target.value.replace(/\D/g, ""))}
              style={{ textAlign: "center", fontSize: "1.25rem", letterSpacing: "0.25em" }}
            />
            <input
              type="password"
              placeholder="Konfirmasi PIN"
              maxLength={6}
              value={setupConfirmPin}
              onChange={(e) => setSetupConfirmPin(e.target.value.replace(/\D/g, ""))}
              style={{ textAlign: "center", fontSize: "1.25rem", letterSpacing: "0.25em" }}
            />

            <div style={{ textAlign: "left", marginTop: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Pertanyaan Pemulihan:</label>
              <select
                value={setupQuestion}
                onChange={(e) => setSetupQuestion(e.target.value)}
                style={{ width: "100%", padding: "0.75rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "white", marginTop: "0.25rem" }}
              >
                <option>Apa nama hewan peliharaan pertama Anda?</option>
                <option>Di mana kota kelahiran ibu Anda?</option>
                <option>Apa nama SD pertama Anda?</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Jawaban pemulihan"
              value={setupAnswer}
              onChange={(e) => setSetupAnswer(e.target.value)}
              style={{ padding: "0.75rem", fontSize: "1rem" }}
            />
          </div>

          {pinErrorText && <p style={{ color: "#f87171", fontSize: "0.9rem", margin: "0 0 1rem 0" }}>{pinErrorText}</p>}

          <button type="submit" style={{ width: "100%" }}>Simpan & Mulai</button>
        </form>
      </div>
    );
  }

  if (appState === "login") {
    return (
      <div className="login-screen">
        {!showRecoveryFlow ? (
          <form className="auth-card" onSubmit={handleLoginSubmit}>
            <div className="auth-logo">KDKMP</div>
            <h2>Masukkan PIN Anda</h2>
            <p className="auth-subtext">Sistem Informasi KDKMP Koperasi Maju Bersama</p>

            <input
              type="password"
              placeholder="••••••"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setPinInput(val);
                if (val.length === 6) {
                  // Trigger login immediately on 6 digits
                  setTimeout(() => {
                    setPinInput((current) => {
                      if (current.length === 6) {
                        handleLoginSubmit();
                      }
                      return current;
                    });
                  }, 100);
                }
              }}
              disabled={!!loginLockedUntil}
              style={{ textAlign: "center", fontSize: "1.75rem", letterSpacing: "0.4em", margin: "1.5rem 0", width: "80%" }}
              autoFocus
            />

            {pinErrorText && <p style={{ color: "#f87171", fontSize: "0.9rem", margin: "0 0 1.25rem 0" }}>{pinErrorText}</p>}
            {loginLockedUntil && (
              <p style={{ color: "#fb7185", fontWeight: "600", fontSize: "0.9rem", margin: "0 0 1.25rem 0" }}>
                Kunci aktif. Tunggu {lockoutCountdown} detik...
              </p>
            )}

            <button type="submit" disabled={!!loginLockedUntil} style={{ width: "100%" }}>Login</button>
            <p
              onClick={() => setShowRecoveryFlow(true)}
              style={{ color: "#38bdf8", cursor: "pointer", marginTop: "1.5rem", fontSize: "0.9rem" }}
            >
              Lupa PIN?
            </p>
          </form>
        ) : (
          <form className="auth-card" onSubmit={handleRecoverySubmit}>
            <h2>Pemulihan PIN</h2>
            <p className="auth-subtext" style={{ textAlign: "left" }}>
              <strong>Pertanyaan:</strong> {recoveryQuestionText}
            </p>

            <input
              type="text"
              placeholder="Masukkan jawaban Anda..."
              value={recoveryAnswerInput}
              onChange={(e) => setRecoveryAnswerInput(e.target.value)}
              style={{ margin: "1.5rem 0", width: "100%" }}
              autoFocus
            />

            {pinErrorText && <p style={{ color: "#f87171", fontSize: "0.9rem", margin: "0 0 1.25rem 0" }}>{pinErrorText}</p>}

            <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
              <button type="button" onClick={() => setShowRecoveryFlow(false)} style={{ background: "#334155", color: "white", flex: 1 }}>
                Batal
              </button>
              <button type="submit" style={{ flex: 1 }}>Verifikasi</button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // Filtered members selector logic
  const filteredMembers = membersList.filter((mbr) => {
    const matchesSearch =
      mbr.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      mbr.nik.includes(memberSearchQuery);
    const matchesFilter =
      memberFilterStatus === "semua" ||
      mbr.status === memberFilterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`app-container ${appTheme} font-${fontSizeSetting}`}>
      {/* Sidebar Navigation */}
      <aside className="sidebar no-print">
        <div>
          <div className="brand-section">
            <span className="brand-logo">KDKMP COCKPIT</span>
          </div>
          <nav className="nav-links">
            <div className={`nav-item ${activeTab === "home" ? "active" : ""}`} onClick={() => setActiveTab("home")}>
              🏠 Beranda
            </div>
            <div className={`nav-item ${activeTab === "members" ? "active" : ""}`} onClick={() => setActiveTab("members")}>
              👥 Anggota Koperasi
            </div>
            <div className={`nav-item ${activeTab === "accounting" ? "active" : ""}`} onClick={() => setActiveTab("accounting")}>
              📊 Akuntansi SAK EP
            </div>
            <div className={`nav-item ${activeTab === "feasibility" ? "active" : ""}`} onClick={() => setActiveTab("feasibility")}>
              📈 Analisis Kelayakan
            </div>
            <div className={`nav-item ${activeTab === "sync" ? "active" : ""}`} onClick={() => setActiveTab("sync")}>
              🔄 Sinkronisasi
            </div>
            <div className={`nav-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
              ⚙️ Pengaturan
            </div>
          </nav>
        </div>

        <div className="footer-section">
          <div className="status-badge">
            <div className="status-dot"></div>
            <span>v0.4.0 Local</span>
          </div>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="main-content">
        {activeTab === "home" && (
          <div>
            <header className="view-header no-print">
              <h2>Beranda Utama</h2>
              <p>RAG status kesehatan finansial KDKMP desa saat ini.</p>
            </header>

            {/* Health Indicators Card */}
            <div className="glass-card" style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem 0" }}>
                    🟢 SEHAT &nbsp;
                    <span style={{ fontSize: "1.1rem", fontWeight: "normal", color: "#94a3b8" }}>
                      (Skor: {coopProfile.health_score}/100)
                    </span>
                  </h3>
                  <p style={{ color: "#94a3b8", margin: 0 }}>
                    Sistem RAG mendeteksi parameter solvabilitas dan kas berada pada batas optimal.
                  </p>
                </div>
                <div style={{ fontSize: "2.5rem" }}>💚</div>
              </div>

              <div className="cards-grid" style={{ marginTop: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                <div style={{ borderLeft: "3px solid #10b981", paddingLeft: "1rem" }}>
                  <div className="card-title">Total Aset</div>
                  <div style={{ fontWeight: "700", fontSize: "1.25rem" }}>Rp {reports.totalAssets.toLocaleString()}</div>
                </div>
                <div style={{ borderLeft: "3px solid #10b981", paddingLeft: "1rem" }}>
                  <div className="card-title">Total Kewajiban</div>
                  <div style={{ fontWeight: "700", fontSize: "1.25rem" }}>Rp {reports.totalLiabilities.toLocaleString()}</div>
                </div>
                <div style={{ borderLeft: "3px solid #38bdf8", paddingLeft: "1rem" }}>
                  <div className="card-title">Total Ekuitas</div>
                  <div style={{ fontWeight: "700", fontSize: "1.25rem" }}>Rp {reports.totalEquity.toLocaleString()}</div>
                </div>
                <div style={{ borderLeft: "3px solid #10b981", paddingLeft: "1rem" }}>
                  <div className="card-title">Jumlah Anggota</div>
                  <div style={{ fontWeight: "700", fontSize: "1.25rem" }}>{membersList.length} Org</div>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="cards-grid no-print">
              <div className="glass-card" onClick={() => setActiveTab("members")} style={{ cursor: "pointer" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</div>
                <h4>Anggota Koperasi</h4>
                <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Kelola database anggota, simpanan, dan pinjaman.</p>
              </div>
              <div className="glass-card" onClick={() => { setActiveTab("accounting"); setAccountingTab("journal"); }} style={{ cursor: "pointer" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💳</div>
                <h4>Transaksi Harian</h4>
                <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Catat transaksi debit/kredit umum SAK EP.</p>
              </div>
              <div className="glass-card" onClick={() => { setActiveTab("accounting"); setAccountingTab("neraca"); }} style={{ cursor: "pointer" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</div>
                <h4>Laporan Keuangan</h4>
                <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Lihat Neraca saldo & Laporan Laba Rugi.</p>
              </div>
            </div>

            {/* EWS Alerts */}
            <div className="glass-card" style={{ marginBottom: "2rem" }}>
              <div className="card-title">Sistem Peringatan Dini (EWS)</div>
              {ewsAlertsList.length === 0 ? (
                <p style={{ color: "#10b981", margin: "1rem 0 0 0", fontWeight: "600" }}>
                  ✅ Tidak ada peringatan aktif. Semua rasio finansial sehat.
                </p>
              ) : (
                <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {ewsAlertsList.map((alert) => (
                    <div key={alert.id} style={{ display: "flex", gap: "1rem", background: "rgba(245, 127, 23, 0.08)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(245, 127, 23, 0.15)" }}>
                      <div style={{ fontSize: "1.25rem" }}>⚠️</div>
                      <div>
                        <div style={{ fontWeight: "600", color: "#f57f17" }}>{alert.message}</div>
                        <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                          Saran: {alert.suggested_action}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial Summary SVG charts */}
            <div className="glass-card no-print">
              <div className="card-title" style={{ marginBottom: "1.5rem" }}>Tren Keuangan (6 Bulan Terakhir)</div>
              <div style={{ height: "180px", display: "flex", alignItems: "flex-end", gap: "2.5rem", padding: "1rem 0" }}>
                {dashboardIncomeData.map((data, idx) => {
                  const maxVal = 100000000;
                  const incHeight = (data.income / maxVal) * 140;
                  const expHeight = (data.expense / maxVal) * 140;

                  return (
                    <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.25rem", height: "140px", width: "100%", justifyContent: "center" }}>
                        {/* Income Bar */}
                        <div style={{ height: `${incHeight}px`, width: "18px", background: "linear-gradient(to top, #10b981, #34d399)", borderRadius: "4px 4px 0 0" }} title={`Income: Rp ${data.income.toLocaleString()}`}></div>
                        {/* Expense Bar */}
                        <div style={{ height: `${expHeight}px`, width: "18px", background: "linear-gradient(to top, #f43f5e, #fb7185)", borderRadius: "4px 4px 0 0" }} title={`Expense: Rp ${data.expense.toLocaleString()}`}></div>
                      </div>
                      <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{data.month}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem", color: "#94a3b8", marginTop: "1rem", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "12px", height: "12px", background: "#10b981", borderRadius: "2px" }}></div>
                  <span>Pendapatan</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "12px", height: "12px", background: "#f43f5e", borderRadius: "2px" }}></div>
                  <span>Beban</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div>
            <header className="view-header no-print">
              <h2>Manajemen Anggota</h2>
              <p>Kelola profil anggota, simpanan pokok/wajib, serta data pinjaman.</p>
            </header>

            <div className="glass-card">
              {/* Toolbar search */}
              <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", flexGrow: 1 }}>
                  <input
                    type="text"
                    placeholder="Cari nama atau NIK anggota..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    style={{ maxWidth: "400px" }}
                  />
                  <select
                    value={memberFilterStatus}
                    onChange={(e) => setMemberFilterStatus(e.target.value)}
                    style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "white", padding: "0 1rem" }}
                  >
                    <option value="semua">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
                <button onClick={openAddMemberModal}>+ Tambah Anggota</button>
              </div>

              {/* Members table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#94a3b8" }}>
                      <th style={{ padding: "1rem" }}>Nama Anggota</th>
                      <th style={{ padding: "1rem" }}>NIK</th>
                      <th style={{ padding: "1rem" }}>Rt/Rw</th>
                      <th style={{ padding: "1rem" }}>Total Simpanan</th>
                      <th style={{ padding: "1rem" }}>Outstanding Pinjaman</th>
                      <th style={{ padding: "1rem" }}>Status</th>
                      <th className="no-print" style={{ padding: "1rem" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((mbr) => {
                      const totalSavings = mbr.savings_pokok + mbr.savings_wajib + mbr.savings_sukarela;
                      return (
                        <tr key={mbr.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "1rem", fontWeight: "600" }}>{mbr.name}</td>
                          <td style={{ padding: "1rem" }}>{mbr.nik}</td>
                          <td style={{ padding: "1rem" }}>{mbr.rt}/{mbr.rw}</td>
                          <td style={{ padding: "1rem" }}>Rp {totalSavings.toLocaleString()}</td>
                          <td style={{ padding: "1rem" }}>Rp {mbr.loan_outstanding.toLocaleString()}</td>
                          <td style={{ padding: "1rem" }}>
                            <span style={{
                              padding: "0.25rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.8rem",
                              background: mbr.status === "aktif" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                              color: mbr.status === "aktif" ? "#10b981" : "#f87171"
                            }}>{mbr.status}</span>
                          </td>
                          <td className="no-print" style={{ padding: "1rem" }}>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button onClick={() => openEditMemberModal(mbr)} style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem", background: "#334155", color: "white", boxShadow: "none" }}>
                                Edit
                              </button>
                              <button onClick={() => handleDeleteMember(mbr)} style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.2)", color: "#f87171", boxShadow: "none" }}>
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredMembers.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                          Belum ada data anggota ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Member Add/Edit Modal */}
            {showMemberModal && (
              <div className="modal-overlay">
                <form className="modal-content" onSubmit={handleMemberFormSubmit}>
                  <h3>{memberFormType === "add" ? "Tambah Anggota Baru" : "Edit Profil Anggota"}</h3>

                  <div className="modal-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: "1.5rem 0" }}>
                    <div>
                      <label>NIK (16 Digit)</label>
                      <input
                        type="text"
                        maxLength={16}
                        required
                        value={memberFormValues.nik}
                        onChange={(e) => setMemberFormValues({ ...memberFormValues, nik: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                    <div>
                      <label>Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={memberFormValues.name}
                        onChange={(e) => setMemberFormValues({ ...memberFormValues, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Tempat Lahir</label>
                      <input
                        type="text"
                        value={memberFormValues.place_of_birth}
                        onChange={(e) => setMemberFormValues({ ...memberFormValues, place_of_birth: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Tanggal Lahir</label>
                      <input
                        type="date"
                        value={memberFormValues.date_of_birth}
                        onChange={(e) => setMemberFormValues({ ...memberFormValues, date_of_birth: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Jenis Kelamin</label>
                      <select
                        value={memberFormValues.gender}
                        onChange={(e) => setMemberFormValues({ ...memberFormValues, gender: e.target.value })}
                        style={{ width: "100%", padding: "0.75rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "white" }}
                      >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label>Pekerjaan</label>
                      <input
                        type="text"
                        value={memberFormValues.occupation}
                        onChange={(e) => setMemberFormValues({ ...memberFormValues, occupation: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Pendidikan Terakhir</label>
                      <input
                        type="text"
                        value={memberFormValues.education}
                        onChange={(e) => setMemberFormValues({ ...memberFormValues, education: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Dusun</label>
                      <input
                        type="text"
                        value={memberFormValues.hamlet}
                        onChange={(e) => setMemberFormValues({ ...memberFormValues, hamlet: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>RT / RW</label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          type="text"
                          placeholder="RT"
                          value={memberFormValues.rt}
                          onChange={(e) => setMemberFormValues({ ...memberFormValues, rt: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="RW"
                          value={memberFormValues.rw}
                          onChange={(e) => setMemberFormValues({ ...memberFormValues, rw: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label>Status</label>
                      <select
                        value={memberFormValues.status}
                        onChange={(e) => setMemberFormValues({ ...memberFormValues, status: e.target.value })}
                        style={{ width: "100%", padding: "0.75rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "white" }}
                      >
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                      </select>
                    </div>

                    <div style={{ gridColumn: "span 2", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
                      <strong>Simpanan Anggota</strong>
                    </div>
                    <div>
                      <label>Simpanan Pokok (Rp)</label>
                      <input
                        type="number"
                        value={memberFormValues.savings_pokok}
                        onChange={(e) => setMemberFormValues({ ...memberFormValues, savings_pokok: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label>Simpanan Wajib (Rp)</label>
                      <input
                        type="number"
                        value={memberFormValues.savings_wajib}
                        onChange={(e) => setMemberFormValues({ ...memberFormValues, savings_wajib: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label>Simpanan Sukarela (Rp)</label>
                      <input
                        type="number"
                        value={memberFormValues.savings_sukarela}
                        onChange={(e) => setMemberFormValues({ ...memberFormValues, savings_sukarela: Number(e.target.value) })}
                      />
                    </div>

                    <div style={{ gridColumn: "span 2", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
                      <strong>Pinjaman Anggota</strong>
                    </div>
                    <div>
                      <label>Total Pinjaman (Rp)</label>
                      <input
                        type="number"
                        value={memberFormValues.loan_total}
                        onChange={(e) => setMemberFormValues({ ...memberFormValues, loan_total: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label>Outstanding Sisa Pinjaman (Rp)</label>
                      <input
                        type="number"
                        value={memberFormValues.loan_outstanding}
                        onChange={(e) => setMemberFormValues({ ...memberFormValues, loan_outstanding: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label>Status Pinjaman</label>
                      <input
                        type="text"
                        value={memberFormValues.loan_status}
                        onChange={(e) => setMemberFormValues({ ...memberFormValues, loan_status: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                    <button type="button" onClick={() => setShowMemberModal(false)} style={{ background: "#334155", color: "white" }}>
                      Batal
                    </button>
                    <button type="submit">Simpan Anggota</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === "accounting" && (
          <div>
            <header className="view-header no-print">
              <h2>Akuntansi SAK EP</h2>
              <p>Kelola pembukuan umum standar SAK Entitas Privat.</p>
            </header>

            {/* Sub Tabs Accounting */}
            <div className="no-print" style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <button onClick={() => setAccountingTab("coa")} style={{ background: accountingTab === "coa" ? undefined : "#1e293b", color: accountingTab === "coa" ? undefined : "#94a3b8", boxShadow: "none" }}>
                Bagan Akun (COA)
              </button>
              <button onClick={() => setAccountingTab("journal")} style={{ background: accountingTab === "journal" ? undefined : "#1e293b", color: accountingTab === "journal" ? undefined : "#94a3b8", boxShadow: "none" }}>
                Jurnal Umum
              </button>
              <button onClick={() => setAccountingTab("ledger")} style={{ background: accountingTab === "ledger" ? undefined : "#1e293b", color: accountingTab === "ledger" ? undefined : "#94a3b8", boxShadow: "none" }}>
                Buku Besar
              </button>
              <button onClick={() => setAccountingTab("neraca")} style={{ background: accountingTab === "neraca" ? undefined : "#1e293b", color: accountingTab === "neraca" ? undefined : "#94a3b8", boxShadow: "none" }}>
                Laporan Neraca
              </button>
              <button onClick={() => setAccountingTab("labarugi")} style={{ background: accountingTab === "labarugi" ? undefined : "#1e293b", color: accountingTab === "labarugi" ? undefined : "#94a3b8", boxShadow: "none" }}>
                Laporan Laba Rugi
              </button>
            </div>

            {/* Tab: Chart of Accounts */}
            {accountingTab === "coa" && (
              <div className="glass-card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                  <h4>Bagan Akun SAK EP</h4>
                  <button onClick={() => setShowCoaModal(true)}>+ Tambah Akun</button>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#94a3b8" }}>
                      <th style={{ padding: "0.75rem" }}>Kode Akun</th>
                      <th style={{ padding: "0.75rem" }}>Nama Rekening</th>
                      <th style={{ padding: "0.75rem" }}>Tipe Klasifikasi</th>
                      <th style={{ padding: "0.75rem" }}>Saldo Normal</th>
                      <th style={{ padding: "0.75rem" }}>Saldo Saat Ini</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coaAccounts.map((acc) => (
                      <tr key={acc.code} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "0.75rem", fontFamily: "monospace" }}>{acc.code}</td>
                        <td style={{ padding: "0.75rem", fontWeight: "600" }}>{acc.name}</td>
                        <td style={{ padding: "0.75rem", textTransform: "capitalize" }}>{acc.type}</td>
                        <td style={{ padding: "0.75rem", textTransform: "capitalize" }}>{acc.normal_balance}</td>
                        <td style={{ padding: "0.75rem" }}>Rp {acc.balance.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {showCoaModal && (
                  <div className="modal-overlay">
                    <form className="modal-content" onSubmit={handleCreateCoaSubmit}>
                      <h3>Tambah Akun Baru</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", margin: "1.5rem 0" }}>
                        <div>
                          <label>Kode Rekening (Contoh: 1.1.05)</label>
                          <input type="text" required value={newCoaValues.code} onChange={(e) => setNewCoaValues({ ...newCoaValues, code: e.target.value })} />
                        </div>
                        <div>
                          <label>Nama Akun</label>
                          <input type="text" required value={newCoaValues.name} onChange={(e) => setNewCoaValues({ ...newCoaValues, name: e.target.value })} />
                        </div>
                        <div>
                          <label>Klasifikasi Tipe</label>
                          <select
                            value={newCoaValues.type}
                            onChange={(e) => setNewCoaValues({ ...newCoaValues, type: e.target.value as any })}
                            style={{ width: "100%", padding: "0.75rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "white" }}
                          >
                            <option value="aset">Aset</option>
                            <option value="kewajiban">Kewajiban</option>
                            <option value="ekuitas">Ekuitas</option>
                            <option value="pendapatan">Pendapatan</option>
                            <option value="beban">Beban</option>
                          </select>
                        </div>
                        <div>
                          <label>Saldo Normal</label>
                          <select
                            value={newCoaValues.normal_balance}
                            onChange={(e) => setNewCoaValues({ ...newCoaValues, normal_balance: e.target.value as any })}
                            style={{ width: "100%", padding: "0.75rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "white" }}
                          >
                            <option value="debit">Debit</option>
                            <option value="kredit">Kredit</option>
                          </select>
                        </div>
                        <div>
                          <label>Saldo Awal (Rp)</label>
                          <input type="number" value={newCoaValues.balance} onChange={(e) => setNewCoaValues({ ...newCoaValues, balance: Number(e.target.value) })} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                        <button type="button" onClick={() => setShowCoaModal(false)} style={{ background: "#334155", color: "white" }}>Batal</button>
                        <button type="submit">Tambah</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Journal Entry List */}
            {accountingTab === "journal" && (
              <div className="glass-card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                  <h4>Buku Jurnal Umum</h4>
                  <button onClick={() => setShowJournalModal(true)}>+ Jurnal Baru</button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {journalEntries.map((entry) => (
                    <div key={entry.id} style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
                        <span style={{ fontWeight: "700", color: "#38bdf8" }}>{entry.number}</span>
                        <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{entry.date}</span>
                      </div>
                      <div style={{ fontSize: "0.95rem", color: "#f8fafc", marginBottom: "0.75rem" }}>{entry.description}</div>
                      
                      <div style={{ paddingLeft: "1.5rem" }}>
                        {entry.lines.map((line, idx) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: line.debit > 0 ? "white" : "#cbd5e1", padding: "0.25rem 0" }}>
                            <span style={{ paddingLeft: line.credit > 0 ? "2rem" : "0" }}>
                              {line.account_code} - {line.name}
                            </span>
                            <span>
                              {line.debit > 0 ? `Rp ${line.debit.toLocaleString()} (D)` : `Rp ${line.credit.toLocaleString()} (K)`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {showJournalModal && (
                  <div className="modal-overlay">
                    <form className="modal-content" onSubmit={handleJournalEntrySubmit} style={{ maxWidth: "700px" }}>
                      <h3>Buat Entri Jurnal Baru</h3>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: "1rem 0" }}>
                        <div>
                          <label>Tanggal Transaksi</label>
                          <input type="date" required value={journalForm.date} onChange={(e) => setJournalForm({ ...journalForm, date: e.target.value })} />
                        </div>
                        <div>
                          <label>Nomor Bukti (No. Ref)</label>
                          <input type="text" required placeholder="Contoh: JU-2026-07-001" value={journalForm.number} onChange={(e) => setJournalForm({ ...journalForm, number: e.target.value })} />
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <label>Keterangan Transaksi</label>
                          <input type="text" required placeholder="Contoh: Penerimaan pembayaran angsuran anggota..." value={journalForm.description} onChange={(e) => setJournalForm({ ...journalForm, description: e.target.value })} />
                        </div>
                      </div>

                      <div style={{ margin: "1.5rem 0" }}>
                        <strong>Baris Transaksi (Debit & Kredit)</strong>
                        <table style={{ width: "100%", marginTop: "0.5rem", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ textAlign: "left", color: "#94a3b8", fontSize: "0.9rem" }}>
                              <th>Akun Rekening</th>
                              <th>Jumlah Debit (Rp)</th>
                              <th>Jumlah Kredit (Rp)</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {journalForm.lines.map((line, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "0.25rem 0" }}>
                                  <select
                                    value={line.accountCode}
                                    onChange={(e) => handleJournalLineChange(idx, "accountCode", e.target.value)}
                                    style={{ padding: "0.5rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "white", width: "95%" }}
                                  >
                                    {coaAccounts.map((a) => (
                                      <option key={a.code} value={a.code}>
                                        {a.code} - {a.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    value={line.debit}
                                    onChange={(e) => handleJournalLineChange(idx, "debit", Number(e.target.value))}
                                    style={{ padding: "0.5rem", width: "90%" }}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    value={line.credit}
                                    onChange={(e) => handleJournalLineChange(idx, "credit", Number(e.target.value))}
                                    style={{ padding: "0.5rem", width: "90%" }}
                                  />
                                </td>
                                <td>
                                  <button type="button" onClick={() => removeJournalLineRow(idx)} style={{ background: "transparent", color: "#ef4444", border: "none", boxShadow: "none", padding: 0 }}>
                                    ❌
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <button type="button" onClick={addJournalLineRow} style={{ background: "#334155", color: "white", padding: "0.5rem 1rem", marginTop: "0.75rem", fontSize: "0.85rem", boxShadow: "none" }}>
                          + Tambah Baris
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                        <button type="button" onClick={() => setShowJournalModal(false)} style={{ background: "#334155", color: "white" }}>Batal</button>
                        <button type="submit">Simpan Transaksi</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Tab: General Ledger */}
            {accountingTab === "ledger" && (
              <div className="glass-card">
                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem", alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <label>Pilih Akun Rekening</label>
                    <select
                      value={ledgerSelectedCode}
                      onChange={(e) => setLedgerSelectedCode(e.target.value)}
                      style={{ width: "100%", padding: "0.75rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "white", marginTop: "0.25rem" }}
                    >
                      {coaAccounts.map((a) => (
                        <option key={a.code} value={a.code}>
                          {a.code} - {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", margin: "1rem 0", color: "#94a3b8" }}>
                  <span>Saldo Awal: <strong>Rp {ledgerBalanceStart.toLocaleString()}</strong></span>
                  <span>Saldo Akhir: <strong>Rp {ledgerBalanceEnd.toLocaleString()}</strong></span>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#94a3b8" }}>
                      <th style={{ padding: "0.75rem" }}>Tanggal</th>
                      <th style={{ padding: "0.75rem" }}>No. Bukti</th>
                      <th style={{ padding: "0.75rem" }}>Keterangan</th>
                      <th style={{ padding: "0.75rem" }}>Debit (D)</th>
                      <th style={{ padding: "0.75rem" }}>Kredit (K)</th>
                      <th style={{ padding: "0.75rem" }}>Saldo Berjalan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerEntries.map((line, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "0.75rem" }}>{line.date}</td>
                        <td style={{ padding: "0.75rem", fontFamily: "monospace" }}>{line.number}</td>
                        <td style={{ padding: "0.75rem" }}>{line.entry_desc}</td>
                        <td style={{ padding: "0.75rem" }}>{line.debit > 0 ? `Rp ${line.debit.toLocaleString()}` : "—"}</td>
                        <td style={{ padding: "0.75rem" }}>{line.credit > 0 ? `Rp ${line.credit.toLocaleString()}` : "—"}</td>
                        <td style={{ padding: "0.75rem", fontWeight: "600" }}>Rp {line.runningBalance.toLocaleString()}</td>
                      </tr>
                    ))}
                    {ledgerEntries.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                          Tidak ada mutasi transaksi untuk periode ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab: Balance Sheet Report */}
            {accountingTab === "neraca" && (
              <div className="glass-card printable-area">
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                  <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.5rem" }}>KOPERASI MAJU BERSAMA</h3>
                  <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}>LAPORAN NERACA FINANSIAL</h4>
                  <p style={{ margin: 0, color: "#94a3b8" }}>Per 30 Juni 2026 • SAK EP Standard</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
                  {/* Left Column: Assets */}
                  <div>
                    <h5 style={{ borderBottom: "2px solid #38bdf8", paddingBottom: "0.5rem", color: "#38bdf8", margin: "0 0 1rem 0" }}>ASET (AKTIVA)</h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {coaAccounts.filter(a => a.type === "aset").map(acc => (
                        <div key={acc.code} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                          <span>{acc.name}</span>
                          <span style={{ fontFamily: "monospace" }}>Rp {acc.balance.toLocaleString()}</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.5rem", marginTop: "1rem" }}>
                        <span>TOTAL ASET</span>
                        <span>Rp {reports.totalAssets.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Liabilities & Equity */}
                  <div>
                    <h5 style={{ borderBottom: "2px solid #10b981", paddingBottom: "0.5rem", color: "#10b981", margin: "0 0 1rem 0" }}>PASSIVA (KEWAJIBAN & EKUITAS)</h5>
                    
                    <strong style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.5rem" }}>KEWAJIBAN</strong>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
                      {coaAccounts.filter(a => a.type === "kewajiban").map(acc => (
                        <div key={acc.code} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                          <span>{acc.name}</span>
                          <span style={{ fontFamily: "monospace" }}>Rp {acc.balance.toLocaleString()}</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.5rem" }}>
                        <span>Total Kewajiban</span>
                        <span>Rp {reports.totalLiabilities.toLocaleString()}</span>
                      </div>
                    </div>

                    <strong style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.5rem" }}>EKUITAS</strong>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {coaAccounts.filter(a => a.type === "ekuitas").map(acc => (
                        <div key={acc.code} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                          <span>{acc.name}</span>
                          <span style={{ fontFamily: "monospace" }}>Rp {acc.balance.toLocaleString()}</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.5rem" }}>
                        <span>Total Ekuitas</span>
                        <span>Rp {reports.totalEquity.toLocaleString()}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.5rem", marginTop: "1.5rem" }}>
                      <span>TOTAL PASSIVA</span>
                      <span>Rp {(reports.totalLiabilities + reports.totalEquity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "3rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="no-print">
                  <div>
                    {reports.balanced ? (
                      <span style={{ color: "#10b981", fontWeight: "600" }}>🟢 Seimbang (Balance)</span>
                    ) : (
                      <span style={{ color: "#f43f5e", fontWeight: "600" }}>🔴 Tidak Seimbang (Unbalanced)</span>
                    )}
                  </div>
                  <button onClick={() => window.print()} style={{ background: "#334155", color: "white" }}>Cetak Laporan</button>
                </div>
              </div>
            )}

            {/* Tab: Income Statement */}
            {accountingTab === "labarugi" && (
              <div className="glass-card printable-area">
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                  <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.5rem" }}>KOPERASI MAJU BERSAMA</h3>
                  <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}>LAPORAN LABA RUGI (SHU)</h4>
                  <p style={{ margin: 0, color: "#94a3b8" }}>Periode 01 Jan - 30 Juni 2026 • SAK EP Standard</p>
                </div>

                <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div>
                    <h5 style={{ borderBottom: "2px solid #38bdf8", paddingBottom: "0.5rem", color: "#38bdf8", margin: "0 0 1rem 0" }}>PENDAPATAN</h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {coaAccounts.filter(a => a.type === "pendapatan").map(acc => (
                        <div key={acc.code} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                          <span>{acc.name}</span>
                          <span style={{ fontFamily: "monospace" }}>Rp {acc.balance.toLocaleString()}</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                        <span>TOTAL PENDAPATAN</span>
                        <span>Rp {reports.totalRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 style={{ borderBottom: "2px solid #fb7185", paddingBottom: "0.5rem", color: "#fb7185", margin: "0 0 1rem 0" }}>BEBAN OPERASIONAL</h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {coaAccounts.filter(a => a.type === "beban").map(acc => (
                        <div key={acc.code} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                          <span>{acc.name}</span>
                          <span style={{ fontFamily: "monospace" }}>Rp {acc.balance.toLocaleString()}</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                        <span>TOTAL BEBAN</span>
                        <span>Rp {reports.totalExpense.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: "2px solid white", paddingTop: "1rem", marginTop: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                      <span>SHU Kotor</span>
                      <span>Rp {reports.shuKotor.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", marginBottom: "0.5rem" }}>
                      <span>Pajak (10%)</span>
                      <span>Rp {reports.tax.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "800", fontSize: "1.25rem", color: "#10b981" }}>
                      <span>SHU Bersih</span>
                      <span>Rp {reports.shuBersih.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "3rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem", display: "flex", justifyContent: "flex-end" }} className="no-print">
                  <button onClick={() => window.print()} style={{ background: "#334155", color: "white" }}>Cetak Laporan</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "feasibility" && (
          <div>
            <header className="view-header no-print">
              <h2>Analisis Kelayakan Bisnis</h2>
              <p>Hitung kelayakan unit usaha KDKMP menggunakan indikator ENPV, EIRR, dan EBCR.</p>
            </header>

            {/* Sub Tabs Feasibility */}
            <div className="no-print" style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <button onClick={() => setFeasibilityActiveTab("calculator")} style={{ background: feasibilityActiveTab === "calculator" ? undefined : "#1e293b", color: feasibilityActiveTab === "calculator" ? undefined : "#94a3b8", boxShadow: "none" }}>
                Kalkulator Investasi (F-11..F-14)
              </button>
              <button onClick={() => { setFeasibilityActiveTab("sensitivity"); handleSensitivityScenarioChange("moderat"); }} style={{ background: feasibilityActiveTab === "sensitivity" ? undefined : "#1e293b", color: feasibilityActiveTab === "sensitivity" ? undefined : "#94a3b8", boxShadow: "none" }}>
                Analisis Sensitivitas (F-15)
              </button>
            </div>

            {feasibilityActiveTab === "calculator" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                {/* Inputs card */}
                <div className="glass-card">
                  <div className="card-title">Parameter Investasi</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                    <div>
                      <label>Investasi Awal (Rp)</label>
                      <input
                        type="number"
                        value={feasibilityParams.initialInvestment}
                        onChange={(e) => setFeasibilityParams({ ...feasibilityParams, initialInvestment: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label>Tahun Proyeksi</label>
                      <select
                        value={feasibilityParams.projectionYears}
                        onChange={(e) => setFeasibilityParams({ ...feasibilityParams, projectionYears: Number(e.target.value) })}
                        style={{ width: "100%", padding: "0.75rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "white" }}
                      >
                        <option value={3}>3 Tahun</option>
                        <option value={5}>5 Tahun</option>
                        <option value={10}>10 Tahun</option>
                      </select>
                    </div>
                    <div>
                      <label>Arus Kas Proyeksi (Pisahkan dengan koma)</label>
                      <input
                        type="text"
                        value={feasibilityParams.cashFlows}
                        onChange={(e) => setFeasibilityParams({ ...feasibilityParams, cashFlows: e.target.value })}
                      />
                      <small style={{ color: "#64748b", display: "block", marginTop: "0.25rem" }}>
                        Contoh: 18000000,22000000,25000000,28000000,30000000
                      </small>
                    </div>
                    <div>
                      <label>Discount Rate (%)</label>
                      <input
                        type="number"
                        step={0.1}
                        value={feasibilityParams.discountRate}
                        onChange={(e) => setFeasibilityParams({ ...feasibilityParams, discountRate: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label>Opportunity Cost (%)</label>
                      <input
                        type="number"
                        step={0.1}
                        value={feasibilityParams.opportunityCost}
                        onChange={(e) => setFeasibilityParams({ ...feasibilityParams, opportunityCost: Number(e.target.value) })}
                      />
                    </div>
                    <button onClick={calculateFeasibility} style={{ marginTop: "1rem" }}>Hitung Kelayakan</button>
                  </div>
                </div>

                {/* Results card */}
                <div className="glass-card">
                  <div className="card-title">Hasil Kelayakan Finansial</div>
                  {feasibilityResults ? (
                    <div style={{ marginTop: "1.5rem" }}>
                      <div style={{ textAlign: "center", padding: "1.5rem", borderRadius: "12px", background: feasibilityResults.tierColor === "green" ? "rgba(16, 185, 129, 0.15)" : feasibilityResults.tierColor === "amber" ? "rgba(245, 127, 23, 0.15)" : "rgba(244, 63, 94, 0.15)", border: `1px solid ${feasibilityResults.tierColor === "green" ? "#10b981" : feasibilityResults.tierColor === "amber" ? "#f57f17" : "#f43f5e"}` }}>
                        <span style={{ fontSize: "0.9rem", color: "#cbd5e1", textTransform: "uppercase", fontWeight: "600" }}>Status Rekomendasi</span>
                        <h3 style={{ fontSize: "2rem", margin: "0.5rem 0", color: feasibilityResults.tierColor === "green" ? "#10b981" : feasibilityResults.tierColor === "amber" ? "#f57f17" : "#f43f5e" }}>
                          {feasibilityResults.tierLabel}
                        </h3>
                        <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                          Tier Kelayakan: <strong>Tier {feasibilityResults.tier}</strong>
                        </span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.5rem" }}>
                          <span>Economic Net Present Value (ENPV)</span>
                          <span style={{ fontWeight: "700" }}>
                            Rp {Math.round(feasibilityResults.enpv).toLocaleString()} &nbsp;
                            {feasibilityResults.isNPVPass ? "✅" : "❌"}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.5rem" }}>
                          <span>Economic Internal Rate of Return (EIRR)</span>
                          <span style={{ fontWeight: "700" }}>
                            {feasibilityResults.eirr.toFixed(2)}% &nbsp;
                            {feasibilityResults.isIRRPass ? "✅" : "❌"}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.5rem" }}>
                          <span>Economic Benefit-Cost Ratio (EBCR)</span>
                          <span style={{ fontWeight: "700" }}>
                            {feasibilityResults.ebcr.toFixed(2)} &nbsp;
                            {feasibilityResults.isBCRPass ? "✅" : "❌"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: "#64748b", marginTop: "2rem", textAlign: "center" }}>
                      Silakan masukkan parameter investasi dan tekan tombol hitung kelayakan.
                    </p>
                  )}
                </div>
              </div>
            )}

            {feasibilityActiveTab === "sensitivity" && (
              <div className="glass-card">
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                  <button onClick={() => handleSensitivityScenarioChange("optimis")} style={{ background: sensitivityScenario === "optimis" ? undefined : "#1e293b", color: sensitivityScenario === "optimis" ? undefined : "#94a3b8", boxShadow: "none" }}>
                    Optimis (+15% Revenue)
                  </button>
                  <button onClick={() => handleSensitivityScenarioChange("moderat")} style={{ background: sensitivityScenario === "moderat" ? undefined : "#1e293b", color: sensitivityScenario === "moderat" ? undefined : "#94a3b8", boxShadow: "none" }}>
                    Moderat (Base Case)
                  </button>
                  <button onClick={() => handleSensitivityScenarioChange("pesimis")} style={{ background: sensitivityScenario === "pesimis" ? undefined : "#1e293b", color: sensitivityScenario === "pesimis" ? undefined : "#94a3b8", boxShadow: "none" }}>
                    Pesimis (-30% Yield Failure)
                  </button>
                </div>

                {sensitivityPresetResults ? (
                  <div>
                    <div className="cards-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                      <div>
                        <div className="card-title">Skenario Aktif</div>
                        <h3 style={{ textTransform: "capitalize", margin: "0.5rem 0" }}>{sensitivityScenario}</h3>
                        <p style={{ color: "#cbd5e1" }}>
                          {sensitivityScenario === "optimis" && "Variabel cuaca dan fluktuasi komoditas stabil, hasil unit usaha diproyeksikan tumbuh 15%."}
                          {sensitivityScenario === "moderat" && "Base Case proyeksi awal tanpa modifikasi variabel eksternal."}
                          {sensitivityScenario === "pesimis" && "Gagal panen, perubahan iklim, dan fluktuasi harga komoditas menekan arus kas masuk sebesar 30%."}
                        </p>
                      </div>

                      <div style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", paddingLeft: "2rem" }}>
                        <div className="card-title">Hasil Simulasi Skenario</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Investasi Awal</span>
                            <strong>Rp {Math.round(sensitivityPresetResults.investment).toLocaleString()}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>ENPV Hasil</span>
                            <strong style={{ color: sensitivityPresetResults.enpv > 0 ? "#10b981" : "#f43f5e" }}>
                              Rp {Math.round(sensitivityPresetResults.enpv).toLocaleString()}
                            </strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>EIRR Hasil</span>
                            <strong>{sensitivityPresetResults.eirr.toFixed(2)}%</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>EBCR Hasil</span>
                            <strong>{sensitivityPresetResults.ebcr.toFixed(2)}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Rekomendasi</span>
                            <strong style={{ color: sensitivityPresetResults.tier === 3 ? "#f43f5e" : "#10b981" }}>
                              {sensitivityPresetResults.tierLabel}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>
                    Hitung kelayakan proyeksi awal (Kalkulator Investasi) terlebih dahulu untuk menjalankan simulasi.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "sync" && (
          <div>
            <header className="view-header no-print">
              <h2>Sinkronisasi Jaringan</h2>
              <p>Aggregasi data berjenjang dari Desa KDKMP ke Kabupaten/Provinsi secara offline-first.</p>
            </header>

            <div className="glass-card" style={{ marginBottom: "2rem" }}>
              <div className="card-title">Manual Sinkronisasi</div>
              <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
                Koneksi saat ini dikonfigurasi ke Node induk Kabupaten: <strong>{syncServerUrl}</strong>.
              </p>
              
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <button onClick={handleSyncNow} disabled={isSyncing}>
                  {isSyncing ? "Proses..." : "Sinkronkan Sekarang"}
                </button>
                {syncProgress && <span style={{ color: "#00f2fe", fontWeight: "600" }}>{syncProgress}</span>}
              </div>
            </div>

            <div className="glass-card">
              <div className="card-title" style={{ marginBottom: "1rem" }}>Riwayat Sinkronisasi Lokal</div>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#94a3b8" }}>
                    <th style={{ padding: "0.75rem" }}>Tanggal Selesai</th>
                    <th style={{ padding: "0.75rem" }}>Arah Aliran</th>
                    <th style={{ padding: "0.75rem" }}>Status</th>
                    <th style={{ padding: "0.75rem" }}>Jumlah Entri</th>
                  </tr>
                </thead>
                <tbody>
                  {syncHistoryList.map((hist) => (
                    <tr key={hist.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "0.75rem" }}>{hist.completed_at}</td>
                      <td style={{ padding: "0.75rem", textTransform: "capitalize" }}>{hist.direction}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <span style={{ color: hist.status === "success" ? "#10b981" : "#f43f5e", fontWeight: "600" }}>
                          {hist.status === "success" ? "Berhasil" : "Gagal"}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem" }}>{hist.entity_count} entri</td>
                    </tr>
                  ))}
                  {syncHistoryList.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                        Belum ada riwayat sinkronisasi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <header className="view-header no-print">
              <h2>Pengaturan Cockpit</h2>
              <p>Sesuaikan preferensi desktop app, keamanan PIN, dan pembaruan OTA.</p>
            </header>

            <div className="cards-grid">
              {/* Profile officers view */}
              <form className="glass-card" onSubmit={handleSaveProfile} style={{ gridColumn: "span 2" }}>
                <div className="card-title">Profil Pengurus Koperasi</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                  <div>
                    <label>Nama Koperasi</label>
                    <input type="text" value={coopProfile.name} onChange={(e) => handleProfileFieldChange("name", e.target.value)} />
                  </div>
                  <div>
                    <label>No. Legal Badan Hukum</label>
                    <input type="text" value={coopProfile.legal_id} onChange={(e) => handleProfileFieldChange("legal_id", e.target.value)} />
                  </div>
                  <div>
                    <label>Nama Ketua (Pengurus)</label>
                    <input
                      type="text"
                      value={JSON.parse(coopProfile.officers || "{}").chairman || ""}
                      onChange={(e) => {
                        const parsed = JSON.parse(coopProfile.officers || "{}");
                        parsed.chairman = e.target.value;
                        handleProfileFieldChange("officers", JSON.stringify(parsed));
                      }}
                    />
                  </div>
                  <div>
                    <label>Nama Sekretaris</label>
                    <input
                      type="text"
                      value={JSON.parse(coopProfile.officers || "{}").secretary || ""}
                      onChange={(e) => {
                        const parsed = JSON.parse(coopProfile.officers || "{}");
                        parsed.secretary = e.target.value;
                        handleProfileFieldChange("officers", JSON.stringify(parsed));
                      }}
                    />
                  </div>
                  <div>
                    <label>Nama Bendahara</label>
                    <input
                      type="text"
                      value={JSON.parse(coopProfile.officers || "{}").treasurer || ""}
                      onChange={(e) => {
                        const parsed = JSON.parse(coopProfile.officers || "{}");
                        parsed.treasurer = e.target.value;
                        handleProfileFieldChange("officers", JSON.stringify(parsed));
                      }}
                    />
                  </div>
                  <div>
                    <label>Nama Pengawas (Auditor)</label>
                    <input
                      type="text"
                      value={JSON.parse(coopProfile.officers || "{}").supervisor || ""}
                      onChange={(e) => {
                        const parsed = JSON.parse(coopProfile.officers || "{}");
                        parsed.supervisor = e.target.value;
                        handleProfileFieldChange("officers", JSON.stringify(parsed));
                      }}
                    />
                  </div>
                </div>
                <button type="submit" style={{ marginTop: "1.5rem" }}>Simpan Profil</button>
              </form>

              {/* PIN resets */}
              <div className="glass-card">
                <div className="card-title">Keamanan PIN Akses</div>
                <form onSubmit={handlePinChangeSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                  <div>
                    <label>PIN Lama</label>
                    <input type="password" name="oldPin" maxLength={6} required />
                  </div>
                  <div>
                    <label>PIN Baru (6 Digit)</label>
                    <input type="password" name="newPin" maxLength={6} required />
                  </div>
                  <div>
                    <label>Konfirmasi PIN Baru</label>
                    <input type="password" name="confirmPin" maxLength={6} required />
                  </div>
                  <button type="submit">Perbarui PIN</button>
                </form>
              </div>

              {/* Updates center */}
              <div className="glass-card">
                <div className="card-title">Pembaruan Sistem OTA</div>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "1rem 0" }}>
                  Tekan tombol di bawah untuk memeriksa rilis versi KDKMP terbaru di GitHub.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <button onClick={checkUpdateCenter} disabled={isUpdateChecking}>
                    {isUpdateChecking ? "Checking..." : "Periksa Pembaruan Sekarang"}
                  </button>
                  {updateStatusText && <span style={{ color: "#00f2fe", fontWeight: "600", fontSize: "0.9rem" }}>{updateStatusText}</span>}
                </div>
              </div>

              {/* Preferensi Tampilan */}
              <div className="glass-card">
                <div className="card-title">Preferensi Tampilan</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                  <div>
                    <label>Tema Warna</label>
                    <select
                      value={appTheme}
                      onChange={(e) => setAppTheme(e.target.value as any)}
                      style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "white" }}
                    >
                      <option value="dark">🌙 Mode Gelap</option>
                      <option value="light">☀️ Mode Terang</option>
                    </select>
                  </div>
                  <div>
                    <label>Ukuran Font</label>
                    <select
                      value={fontSizeSetting}
                      onChange={(e) => setFontSizeSetting(e.target.value as any)}
                      style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "white" }}
                    >
                      <option value="normal">Normal (Disarankan)</option>
                      <option value="large">Besar (Untuk Membaca Lebih Mudah)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
