"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ExternalLink, Gamepad2, Mail, Phone } from "lucide-react"
import DiscordBanner from "./DiscordBanner"
import { useLanguage } from "../contexts/LanguageContext"
import { useSiteContent } from "../hooks/useSiteContent"

const contactIcons = {
  mail: Mail,
  phone: Phone,
  gamepad: Gamepad2,
}

export default function Footer() {
  const { t } = useLanguage()
  const { footer } = useSiteContent()

  return (
    <div className="relative">
      <div className="relative z-30 -mb-47">
        <DiscordBanner />
      </div>

      <footer className="bg-gray-100 dark:bg-[#0a0b0f] border-t border-gray-200 dark:border-white/10 relative z-10 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 mt-24 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <Image
                  src={footer.logo || "/meta/Logo.png"}
                  alt="Footer logo"
                  width={200}
                  height={60}
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                {footer.description}
              </p>
              {footer.credit && (
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {footer.credit}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-6 orbitron-font">{t('footer.quickLinks')}</h3>
              <ul className="space-y-3">
                {footer.quickLinks.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <a
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-icon-text-primary dark:hover:text-icon-text-primary transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-6 orbitron-font">{t('footer.legal')}</h3>
              <ul className="space-y-3">
                {footer.legalLinks.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <a
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-icon-text-primary dark:hover:text-icon-text-primary transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-6 orbitron-font">{t('footer.contactUs')}</h3>
              <ul className="space-y-4">
                {footer.contacts.map((contact) => {
                  const Icon = contactIcons[contact.icon] ?? Mail

                  return (
                    <li key={`${contact.label}-${contact.value}`}>
                      <a
                        href={contact.href}
                        className="text-gray-600 dark:text-gray-400 hover:text-icon-text-primary dark:hover:text-icon-text-primary transition-colors duration-300 text-sm flex items-center group"
                      >
                        <Icon className="w-4 h-4 mr-3 icon-text-primary" />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide">{contact.label}</div>
                          <div className="group-hover:text-icon-text-primary dark:group-hover:text-icon-text-primary transition-colors duration-300">{contact.value}</div>
                        </div>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10"
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-500 dark:text-gray-500 text-sm mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} {footer.copyright}
              </div>
              <div className="flex items-center space-x-6" />
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
