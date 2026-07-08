import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusIcon } from "@phosphor-icons/react";
import type { CooperativeProfile } from "@/types";
import { createCooperative } from "./cooperativeDb";
import RegionPicker from "./RegionPicker";

const PLACEHOLDER_NAME = "e.g. Koperasi Tani Makmur";
const COMPLETE_LATER = "Data lainnya seperti pengurus, unit usaha, dan kontak dapat dilengkapi nanti melalui Dashboard.";

interface CreateProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileCreated: (profile: CooperativeProfile) => void;
}

export default function CreateProfileDialog({ open, onOpenChange, onProfileCreated }: CreateProfileDialogProps) {
  const { t } = useTranslation();
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    legalId: "",
    address: "",
    village: "",
    district: "",
    regency: "",
    province: "",
    postalCode: "",
    phone: "",
    email: "",
    chairman: "",
    secretary: "",
    treasurer: "",
    supervisor: "",
    unitPupuk: true,
    unitSimpanPinjam: true,
    unitToko: false,
    foundedDate: "",
    category: "serba_usaha",
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.province.trim()) {
      setFormError(t("profileSelect.validationError"));
      return;
    }

    try {
      const inserted = await createCooperative({
        name: formData.name,
        legalId: formData.legalId,
        address: formData.address,
        village: formData.village,
        district: formData.district,
        regency: formData.regency,
        province: formData.province,
        postalCode: formData.postalCode,
        phone: formData.phone,
        email: formData.email,
        chairman: formData.chairman,
        secretary: formData.secretary,
        treasurer: formData.treasurer,
        supervisor: formData.supervisor,
        unitPupuk: formData.unitPupuk,
        unitSimpanPinjam: formData.unitSimpanPinjam,
        unitToko: formData.unitToko,
        foundedDate: formData.foundedDate,
        category: formData.category,
      });
      onProfileCreated(inserted);
    } catch (err: unknown) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border border-brand/25 text-foreground max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
        <form onSubmit={handleCreateSubmit}>
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground">{t("profileSelect.dialogTitle")}</DialogTitle>
            <p className="text-xxs text-slate-300 mt-0.5 leading-normal">{t("profileSelect.dialogDesc")}</p>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {formError && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-xxs font-mono text-danger">
                {formError}
              </div>
            )}

            {/* Nama Koperasi */}
            <div className="space-y-1">
              <label className="text-success font-mono text-xxxs uppercase tracking-wider">
                {t("profileSelect.fieldName")} *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={PLACEHOLDER_NAME}
                autoFocus
                className="bg-slate-950 border-slate-800 text-slate-100 text-xs h-8.5 focus:border-success/50 focus:ring-1 focus:ring-brand/50 placeholder:text-slate-500"
              />
            </div>

            {/* Region picker */}
            <RegionPicker
              onChange={(region) => {
                setFormData({
                  ...formData,
                  province: region.province_name,
                  regency: region.regency_name,
                  district: region.district_name,
                  village: region.village_name,
                });
              }}
            />

            {/* Category — hidden, defaults to serba_usaha */}
            <input type="hidden" value={formData.category} />

            <p className="text-xxs text-slate-500 italic">
              {COMPLETE_LATER}
            </p>
          </div>

          <DialogFooter className="border-t border-slate-800/80 pt-3.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-800 bg-slate-950 text-slate-300 hover:text-white text-xs h-8.5"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-brand hover:bg-brand text-brand-foreground font-bold text-xs h-8.5 px-4"
            >
              <PlusIcon className="h-3.5 w-3.5 mr-1" />
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
