"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import uiConfig from "../../config/sections/ui.json";
import type { UIConfig, Currency } from "../../types/ui";

const config = uiConfig as UIConfig;
const rateCacheMs = 24 * 60 * 60 * 1000;
const selectedCurrencyStorageKey = "snapgrids:selectedCurrency";
const exchangeRatesStorageKey = `snapgrids:exchangeRates:${config.currency.baseCurrency}`;

const fallbackExchangeRates: Record<string, number> = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.78,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 157,
};

function getCurrencyByCode(code: string) {
  return config.currency.supportedCurrencies.find((currency) => currency.code === code);
}

function getDefaultCurrency() {
  return getCurrencyByCode(config.currency.defaultCurrency) || config.currency.supportedCurrencies[0];
}

function getSavedCurrency() {
  if (typeof window === "undefined") {
    return getDefaultCurrency();
  }

  const savedCode = window.localStorage.getItem(selectedCurrencyStorageKey);
  return savedCode ? getCurrencyByCode(savedCode) || getDefaultCurrency() : getDefaultCurrency();
}

function getRatesEndpoint() {
  const baseCurrency = encodeURIComponent(config.currency.baseCurrency);

  if (config.currency.apiKey) {
    return `https://v6.exchangerate-api.com/v6/${encodeURIComponent(config.currency.apiKey)}/latest/${baseCurrency}`;
  }

  return (config.currency.ratesEndpoint || "https://open.er-api.com/v6/latest/{baseCurrency}").replace(
    "{baseCurrency}",
    baseCurrency
  );
}

function parseCachedRates() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(exchangeRatesStorageKey);
    if (!stored) {
      return null;
    }

    const cache = JSON.parse(stored) as { rates?: Record<string, number>; timestamp?: number };
    if (!cache.rates || !cache.timestamp || Date.now() - cache.timestamp > rateCacheMs) {
      return null;
    }

    return cache.rates;
  } catch {
    return null;
  }
}

function detectCurrencyCode(price: string) {
  const upperPrice = price.toUpperCase();

  if (upperPrice.includes("INR") || price.includes("\u20b9")) return "INR";
  if (upperPrice.includes("CAD") || price.includes("C$")) return "CAD";
  if (upperPrice.includes("AUD") || price.includes("A$")) return "AUD";
  if (upperPrice.includes("EUR") || price.includes("\u20ac")) return "EUR";
  if (upperPrice.includes("GBP") || price.includes("\u00a3")) return "GBP";
  if (upperPrice.includes("JPY") || price.includes("\u00a5")) return "JPY";
  if (upperPrice.includes("USD") || price.includes("$")) return "USD";

  return config.currency.baseCurrency;
}

function normalizeNumber(value: string) {
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function getPriceSuffix(price: string, numericMatch: RegExpMatchArray) {
  const index = numericMatch.index ?? 0;
  return price.slice(index + numericMatch[0].length).trim();
}

function formatAmount(amount: number, currency: Currency) {
  const maximumFractionDigits = currency.code === "JPY" ? 0 : 2;
  const minimumFractionDigits = currency.code === "JPY" || currency.code === "INR" ? 0 : 2;
  const locale = currency.code === "INR" ? "en-IN" : "en-US";

  return `${currency.symbol}${amount.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`;
}

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  className?: string;
}

