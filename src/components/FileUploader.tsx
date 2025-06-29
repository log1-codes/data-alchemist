import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Users, Briefcase, ClipboardList } from 'lucide-react';

interface FileUploaderProps {
  label: string;
  onFileParsed: (data: any[], fileName: string) => void;
  icon?: 'users' | 'briefcase' | 'clipboard-list';
  compact?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ label, onFileParsed, icon, compact }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      const Papa = await import('papaparse');
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          onFileParsed(results.data, fileName);
        },
      });
    } else if (ext === 'xlsx') {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      onFileParsed(json, fileName);
    } else {
      alert('Unsupported file type. Please upload a CSV or XLSX file.');
    }
  };

  const renderIcon = () => {
    if (icon === 'users') return <Users className="w-5 h-5 mr-2" />;
    if (icon === 'briefcase') return <Briefcase className="w-5 h-5 mr-2" />;
    if (icon === 'clipboard-list') return <ClipboardList className="w-5 h-5 mr-2" />;
    return null;
  };

  return (
    <div className="flex flex-col gap-2 items-center">
      {!compact && <label className="font-medium">{label}</label>}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        onClick={() => inputRef.current?.click()}
        size={compact ? 'sm' : 'default'}
        className={compact ? 'rounded-full px-4 py-2 flex items-center justify-center' : 'flex items-center'}
      >
        {icon && renderIcon()}
        {compact ? label : `Upload ${label}`}
      </Button>
    </div>
  );
};

export default FileUploader; 