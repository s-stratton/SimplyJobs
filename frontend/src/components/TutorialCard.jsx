import { HiOutlineChevronDoubleLeft, HiOutlineChevronDoubleRight } from "react-icons/hi";
import { motion, useMotionValue, useTransform } from "framer-motion";

export const TUTORIAL_CARD_WIDTH =
    window.innerWidth >= 768 ? 400 : 340;
export const TUTORIAL_CARD_HEIGHT =
    window.innerWidth >= 768 ? 600 : 520;

function TutorialRotate({ children }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [60, -60]);
    const rotateY = useTransform(x, [-100, 100], [-60, 60]);

    function handleDragEnd(_, info) {
        x.set(0);
        y.set(0);
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

function TutorialCard({ onClose, leftText, rightText }) {
    return (
        <div
            className="bg-white/70 border border-slate-200 rounded-xl shadow-lg p-8 flex flex-col items-center justify-between translate-y-[-20px] text-center"
            style={{ width: TUTORIAL_CARD_WIDTH, height: TUTORIAL_CARD_HEIGHT }}
        >
            <div>
                <h3 className="text-3xl text-slate-800 font-bold mb-30">How to Use</h3>
                <div className="text-lg text-slate-500 font-semibold flex gap-20 flex-col items-start">
                    <span className="flex items-center">
                        <HiOutlineChevronDoubleLeft />
                        <span>
                            Swipe left to <b className="text-slate-600">{leftText}</b>
                        </span>
                    </span>
                    <span className="flex items-center">
                        <span>
                            Swipe right to <b className="text-slate-600">{rightText}</b>
                        </span>
                        <HiOutlineChevronDoubleRight />
                    </span>
                </div>
            </div>
            <button
                className="mt-auto px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                onClick={onClose}
            >
                Got it!
            </button>
        </div>
    );
}

export { TutorialCard, TutorialRotate };
export default TutorialCard;