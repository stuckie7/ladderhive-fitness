import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: {
    height?: number;
    weight?: number;
    age?: number;
    fitnessGoals: string[];
    workoutDays: string[];
  };
  onSaved?: () => void;
}

const days = ["M", "T", "W", "Th", "F", "Sa", "Su"];

export default function EditFitnessStatsDialog({ open, onOpenChange, initial, onSaved }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    height: initial.height ?? 0,
    weight: initial.weight ?? 0,
    age: initial.age ?? 0,
    fitnessGoals: initial.fitnessGoals ?? [],
    workoutDays: initial.workoutDays ?? [],
  });
  const [saving, setSaving] = useState(false);

  const toggleDay = (d: string) => {
    setForm(prev => ({
      ...prev,
      workoutDays: prev.workoutDays.includes(d) ? prev.workoutDays.filter(x => x !== d) : [...prev.workoutDays, d],
    }));
  };

  const toggleGoal = (g: string) => {
    setForm(prev => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(g) ? prev.fitnessGoals.filter(x => x !== g) : [...prev.fitnessGoals, g],
    }));
  };

  const save = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          height: form.height,
          weight: form.weight,
          age: form.age,
          fitness_goals: form.fitnessGoals,
          workout_days: form.workoutDays,
        })
        .eq("id", user.id);
      if (error) throw error;
      toast({ title: "Profile updated" });
      onSaved?.();
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Fitness Stats</DialogTitle>
          <DialogDescription>Update your measurements, goals and workout days.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Height (inches)</Label>
              <Input
                type="number"
                value={form.height}
                onChange={e => setForm({ ...form, height: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Weight (lbs)</Label>
              <Input
                type="number"
                value={form.weight}
                onChange={e => setForm({ ...form, weight: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                value={form.age}
                onChange={e => setForm({ ...form, age: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label className="block mb-1">Fitness Goals</Label>
            <div className="flex flex-wrap gap-2">
              {["Lose Weight", "Build Muscle", "Maintain", "Improve Endurance"].map(g => (
                <Button
                  key={g}
                  variant={form.fitnessGoals.includes(g) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleGoal(g)}
                >
                  {g}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="block mb-1">Workout Days</Label>
            <div className="flex gap-2">
              {days.map(d => (
                <Checkbox key={d} checked={form.workoutDays.includes(d)} onCheckedChange={() => toggleDay(d)}>
                  <span className="ml-1 text-sm">{d}</span>
                </Checkbox>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
