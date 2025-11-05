import { NextResponse } from 'next/server'

export async function GET() {
  const serverDate = new Date()

  return NextResponse.json({
    date: serverDate.toISOString(),
    timestamp: serverDate.getTime(),
    timezone: 'UTC',
    year: serverDate.getFullYear(),
    month: serverDate.getMonth() + 1,
    day: serverDate.getDate(),
    hours: serverDate.getHours(),
    minutes: serverDate.getMinutes(),
    seconds: serverDate.getSeconds(),
    // Formato de hora para comparación fácil (HH:MM)
    currentTime: `${String(serverDate.getHours()).padStart(2, '0')}:${String(serverDate.getMinutes()).padStart(2, '0')}`
  })
}
