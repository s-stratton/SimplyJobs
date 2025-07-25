import React, { useState, Children, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaAngleLeft, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Stepper({
    children,
    initialStep = 1,
    onStepChange = () => { },
    onFinalStepCompleted = () => { },
    backButtonProps = {},
    nextButtonProps = {},
    nextButtonText = "Continue",
    renderStepIndicator,
    canProceed = true,
}) {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [direction, setDirection] = useState(0);
    const stepsArray = Children.toArray(children);
    const totalSteps = stepsArray.length;
    const isCompleted = currentStep > totalSteps;
    const isLastStep = currentStep === totalSteps;
    const navigate = useNavigate();

    const updateStep = (newStep) => {
        setCurrentStep(newStep);
        if (newStep > totalSteps) onFinalStepCompleted();
        else onStepChange(newStep);
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setDirection(-1);
            updateStep(currentStep - 1);
        }
    };

    const handleNext = () => {
        if (!isLastStep) {
            setDirection(1);
            updateStep(currentStep + 1);
        }
    };

    const handleComplete = () => {
        setDirection(1);
        updateStep(totalSteps + 1);
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
    };

    return (
        <div className="flex min-h-full flex-1 flex-col items-center justify-center p-4 sm:aspect-[4/3] md:aspect-[2/1]">
            <div className="bg-white mx-auto w-full max-w-md rounded-4xl shadow-md">
                <div className="flex justify-end pt-7 pr-7">
                    <button
                        onClick={handleLogout}
                        className="flex items-center text-lg text-slate-500 hover:cursor-pointer"
                        title="Logout"
                    >
                        <FaSignOutAlt className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex w-full items-center p-8">
                    {stepsArray.map((_, index) => {
                        const stepNumber = index + 1;
                        const isNotLastStep = index < totalSteps - 1;
                        return (
                            <React.Fragment key={stepNumber}>
                                {renderStepIndicator ? (
                                    renderStepIndicator({
                                        step: stepNumber,
                                        currentStep,
                                    })
                                ) : (
                                    <StepIndicator
                                        step={stepNumber}
                                        disableStepIndicators={true}
                                        currentStep={currentStep}
                                    />
                                )}
                                {isNotLastStep && (
                                    <StepConnector isComplete={currentStep > stepNumber} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
                <StepContentWrapper
                    isCompleted={isCompleted}
                    currentStep={currentStep}
                    direction={direction}
                    className="space-y-2 px-8"
                >
                    {stepsArray[currentStep - 1]}
                </StepContentWrapper>
                {!isCompleted && (
                    <div className="px-8 pb-8">
                        <div className={`mt-10 flex${currentStep !== 1 ? " justify-between" : " justify-end"}`}>
                            {currentStep !== 1 && (
                                <button
                                    onClick={handleBack}
                                    className={`duration-350 rounded-lg py-2 text-lg transition${currentStep === 1
                                        ? " pointer-events-none opacity-50 text-neutral-400"
                                        : " text-neutral-400 hover:text-neutral-700"
                                    }`}
                                    {...backButtonProps}
                                >
                                    <FaAngleLeft className="w-6 h-6" />
                                </button>
                            )}
                            <button
                                onClick={isLastStep ? handleComplete : handleNext}
                                disabled={!canProceed}
                                className="duration-350 flex items-center justify-center rounded-full bg-blue-500 py-1.5 px-3.5 font-medium tracking-tight text-white transition hover:bg-blue-600 active:bg-blue-700"
                                {...nextButtonProps}
                            >
                                {isLastStep ? "Complete" : nextButtonText}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StepContentWrapper({ isCompleted, currentStep, direction, children, className }) {
    const [parentHeight, setParentHeight] = useState(0);

    return (
        <motion.div
            style={{ position: "relative", overflow: "hidden" }}
            animate={{ height: isCompleted ? 0 : parentHeight }}
            transition={{ type: "spring", duration: 0.4 }}
            className={className}
        >
            <AnimatePresence initial={false} mode="sync" custom={direction}>
                {!isCompleted && (
                    <SlideTransition
                        key={currentStep}
                        direction={direction}
                        onHeightReady={(h) => setParentHeight(h)}
                    >
                        {children}
                    </SlideTransition>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function SlideTransition({ children, direction, onHeightReady }) {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        if (containerRef.current) onHeightReady(containerRef.current.offsetHeight);
    }, [children, onHeightReady]);

    return (
        <motion.div
            ref={containerRef}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            style={{ position: "absolute", left: 0, right: 0, top: 0 }}
        >
            {children}
        </motion.div>
    );
}

const stepVariants = {
    enter: (dir) => ({
        x: dir >= 0 ? "-100%" : "100%",
        opacity: 0,
    }),
    center: {
        x: "0%",
        opacity: 1,
    },
    exit: (dir) => ({
        x: dir >= 0 ? "50%" : "-50%",
        opacity: 0,
    }),
};

export function Step({ children }) {
    return <div className="px-8">{children}</div>;
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators }) {
    const status = currentStep === step ? "active" : currentStep < step ? "inactive" : "complete";

    const handleClick = () => {
        if (step !== currentStep && !disableStepIndicators) onClickStep(step);
    };

    return (
        <motion.div
            onClick={handleClick}
            className="relative outline-none focus:outline-none"
            animate={status}
            initial={false}
        >
            <motion.div
                variants={{
                    inactive: { scale: 1, backgroundColor: "#bfdbfe", color: "#1d4ed8" },
                    active: { scale: 1, backgroundColor: "#3b82f6", color: "#3b82f6" },
                    complete: { scale: 1, backgroundColor: "#3b82f6", color: "#ffffff" },
                }}
                transition={{ duration: 0.3 }}
                className="flex h-8 w-8 items-center justify-center rounded-full font-semibold"
            >
                {status === "complete" ? (
                    <CheckIcon className="h-4 w-4 text-white" />
                ) : status === "active" ? (
                    <div className="h-3 w-3 rounded-full bg-white" />
                ) : (
                    <span className="text-sm">{step}</span>
                )}
            </motion.div>
        </motion.div>
    );
}

function StepConnector({ isComplete }) {
    const lineVariants = {
        incomplete: { width: 0, backgroundColor: "transparent" },
        complete: { width: "100%", backgroundColor: "#3b82f6" },
    };

    return (
        <div className="relative mx-2 h-0.5 flex-1 overflow-hidden rounded bg-neutral-600">
            <motion.div
                className="absolute left-0 top-0 h-full"
                variants={lineVariants}
                initial={false}
                animate={isComplete ? "complete" : "incomplete"}
                transition={{ duration: 0.4 }}
            />
        </div>
    );
}

function CheckIcon(props) {
    return (
        <svg
            {...props}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
        >
            <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.1, type: "tween", ease: "easeOut", duration: 0.3 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
            />
        </svg>
    );
}
