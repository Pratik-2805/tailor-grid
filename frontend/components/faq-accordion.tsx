'use client'

import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { FAQS } from './data'

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="max-w-[860px] mx-auto divide-y divide-[#E8E1D5]/80">
      {FAQS.map((faq, idx) => {
        const isOpen = openIndex === idx
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{
              duration: 0.4,
              delay: idx * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="py-5 sm:py-6 group"
          >
            <button
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${idx}`}
              id={`faq-question-${idx}`}
              className="flex w-full items-center justify-between text-left gap-4 cursor-pointer focus:outline-none"
            >
              <span className="font-serif text-base sm:text-lg lg:text-xl font-bold text-[#0F1115] group-hover:text-[#9E593B] transition-colors leading-snug">
                {faq.q}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className={`grid size-8 shrink-0 place-items-center rounded-full border transition-colors ${
                  isOpen
                    ? 'bg-[#0F1115] text-white border-[#0F1115]'
                    : 'bg-white text-[#5A5D64] border-[#E8E1D5] group-hover:border-[#9E593B] group-hover:text-[#9E593B]'
                }`}
              >
                <Plus size={16} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className="overflow-hidden"
                >
                  <p className="pt-3 pb-1 text-xs sm:text-sm md:text-[15px] leading-relaxed text-[#5A5D64] max-w-3xl pr-6">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
