"use client"

import Snowfall from 'react-snowfall'
import { useSiteContent } from '../hooks/useSiteContent'

export default function ChristmasSnowfall() {
  const { seasonEffect } = useSiteContent()

  if (!seasonEffect.enabled || seasonEffect.type === "none") {
    return null
  }

  return (
    <Snowfall
      color={seasonEffect.type === "christmas" ? "#fff" : "#dbeafe"}
      snowflakeCount={seasonEffect.snowflakeCount}
      style={{
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    />
  )
}
