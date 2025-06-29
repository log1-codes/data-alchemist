import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  label: string;
  onFileParsed: (data: any[], fileName: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ label, onFileParsed }) => {
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

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button type="button" onClick={() => inputRef.current?.click()}>
        Upload {label}
      </Button>
    </div>
  );
};

export default FileUploader; 