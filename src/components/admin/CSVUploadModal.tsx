
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface CSVUploadModalProps {
  onSuccess: () => void;
}

interface CSVRow {
  user_email: string;
  workout_id: string;
  scheduled_date: string;
  admin_message?: string;
}

interface ProcessingResult {
  success: CSVRow[];
  errors: { row: number; data: CSVRow; error: string }[];
}

export function CSVUploadModal({ onSuccess }: CSVUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessingResult | null>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const template = `user_email,workout_id,scheduled_date,admin_message
john.doe@example.com,550e8400-e29b-41d4-a716-446655440001,2024-06-01,Your personalized workout for Monday
jane.smith@example.com,550e8400-e29b-41d4-a716-446655440002,2024-06-02,Recommended strength training session
user@example.com,550e8400-e29b-41d4-a716-446655440001,2024-06-03,Recovery day workout`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `workout-schedule-template-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (csvText: string): CSVRow[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row as CSVRow;
    });
  };

  const validateRow = (row: CSVRow, index: number): string | null => {
    if (!row.user_email || !row.user_email.includes('@')) {
      return `Row ${index + 2}: Invalid email address`;
    }
    if (!row.workout_id || row.workout_id.length !== 36) {
      return `Row ${index + 2}: Invalid workout ID format (should be UUID)`;
    }
    if (!row.scheduled_date || isNaN(Date.parse(row.scheduled_date))) {
      return `Row ${index + 2}: Invalid date format (use YYYY-MM-DD)`;
    }
    return null;
  };

  const processCSV = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    try {
      const csvText = await file.text();
      const rows = parseCSV(csvText);
      
      if (rows.length === 0) {
        throw new Error('CSV file is empty or invalid');
      }

      const result: ProcessingResult = { success: [], errors: [] };
      
      // Validate all rows first
      for (let i = 0; i < rows.length; i++) {
        const validationError = validateRow(rows[i], i);
        if (validationError) {
          result.errors.push({ row: i + 2, data: rows[i], error: validationError });
        } else {
          result.success.push(rows[i]);
        }
        setProgress(((i + 1) / rows.length) * 50); // First 50% for validation
      }

      // Process successful rows
      for (let i = 0; i < result.success.length; i++) {
        const row = result.success[i];
        
        try {
          // Get current admin user
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (!currentUser) throw new Error('Not authenticated');

          // Look up user by email using auth.admin.listUsers()
          const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
          
          if (usersError) throw usersError;
          
          const user = users.users.find(u => u.email === row.user_email);
          if (!user) {
            throw new Error(`User with email ${row.user_email} not found`);
          }

          // Insert scheduled workout
          const { error: insertError } = await supabase
            .from('scheduled_workouts')
            .insert({
              user_id: user.id,
              workout_id: row.workout_id,
              scheduled_date: row.scheduled_date,
              scheduled_by_admin: currentUser.id,
              admin_message: row.admin_message || null,
              status: 'scheduled'
            });

          if (insertError) throw insertError;
        } catch (error: any) {
          const errorIndex = result.success.findIndex(r => r === row);
          result.errors.push({
            row: errorIndex + 2,
            data: row,
            error: error.message || 'Failed to process row'
          });
          result.success.splice(errorIndex, 1);
          i--; // Adjust index since we removed an item
        }
        
        setProgress(50 + ((i + 1) / result.success.length) * 50); // Second 50% for processing
      }

      setResults(result);
      
      if (result.success.length > 0) {
        toast({
          title: 'CSV Upload Completed',
          description: `Successfully scheduled ${result.success.length} workouts${
            result.errors.length > 0 ? ` with ${result.errors.length} errors` : ''
          }`,
        });
        
        if (result.errors.length === 0) {
          onSuccess();
          setIsOpen(false);
        }
      } else {
        toast({
          title: 'Upload Failed',
          description: 'No workouts were successfully scheduled. Please check the errors below.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('CSV processing error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to process CSV file',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResults(null);
    setProgress(0);
    setIsProcessing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={resetForm}>
          <Upload className="h-4 w-4 mr-2" />
          Upload CSV Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Workout Schedule CSV</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Need a template?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Download our CSV template with example data and the correct column format.
            </p>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={isProcessing}
            />
            {file && (
              <p className="text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* CSV Format Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Required columns:</strong> user_email, workout_id, scheduled_date<br />
              <strong>Optional columns:</strong> admin_message<br />
              <strong>Date format:</strong> YYYY-MM-DD (e.g., 2024-06-01)
            </AlertDescription>
          </Alert>

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing CSV...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-4">
              {results.success.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Successfully scheduled {results.success.length} workouts</strong>
                  </AlertDescription>
                </Alert>
              )}

              {results.errors.length > 0 && (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{results.errors.length} errors occurred:</strong>
                    <ul className="mt-2 space-y-1">
                      {results.errors.slice(0, 5).map((error, index) => (
                        <li key={index} className="text-sm">
                          • {error.error}
                        </li>
                      ))}
                      {results.errors.length > 5 && (
                        <li className="text-sm">
                          • ... and {results.errors.length - 5} more errors
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={processCSV} 
              disabled={!file || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Upload & Process'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
