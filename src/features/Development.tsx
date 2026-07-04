import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2 } from "lucide-react";

const PROJECTS = [
  { name: "Pembangunan Unit Penggilingan", status: "Berjalan", budget: 250000000, progress: 65, target: "2026-12" },
  { name: "Ekspansi Gudang Penyimpanan", status: "Perencanaan", budget: 120000000, progress: 15, target: "2027-03" },
  { name: "Pengembangan Aplikasi PAKDE Mobile", status: "Berjalan", budget: 85000000, progress: 45, target: "2026-10" },
  { name: "Kerjasama dengan 10 Mitra Baru", status: "Berjalan", budget: 0, progress: 70, target: "2026-09" },
  {
    name: "Program Digitalisasi Unit Simpan Pinjam",
    status: "Selesai",
    budget: 60000000,
    progress: 100,
    target: "2026-06",
  },
  {
    name: "Pembukaan Unit Usaha Baru (Air Minum)",
    status: "Perencanaan",
    budget: 180000000,
    progress: 10,
    target: "2027-06",
  },
  {
    name: "Pelatihan 50 Anggota Bidang Digital Marketing",
    status: "Berjalan",
    budget: 25000000,
    progress: 55,
    target: "2026-08",
  },
  { name: "Renovasi Kantor Koperasi", status: "Selesai", budget: 95000000, progress: 100, target: "2026-05" },
];

const STATUS_STYLE: Record<string, string> = {
  Berjalan: "bg-blue-500/10 text-blue-400",
  Selesai: "bg-emerald-500/10 text-emerald-400",
  Perencanaan: "bg-amber-500/10 text-amber-400",
};

export default function Development() {
  const { t } = useTranslation();
  return (
    <div className="flex-1 overflow-auto p-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-amber-400" /> {t("sidebar.nav.development")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xxs font-mono text-muted-foreground">
                  {t("development.table.project")}
                </TableHead>
                <TableHead className="text-xxs font-mono text-muted-foreground">
                  {t("development.table.status")}
                </TableHead>
                <TableHead className="text-xxs font-mono text-muted-foreground">
                  {t("development.table.progress")}
                </TableHead>
                <TableHead className="text-xxs font-mono text-muted-foreground">
                  {t("development.table.budget")}
                </TableHead>
                <TableHead className="text-xxs font-mono text-muted-foreground">
                  {t("development.table.target")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PROJECTS.map((p, i) => (
                <TableRow key={i} className="border-border hover:bg-secondary">
                  <TableCell className="text-xs font-medium text-foreground">{p.name}</TableCell>
                  <TableCell className="text-xs">
                    <span
                      className={`text-xxxs font-bold px-1.5 py-0.5 rounded ${STATUS_STYLE[p.status] ?? "text-muted-foreground"}`}
                    >
                      {p.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-xxxs font-mono text-muted-foreground">{p.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-foreground">
                    {p.budget > 0 ? p.budget.toLocaleString("id-ID") : "—"}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{p.target}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
