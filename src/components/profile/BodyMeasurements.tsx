import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface BodyMeasurementsProps {
  neck?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  onUpdated?: () => void;
}

const KEYS = ["neck", "chest", "waist", "hips"] as const;
type Key = typeof KEYS[number];

const BodyMeasurements = ({
  neck,
  chest,
  waist,
  hips,
  onUpdated,
}: BodyMeasurementsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<Key, number>>({
    neck: neck ?? 0,
    chest: chest ?? 0,
    waist: waist ?? 0,
    hips: hips ?? 0,
  });

  const list = [
    { label: "Neck", key: "neck" as const, value: neck },
    { label: "Chest", key: "chest" as const, value: chest },
    { label: "Waist", key: "waist" as const, value: waist },
    { label: "Hips", key: "hips" as const, value: hips },
  ].filter((m) => m.value !== undefined && m.value !== null);

  const save = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          neck: form.neck,
          chest: form.chest,
          waist: form.waist,
          hips: form.hips,
        })
        .eq("id", user.id);
      if (error) throw error;
      toast({ title: "Measurements updated" });
      setOpen(false);
      onUpdated?.();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {list.length ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {list.map(({ label, value }) => (
            <div
              key={label}
              className="text-center p-3 bg-muted/50 rounded-lg"
            >
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold">{value}"</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-4">
          <p>No body measurements recorded yet.</p>
          <p className="text-sm mt-1">Use the Edit button to add them.</p>
        </div>
      )}

      <div className="flex justify-end mb-2">
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Body Measurements</DialogTitle>
            <DialogDescription>Enter values in inches.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            {KEYS.map((key) => (
              <div key={key}>
                <label
                  htmlFor={key}
                  className="block text-sm capitalize mb-1"
                >
                  {key}
                </label>
                <Input
                  id={key}
                  type="number"
                  value={form[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: Number(e.target.value) })
                  }
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={save}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BodyMeasurements;