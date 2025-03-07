import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "~/common/components/ui/button";
import { Card } from "~/common/components/ui/card";
import { Upload, X } from "lucide-react";

interface EbookCoverProps {
    imageUrl?: string;
    alt?: string;
    editable?: boolean;
    onImageChange?: (file: File) => void;
    className?: string;
}

export function EbookCover({
    imageUrl,
    alt = "eBook 표지",
    editable = false,
    onImageChange,
    className = "",
}: EbookCoverProps) {
    const [preview, setPreview] = useState<string | null>(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".webp"],
        },
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                const previewUrl = URL.createObjectURL(file);
                setPreview(previewUrl);
                onImageChange?.(file);
            }
        },
    });

    const handleRemoveImage = () => {
        setPreview(null);
        // 여기서 이미지 삭제 로직을 추가할 수 있습니다
    };

    const displayUrl = preview || imageUrl;

    if (editable) {
        return (
            <div className={`relative ${className}`}>
                {displayUrl ? (
                    <div className="relative group">
                        <img
                            src={displayUrl}
                            alt={alt}
                            className="w-full h-full object-cover rounded-md shadow-md"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-md">
                            <Button
                                size="sm"
                                variant="secondary"
                                {...getRootProps()}
                                className="z-10"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                변경
                                <input {...getInputProps()} />
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleRemoveImage}
                                className="z-10"
                            >
                                <X className="h-4 w-4 mr-2" />
                                삭제
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive
                                ? "border-primary bg-primary/10"
                                : "border-gray-300 hover:border-primary/50"
                            } ${className}`}
                    >
                        <input {...getInputProps()} />
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 text-center">
                            {isDragActive
                                ? "이미지를 여기에 놓으세요"
                                : "표지 이미지를 드래그하거나 클릭하여 업로드하세요"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            JPG, PNG, WebP 파일 (최대 5MB)
                        </p>
                    </div>
                )}
            </div>
        );
    }

    if (!displayUrl) {
        return (
            <Card className={`flex items-center justify-center p-4 ${className}`}>
                <div className="text-center text-gray-400">
                    <p>표지 이미지 없음</p>
                </div>
            </Card>
        );
    }

    return (
        <img
            src={displayUrl}
            alt={alt}
            className={`w-full h-full object-cover rounded-md shadow-md ${className}`}
        />
    );
} 