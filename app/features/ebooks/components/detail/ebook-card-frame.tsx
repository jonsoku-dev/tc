import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface EbookCardFrameProps {
    title: string;
    children: ReactNode;
    icon?: LucideIcon;
    className?: string;
    contentClassName?: string;
    headerClassName?: string;
    titleClassName?: string;
}

export function EbookCardFrame({
    title,
    children,
    icon: Icon,
    className = "",
    contentClassName = "pt-6",
    headerClassName = "bg-gray-50",
    titleClassName = "",
}: EbookCardFrameProps) {
    return (
        <Card className={`overflow-hidden ${className}`}>
            <CardHeader className={headerClassName}>
                <div className="flex items-center justify-between">
                    <CardTitle className={titleClassName}>{title}</CardTitle>
                    {Icon && <Icon className="h-5 w-5 text-gray-500" />}
                </div>
            </CardHeader>
            <CardContent className={contentClassName}>
                {children}
            </CardContent>
        </Card>
    );
} 