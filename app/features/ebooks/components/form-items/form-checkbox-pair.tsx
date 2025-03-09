import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/common/components/ui/form";

interface FormCheckboxPairProps {
    name: string;
    label: string;
    description?: string;
    className?: string;
}

export function FormCheckboxPair({
    name,
    label,
    description,
    className
}: FormCheckboxPairProps) {
    const { control } = useFormContext();

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={`flex flex-row items-start space-x-3 space-y-0 ${className}`}>
                    <FormControl>
                        <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="rounded"
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>{label}</FormLabel>
                        {description && (
                            <p className="text-sm text-gray-500">{description}</p>
                        )}
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
} 