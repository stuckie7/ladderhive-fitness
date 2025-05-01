
interface SpecItemProps {
  label: string;
  value: string | null | undefined;
}

export default function SpecItem({ label, value }: SpecItemProps) {
  if (!value) return null;
  
  return (
    <div className="mb-2">
      <p className="font-medium">{label}:</p>
      <p className="text-muted-foreground">{value}</p>
    </div>
  );
}
