import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { createRepository, newId } from "@/db";
import type { Member } from "@/types";
import { useToast } from "@/hooks/useToast";

const membersRepo = createRepository<Member>("members");

const MEMBER_DEFAULT: Member = {
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
};

export function useMembers(onChange?: () => void) {
  const { t } = useTranslation();
  const toast = useToast();

  const [membersList, setMembersList] = useState<Member[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState(() => {
    const saved = localStorage.getItem("pakde-member-search-filter");
    if (saved) {
      localStorage.removeItem("pakde-member-search-filter");
      return saved;
    }
    return "";
  });
  const [memberFilterStatus, setMemberFilterStatus] = useState("semua");
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberFormType, setMemberFormType] = useState<"add" | "edit">("add");
  const [currentMemberId, setCurrentMemberId] = useState("");
  const [memberFormValues, setMemberFormValues] = useState<Member>(MEMBER_DEFAULT);

  const loadMembersData = useCallback(async () => {
    try {
      const res = await membersRepo.list("ORDER BY name ASC");
      setMembersList(res);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const openAddMemberModal = () => {
    setMemberFormType("add");
    setMemberFormValues(MEMBER_DEFAULT);
    setShowMemberModal(true);
  };

  const openEditMemberModal = (member: Member) => {
    setMemberFormType("edit");
    setCurrentMemberId(member.id ?? "");
    setMemberFormValues({ ...member });
    setShowMemberModal(true);
  };

  const handleMemberFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (memberFormValues.nik.length !== 16) {
      toast.error(t("toast.nikInvalid"));
      return;
    }
    if (!memberFormValues.name.trim()) {
      toast.error(t("toast.nameRequired"));
      return;
    }
    try {
      const fv = memberFormValues;
      const columns = {
        nik: fv.nik,
        name: fv.name,
        place_of_birth: fv.place_of_birth,
        date_of_birth: fv.date_of_birth,
        gender: fv.gender,
        occupation: fv.occupation,
        education: fv.education,
        rt: fv.rt,
        rw: fv.rw,
        hamlet: fv.hamlet,
        status: fv.status,
        savings_pokok: Number(fv.savings_pokok),
        savings_wajib: Number(fv.savings_wajib),
        savings_sukarela: Number(fv.savings_sukarela),
        loan_total: Number(fv.loan_total),
        loan_outstanding: Number(fv.loan_outstanding),
        loan_status: fv.loan_status,
      };
      if (memberFormType === "add") {
        await membersRepo.insert(newId("mbr"), columns);
      } else {
        await membersRepo.update(currentMemberId, columns);
      }
      setShowMemberModal(false);
      loadMembersData();
      onChange?.();
    } catch (err) {
      toast.error(t("toast.memberSaveFailed", { error: err instanceof Error ? err.message : String(err) }));
    }
  };

  const handleDeleteMember = async (member: Member) => {
    if (member.loan_outstanding > 0) {
      toast.error(t("toast.memberDeleteBlocked"));
      return;
    }
    const yes = await toast.confirm(t("toast.memberDeleteConfirm", { name: member.name }));
    if (!yes) return;
    try {
      await membersRepo.remove(member.id ?? "");
      loadMembersData();
      onChange?.();
    } catch (err) {
      toast.error(t("toast.memberDeleteFailed", { error: String(err) }));
    }
  };

  const filteredMembers = membersList.filter((mbr) => {
    const matchesSearch =
      mbr.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || mbr.nik.includes(memberSearchQuery);
    const matchesFilter = memberFilterStatus === "semua" || mbr.status === memberFilterStatus;
    return matchesSearch && matchesFilter;
  });

  return {
    membersList,
    filteredMembers,
    memberSearchQuery,
    setMemberSearchQuery,
    memberFilterStatus,
    setMemberFilterStatus,
    showMemberModal,
    setShowMemberModal,
    memberFormType,
    memberFormValues,
    setMemberFormValues,
    loadMembersData,
    openAddMemberModal,
    openEditMemberModal,
    handleMemberFormSubmit,
    handleDeleteMember,
  };
}
