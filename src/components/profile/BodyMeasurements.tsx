
interface BodyMeasurementsProps {
  neck?: number;
  chest?: number;
  waist?: number;
  hips?: number;
}

const BodyMeasurements = ({ neck, chest, waist, hips }: BodyMeasurementsProps) => {
  const measurements = [
    { label: "Neck", value: neck },
    { label: "Chest", value: chest },
    { label: "Waist", value: waist },
    { label: "Hips", value: hips }
  ].filter(measurement => measurement.value);

  if (measurements.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        <p>No body measurements recorded yet.</p>
        <p className="text-sm mt-1">Add measurements during onboarding or in settings.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {measurements.map((measurement, index) => (
        <div key={index} className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">{measurement.label}</p>
          <p className="text-lg font-semibold">{measurement.value}"</p>
        </div>
      ))}
    </div>
  );
};

export default BodyMeasurements;
