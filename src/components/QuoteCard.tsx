'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface QuoteCardProps {
  lineItems: LineItem[];
  total: number;
  currency?: string;
  discount?: { label: string; amount: number };
  notes?: string;
  onBook?: () => void;
  className?: string;
  variant?: 'full' | 'sticky';
  onExpand?: () => void;
}

export function QuoteCard({
  lineItems,
  total,
  currency = '฿',
  discount,
  notes,
  onBook,
  className,
  variant = 'full',
  onExpand,
}: QuoteCardProps) {
  // Calculate subtotal before discount
  const subtotalBeforeDiscount = discount ? total + discount.amount : total;

  // Sticky variant - compact bar for sidebar
  if (variant === 'sticky') {
    return (
      <motion.button
        onClick={onExpand}
        className={cn(
          'w-full flex items-center justify-between p-4 rounded-xl',
          'bg-surface-glass backdrop-blur-xl border border-white/10',
          'hover:bg-white/10 transition-colors text-left group',
          className
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">
            Estimated Total
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-text-primary">
              {currency}{total.toLocaleString()}
            </span>
            {discount && discount.amount > 0 && (
              <span className="text-xs font-medium text-accent-cyan">
                -{currency}{discount.amount.toLocaleString()} saved
              </span>
            )}
          </div>
          <p className="text-[10px] text-text-muted mt-0.5">
            {lineItems.length} items
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onBook && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onBook();
              }}
              className="px-3 py-1.5 rounded-full bg-accent-coral text-white text-xs font-bold hover:bg-accent-coral/90 transition-colors"
            >
              Book
            </span>
          )}
          <ChevronRight
            size={16}
            className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </motion.button>
    );
  }

  // Full variant - complete breakdown (default)
  return (
    <motion.div
      className={cn(
        'relative w-full rounded-card overflow-hidden',
        'bg-surface-glass backdrop-blur-xl border border-white/10',
        'shadow-glass',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-white/5 bg-surface-glass">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-button bg-accent-coralMuted">
            <FileText size={20} className="text-accent-coral" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-text-primary">Price Quote</h2>
            <p className="text-xs text-text-muted">
              All prices in {currency === '฿' ? 'THB' : 'USD'}
            </p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Table Header - Desktop Only */}
          <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-white/5 text-xs font-bold text-text-muted uppercase tracking-wider">
            <div className="col-span-5">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-3 text-right">Subtotal</div>
          </div>

          {/* Line Items */}
          {lineItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              {/* Desktop Layout */}
              <div className="hidden sm:grid grid-cols-12 gap-4 items-center py-3 rounded-button hover:bg-white/5 transition-colors px-3">
                <div className="col-span-5 text-sm font-medium text-text-secondary">
                  {item.description}
                </div>
                <div className="col-span-2 text-right text-sm text-text-muted">
                  {item.quantity}
                </div>
                <div className="col-span-2 text-right text-sm text-text-secondary">
                  {currency}
                  {item.unitPrice.toLocaleString()}
                </div>
                <div className="col-span-3 text-right text-base font-bold text-text-primary">
                  {currency}
                  {item.subtotal.toLocaleString()}
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="sm:hidden p-3 rounded-button bg-white/5 border border-white/5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-text-secondary flex-1">
                    {item.description}
                  </span>
                  <span className="text-base font-bold text-text-primary ml-3">
                    {currency}
                    {item.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-text-muted">
                  <span>Qty: {item.quantity}</span>
                  <span>
                    @ {currency}
                    {item.unitPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Totals Section */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3">
        {/* Subtotal (if discount exists) */}
        {discount && (
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <span className="text-sm text-text-muted">Subtotal</span>
            <span className="text-lg font-semibold text-text-secondary">
              {currency}
              {subtotalBeforeDiscount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Discount */}
        {discount && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center py-3 px-4 rounded-button bg-accent-cyanMuted border border-accent-cyan/20"
          >
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-accent-cyan" />
              <span className="text-sm font-medium text-accent-cyan">{discount.label}</span>
            </div>
            <span className="text-lg font-bold text-accent-cyan">
              -{currency}
              {discount.amount.toLocaleString()}
            </span>
          </motion.div>
        )}

        {/* Divider */}
        <div className="border-t border-white/10 pt-4 mt-4" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-base sm:text-lg font-bold text-text-primary">Total Amount</span>
          <div className="text-right">
            <motion.span
              className="text-2xl sm:text-3xl font-bold text-accent-gold drop-shadow-lg"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              {currency}
              {total.toLocaleString()}
            </motion.span>
            <span className="text-xs text-text-muted ml-1 font-medium">
              {currency === '฿' ? 'THB' : 'USD'}
            </span>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {notes && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="p-4 rounded-button bg-background-card border border-white/5">
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">{notes}</p>
          </div>
        </div>
      )}

      {/* CTA Section */}
      {onBook && (
        <div className="p-4 sm:p-6 border-t border-white/5 bg-background-base/40">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBook}
            className="w-full py-4 rounded-button bg-accent-coral text-text-primary font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-glow-coral hover:bg-accent-coral/90 transition-colors"
          >
            Book Now
            <ChevronRight size={18} />
          </motion.button>
          <p className="text-[10px] text-center text-text-muted mt-3 uppercase tracking-wider">
            No payment required • We&apos;ll confirm availability first
          </p>
        </div>
      )}
    </motion.div>
  );
}
