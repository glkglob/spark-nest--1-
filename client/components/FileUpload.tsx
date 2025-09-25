import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, File, X, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface FileMetadata {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  userId: string;
  projectId?: number;
  uploadedAt: string;
  url: string;
}

interface FileUploadProps {
  projectId?: number;
  onFileUploaded?: (file: FileMetadata) => void;
}

export default function FileUpload({ projectId, onFileUploaded }: FileUploadProps) {
  const { token } = useAuth();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      const url = projectId 
        ? `/api/projects/${projectId}/files`
        : '/api/files';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  // Fetch files on component mount
  useState(() => {
    fetchFiles();
  });

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    Array.from(selectedFiles).forEach(file => {
      uploadFile(file);
    });
  };

  const uploadFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    if (projectId) {
      formData.append('projectId', projectId.toString());
    }

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(prev => [data.file, ...prev]);
        toast.success('File uploaded successfully!');
        onFileUploaded?.(data.file);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        toast.success('File deleted successfully!');
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error) {
      toast.error('Error deleting file');
    }
  };

  const downloadFile = (file: FileMetadata) => {
    window.open(`/api/files/${file.id}`, '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
    if (mimeType.includes('zip')) return '📦';
    return '📁';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Upload Area */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Upload className="h-5 w-5 text-primary" />
            File Upload
          </CardTitle>
          <CardDescription className="text-base">
            Upload documents, images, and other files for your project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ease-out ${
              dragOver 
                ? 'border-primary bg-primary/5 scale-[1.02] shadow-lg shadow-primary/10' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30 hover:scale-[1.01]'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
            />
            
            <div className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center hover-scale">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <p className="text-xl font-semibold text-balance">
                  {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Maximum file size: 10MB • Supports images, documents, and archives
                </p>
              </div>

              {uploading && (
                <div className="space-y-3 animate-in slide-up">
                  <Progress value={uploadProgress} className="w-full h-2" />
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading your files...
                  </p>
                </div>
              )}

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                variant="gradient"
                size="lg"
                className="hover-lift"
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Select Files
              </Button>
            </div>
          </div>

          <Alert className="mt-6 glass border-primary/20">
            <AlertDescription className="text-sm">
              <strong>Supported formats:</strong> Images (JPEG, PNG, GIF, WebP), Documents (PDF, Word, Excel), Text files, ZIP archives
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Files List */}
      {files.length > 0 && (
        <Card className="card-interactive animate-in slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <File className="h-5 w-5 text-primary" />
              Uploaded Files ({files.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5 animate-in slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center hover-scale">
                    <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-base">{file.originalName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} • {formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => downloadFile(file)}
                      className="hover-scale hover:bg-primary/10 hover:text-primary"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteFile(file.id)}
                      className="hover-scale hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
