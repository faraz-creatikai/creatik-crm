'use client';
import React, { ReactNode, MouseEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PopupMenuProps {
  children: ReactNode;
  onClose?: () => void;
  isOpen?: boolean; // optional prop to control visibility
}

const PopupMenu: React.FC<PopupMenuProps> = ({ children, onClose, isOpen = true }) => {
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

    useEffect(() => {
    if (isOpen) {
      document.body.style.overflowY = 'hidden';
    } else {
      document.body.style.overflowY = 'auto';
    }

    return () => {
      document.body.style.overflowY = 'auto'; // cleanup
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onClick={handleBackdropClick}
          className="fixed z-50 top-0 left-0 px-0.5 backdrop-blur-[0.5px] w-screen grid place-items-center bg-gray-300/50"
          style={{ height: '100dvh' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
          onClick={handleBackdropClick}
            className="w-full flex justify-center items-center "
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            transition={{ duration: .4 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PopupMenu;
