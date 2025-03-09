import googleapis, { google } from 'googleapis'

export default function googleAuth(): googleapis.Auth.OAuth2Client{
  const OAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  )

  return OAuth2Client
}