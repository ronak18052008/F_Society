"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative h-[52vh] min-h-80 overflow-hidden border border-line">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <Image
              src={images[active]}
              alt={`${title} photograph ${active + 1}`}
              fill
              className="object-cover"
              priority
              sizes="100vw"
              unoptimized
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(index)}
            className={`relative h-16 w-24 shrink-0 overflow-hidden border ${
              index === active ? "border-bronze" : "border-line"
            }`}
            aria-label={`Show photograph ${index + 1}`}
          >
            <Image src={src} alt="" fill className="object-cover" sizes="96px" />
          </button>
        ))}
      </div>
    </div>
  );
}
