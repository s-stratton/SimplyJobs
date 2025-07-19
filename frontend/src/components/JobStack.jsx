import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import JobCard, { JOB_CARD_WIDTH, JOB_CARD_HEIGHT } from "./JobCard";

function CardRotate({ children, onSendToBack, onApply, sensitivity, onSkip }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [60, -60]);
    const rotateY = useTransform(x, [-100, 100], [-60, 60]);

    function handleDragEnd(_, info) {
        if (info.offset.x > sensitivity) {
            onApply();
            onSendToBack();
        } else if (info.offset.x < -sensitivity) {
            onSkip();
            onSendToBack();
        } else {
            x.set(0);
            y.set(0);
        }
    }

    return (
        <motion.div
            className="absolute cursor-grab"
            style={{ x, y, rotateX, rotateY }}
            drag="x"
            dragConstraints={{ right: 0, left: 0 }}
            dragElastic={0.6}
            whileTap={{ cursor: "grabbing" }}
            onDragEnd={handleDragEnd}
        >
            {children}
        </motion.div>
    );
}

export default function JobStack({
    jobs = [],
    onApply,
    onSkip,
    onExpand,
    sensitivity = 100,
    sendToBackOnClick = false,
}) {
    const [cards, setCards] = useState(jobs);

    // Keep cards in sync with jobs prop
    useEffect(() => {
        setCards(jobs);
    }, [jobs]);

    // Move card to back of stack
    const sendToBack = (id) => {
        setCards((prev) => {
            const newCards = [...prev];
            const index = newCards.findIndex((card) => card.id === id);
            const [card] = newCards.splice(index, 1);
            newCards.unshift(card);
            return newCards;
        });
    };

    // If overlay/modal, disable swipe by not rendering CardRotate
    const isOverlay = onExpand === null;

    return (
        <div
            className="relative mx-auto"
            style={{
                width: JOB_CARD_WIDTH,
                height: JOB_CARD_HEIGHT,
                perspective: 600,
            }}
        >
            {cards.map((job, index) =>
                isOverlay ? (
                    <motion.div
                        key={job.id}
                        className="w-full h-full"
                        animate={{
                            rotateZ: 0,
                            transformOrigin: "90% 90%",
                        }}
                        initial={false}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                        }}
                    >
                        <JobCard
                            job={job}
                            isTop={index === cards.length - 1}
                            onExpand={onExpand}
                            forceShowFull={true}
                        />
                    </motion.div>
                ) : (
                    <CardRotate
                        key={job.id}
                        onSendToBack={() => sendToBack(job.id)}
                        onApply={() => onApply(job.id)}
                        onSkip={() => onSkip(job.id)}
                        sensitivity={sensitivity}
                    >
                        <motion.div
                            className="w-full h-full"
                            onClick={() => sendToBackOnClick && sendToBack(job.id)}
                            animate={{
                                rotateZ: 0,
                                transformOrigin: "90% 90%",
                            }}
                            initial={false}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                            }}
                        >
                            <JobCard
                                job={job}
                                isTop={index === cards.length - 1}
                                onExpand={onExpand}
                                forceShowFull={false}
                            />
                        </motion.div>
                    </CardRotate>
                )
            )}
        </div>
    );
}