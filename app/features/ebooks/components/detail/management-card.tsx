import { useState } from "react";
import { Link } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Edit, Trash2, Archive } from "lucide-react";
import { EbookCardFrame } from "./ebook-card-frame";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/common/components/ui/dialog";

interface ManagementCardProps {
    ebookId: string;
    ebookStatus: string;
    className?: string;
    onDelete?: (id: string) => void;
    onArchive?: (id: string) => void;
}

export function ManagementCard({
    ebookId,
    ebookStatus,
    className = "",
    onDelete,
    onArchive
}: ManagementCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showArchiveDialog, setShowArchiveDialog] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        if (onDelete) {
            onDelete(ebookId);
        }
        // 실제 구현에서는 삭제 후 리디렉션 등의 처리
        setIsDeleting(false);
        setShowDeleteDialog(false);
    };

    const handleArchive = () => {
        setIsArchiving(true);
        if (onArchive) {
            onArchive(ebookId);
        }
        // 실제 구현에서는 보관 처리 후 상태 업데이트
        setIsArchiving(false);
        setShowArchiveDialog(false);
    };

    return (
        <EbookCardFrame title="관리" className={className}>
            <div className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                    <Link to={`/ebooks/${ebookId}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        편집하기
                    </Link>
                </Button>

                {ebookStatus !== "archived" && (
                    <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <Archive className="mr-2 h-4 w-4" />
                                보관하기
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>전자책 보관</DialogTitle>
                                <DialogDescription>
                                    이 전자책을 보관하시겠습니까? 보관된 전자책은 목록에서 숨겨지지만 언제든지 복원할 수 있습니다.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
                                    취소
                                </Button>
                                <Button onClick={handleArchive} disabled={isArchiving}>
                                    {isArchiving ? "처리 중..." : "보관하기"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}

                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제하기
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>전자책 삭제</DialogTitle>
                            <DialogDescription>
                                정말로 이 전자책을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며 모든 관련 데이터가 영구적으로 삭제됩니다.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                취소
                            </Button>
                            <Button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                variant="destructive"
                            >
                                {isDeleting ? "삭제 중..." : "삭제하기"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </EbookCardFrame>
    );
} 