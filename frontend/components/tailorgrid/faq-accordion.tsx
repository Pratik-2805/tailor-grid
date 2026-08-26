'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { FAQS } from './data'

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-3 max-w-[800px] mx-auto">
      {FAQS.map((faq, idx) => {
        const isOpen = openIndex === idx
        return (
          <div
            key={idx}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? 'border-[#0F1115] bg-white shadow-sm'
                : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB]'
            }`}
          >
            <button
              onClick={() => toggle(idx)}
              className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-[#0F1115] focus:outline-none"
            >
              <span className="flex items-center gap-3">
                <HelpCircle size={17} className={isOpen ? 'text-[#9E593B]' : 'text-[#6B7280]'} />
                <span>{faq.q}</span>
              </span>
              <ChevronDown
                size={18}
                className={`text-[#6B7280] transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-[#0F1115]' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed text-[#4B5563] border-t border-[#F3F4F6]">
                {faq.a}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

