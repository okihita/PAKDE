import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { createRepository, newId } from "@/db";
import { useToast } from "@/hooks/useToast";
import type { EquipmentItem, EquipmentCondition } from "@/types";

const equipmentRepo = createRepository<EquipmentItem>("equipment");

export function useEquipment() {
  const { t } = useTranslation();
  const toast = useToast();
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);

  const loadEquipment = useCallback(async () => {
    try {
      const res = await equipmentRepo.list("ORDER BY name ASC");
      setEquipmentList(res);
    } catch (e) {
      console.error("Failed to load equipment:", e);
    }
  }, []);

  const createEquipment = async (
    name: string,
    quantity: number,
    condition: EquipmentCondition,
    lastMaintenance: string,
    value: number,
  ): Promise<boolean> => {
    if (!name.trim()) {
      toast.error(t("equipment.toast.nameRequired"));
      return false;
    }
    try {
      await equipmentRepo.insert(newId("eq"), {
        name: name.trim(),
        quantity,
        condition,
        last_maintenance: lastMaintenance,
        value,
      });
      toast.success(t("equipment.toast.itemCreated"));
      await loadEquipment();
      return true;
    } catch (e) {
      console.error(e);
      toast.error(t("equipment.toast.saveFailed"));
      return false;
    }
  };

  const updateEquipment = async (
    id: string,
    name: string,
    quantity: number,
    condition: EquipmentCondition,
    lastMaintenance: string,
    value: number,
  ): Promise<boolean> => {
    if (!name.trim()) {
      toast.error(t("equipment.toast.nameRequired"));
      return false;
    }
    try {
      await equipmentRepo.update(id, {
        name: name.trim(),
        quantity,
        condition,
        last_maintenance: lastMaintenance,
        value,
      });
      toast.success(t("equipment.toast.itemUpdated"));
      await loadEquipment();
      return true;
    } catch (e) {
      console.error(e);
      toast.error(t("equipment.toast.saveFailed"));
      return false;
    }
  };

  const recordMaintenance = async (id: string): Promise<boolean> => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      await equipmentRepo.update(id, { last_maintenance: today, condition: "Baik" });
      toast.success(t("equipment.toast.maintenanceDone"));
      await loadEquipment();
      return true;
    } catch (e) {
      console.error(e);
      toast.error(t("equipment.toast.saveFailed"));
      return false;
    }
  };

  const deleteEquipment = async (id: string): Promise<boolean> => {
    const confirmDelete = await toast.confirm(t("equipment.toast.deleteConfirm"));
    if (!confirmDelete) return false;
    try {
      await equipmentRepo.remove(id);
      toast.success(t("equipment.toast.itemDeleted"));
      await loadEquipment();
      return true;
    } catch (e) {
      console.error(e);
      toast.error(t("equipment.toast.saveFailed"));
      return false;
    }
  };

  return {
    equipmentList,
    loadEquipment,
    createEquipment,
    updateEquipment,
    recordMaintenance,
    deleteEquipment,
  };
}
