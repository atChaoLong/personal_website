"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import PixelField from "./PixelField";
import PixelText from "./PixelText";

export default function SignatureFooter() {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const curtainY = useTransform(scrollYProgress, [0, 0.2, 1], ["0%", "0%", "-100%"]);
  const textOpacity = useTransform(scrollYProgress, [0.3, 1], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.3, 1], [40, 0]);

  return (
    <footer className="signature-footer" id="signature" ref={ref}>
      <PixelField />
      <motion.div
        className="signature-text-wrapper"
        style={reduced ? undefined : { opacity: textOpacity, y: textY }}
      >
        <PixelText text="ATCHAOLONG" className="signature-text" />
      </motion.div>
      {!reduced && (
        <motion.div className="signature-curtain" style={{ y: curtainY }} aria-hidden="true" />
      )}
    </footer>
  );
}
