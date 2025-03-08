import { useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "~/common/lib/utils";
import { FormStep, FORM_STEPS, STEP_NAMES } from "../schemas/ebook-form.schema";

interface EbookFormStepperProps {
    currentStep: FormStep;
    completedSteps: FormStep[];
    onStepChange: (step: FormStep) => void;
    isStepClickable?: boolean;
}

export function EbookFormStepper({
    currentStep,
    completedSteps,
    onStepChange,
    isStepClickable = true,
}: EbookFormStepperProps) {
    const currentStepIndex = FORM_STEPS.indexOf(currentStep);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                {FORM_STEPS.map((step, index) => {
                    const isCompleted = completedSteps.includes(step);
                    const isCurrent = step === currentStep;
                    const isClickable = isStepClickable && (isCompleted || index <= currentStepIndex);

                    return (
                        <div key={step} className="flex flex-col items-center w-full">
                            <div className="flex items-center w-full">
                                {/* 이전 단계와 연결하는 선 */}
                                {index > 0 && (
                                    <div
                                        className={cn(
                                            "h-1 flex-1",
                                            isCompleted || (index <= currentStepIndex && completedSteps.includes(FORM_STEPS[index - 1]))
                                                ? "bg-primary"
                                                : "bg-gray-200"
                                        )}
                                    />
                                )}

                                {/* 스텝 원형 버튼 */}
                                <button
                                    type="button"
                                    onClick={() => isClickable && onStepChange(step)}
                                    disabled={!isClickable}
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                                        isCurrent
                                            ? "border-primary bg-primary text-white"
                                            : isCompleted
                                                ? "border-primary bg-primary text-white"
                                                : "border-gray-300 bg-white text-gray-400",
                                        isClickable ? "cursor-pointer" : "cursor-not-allowed"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </button>

                                {/* 다음 단계와 연결하는 선 */}
                                {index < FORM_STEPS.length - 1 && (
                                    <div
                                        className={cn(
                                            "h-1 flex-1",
                                            isCompleted
                                                ? "bg-primary"
                                                : "bg-gray-200"
                                        )}
                                    />
                                )}
                            </div>

                            {/* 스텝 이름 */}
                            <span
                                className={cn(
                                    "mt-2 text-sm font-medium",
                                    isCurrent ? "text-primary" : isCompleted ? "text-gray-700" : "text-gray-400"
                                )}
                            >
                                {STEP_NAMES[step]}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface StepNavigationProps {
    currentStep: FormStep;
    isFirstStep: boolean;
    isLastStep: boolean;
    isNextDisabled?: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onSave: (() => void) | undefined;
    isSaving?: boolean;
}

export function StepNavigation({
    currentStep,
    isFirstStep,
    isLastStep,
    isNextDisabled = false,
    onPrevious,
    onNext,
    onSave,
    isSaving = false,
}: StepNavigationProps) {
    return (
        <div className="flex justify-between mt-6">
            <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isFirstStep}
            >
                이전
            </Button>

            <div className="flex gap-2">
                {isLastStep ? (
                    <Button
                        type="button"
                        disabled={isSaving || !onSave}
                        onClick={onSave}
                    >
                        {isSaving ? "저장 중..." : "저장하기"}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={onNext}
                        disabled={isNextDisabled}
                        className="flex items-center"
                    >
                        다음
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
} 