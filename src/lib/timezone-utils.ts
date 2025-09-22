// Timezone utility functions
export interface TimezoneOption {
  value: string
  label: string
  offset: string
  region: string
}

// Common timezone mappings with their display names and offsets
const TIMEZONE_MAP: Record<string, { label: string; offset: string; region: string }> = {
  'America/New_York': { label: 'Eastern Time', offset: 'UTC-5/-4', region: 'US East' },
  'America/Chicago': { label: 'Central Time', offset: 'UTC-6/-5', region: 'US Central' },
  'America/Denver': { label: 'Mountain Time', offset: 'UTC-7/-6', region: 'US Mountain' },
  'America/Los_Angeles': { label: 'Pacific Time', offset: 'UTC-8/-7', region: 'US West' },
  'America/Phoenix': { label: 'Arizona Time', offset: 'UTC-7', region: 'US Arizona' },
  'America/Anchorage': { label: 'Alaska Time', offset: 'UTC-9/-8', region: 'US Alaska' },
  'Pacific/Honolulu': { label: 'Hawaii Time', offset: 'UTC-10', region: 'US Hawaii' },

  'Europe/London': { label: 'Greenwich Mean Time', offset: 'UTC+0/+1', region: 'UK' },
  'Europe/Paris': { label: 'Central European Time', offset: 'UTC+1/+2', region: 'Europe' },
  'Europe/Berlin': { label: 'Central European Time', offset: 'UTC+1/+2', region: 'Europe' },
  'Europe/Rome': { label: 'Central European Time', offset: 'UTC+1/+2', region: 'Europe' },
  'Europe/Madrid': { label: 'Central European Time', offset: 'UTC+1/+2', region: 'Europe' },
  'Europe/Amsterdam': { label: 'Central European Time', offset: 'UTC+1/+2', region: 'Europe' },
  'Europe/Stockholm': { label: 'Central European Time', offset: 'UTC+1/+2', region: 'Europe' },
  'Europe/Vienna': { label: 'Central European Time', offset: 'UTC+1/+2', region: 'Europe' },
  'Europe/Zurich': { label: 'Central European Time', offset: 'UTC+1/+2', region: 'Europe' },
  'Europe/Athens': { label: 'Eastern European Time', offset: 'UTC+2/+3', region: 'Europe' },
  'Europe/Moscow': { label: 'Moscow Time', offset: 'UTC+3', region: 'Europe' },

  'Asia/Tokyo': { label: 'Japan Standard Time', offset: 'UTC+9', region: 'Asia' },
  'Asia/Shanghai': { label: 'China Standard Time', offset: 'UTC+8', region: 'Asia' },
  'Asia/Hong_Kong': { label: 'Hong Kong Time', offset: 'UTC+8', region: 'Asia' },
  'Asia/Singapore': { label: 'Singapore Time', offset: 'UTC+8', region: 'Asia' },
  'Asia/Seoul': { label: 'Korea Standard Time', offset: 'UTC+9', region: 'Asia' },
  'Asia/Calcutta': { label: 'India Standard Time', offset: 'UTC+5:30', region: 'Asia' },
  'Asia/Dubai': { label: 'Gulf Standard Time', offset: 'UTC+4', region: 'Asia' },
  'Asia/Bangkok': { label: 'Indochina Time', offset: 'UTC+7', region: 'Asia' },
  'Asia/Jakarta': { label: 'Western Indonesia Time', offset: 'UTC+7', region: 'Asia' },
  'Asia/Manila': { label: 'Philippine Time', offset: 'UTC+8', region: 'Asia' },

  'Australia/Sydney': { label: 'Australian Eastern Time', offset: 'UTC+10/+11', region: 'Australia' },
  'Australia/Melbourne': { label: 'Australian Eastern Time', offset: 'UTC+10/+11', region: 'Australia' },
  'Australia/Brisbane': { label: 'Australian Eastern Time', offset: 'UTC+10', region: 'Australia' },
  'Australia/Perth': { label: 'Australian Western Time', offset: 'UTC+8', region: 'Australia' },
  'Australia/Adelaide': { label: 'Australian Central Time', offset: 'UTC+9:30/+10:30', region: 'Australia' },
  'Australia/Darwin': { label: 'Australian Central Time', offset: 'UTC+9:30', region: 'Australia' },

  'Pacific/Auckland': { label: 'New Zealand Time', offset: 'UTC+12/+13', region: 'Pacific' },
  'Pacific/Fiji': { label: 'Fiji Time', offset: 'UTC+12', region: 'Pacific' },

  'Africa/Cairo': { label: 'Eastern European Time', offset: 'UTC+2', region: 'Africa' },
  'Africa/Johannesburg': { label: 'South Africa Time', offset: 'UTC+2', region: 'Africa' },
  'Africa/Lagos': { label: 'West Africa Time', offset: 'UTC+1', region: 'Africa' },
  'Africa/Nairobi': { label: 'East Africa Time', offset: 'UTC+3', region: 'Africa' },

  'America/Sao_Paulo': { label: 'Brasilia Time', offset: 'UTC-3/-2', region: 'South America' },
  'America/Argentina/Buenos_Aires': { label: 'Argentina Time', offset: 'UTC-3', region: 'South America' },
  'America/Santiago': { label: 'Chile Time', offset: 'UTC-4/-3', region: 'South America' },
  'America/Lima': { label: 'Peru Time', offset: 'UTC-5', region: 'South America' },
  'America/Mexico_City': { label: 'Central Time', offset: 'UTC-6/-5', region: 'North America' },
  'America/Toronto': { label: 'Eastern Time', offset: 'UTC-5/-4', region: 'North America' },
  'America/Vancouver': { label: 'Pacific Time', offset: 'UTC-8/-7', region: 'North America' },

  // Additional common timezones
  'Asia/Kolkata': { label: 'India Standard Time', offset: 'UTC+5:30', region: 'Asia' },
  'Asia/Tehran': { label: 'Iran Standard Time', offset: 'UTC+3:30', region: 'Asia' },
  'Asia/Karachi': { label: 'Pakistan Standard Time', offset: 'UTC+5', region: 'Asia' },
  'Asia/Dhaka': { label: 'Bangladesh Standard Time', offset: 'UTC+6', region: 'Asia' },
  'Asia/Kathmandu': { label: 'Nepal Time', offset: 'UTC+5:45', region: 'Asia' },
  'Asia/Colombo': { label: 'Sri Lanka Time', offset: 'UTC+5:30', region: 'Asia' },
  'Asia/Kabul': { label: 'Afghanistan Time', offset: 'UTC+4:30', region: 'Asia' },
  'Asia/Tashkent': { label: 'Uzbekistan Time', offset: 'UTC+5', region: 'Asia' },
  'Asia/Almaty': { label: 'Kazakhstan Time', offset: 'UTC+6', region: 'Asia' },
  'Asia/Yekaterinburg': { label: 'Yekaterinburg Time', offset: 'UTC+5', region: 'Asia' },
  'Asia/Novosibirsk': { label: 'Novosibirsk Time', offset: 'UTC+7', region: 'Asia' },
  'Asia/Vladivostok': { label: 'Vladivostok Time', offset: 'UTC+10', region: 'Asia' },
  'Asia/Magadan': { label: 'Magadan Time', offset: 'UTC+11', region: 'Asia' },
  'Asia/Kamchatka': { label: 'Kamchatka Time', offset: 'UTC+12', region: 'Asia' },
}

// Get all timezone options
export function getTimezoneOptions(): TimezoneOption[] {
  return Object.entries(TIMEZONE_MAP).map(([value, info]) => ({
    value,
    label: `${info.label} (${info.offset})`,
    offset: info.offset,
    region: info.region,
  }))
}

// Get timezone options grouped by region
export function getTimezoneOptionsByRegion(): Record<string, TimezoneOption[]> {
  const options = getTimezoneOptions()
  const grouped: Record<string, TimezoneOption[]> = {}

  options.forEach(option => {
    const region = option.region
    if (!grouped[region]) {
      grouped[region] = []
    }
    grouped[region].push(option)
  })

  return grouped
}

// Get user's current timezone
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'America/New_York' // fallback
  }
}

// Get timezone display name
export function getTimezoneDisplayName(timezone: string): string {
  const info = TIMEZONE_MAP[timezone]
  if (info) {
    return `${info.label} (${info.offset})`
  }
  return timezone
}

// Check if timezone is valid
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}
