
import React, { useState, useEffect } from 'react';
import { driveService, DriveFile } from '../services/driveService';
import ErrorMessage from '../components/ErrorMessage';
import { Upload, FileText, Trash2, HardDrive, Loader2, ExternalLink, RefreshCw, Search, Image, FileSpreadsheet, File as FileIcon, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

const FilesPage: React.FC = () => {
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quota, setQuota] = useState<{ limit: string, usage: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'pdf' | 'image' | 'spreadsheet' | 'doc' | 'folder'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');

    const loadFiles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [fileList, quotaData] = await Promise.all([
                driveService.listFiles(),
                driveService.getQuota()
            ]);
            setFiles(fileList);
            if (quotaData?.storageQuota) {
                setQuota({
                    limit: quotaData.storageQuota.limit,
                    usage: quotaData.storageQuota.usage
                });
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to load files. Ensure Supabase Secrets are set.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, []);

    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) { // 100MB limit check client side
            alert('File too large. Max 100MB allowed.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        // Simulate progress since fetch doesn't support it easily through proxy
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) return prev;
                return prev + 10;
            });
        }, 500);

        try {
            await driveService.uploadFile(file);
            clearInterval(interval);
            setUploadProgress(100);
            await new Promise(r => setTimeout(r, 500)); // Show 100% briefly
            await loadFiles(); // Refresh list
        } catch (err: any) {
            clearInterval(interval);
            alert('Upload failed: ' + err.message);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDelete = async (fileId: string) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            await driveService.deleteFile(fileId);
            setFiles(prev => prev.filter(f => f.id !== fileId));
        } catch (err: any) {
            alert('Delete failed: ' + err.message);
        }
    };

    const formatSize = (bytes: string) => {
        const b = parseInt(bytes);
        if (b === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(b) / Math.log(k));
        return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getUsagePercentage = () => {
        if (!quota) return 0;
        const limit = parseInt(quota.limit);
        const usage = parseInt(quota.usage);
        return limit > 0 ? (usage / limit) * 100 : 0;
    };

    const filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all'
            ? true
            : filterType === 'pdf' ? file.mimeType.includes('pdf')
                : filterType === 'image' ? file.mimeType.includes('image')
                    : filterType === 'spreadsheet' ? (file.mimeType.includes('sheet') || file.mimeType.includes('excel'))
                        : filterType === 'doc' ? (file.mimeType.includes('word') || file.mimeType.includes('document'))
                            : filterType === 'folder' ? file.mimeType.includes('folder')
                                : true;
        return matchesSearch && matchesType;
    }).sort((a, b) => {
        if (sortBy === 'date') {
            return new Date(b.createdTime || 0).getTime() - new Date(a.createdTime || 0).getTime();
        } else if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'size') {
            return parseInt(b.size || '0') - parseInt(a.size || '0');
        }
        return 0;
    });

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
        if (mimeType.includes('image')) return <Image className="h-8 w-8 text-purple-500" />;
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
        if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="h-8 w-8 text-blue-500" />;
        return <FileIcon className="h-8 w-8 text-slate-400" />;
    };

    const getFileColorBg = (mimeType: string) => {
        if (mimeType.includes('pdf')) return 'bg-red-50 group-hover:bg-red-100';
        if (mimeType.includes('image')) return 'bg-purple-50 group-hover:bg-purple-100';
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'bg-green-50 group-hover:bg-green-100';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'bg-blue-50 group-hover:bg-blue-100';
        return 'bg-slate-50 group-hover:bg-slate-100';
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Files</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Manage Documents</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Storage Meter */}
                    {quota && (
                        <div className="hidden md:block bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-1.5">
                                <HardDrive className="h-4 w-4 text-brand-500" />
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Storage</span>
                                <span className="ml-auto text-xs font-bold text-slate-900">
                                    {formatSize(quota.usage)} / {formatSize(quota.limit)}
                                </span>
                            </div>
                            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${getUsagePercentage() > 90 ? 'bg-red-500' : 'bg-brand-500'}`}
                                    style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={loadFiles}
                        disabled={isLoading}
                        className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>

                    <label className={`
                        relative flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 
                        cursor-pointer hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all text-sm overflow-hidden
                        ${isUploading ? 'pointer-events-none' : ''}
                    `}>
                        {isUploading && (
                            <div
                                className="absolute left-0 top-0 bottom-0 bg-brand-800 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        )}
                        <div className="relative flex items-center gap-2 z-10">
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            {isUploading ? `Uploading ${uploadProgress}%` : 'Upload File'}
                        </div>
                        <input
                            type="file"
                            accept=".pdf, .png, .jpg, .jpeg, .doc, .docx, .xls, .xlsx, application/pdf, image/*, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                    </label>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filterType === 'all' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        All Files
                    </button>
                    <button
                        onClick={() => setFilterType('pdf')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filterType === 'pdf' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        <FileText className="h-4 w-4" />
                        PDFs
                    </button>
                    <button
                        onClick={() => setFilterType('image')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filterType === 'image' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        <Image className="h-4 w-4" />
                        Images
                    </button>
                    <button
                        onClick={() => setFilterType('doc')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filterType === 'doc' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        <FileText className="h-4 w-4" />
                        Docs
                    </button>
                    <button
                        onClick={() => setFilterType('spreadsheet')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filterType === 'spreadsheet' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        Sheets
                    </button>

                    <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>

                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-slate-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
                        >
                            <option value="date">Date</option>
                            <option value="name">Name</option>
                            <option value="size">Size</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && <ErrorMessage message={error} className="rounded-2xl shadow-sm border-red-100" />}

            {/* Content */}
            {isLoading && files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-brand-500" />
                    <p className="font-medium animate-pulse">Loading files...</p>
                </div>
            ) : filteredFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredFiles.map((file) => (
                        <div key={file.id} className="group premium-card p-5 relative hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-2xl transition-colors ${getFileColorBg(file.mimeType)}`}>
                                    {getFileIcon(file.mimeType)}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={file.webViewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                        title="Open in Drive"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(file.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-slate-900 truncate mb-1" title={file.name}>
                                {file.name}
                            </h3>

                            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span>{formatSize(file.size)}</span>
                                {file.createdTime && (
                                    <span>{format(new Date(file.createdTime), 'MMM d, yyyy')}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="premium-card py-20 text-center border-dashed">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <Search className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No files found</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto mb-6">
                        {searchTerm || filterType !== 'all' ? 'Try adjusting your search or filters.' : 'Upload your first PDF document to the common drive.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default FilesPage;