export function CurrencySelector({ 
  selectedCurrency, 
  onCurrencyChange, 
  className = "" 
}: CurrencySelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 300,
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.15,
        ease: "easeInOut" as const,
      },
    },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.02,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 300,
      },
    },
    tap: { scale: 0.98 },
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="flex items-center justify-between w-full bg-white/20 dark:bg-white/5 hover:bg-white/30 dark:hover:bg-white/10 border border-white/20 dark:border-white/10 hover:border-blue-500/40 dark:hover:border-blue-400/40 rounded-lg px-3 sm:px-4 py-2 text-gray-900 dark:text-white transition-all duration-300 backdrop-blur-sm"
      >
        <span>
          {selectedCurrency.symbol} {selectedCurrency.code}
        </span>
        <motion.div
          animate={{ rotate: isDropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>
       {uiConfig.christmasTheme.enabled && (
        <>
          <Image
            src="/christmas/button-deco-up.png"
            alt="Christmas decoration"
            width={28}
            height={28}
            className="absolute -top-2 -right-2 pointer-events-none"
          />
          <Image
            src="/christmas/button-deco-down.png"
            alt="Christmas decoration"
            width={28}
            height={28}
            className="absolute -bottom-2 -left-2 pointer-events-none"
          />
        </>
      )}

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full mt-2 right-0 w-full sm:w-64 bg-white/20 dark:bg-[#0a0b0f]/90 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-lg shadow-xl z-[100] overflow-hidden"
          >
            {config.currency.supportedCurrencies.map((currency, index) => (
              <motion.button
                key={currency.code}
                onClick={() => {
                  onCurrencyChange(currency);
                  setIsDropdownOpen(false);
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { delay: index * 0.05 }
                }}
                whileHover={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  transition: { duration: 0.2 }
                }}
                className="w-full px-4 py-2 text-left hover:bg-white/10 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
              >
                {currency.symbol} {currency.code} - {currency.name}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface UseCurrencyReturn {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  exchangeRates: Record<string, number>;
  convertPrice: (price: string | number) => string;
  isLoading: boolean;
}

export function useCurrency(): UseCurrencyReturn {
  const [selectedCurrency, setSelectedCurrencyState] = useState<Currency>(getDefaultCurrency);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(fallbackExchangeRates);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSelectedCurrencyState(getSavedCurrency());

    const fetchExchangeRates = async () => {
      try {
        setIsLoading(true);
        const cachedRates = parseCachedRates();

        if (cachedRates) {
          setExchangeRates({ ...fallbackExchangeRates, ...cachedRates });
          setIsLoading(false);
          return;
        }

        const response = await fetch(getRatesEndpoint());
        const data = await response.json();

        const fetchedRates = data.conversion_rates || data.rates;

        if (data.result === "success" && fetchedRates) {
          const rates = { ...fallbackExchangeRates, ...fetchedRates };
          setExchangeRates(rates);
          localStorage.setItem(
            exchangeRatesStorageKey,
            JSON.stringify({
              rates,
              timestamp: Date.now(),
            })
          );
        }
      } catch (error) {
        console.warn("Failed to refresh exchange rates. Using cached or fallback rates.", error);
        const cachedRates = parseCachedRates();
        if (cachedRates) {
          setExchangeRates({ ...fallbackExchangeRates, ...cachedRates });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  const setSelectedCurrency = (currency: Currency) => {
    setSelectedCurrencyState(currency);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(selectedCurrencyStorageKey, currency.code);
    }
  };

  const convertPrice = (price: string | number): string => {
    const rawPrice = String(price);
    const numericMatch = rawPrice.match(/-?\d[\d,]*(?:\.\d+)?/);
    if (!numericMatch) {
      return formatAmount(0, selectedCurrency);
    }

    const numericPrice = normalizeNumber(numericMatch[0]);
    if (numericPrice === null) {
      return formatAmount(0, selectedCurrency);
    }

    const sourceCurrencyCode = detectCurrencyCode(rawPrice);
    const suffix = getPriceSuffix(rawPrice, numericMatch);

    if (selectedCurrency.code === sourceCurrencyCode) {
      return `${formatAmount(numericPrice, selectedCurrency)}${suffix}`;
    }

    const sourceRate = exchangeRates[sourceCurrencyCode] || fallbackExchangeRates[sourceCurrencyCode] || 1;
    const targetRate = exchangeRates[selectedCurrency.code] || fallbackExchangeRates[selectedCurrency.code] || 1;

    if (!sourceRate || !targetRate) {
      return `${formatAmount(numericPrice, selectedCurrency)}${suffix}`;
    }

    const basePrice = numericPrice / sourceRate;
    const convertedPrice = basePrice * targetRate;

    return `${formatAmount(convertedPrice, selectedCurrency)}${suffix}`;
  };

  return {
    selectedCurrency,
    setSelectedCurrency,
    exchangeRates,
    convertPrice,
    isLoading,
  };
}
