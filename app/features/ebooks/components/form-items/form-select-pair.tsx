import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/common/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";

interface SelectOption {
    label: string;
    value: string;
    metadata?: Record<string, unknown>;
}

interface FormSelectPairProps {
    name: string;
    label: string;
    description?: string;
    placeholder?: string;
    options: SelectOption[];
    required?: boolean;
    className?: string;
    customRenderOption?: (option: SelectOption) => React.ReactNode;
}

export function FormSelectPair({
    name,
    label,
    description,
    placeholder,
    options,
    required = false,
    className,
    customRenderOption
}: FormSelectPairProps) {
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
                    <Select
                        onValueChange={field.onChange}
                        value={field.value}
                    >
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {customRenderOption ? customRenderOption(option) : option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
} 