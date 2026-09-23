import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'motion/react';

interface DockItemProps {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  baseItemSize: number;
  magnification: number;
}

const DockItem: React.FC<DockItemProps> = ({ children, label, onClick, mouseX, baseItemSize, magnification }) => {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [baseItemSize, magnification, baseItemSize]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      onClick={onClick}
      className="group relative flex aspect-square cursor-pointer items-center justify-center rounded-xl bg-white/5 transition-colors hover:bg-white/10"
    >
      <div className="flex items-center justify-center text-primary transition-transform group-hover:scale-110">
        {children}
      </div>
      
      {/* Tooltip */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 rounded bg-charcoal px-2 py-1 text-[10px] text-white transition-transform group-hover:scale-100 whitespace-nowrap font-display tracking-widest uppercase z-50">
        {label}
      </div>
    </motion.div>
  );
};

interface DockProps {
  items: {
    icon?: React.ReactNode;
    label: string;
    onClick?: () => void;
    href?: string;
  }[];
  panelHeight?: number;
  baseItemSize?: number;
  magnification?: number;
  className?: string;
}

const Dock: React.FC<DockProps> = ({ 
  items, 
  panelHeight = 68, 
  baseItemSize = 50, 
  magnification = 70,
  className = ""
}) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      style={{ height: panelHeight }}
      className={`flex items-center gap-2 rounded-2xl bg-white/5 px-4 backdrop-blur-md border border-white/10 overflow-visible ${className}`}
    >
      {items.map((item, index) => (
        <a key={index} href={item.href} onClick={item.onClick}>
          <DockItem
            mouseX={mouseX}
            baseItemSize={baseItemSize}
            magnification={magnification}
            label={item.label}
          >
            {item.icon}
          </DockItem>
        </a>
      ))}
    </motion.div>
  );
};

export default Dock;
