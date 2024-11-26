import { motion, AnimatePresence } from "framer-motion";

function PageAnimation({
  children,
  initial = { opacity: 0 },
  animate = { opacity: 1 },
  transition = { duration: 1 },
  className,
}) {
  return (
    <AnimatePresence>
      <motion.div initial={initial} animate={animate} className={className} transition={transition}>
        {children}
      </motion.div>
      ;
    </AnimatePresence>
  );
}

export default PageAnimation;
