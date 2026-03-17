"use client";

import { useRef, useEffect, useState, FC, PointerEvent } from 'react';
import { Text } from 'citrica-ui-toolkit';

interface CurvedLoopProps {
  marqueeText?: string;
  items?: string[];
  speed?: number;
  className?: string;
  direction?: 'left' | 'right';
  interactive?: boolean;
  separator?: string;
  textVariant?: string;
  textColor?: string;
}

const CurvedLoop: FC<CurvedLoopProps> = ({
  marqueeText = '',
  items,
  speed = 1,
  className,
  direction = 'left',
  interactive = true,
  separator = '•',
  textVariant = 'h3',
  textColor = '#ffffff',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const offsetRef = useRef(0);
  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const dirRef = useRef<'left' | 'right'>(direction);
  const velRef = useRef(0);

  // Parse items from marqueeText if items prop not provided
  const textItems = items || marqueeText.split(/\u00A0{2,}/).filter(Boolean);

  // Measure content width
  useEffect(() => {
    if (innerRef.current) {
      const firstSet = innerRef.current.children[0] as HTMLElement;
      if (firstSet) {
        setContentWidth(firstSet.offsetWidth);
      }
    }
  }, [textItems]);

  // Animation loop
  useEffect(() => {
    if (!contentWidth) return;
    let frame = 0;
    const step = () => {
      if (!dragRef.current && innerRef.current) {
        const delta = dirRef.current === 'right' ? speed : -speed;
        offsetRef.current += delta;
        if (offsetRef.current <= -contentWidth) offsetRef.current += contentWidth;
        if (offsetRef.current > 0) offsetRef.current -= contentWidth;
        innerRef.current.style.transform = `translateX(${offsetRef.current}px)`;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [contentWidth, speed]);

  const onPointerDown = (e: PointerEvent) => {
    if (!interactive) return;
    dragRef.current = true;
    lastXRef.current = e.clientX;
    velRef.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!interactive || !dragRef.current || !innerRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;
    offsetRef.current += dx;
    if (offsetRef.current <= -contentWidth) offsetRef.current += contentWidth;
    if (offsetRef.current > 0) offsetRef.current -= contentWidth;
    innerRef.current.style.transform = `translateX(${offsetRef.current}px)`;
  };

  const endDrag = () => {
    if (!interactive) return;
    dragRef.current = false;
    dirRef.current = velRef.current > 0 ? 'right' : 'left';
  };

  const cursorStyle = interactive ? 'grab' : 'auto';

  const renderSet = (keyPrefix: string) => (
    <div className="flex items-center shrink-0" key={keyPrefix}>
      {textItems.map((item, i) => (
        <div key={`${keyPrefix}-${i}`} className="flex items-center shrink-0">
          <Text variant={textVariant as any} color={textColor} className={`whitespace-nowrap px-4 ${className || ''}`}>
            {item}
          </Text>
          {separator && (
            <Text variant={textVariant as any} color={textColor} className="whitespace-nowrap px-4 opacity-50">
              {separator}
            </Text>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="overflow-hidden w-full"
      style={{ cursor: cursorStyle }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <div ref={innerRef} className="flex items-center w-max will-change-transform">
        {renderSet('a')}
        {renderSet('b')}
        {renderSet('c')}
      </div>
    </div>
  );
};

export default CurvedLoop;
