export const metadata = {
  title: 'QR Menu',
  description: 'Menús digitales para restaurantes',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}