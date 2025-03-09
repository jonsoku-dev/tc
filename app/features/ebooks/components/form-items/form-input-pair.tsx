import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/common/components/ui/form";
import { Input } from "~/common/components/ui/input";
import { Textarea } from "~/common/components/ui/textarea";

interface FormInputPairProps {
    name: string;
    label: string;
    description?: string;
    placeholder?: string;
    type?: string;
    required?: boolean;
    min?: string | number;
    max?: string | number;
    rows?: number;
    textArea?: boolean;
    className?: string;
}

export function FormInputPair({
    name,
    label,
    description,
    placeholder,
    type = "text",
    required = false,
    min,
    max,
    rows = 4,
    textArea = false,
    className
}: FormInputPairProps) {
    const { control } = useFormContext();

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                        {label}
                    </FormLabel>
                    {description && (
                        <p className="text-sm text-gray-500 mb-2">{description}</p>
                    )}
                    <FormControl>
                        {textArea ? (
                            <Textarea
                                {...field}
                                placeholder={placeholder}
                                rows={rows}
                            />
                        ) : (
                            <Input
                                {...field}
                                type={type}
                                placeholder={placeholder}
                                min={min}
                                max={max}
                            />
                        )}
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
} 